import * as inquirer from 'inquirer';

import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(): WorkloadModule {
    return new WorkloadModule();
  }
}
export class WorkloadModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  prompts = [
    {
      type: 'list',
      name: 'value',
      message: 'Which workload type would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { name: 'Analytics / OLAP dataset', value: '../modules/workloads/olap/new' },
        { name: 'Transactional / OLTP dataset', value: '../modules/workloads/oltp/new', disabled: 'Unavailable at this time' },
        { name: 'Bring Your Own dataset', value: '../modules/workloads/custom/new', disabled: 'Unavailable at this time' },
        new inquirer.Separator(),
        { name: 'Return to the main menu', value: 'exit-module' },
        { name: 'Exit CLI', value: 'exit' },
        new inquirer.Separator(),
      ],
    },
  ];

}
