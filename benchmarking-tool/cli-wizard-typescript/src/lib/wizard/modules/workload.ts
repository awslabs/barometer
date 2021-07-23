import * as inquirer from 'inquirer';

import { Configuration } from '../../impl/configuration';
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
  prompts = {
    "selectAction": [{
      type: 'list',
      name: 'value',
      message: 'Which workload would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'TPC-DS Version 2', 'value': 'tpc-ds/v2', disabled: 'Unavailable at this time' },
        { 'name': 'TPC-DS Version 3', 'value': 'tpc-ds/v3' },
        { 'name': 'TPC-H Version 2', 'value': 'tpc-h/v2', disabled: 'Unavailable at this time' },
        { 'name': 'TPC-H Version 3', 'value': 'tpc-h/v3' },
         new inquirer.Separator(),
        { 'name': 'Return to the main menu', 'value': 'exit-module' },
        { 'name': 'Exit CLI', 'value': 'exit' },
        new inquirer.Separator(),
      ],
    },
    ]
  };

  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    const nextstep: string = await (inquirer.prompt(this.prompts.selectAction).then(async (answers) => {
      let conf_module;
      if (answers.value) {
        switch (answers.value) {
          case 'exit':
            console.log("Exiting.");
            break;
          case 'exit-module':
            break;
          default:
            console.log("Execute Module : " + answers.value);
            conf_module = require("./workloads/" + answers.value);
            [answers.value, configuration] = await conf_module.Module.getInstance().run(configuration);
            break;
        }
      }
      return answers.value;
    }));
    return [nextstep, configuration];
  }
}
