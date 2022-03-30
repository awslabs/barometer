import * as fs from 'fs';

import { Configuration } from '../../impl/configuration';
import { CLIModule, ICLIModule } from '../common/cli-module';
import { CLIModulePrompts } from '../common/cli-prompts';

export const DEFAULT_CONFG_FILE_NAME = process.cwd() + '/storage/benchmarking-config.json';

export class Module {
  public static getInstance(configuration: Configuration ): ConfigurationModule {
    return new ConfigurationModule(configuration, "ConfigurationModule");
  }
}

export class ConfigurationModule extends CLIModule implements ICLIModule {
  constructor(configuration: Configuration, modulename: string) {
    super(configuration, modulename);
    this.loadDefault();
  }

  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push({
      type: 'list',
      name: 'value',
      message: 'Which action would you like to execute ?',
      choices: [
        { name: 'Manage platforms', value: './platform' },
        { name: 'Manage workloads', value: './workload' },
        { name: 'Manage experiments', value: './experiment' },
        this.getQuestionSeparator(),
        { name: 'Display current configuration', value: 'display' },
        { name: 'Save current configuration', value: 'save' },
        { name: 'Restore initial current configuration', value: 'restore' },
        { name: 'Reset current configuration', value: 'reset' },
        { name: 'Load existing configuration', value: 'load' },
        this.getQuestionSeparator(),
        { name: 'Exit CLI', value: 'exit' },
        this.getQuestionSeparator(),
      ],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    throw new Error('Method not implemented.');
  }

  async runConfigurationModule(): Promise<void> {
    // prompt to execute an action until the user decide to stop
    await this.runConfigurationModuleQuestions();
    // loop until the next step is exit
    while (this.nextstep !== 'exit') {
      await this.runConfigurationModuleQuestions();
    }
  }

  async runConfigurationModuleQuestions(): Promise<void> {
    await this.askQuestions(this.getQuestions()).then(async (answers) => {
      if (answers.value) {
        let conf_module;
        this.nextstep = answers.value;
        switch (this.nextstep) {
          case 'display':
            this.configuration.print();
            break;
          case 'save':
            await this.saveConfiguration();
            break;
          case 'load':
            await this.loadConfiguration();
            break;
          case 'restore':
            await this.restoreConfiguration();
            break;
          case 'reset':
            await this.resetConfiguration();
            break;
          case 'exit':
            await this.exitCLI();
            break;
          default:
            conf_module = require(this.nextstep);
            [this.nextstep, this.configuration] = await conf_module.Module.getInstance(this.configuration).runModule();
            if (this.nextstep === 'exit') {
              await this.exitCLI();
            }
            break;
        }
      }
    });
  }
  async loadConfiguration(): Promise<void> {
    const answers = await this.askQuestions(CLIModulePrompts.importConfiguration).then((answers) => {
      return answers;
    });
    if (answers.value) {
      switch (answers.value) {
        case 'default':
          await this.loadDefault();
          break;
        case 'custom':
          await this.loadWithPrompt();
          break;
        case 'exit':
          break;
        case 'exit-module':
          break;
        default:
          break;
      }
    }
  }

  async saveConfiguration(): Promise<void> {
    const answers = await this.askQuestions(CLIModulePrompts.exportConfiguration).then((answers) => {
      return answers;
    });
    if (answers.value) {
      switch (answers.value) {
        case 'default':
          await this.saveDefault();
          break;
        case 'custom':
          await this.saveWithPrompt();
          break;
        case 'exit':
          break;
        case 'exit-module':
          break;
        default:
          break;
      }
    }
  }

  async exitCLI(): Promise<void> {
    console.log('Exiting.');
    await this.saveConfiguration();
  }
  async restoreConfiguration(): Promise<void> {
    this.configuration = new Configuration();
    await this.loadDefault();
  }
  async resetConfiguration(): Promise<void> {
    this.configuration = new Configuration();
    this.configuration.loaded = true;
  }

  async load(path: string): Promise<void> {
    try {
      console.log(`Loading configuration file : ${path}`);
      const config = JSON.parse(fs.readFileSync(path, 'utf8'));

      this.configuration = new Configuration();
      this.configuration.buildFrom(config);

      // TODO: need to implement a validation of the format/content before reading
    } catch (e) {
      console.error(`Configuration file not found: ${path}. Creating a default configuration file...`);
      console.error(e);
      this.configuration = new Configuration();
      await this.save(path);
      require(path);
    }
    this.configuration.loaded = true;
  }

  async save(path: string): Promise<void> {
    try {
      fs.writeFileSync(path, this.configuration.toSaveFormat());
      console.log(`\nThe configuration has been successfully written to : ${path}.`);

      // TODO: need to implement a validation of the format/content before writing
    } catch (e) {
      console.error(`
        The provided configuration file could not be found. ${path}
      `);
      console.error(e);
      process.exit(1);
    }
  }

  async loadWithPrompt(): Promise<void> {
    const path = await this.askQuestions(CLIModulePrompts.importConfigurationPath).then((answers) => {
      return answers.value;
    });
    this.load(path);
  }

  async saveWithPrompt(): Promise<void> {
    const path = await this.askQuestions(CLIModulePrompts.exportConfigurationPath).then((answers) => {
      return answers.value;
    });
    this.save(path);
  }

  async loadDefault(): Promise<void> {
    await this.load(DEFAULT_CONFG_FILE_NAME);
  }

  async saveDefault(): Promise<void> {
    await this.save(DEFAULT_CONFG_FILE_NAME);
  }
}
