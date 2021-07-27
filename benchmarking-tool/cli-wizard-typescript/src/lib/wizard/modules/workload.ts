import * as inquirer from 'inquirer';
import { WorkloadTypeName } from '../../interface/workload';

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
  getPrompts(): Array<any> {
    return [
      {
        type: 'list',
        name: 'value',
        message: 'Which workload type would you like to configure ?',
        hint: '- Use <space> to select and <return> to submit.',
        choices: [
          { name: WorkloadTypeName.OLAP, value: '../modules/workloads/olap/new' },
          { name: WorkloadTypeName.OLTP, value: '../modules/workloads/oltp/new', disabled: 'Unavailable at this time' },
          // { name: WorkloadTypeName.CUSTOM, value: '../modules/workloads/custom/new', disabled: 'Unavailable at this time' },
          new inquirer.Separator(),
          { name: 'Return to the main menu', value: 'exit-module' },
          { name: 'Exit CLI', value: 'exit' },
          new inquirer.Separator(),
        ],
      },
    ];
  }
}
