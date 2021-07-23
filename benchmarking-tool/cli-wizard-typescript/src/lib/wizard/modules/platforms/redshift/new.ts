import { NodeType } from "@aws-cdk/aws-redshift";
import * as inquirer from 'inquirer';
import { Configuration } from '../../../../impl/configuration';

import { RedshiftPlatformConfiguration, RedshiftSettings, RedshiftFeatures} from '../../../../impl/platforms/redshift/new';
import { CLIModule } from '../../../common/cli-module';

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
                message: 'Please provide name of the platform (You will be able to use platform by this name later)',
                'validate': async (input: string | any[]): Promise<any> => {
                    if (input.length > 0)
                        return true;
                    return "Name can not be empty"
                }
            },
            {
                type: 'list',
                name: 'nodeType',
                message: 'What node type you want to use?',
                hint: '- Use <space> to select and <return> to submit.',
                choices: [
                    { 'name': NodeType.RA3_XLPLUS },
                    { 'name': NodeType.RA3_4XLARGE },
                    { 'name': NodeType.RA3_16XLARGE },
                    { 'name': NodeType.DC2_LARGE },
                    { 'name': NodeType.DC2_8XLARGE },
                    { 'name': NodeType.DS2_XLARGE },
                    { 'name': NodeType.DS2_8XLARGE }
                ]
            }, {
                type: 'input',
                name: 'numberOfNodes',
                message: 'How many instances you want to add to the cluster?',
                default: 2,
                'validate': async (input: string): Promise<any> => {
                    if (parseInt(input) > 0)
                        return true;
                    return "Only numbers > 0 are allowed"
                }
            }, {
                type: 'checkbox',
                name: 'features',
                message: 'Choose all the features you want to enable',
                choices: [
                    new inquirer.Separator(' = Redshift Features = '),
                    { 'name': 'Work load manager (WLM)' },
                    { 'name': 'Advanced Query Accelerator (AQUA)' },
                    { 'name': 'Concurrency Scaling' },
                    { 'name': 'Redshift Spectrum' }
                ],
                'filter': async (input: string | any[]): Promise<any> => {
                    const features: RedshiftFeatures = new RedshiftFeatures();
                    for (let i = 0; i < input.length; i++) {
                        if (input[i].indexOf("WLM") >= 0)
                            features.workloadManager = true
                        if (input[i].indexOf("AQUA") >= 0)
                            features.aqua = true
                        if (input[i].indexOf("Concurrency") >= 0)
                            features.concurrencyScaling = true
                        if (input[i].indexOf("Spectrum") >= 0)
                            features.spectrum = true
                    }
                    return features;
                }
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
                const entry = new RedshiftPlatformConfiguration();
                entry.name = answers.name;
                const settings = new RedshiftSettings();
                settings.numberOfNodes = answers.numberOfNodes;
                settings.features = answers.features;
                settings.nodeType = answers.nodeType;
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
