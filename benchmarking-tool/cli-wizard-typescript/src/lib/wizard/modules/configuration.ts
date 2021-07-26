import * as inquirer from 'inquirer';

import { Configuration } from '../../impl/configuration';
import { CLIModule, ICLIModule } from '../common/cli-module';

export class ConfigurationModule extends CLIModule implements ICLIModule {

  configuration!: Configuration;

  constructor() {
    super();
    this.resetConfiguration();

    this.nextstep = "";
  }

  resetConfiguration(): void {
    this.configuration = new Configuration();
    this.configuration.loadDefault();
  }


  prompts = [
    {
      type: 'list',
      name: 'value',
      message: 'Which action would you like to execute ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { name: 'Manage platforms', value: './platform' },
        { name: 'Manage workloads', value: './workload' },
        { name: 'Manage experiments', value: './experiment' },
        new inquirer.Separator(),
        { name: 'Display current configuration', value: 'display' },
        { name: 'Save current configuration', value: 'save' },
        { name: 'Reset current configuration', value: 'reset' },
        { name: 'Load existing configuration', value: 'load' },
        new inquirer.Separator(),
        { name: 'Exit CLI', value: 'exit' },
        new inquirer.Separator(),
      ],
    },
  ];
  async runMainModule(): Promise<void> {
    // prompt to execute an action until the user decide to stop
    await this.promptMainModule();
    // loop until the next step is exit
    while (this.nextstep !== 'exit') {
      await this.promptMainModule();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    throw new Error('Method not implemented.');
  }

  async promptMainModule(): Promise<void> {
    const module_name = 'configuration';
    await inquirer.prompt(this.prompts).then(async (answers) => {
      let conf_module;
      if (answers.value) {
        this.nextstep = answers.value;
        switch (this.nextstep) {
          case 'display':
            this.configuration.print();
            break;
          case 'save':
            await this.exportConfigurationWizard(this.configuration);
            break;
          case 'load':
            this.configuration = await this.importConfigurationWizard();
            break;
          case 'reset':
            this.resetConfiguration();
            break;
          case 'exit':
            await this.exitCLI(this.configuration);
            break;
          default:
            conf_module = require(this.nextstep);
            [this.nextstep, this.configuration] = await conf_module.Module.getInstance().run(this.configuration, module_name);
            if (this.nextstep === 'exit') {
              await this.exitCLI(this.configuration);
            }
            break;
        }
      }
    });
  }
}
