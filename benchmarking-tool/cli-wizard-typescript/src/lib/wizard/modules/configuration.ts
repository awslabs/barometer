import * as inquirer from 'inquirer';

import { Configuration } from '../../impl/configuration';
import { CLIModule } from '../common/cli-module';

export class ConfigurationModule extends CLIModule {

  prompts = {
    "selectAction": [{
      type: 'list',
      name: 'value',
      message: 'Which action would you like to execute ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'Manage platforms', 'value': 'platform' },
        { 'name': 'Manage workloads', 'value': 'workload' },
        { 'name': 'Manage experiments', 'value': 'experiment' },
        new inquirer.Separator(),
        { 'name': 'Display current configuration', 'value': 'display' },
        { 'name': 'Save current configuration', 'value': 'save' },
        { 'name': 'Reset current configuration', 'value': 'reset' },
        { 'name': 'Load existing configuration', 'value': 'load' },
        new inquirer.Separator(),
        { 'name': 'Exit CLI', 'value': 'exit' },
        new inquirer.Separator(),
      ]
    }]
  }

  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    const nextstep: string = await (inquirer.prompt(this.prompts.selectAction).then(async (answers) => {
      let conf_module;
      if (answers.value) {
        switch (answers.value) {
          case 'display':
            configuration.print();
            break;
          case 'save':
            await this.promptExportConfigurationWizard(configuration);
            break;
          case 'load':
            configuration = await this.promptImportConfigurationWizard();
            break;
          case 'reset':
            configuration = new Configuration();
            configuration.loaded = true;
            break;
          case 'exit':
            console.log("Exiting.");
            await this.promptExportConfigurationWizard(configuration);
            break;
          default:
            console.log("Execute Module : " + answers.value);
            conf_module = require("./" + answers.value );
            [answers.value, configuration] = await conf_module.Module.getInstance().run(configuration);
            break;
        }
      }
      return answers.value;
    }));
    return [nextstep, configuration];
  }
}
