import * as inquirer from 'inquirer';
import { CLIModule } from '../../common/cli-module';

import { Configuration } from '../../../impl/configuration';
import { ExperimentConfiguration, ExperimentSettings } from '../../../impl/experiment';
import { WorkloadType } from '../../../interface/workload';
import { ExecutionMode } from '../../../interface/experiment';

export class Module {
  public static getInstance(): ExpermientModule {
    return new ExpermientModule();
  }
}

export class ExpermientModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  getPrompts(): Array<any> {
    return [
      this.CLIModuleQuestions.entryName,
      {
        type: 'list',
        name: 'workloadType',
        message: 'Please select the type of the workload you would like to use.',
        choices: async (answers): Promise<any> => {
          const choices: Array<any> = [];
          for (const _key in WorkloadType) {
            choices.push({ 'name': _key, 'value': WorkloadType[_key] });
          }
          return choices;
        },
      }, {
        type: 'list',
        name: 'workloadName',
        message: 'Please select the name of the workload you would like to use.',

      }, {
        type: 'list',
        name: 'platformName',
        message: 'Please select the name of the platform you would like to use.',
      }, {
        type: 'number',
        name: 'concurrentSessionCount',
        message: 'Number of concurrent sessions?',
        default: 1,
        'validate': async (input: number): Promise<any> => {
          if (input > 0)
            return true;
          return "Only positive numbers > 0 are allowed";
        },
      }, {
        type: 'list',
        name: 'executionMode',
        message: 'Which query execution mode would you like to use ?',
        choices: [
          { name: 'Concurrently (all queries are started at the same time)', value: ExecutionMode.CONCURRENT },
          { name: 'Sequentially (queries are started one after each other)', value: ExecutionMode.SEQUENTIAL },
        ],
      },
      {
        type: 'confirm',
        name: 'keepInfrastructure',
        message: 'Do you want to keep the infrastructure after the experiment?',
        default: false,
      }
    ];
  }

  getPromptByName(items : Array<any>, name :string): any {
    for (const item of items) {
      if(item['name'] === name){
        return item;
      }
    }
    return false;
  }
  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    const prompts: Array<any> = this.getPrompts();

    const workloadNamePrompt = this.getPromptByName(prompts, "workloadName");

    workloadNamePrompt['choices'] = async (answers): Promise<Array<any>> => {
      const choices: Array<any> = [];
      for (const _key in configuration.workloads) {
        if (configuration.workloads[_key].workloadType === answers.workloadType) {
          choices.push({ 'name': configuration.workloads[_key].name, 'value': _key });
        }
      }
      if (choices.length === 0) {
        choices.push({ 'name': 'No entries found.', disabled: true });
        choices.push(new inquirer.Separator());
        choices.push({ 'name': 'Return to the previous menu', 'value': 'exit-module' });
      }
      return choices;
    };

    const platformNamePrompt = this.getPromptByName(prompts, "platformName");
    platformNamePrompt['choices'] = async (answers): Promise<Array<any>> => {
      const choices: Array<any> = [];
      for (const _key in configuration.platforms) {
        if (configuration.platforms[_key].workloadType.includes(answers.workloadType)) {
          choices.push({ 'name': configuration.platforms[_key].name, 'value': _key });
        }
      }
      if (choices.length === 0) {
        choices.push({ 'name': 'No entries found.', disabled: true });
        choices.push(new inquirer.Separator());
        choices.push({ 'name': 'Return to the previous menu', 'value': 'exit-module' });
      }
      return choices;
    };

    // console.log(JSON.stringify(prompts, null, 2));

    const answers = await inquirer.prompt(prompts).then(async (answers) => {
      // console.log(JSON.stringify(answers, null, 2));   
      for (const _key in answers) {
        if (answers[_key] === 'exit-module') {
          return answers;
        }
      }
      const settings = new ExperimentSettings();
      settings.platformConfig = configuration.platforms[answers.platformName];
      settings.workloadConfig = configuration.workloads[answers.workloadName];
      settings.concurrentSessionCount = answers.concurrentSessionCount;
      settings.executionMode = answers.executionMode;
      settings.keepInfrastructure = answers.keepInfrastructure;

      // console.log(JSON.stringify(settings, null, 2));

      const entry = new ExperimentConfiguration();
      entry.name = answers.name;
      entry.platformType = settings.platformConfig.platformType;
      entry.workloadType = settings.workloadConfig.workloadType;
      entry.settings = settings;
      // console.log(JSON.stringify(entry, null, 2));

      configuration = await this.addEntry(configuration, entry);
      return answers;

    });
    let nextstep = 'continue';
    if (
      answers.workloadName === 'exit-module' || answers.platformName === 'exit-module'
      || !(await this.promptAddMoreEntry())) {
      nextstep = 'exit-module';
    }
    return [nextstep, configuration];
  }
}
