import * as inquirer from 'inquirer';

import { Configuration, ConfigurationItem, DEFAULT_CONFG_FILE_NAME } from '../../impl/configuration';

export interface ICLIModule {
  run(configuration: Configuration, module: string): Promise<[string, Configuration]>;

  nextstep: string;
}

export abstract class CLIModule implements ICLIModule {
  nextstep!: string;

  abstract getPrompts(): Array<any>;

  async run(configuration: Configuration, module_name: string): Promise<[string, Configuration]> {
    // prompt to execute an action until the user decide to stop
    [this.nextstep, configuration] = await this.prompt(configuration);
    while (this.nextstep !== 'exit' && this.nextstep !== 'exit-module') {
      [this.nextstep, configuration] = await this.prompt(configuration);
    }

    // we need to reset the next step to avoid full exit here
    if (this.nextstep === 'exit-module') {
      this.nextstep = 'continue-previous-menu';
    }
    return [this.nextstep, configuration];
  }

  protected async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    const module_name = 'experiment';
    return await inquirer.prompt(this.getPrompts()).then(async (answers): Promise<[string, Configuration]> => {
      let conf_module;
      if (answers.value) {
        switch (answers.value) {
          case 'exit-module':
            break;
          default:
            conf_module = require("" + answers.value);
            [answers.value, configuration] = await conf_module.Module.getInstance().run(configuration, module_name);
            break;
        }
      }
      return [answers.value, configuration];
    });
  }

  protected CLIModuleQuestions = {
    entryName: {
      type: 'input',
      name: 'name',
      message: 'Please provide name for this entry (You will be able to use by this name later)',
      validate: async (input: string | any[]): Promise<any> => {
        if (input.length > 0) return true;
        return 'Name can not be empty';
      },
    },
  };

  protected CLIModulePrompts = {
    exportConfiguration: [
      {
        type: 'list',
        name: 'value',
        message: 'How would you like to export your current configuration ?',
        hint: '- Use <space> to select and <return> to submit.',
        choices: [
          {
            name: 'Save to default location ' + DEFAULT_CONFG_FILE_NAME,
            value: 'default',
          },
          { name: 'Save to custom location', value: 'custom' },
          { name: "Don't save", value: 'exit' },
        ],
      },
    ],
    importConfiguration: [
      {
        type: 'list',
        name: 'value',
        message: 'How would you like to import your configuration ?',
        choices: [
          {
            name: 'Load from default location ' + DEFAULT_CONFG_FILE_NAME,
            value: 'default',
          },
          { name: 'Load from custom location', value: 'custom' },
          { name: "Don't load", value: 'exit' },
        ],
      },
    ],
    addMoreConfigurationItem: [
      {
        type: 'confirm',
        name: 'value',
        message: 'Do you want to add an additional entry?',
        default: false,
      },
    ],
    overrideConfigurationItem: [
      {
        type: 'list',
        name: 'value',
        message: 'An entry with the same name exist. How do you want to proceed ?',
        choices: [
          { name: 'Rename entry', value: 'rename' },
          { name: 'Override existing entry', value: 'override' },
          { name: 'Discard change', value: 'discard' },
        ],
      },
      {
        type: 'input',
        name: 'name',
        message: 'Please provide name for this entry.',
        when: function (answers): boolean {
          return answers.value === 'rename';
        },
      },
    ],
  };

  async exitCLI(configuration: Configuration): Promise<void> {
    console.log('Exiting.');
    await this.exportConfigurationWizard(configuration);
  }

  async importConfigurationWizard(): Promise<Configuration> {
    const configuration: Configuration = new Configuration();
    const answers = await inquirer.prompt(this.CLIModulePrompts.importConfiguration).then((answers) => {
      return answers;
    });
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

  async exportConfigurationWizard(configuration: Configuration): Promise<Configuration> {
    const answers = await inquirer.prompt(this.CLIModulePrompts.exportConfiguration).then((answers) => {
      return answers;
    });
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

  async promptAddMoreEntry(): Promise<boolean> {
    const answers = await inquirer.prompt(this.CLIModulePrompts.addMoreConfigurationItem).then((answers) => {
      return answers;
    });
    return answers.value;
  }

  async addEntry(configuration: Configuration, entry: ConfigurationItem): Promise<Configuration> {
    // add empty if not exists
    if (!configuration[entry.configType]) {
      configuration[entry.configType] = {};
    }

    if (configuration[entry.configType][entry.name]) {
      // is entry exist, ask if override
      configuration = await this.overrideEntry(configuration, entry);
    } else {
      configuration[entry.configType][entry.name] = entry;
    }

    return configuration;
  }

  async overrideEntry(configuration: Configuration, entry: ConfigurationItem): Promise<Configuration> {
    this.CLIModulePrompts.overrideConfigurationItem[1]['validate'] = async (input: string | any[]): Promise<any> => {
      if (input.length === 0) {
        return 'Name can not be empty';
      }
      if (configuration[entry.configType][input]) {
        return 'Entry name already exists. Select a different name.';
      }
      return true;
    };

    const answers = await inquirer.prompt(this.CLIModulePrompts.overrideConfigurationItem).then((answers) => {
      return answers;
    });
    if (answers) {
      switch (answers.value) {
        case 'discard':
          break;
        case 'override':
          configuration[entry.configType][entry.name] = entry;
          break;
        case 'rename':
          entry.name = answers.name;
          configuration[entry.configType][entry.name] = entry;
          break;
        default:
          break;
      }
    }
    return configuration;
  }
}
