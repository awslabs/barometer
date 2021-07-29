import * as inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';
import { Configuration, ConfigurationItem } from '../../impl/configuration';
import { CLIModulePrompts } from './cli-prompts';

export interface ICLIModule {
  runModule(): Promise<[string, Configuration]>;

  nextstep: string;
}

export abstract class CLIModule implements ICLIModule {
  configuration: Configuration;

  modulename: string;
  nextstep: string;

  questions!: Array<any>;

  protected clipromptWrapper;

  constructor(configuration: Configuration, modulename: string) {
    this.configuration = configuration;
    this.modulename = modulename;
    this.nextstep = '';
    this.setQuestions();

    this.exit = this.exit.bind(this);
    this.exitOnKeypress = this.exitOnKeypress.bind(this);

    // Make sure new prompt start on a newline when closing
    process.on('exit', this.exit);
    process.stdin.on('keypress', this.exitOnKeypress);
  }

  exitOnKeypress(data: string, key: { name: string; ctrl: any }): void {
    if (key && key.name === 'c' && key.ctrl) {
      this.exit();
    }
  }

  exit(): void {
    this.clipromptWrapper.ui.close();
  }

  abstract setQuestions(): void;

  getQuestions(): Array<any> {
    return this.questions;
  }

  async runModule(): Promise<[string, Configuration]> {
    // prompt to execute an action until the user decide to stop
    [this.nextstep, this.configuration] = await this.runModuleQuestions();
    while (this.nextstep !== 'exit' && this.nextstep !== 'exit-module') {
      [this.nextstep, this.configuration] = await this.runModuleQuestions();
    }

    // we need to reset the next step to avoid full exit here
    if (this.nextstep === 'exit-module') {
      this.nextstep = 'continue-previous-menu';
    }
    return [this.nextstep, this.configuration];
  }

  async runModuleQuestions(): Promise<[string, Configuration]> {
    await this.askQuestions(this.questions).then(async (answers): Promise<void> => {
      let conf_module;
      if (answers.value) {
        this.nextstep = answers.value;
        switch (answers.value) {
          case 'exit':
            break;
          case 'exit-module':
            break;
          default:
            conf_module = require('' + answers.value);
            [this.nextstep, this.configuration] = await conf_module.Module.getInstance(this.configuration).runModule();
            break;
        }
      }
    });
    return [this.nextstep, this.configuration];
  }

  askQuestions(questions: Array<any>): Promise<any> {
    this.clipromptWrapper = inquirer.prompt(questions);
    return this.clipromptWrapper;
  }

  getQuestionByName(items: Array<any>, name: string): any {
    for (const item of items) {
      if (item['name'] === name) {
        return item;
      }
    }
    return false;
  }

  getQuestionSeparator(): Separator {
    return new inquirer.Separator();
  }

  async askAddMoreEntry(): Promise<boolean> {
    const answers = await this.askQuestions(CLIModulePrompts.addMoreConfigurationItem).then((answers) => {
      return answers;
    });
    return answers.value;
  }

  async addEntry(entry: ConfigurationItem): Promise<void> {
    // add empty if not exists
    if (!this.configuration[entry.configType]) {
      this.configuration[entry.configType] = {};
    }

    if (this.configuration[entry.configType][entry.name]) {
      // is entry exist, ask if override
      await this.overrideEntry(entry);
    } else {
      this.configuration[entry.configType][entry.name] = entry;
    }
  }

  async overrideEntry(entry: ConfigurationItem): Promise<void> {
    CLIModulePrompts.overrideConfigurationItem[1]['validate'] = async (input: string): Promise<any> => {
      if (input.length === 0) {
        return 'Name can not be empty';
      }
      if (this.configuration[entry.configType][input]) {
        return 'Entry name already exists. Select a different name.';
      }
      return true;
    };

    const answers = await this.askQuestions(CLIModulePrompts.overrideConfigurationItem).then((answers) => {
      return answers;
    });
    if (answers) {
      switch (answers.value) {
        case 'discard':
          break;
        case 'override':
          this.configuration[entry.configType][entry.name] = entry;
          break;
        case 'rename':
          entry.name = answers.name;
          this.configuration[entry.configType][entry.name] = entry;
          break;
        default:
          break;
      }
    }
  }
}
