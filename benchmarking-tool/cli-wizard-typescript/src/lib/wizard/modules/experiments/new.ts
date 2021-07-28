import { CLIModule } from '../../common/cli-module';
import { Configuration } from '../../../impl/configuration';
import { ExperimentConfiguration, ExperimentSettings } from '../../../impl/experiment';
import { WorkloadType } from '../../../interface/workload';
import { ExecutionMode } from '../../../interface/experiment';
import { CLIModuleQuestions } from '../../common/cli-prompts';

export class Module {
  promptAddMoreEntry;
  public static getInstance(configuration: Configuration): ExpermientModule {
    return new ExpermientModule(configuration, 'ExpermientModule');
  }
}

export class ExpermientModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push(CLIModuleQuestions.entryName);
    this.questions.push({
      type: 'list',
      name: 'workloadType',
      message: 'Please select the type of the workload you would like to use.',
      choices: async (): Promise<any> => {
        const choices: Array<any> = [];
        for (const _key in WorkloadType) {
          choices.push({ name: _key, value: WorkloadType[_key] });
        }
        return choices;
      },
    });
    this.questions.push({
      type: 'list',
      name: 'workloadName',
      message: 'Please select the name of the workload you would like to use.',
    });
    this.questions.push({
      type: 'list',
      name: 'platformName',
      message: 'Please select the name of the platform you would like to use.',
    });
    this.questions.push({
      type: 'number',
      name: 'concurrentSessionCount',
      message: 'Number of concurrent sessions?',
      default: 1,
      validate: async (input: number): Promise<any> => {
        if (input > 0) return true;
        return 'Only positive numbers > 0 are allowed';
      },
    });
    this.questions.push({
      type: 'list',
      name: 'executionMode',
      message: 'Which query execution mode would you like to use ?',
      choices: [
        {
          name: 'Concurrently (all queries are started at the same time)',
          value: ExecutionMode.CONCURRENT,
        },
        {
          name: 'Sequentially (queries are started one after each other)',
          value: ExecutionMode.SEQUENTIAL,
        },
      ],
    });
    this.questions.push({
      type: 'confirm',
      name: 'keepInfrastructure',
      message: 'Do you want to keep the infrastructure after the experiment?',
      default: false,
    });
  }

  async runModuleQuestions(): Promise<[string, Configuration]> {
    const _questions: Array<any> = this.getQuestions();

    const workloadNamePrompt = this.getQuestionByName(_questions, 'workloadName');
    workloadNamePrompt['choices'] = async (answers): Promise<Array<any>> => {
      const choices: Array<any> = [];
      for (const _key in this.configuration.workloads) {
        if (this.configuration.workloads[_key].workloadType === answers.workloadType) {
          choices.push({
            name: this.configuration.workloads[_key].name,
            value: _key,
          });
        }
      }
      if (choices.length === 0) {
        choices.push({ name: 'No entries found.', disabled: true });
        choices.push(this.getQuestionSeparator());
        choices.push({ name: 'Return to the previous menu', value: 'exit-module' });
      }
      return choices;
    };

    const platformNamePrompt = this.getQuestionByName(_questions, 'platformName');
    platformNamePrompt['choices'] = async (answers): Promise<Array<any>> => {
      const choices: Array<any> = [];
      for (const _key in this.configuration.platforms) {
        if (this.configuration.platforms[_key].workloadType.includes(answers.workloadType)) {
          choices.push({
            name: this.configuration.platforms[_key].name,
            value: _key,
          });
        }
      }
      if (choices.length === 0) {
        choices.push({ name: 'No entries found.', disabled: true });
        choices.push(this.getQuestionSeparator());
        choices.push({ name: 'Return to the previous menu', value: 'exit-module' });
      }
      return choices;
    };

    const answers = await this.askQuestions(_questions).then(async (answers) => {
      for (const _key in answers) {
        if (answers[_key] === 'exit-module') {
          return answers;
        }
      }
      const settings = new ExperimentSettings();
      settings.platformConfig = this.configuration.platforms[answers.platformName];
      settings.workloadConfig = this.configuration.workloads[answers.workloadName];
      settings.concurrentSessionCount = answers.concurrentSessionCount;
      settings.executionMode = answers.executionMode;
      settings.keepInfrastructure = answers.keepInfrastructure;

      const entry = new ExperimentConfiguration();
      entry.name = answers.name;
      entry.platformType = settings.platformConfig.platformType;
      entry.workloadType = settings.workloadConfig.workloadType;
      entry.settings = settings;

      await this.addEntry(entry);
      return answers;
    });
    this.nextstep = 'continue';
    if (answers.workloadName === 'exit-module' || answers.platformName === 'exit-module' || !(await this.askAddMoreEntry())) {
      this.nextstep = 'exit-module';
    }
    return [this.nextstep, this.configuration];
  }
}
