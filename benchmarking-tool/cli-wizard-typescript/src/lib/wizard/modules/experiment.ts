import { Configuration } from '../../impl/configuration';
import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(configuration: Configuration): ExperimentModule {
    return new ExperimentModule(configuration, 'ExperimentModule');
  }
}
export class ExperimentModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push({
      type: 'list',
      name: 'value',
      message: 'Which action would you like to execute ?',
      choices: [
        { name: 'Add an experiment', value: '../modules/experiments/new' },
        { name: 'Deploy an experiment', value: '../modules/experiments/deploy', disabled: 'Unavailable at this time' },
        { name: 'Run an experiment', value: '../modules/experiments/run', disabled: 'Unavailable at this time' },
        { name: 'Tear down an experiment', value: '../modules/experiments/teardown', disabled: 'Unavailable at this time' },
        this.getQuestionSeparator(),
        { name: 'Return to the previous menu', value: 'exit-module' },
        { name: 'Exit CLI', value: 'exit' },
        this.getQuestionSeparator(),
      ],
    });
  }
}
