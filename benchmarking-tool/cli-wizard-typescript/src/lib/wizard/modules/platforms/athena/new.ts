import * as inquirer from 'inquirer';
import {Configuration} from '../../../../impl/configuration';

import {CLIModule} from '../../../common/cli-module';
import {AthenaPlatformConfiguration, AthenaSettings} from "../../../../impl/platforms/athena/new";

export class Module {
    public static getInstance(): AthenaModule {
        return new AthenaModule();
    }
}

export class AthenaModule extends CLIModule {
    /**
     * Questions to be prompted
     */
    prompts = {
        "configure": [
            {
                type: 'input',
                name: 'name',
                message: 'Please provide name of the platform (You will be able to use platform by this name later)',
                'validate': async (input: string | any[]): Promise<any> => {
                    if (input.length > 0)
                        return true;
                    return "Name can not be empty"
                }
            }, {
                type: 'input',
                name: 'bytesScannedCutoffPerQuery',
                message: 'Maximum bytes in MB scan allowed for the workgroup?',
                default: 200,
                'validate': async (input: string): Promise<any> => {
                    if (parseInt(input) > 0)
                        return true;
                    return "Only numbers > 0 are allowed"
                }
            }, {
                type: 'confirm',
                name: 'enforceWorkgroupConfiguration',
                message: 'Do you want to enforce workgroup configuration?',
                default: false,
            }, {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to add an additional platform?',
                default: false,
            }
        ]
    };

    async prompt(configuration: Configuration): Promise<[string, Configuration]> {
        const nextstep: string = await (inquirer.prompt(this.prompts.configure).then(async (answers) => {
            if (answers) {
                const entry = new AthenaPlatformConfiguration();
                entry.name = answers.name;
                const settings = new AthenaSettings();
                settings.bytesScannedCutoffPerQuery = answers.bytesScannedCutoffPerQuery * 1000000;
                settings.enforceWorkgroupConfiguration = answers.enforceWorkgroupConfiguration;
                entry.settings = settings;

                configuration.platforms[answers.name] = entry;
            }
            if (!answers.confirm) {
                return "exit-module";
            }
            return answers.value;
        }));
        return [nextstep, configuration];
    }
}
