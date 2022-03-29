import {Configuration} from '../../impl/configuration';

import {CLIModule, ICLIModule} from '../common/cli-module';
import {CLIModuleQuestions} from "../common/cli-prompts";
import {WorkloadConfiguration, WorkloadSettings} from "../../impl/workload";
import {Utils} from "../utils";
import {S3} from "@aws-sdk/client-s3";
import {URL} from "url";
import {PlatformType} from "../../interface/platform";
import {IWorkloadSettings} from "../../interface/workload";
import path = require('path');

export class Module {
    public static getInstance(configuration: Configuration): WorkloadModule {
        return new WorkloadModule(configuration, 'WorkloadModule');
    }
}

export class WorkloadModule extends CLIModule implements ICLIModule {

    s3Client = new S3({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});
    static BYOW = "BYOW";

    /**
     * Questions to be prompted
     */
    setQuestions(): void {
        this.questions = new Array<any>();
        this.questions.push(CLIModuleQuestions.entryName);
        this.questions.push({
            type: 'list',
            name: 'dataset',
            message: 'Which dataset would you like to use ?'
        });
        this.questions.push({
            type: 'input',
            name: 's3Path',
            message: 'Please provide path to your workload on S3 ?',
            when: function (answers): boolean {
                return answers.dataset == WorkloadModule.BYOW;
            },
            validate: async (input: string, answers): Promise<any> => {
                const url = new URL(input);
                try {
                    let prefix = url.pathname.replace(/^\//g, '');
                    if (!prefix.endsWith("/"))
                        prefix += '/';
                    let result = await this.s3Client.listObjectsV2({
                        Bucket: url.hostname,
                        Delimiter: '/',
                        Prefix: prefix
                    });
                    let count = 0;
                    if (result.CommonPrefixes)
                        for (const commonPrefix of result.CommonPrefixes) {
                            if (commonPrefix.Prefix?.endsWith("ddl/") || commonPrefix.Prefix?.endsWith("volumes/") || commonPrefix.Prefix?.endsWith("benchmarking-queries/"))
                                count++;
                        }
                    if (count != 3)
                        return "Folders ddl/, volumes/ and benchmarking-queries/ must be present in path " + input;
                    else {
                        // Count = 3, go into details and build workload config
                        const workloadConfig: IWorkloadSettings = {
                            name: answers.name,
                            description: answers.name,
                            volumes: [],
                            ddl: {},
                            queries: {},
                            supportedPlatforms: []
                        };
                        // Go to ddl folder to test supported platforms
                        result = await this.s3Client.listObjectsV2({
                            Bucket: url.hostname,
                            Delimiter: '/',
                            Prefix: prefix + "ddl/"
                        });
                        let platformTypes = "";
                        if (result.CommonPrefixes) {
                            const platformMatches = result.CommonPrefixes.every(commonPrefix => {
                                for (const _key in PlatformType) {
                                    if (commonPrefix.Prefix?.endsWith(PlatformType[_key] + "/")) {
                                        workloadConfig.supportedPlatforms.push(PlatformType[_key]);
                                        workloadConfig.ddl[PlatformType[_key]] = {
                                            path: "s3://" + url.hostname + "/" + commonPrefix.Prefix
                                        }
                                        platformTypes += PlatformType[_key] + ",";
                                        return true;
                                    }
                                }
                                return false;
                            });
                            if (!platformMatches) return "Path " + prefix + "ddl/ should contain only platform types: " + platformTypes;
                        } else return "Path " + prefix + "ddl/ should contain at least 1 folder matching platform type";

                        // Go to benchmarking-queries folder to test supported platforms
                        result = await this.s3Client.listObjectsV2({
                            Bucket: url.hostname,
                            Delimiter: '/',
                            Prefix: prefix + "benchmarking-queries/"
                        });
                        if (result.CommonPrefixes) {
                            const platformMatches = result.CommonPrefixes.every(commonPrefix => {
                                for (const _key in PlatformType) {
                                    if (commonPrefix.Prefix?.endsWith(PlatformType[_key] + "/") && workloadConfig.supportedPlatforms.indexOf(PlatformType[_key]) > -1) {
                                        workloadConfig.queries[PlatformType[_key]] = {
                                            path: "s3://" + url.hostname + "/" + commonPrefix.Prefix
                                        }
                                        return true;
                                    }
                                }
                                return false;
                            });
                            if (!platformMatches) return "Path " + prefix + "benchmarking-queries/ should contain only platform types: " + platformTypes;
                        } else return "Path " + prefix + "benchmarking-queries/ should contain at least 1 folder matching platform type";

                        // Go to volumes and add all volumes
                        result = await this.s3Client.listObjectsV2({
                            Bucket: url.hostname,
                            Delimiter: '/',
                            Prefix: prefix + "volumes/"
                        });
                        if (result.CommonPrefixes) {
                            for (const commonPrefix of result.CommonPrefixes) {
                                if (commonPrefix.Prefix) {
                                    const splits = commonPrefix.Prefix.split('/');
                                    workloadConfig.volumes?.push({
                                        name: splits[splits.length - 2],
                                        path: "s3://" + url.hostname + "/" + commonPrefix.Prefix,
                                        format: "parquet"
                                    });
                                } else return "No volumes found in format " + prefix + "volumes/[scale-factor]/[table-name]/"
                            }
                            const workloadDirPath: string = path.join(__dirname, '../../../../../cdk-stack/workloads/');
                            const bucketPolicyTemplatePath: string = path.join(__dirname, '../../../../byow-bucket-policy.json');
                            const template = Utils.readJson(bucketPolicyTemplatePath);
                            template["Statement"][0]["Resource"].push("arn:aws:s3:::" + url.hostname);
                            template["Statement"][0]["Resource"].push("arn:aws:s3:::" + url.hostname + "/" + prefix + "*");
                            template["Statement"][0]["Condition"]["StringLike"]["aws:PrincipalArn"].push("arn:aws:iam::" + process.env.CDK_DEPLOY_ACCOUNT + ":role/BenchmarkingStack-*");
                            template["Statement"][0]["Condition"]["StringLike"]["aws:PrincipalArn"].push("arn:aws:iam::" + process.env.CDK_DEPLOY_ACCOUNT + ":role/redshift-*");
                            Utils.writeToDir(workloadDirPath + workloadConfig.name, 'config.json', workloadConfig);
                            const message = "\n\nPlease update bucket policy of bucket: " + url.hostname + " to the following \n\n" +
                                JSON.stringify(template, null, 4);
                            console.log(message);
                        } else return "Path " + prefix + "volumes/ should contain at least 1 folder";
                    }
                } catch (e: any) {
                    return e.message;
                }
                return true;
            }
        });
        this.questions.push({
            type: 'list',
            name: 'volume',
            message: 'Which scaling factor would you like to use ?',
            choices: function (answers): Array<any> {
                // Only run if user set a name
                return answers.dataset.volumes.map((e) => {
                    return {name: e.name, value: e}
                })
            },
            when: function (answers): boolean {
                return answers.dataset != WorkloadModule.BYOW;
            }
        });
    }

    async runModuleQuestions(): Promise<[string, Configuration]> {
        const _questions: Array<any> = this.getQuestions();
        const datasetQuestion = this.getQuestionByName(_questions, 'dataset');
        datasetQuestion["choices"] = [];

        // Scan workload directory to load all supported workloads
        const workloadDirPath: string = path.join(__dirname, '../../../../../cdk-stack/workloads/');
        const workloadConfigDirs = Utils.listPaths(workloadDirPath, true);
        for (let i = 0; i < workloadConfigDirs.length; i++) {
            const config = Utils.readJson(workloadDirPath + workloadConfigDirs[i] + "/config.json");
            datasetQuestion["choices"].push({name: config.description, value: config});
        }
        datasetQuestion["choices"].push({name: "Bring your own workload from Amazon S3", value: WorkloadModule.BYOW});

        await this.askQuestions(this.getQuestions()).then(async (answers) => {
            if (answers && answers.dataset != WorkloadModule.BYOW) {
                const settings = new WorkloadSettings();
                settings.name = answers.dataset.name;
                settings.description = answers.dataset.description;
                settings.volume = answers.volume;
                settings.ddl = answers.dataset.ddl;
                settings.queries = answers.dataset.queries;
                settings.supportedPlatforms = answers.dataset.supportedPlatforms;
                const entry = new WorkloadConfiguration();
                entry.name = answers.name;
                entry.settings = settings;

                await this.addEntry(entry);
            }
        });
        this.nextstep = 'continue';
        if (!(await this.askAddMoreEntry())) {
            this.nextstep = 'exit-module';
        }
        return [this.nextstep, this.configuration];
    }
}