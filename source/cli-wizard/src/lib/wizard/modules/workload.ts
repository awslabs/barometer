import {Configuration} from '../../impl/configuration';

import {CLIModule, ICLIModule} from '../common/cli-module';
import {CLIModuleQuestions} from "../common/cli-prompts";
import fs from "fs";
import {WorkloadConfiguration, WorkloadSettings} from "../../impl/workload";
import {Utils} from "../utils";
import path = require('path');
import {CloudFormationClient} from "@aws-sdk/client-cloudformation";
import {S3} from "@aws-sdk/client-s3";
import {URL} from "url";

export class Module {
    public static getInstance(configuration: Configuration): WorkloadModule {
        return new WorkloadModule(configuration, 'WorkloadModule');
    }
}

export class WorkloadModule extends CLIModule implements ICLIModule {

    s3Client = new S3({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});

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
                return answers.dataset == "BYOW";
            },
            validate: async (input: string): Promise<any> => {
                const url = new URL(input);
                try {
                    let prefix = url.pathname.replace(/^\//g, '');
                    if (!prefix.endsWith("/"))
                        prefix += '/';
                    const result = await this.s3Client.listObjectsV2({
                        Bucket: url.hostname,
                        Delimiter: '/',
                        Prefix: prefix
                    })
                    console.log(result);
                    let count = 0;
                    if (result.CommonPrefixes)
                        for (const commonPrefix of result.CommonPrefixes) {
                            if (commonPrefix.Prefix?.endsWith("ddl/") || commonPrefix.Prefix?.endsWith("volumes/") || commonPrefix.Prefix?.endsWith("benchmarking-queries/"))
                                count++;
                        }
                    if (count != 3)
                        return "Folders ddl/, volumes/ and benchmarking-queries/ must be present in path " + input;
                } catch (e) {
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
            const config = JSON.parse(fs.readFileSync(workloadDirPath + workloadConfigDirs[i] + "/config.json", 'utf-8'));
            datasetQuestion["choices"].push({name: config.description, value: config});
        }
        datasetQuestion["choices"].push({name: "Bring your own workload from Amazon S3", value: "BYOW"});

        await this.askQuestions(this.getQuestions()).then(async (answers) => {
            if (answers) {
                const settings = new WorkloadSettings();
                settings.name = answers.dataset.name;
                settings.description = answers.dataset.description;
                settings.volume = answers.volume;
                settings.ddl = answers.dataset.ddl;
                settings.queries = answers.dataset.queries;
                settings.supportedPlatforms = answers.dataset.supportedPlatforms;
                settings.workloadType = answers.dataset.type.toUpperCase();

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