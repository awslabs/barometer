import * as inquirer from 'inquirer';
import { CLIModule } from '../../../common/cli-module';

import { Configuration } from '../../../../impl/configuration';
import { OLAPWorkloadSettings, OLAPWorkloadConfiguration } from '../../../../impl/workloads/olap/new';

export class Module {
    public static getInstance(): RedshiftModule {
        return new RedshiftModule();
    }
}

export class RedshiftModule extends CLIModule {
    /**
      * Questions to be prompted
      */
    prompts = {
        "configure": [
            {
                type: 'input',
                name: 'name',
                message: 'Please provide name for the workload (You will be able to use by this name later)',
                'validate': async (input: string | any[]): Promise<any> => {
                    if (input.length > 0)
                        return true;
                    return "Name can not be empty"
                }
            }, {
                type: 'list',
                name: 'workload_type',
                message: 'Which Analytics / OLAP dataset would you like to use ?',
                hint: '- Use <space> to select and <return> to submit.',
                choices: [
                    { 'name': 'TPC-DS Version 3', 'value': 'tpc-ds/v3' },
                    { 'name': 'TPC-DS Version 2', 'value': 'tpc-ds/v2', disabled: 'Unavailable at this time', },
                    { 'name': 'TPC-H Version 3', 'value': 'tpc-h/v3' },
                    { 'name': 'TPC-H Version 2', 'value': 'tpc-h/v2', disabled: 'Unavailable at this time', },
                ],
            }, {
                type: 'list',
                name: 'scalingFactor',
                message: 'Which scaling factor would you like to use ?',
                hint: '- Use <space> to select and <return> to submit.',
                choices: [
                    { 'name': '100', 'value': '100' },
                    { 'name': '1k', 'value': '1000' },
                    { 'name': '3k', 'value': '3000' },
                    { 'name': '10k', 'value': '10000' },
                    { 'name': '30k', 'value': '30000' },
                    { 'name': '100k', 'value': '100000' },
                ],
                when: function (answers): boolean {
                    // Only run if user set a name
                    return (answers.workload_type.startsWith('tpc-h'));
                },
            }, {
                type: 'list',
                name: 'scalingFactor',
                message: 'Which scaling factor would you like to use ?',
                hint: '- Use <space> to select and <return> to submit.',
                choices: [
                    { 'name': '10k', 'value': '10000' },
                    { 'name': '100k', 'value': '100000' },
                ],
                when: function (answers): boolean {
                    // Only run if user set a name
                    return (answers.workload_type.startsWith('tpc-ds'));
                },
            }, {
                type: 'confirm',
                name: 'usePartitioning',
                message: 'Do you want to partition the data whenever possible ?',
                default: false
            }, {
                type: 'list',
                name: 'loadMethod',
                message: 'How do you want to import the data ?',
                choices: [
                    { 'name': 'Import directly from the source bucket', 'value': 'direct' },
                    { 'name': 'Make a copy in a local S3 bucket first', 'value': 'copy' },
                ]
            }, {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to add an additional workload?',
                default: false,
            }
        ]
    };

    async prompt(configuration: Configuration): Promise<[string, Configuration]> {
        const nextstep: string = await (inquirer.prompt(this.prompts.configure).then(async (answers) => {
            if (answers) {
                const settings = new OLAPWorkloadSettings();
                settings.scalingFactor = answers.scalingFactor;
                settings.usePartitioning = answers.usePartitioning;
                settings.loadMethod = answers.loadMethod;

                const entry = new OLAPWorkloadConfiguration();
                entry.name = answers.name;
                entry.settings = settings;

                configuration.workloads[answers.name] = entry;
            }
            if (!answers.confirm) {
                return "exit-module";
            }
            return answers.value;
        }));
        return [nextstep, configuration];
    }
}
