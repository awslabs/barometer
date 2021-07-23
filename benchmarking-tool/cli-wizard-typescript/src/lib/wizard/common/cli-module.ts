import * as inquirer from 'inquirer';

import { Configuration, DEFAULT_CONFG_FILE_NAME } from '../../impl/configuration';

export interface ICLIModule {
  prompt(configuration: Configuration): Promise<[string, Configuration]>;

  run(configuration: Configuration): Promise<[string, Configuration]>;
}

export abstract class CLIModule implements ICLIModule {

  private CLIModulePrompts = {
    "exportConfiguration": [{
      type: 'list',
      name: 'value',
      message: 'How would you like to export your current configuration ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'Save to default location ' + DEFAULT_CONFG_FILE_NAME, 'value': 'default' },
        { 'name': 'Save to custom location', 'value': 'custom' },
        { 'name': 'Don\'t save', 'value': 'exit' },
      ]
    }],
    "importConfiguration": [{
      type: 'list',
      name: 'value',
      message: 'How would you like to import your configuration ?',
      choices: [
        { 'name': 'Load from default location ' + DEFAULT_CONFG_FILE_NAME, 'value': 'default' },
        { 'name': 'Load from custom location', 'value': 'custom' },
        { 'name': 'Don\'t save', 'value': 'exit' },
      ]
    },
    ],
  }
  abstract prompt(configuration: Configuration): Promise<[string, Configuration]>;

  async run(configuration: Configuration): Promise<[string, Configuration]> {
    if (!configuration.loaded) {
      configuration.loadDefault();
    }

    // prompt to execute an action until the user decide to stop
    let nextstep = "";
    [nextstep, configuration] = await this.prompt(configuration);
    while (nextstep !== "exit" && nextstep !== "exit-module") {
      [nextstep, configuration] = await this.prompt(configuration);
    }
    if (nextstep === "exit-module") {
      nextstep = "";
    }
    return [nextstep, configuration];
  }

  async promptImportConfigurationWizard(): Promise<Configuration> {
    const configuration: Configuration = new Configuration();
    const answers = await (inquirer.prompt(this.CLIModulePrompts.importConfiguration).then((answers) => {
      return answers;
    }));
    if (answers.value) {
      switch (answers.value) {
        case 'default':
          await configuration.loadDefault();
          break;
        case 'custom':
          await configuration.loadWithPrompt();
          break;
        case 'exit':
          break;
        case 'exit-module':
          break;
        default:
          break;
      }
    }
    return configuration;
  }

  async promptExportConfigurationWizard(configuration: Configuration): Promise<Configuration> {
    const answers = await (inquirer.prompt(this.CLIModulePrompts.exportConfiguration).then((answers) => {
      return answers;
    }));
    if (answers.value) {
      switch (answers.value) {
        case 'default':
          await configuration.saveDefault();
          break;
        case 'custom':
          await configuration.saveWithPrompt();
          break;
        case 'exit':
          break;
        case 'exit-module':
          break;
        default:
          break;
      }
    }
    return configuration;
  }
}


