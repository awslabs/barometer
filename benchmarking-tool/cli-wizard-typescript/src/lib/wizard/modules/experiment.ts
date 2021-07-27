import * as inquirer from 'inquirer';

import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(): ExperimentModule {
    return new ExperimentModule();
  }
}
export class ExperimentModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  getPrompts(): Array<any> {
    return [
      {
        type: 'list',
        name: 'value',
        message: 'Which action would you like to execute ?',
        hint: '- Use <space> to select and <return> to submit.',
        choices: [
          { name: 'Add an experiment', value: '../modules/experiments/new' },
          { name: 'Deploy an experiment', value: '../modules/experiments/deploy', disabled: 'Unavailable at this time' },
          { name: 'Run an experiment', value: '../modules/experiments/run', disabled: 'Unavailable at this time' },
          { name: 'Tear down an experiment', value: '../modules/experiments/teardown', disabled: 'Unavailable at this time' },
          new inquirer.Separator(),
          { name: 'Return to the previous menu', value: 'exit-module' },
          { name: 'Exit CLI', value: 'exit' },
          new inquirer.Separator(),
        ],
      },
    ];
  }
}
