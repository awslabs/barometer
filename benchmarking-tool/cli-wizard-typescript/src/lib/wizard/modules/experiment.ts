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
  prompts = [
    {
      type: 'list',
      name: 'value',
      message: 'Which platform would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'Add an experiment', 'value': '../modules/experiments/new' },
        new inquirer.Separator(),
        { 'name': 'Return to the previous menu', 'value': 'exit-module' },
        { 'name': 'Exit CLI', 'value': 'exit' },
        new inquirer.Separator(),
      ]
    }
  ];
}
