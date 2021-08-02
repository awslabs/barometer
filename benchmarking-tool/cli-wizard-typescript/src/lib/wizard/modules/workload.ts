import { Configuration } from '../../impl/configuration';
import { WorkloadTypeName } from '../../interface/workload';

import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(configuration: Configuration): WorkloadModule {
    return new WorkloadModule(configuration, 'WorkloadModule');
  }
}
export class WorkloadModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push({
      type: 'list',
      name: 'value',
      message: 'Which workload type would you like to configure ?',
      choices: [
        { name: WorkloadTypeName.OLAP, value: '../modules/workloads/olap/new' },
        {
          name: WorkloadTypeName.OLTP,
          value: '../modules/workloads/oltp/new',
          disabled: 'Unavailable at this time',
        },
        // { name: WorkloadTypeName.CUSTOM, value: '../modules/workloads/custom/new', disabled: 'Unavailable at this time' },
        this.getQuestionSeparator(),
        { name: 'Return to the main menu', value: 'exit-module' },
        { name: 'Exit CLI', value: 'exit' },
        this.getQuestionSeparator(),
      ],
    });
  }
}
