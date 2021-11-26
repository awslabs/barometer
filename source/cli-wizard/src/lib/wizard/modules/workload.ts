import {Configuration} from '../../impl/configuration';

import {CLIModule, ICLIModule} from '../common/cli-module';
import {CLIModuleQuestions} from "../common/cli-prompts";
import fs from "fs";
import {WorkloadConfiguration, WorkloadSettings} from "../../impl/workload";
import {Utils} from "../utils";
import path = require('path');

export class Module {
    public static getInstance(configuration: Configuration): WorkloadModule {
        return new WorkloadModule(configuration, 'WorkloadModule');
    }
}

export class WorkloadModule extends CLIModule implements ICLIModule {
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