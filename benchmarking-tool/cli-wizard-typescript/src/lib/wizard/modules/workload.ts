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
      message: 'Which workload type would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'Analytics / OLAP dataset', 'value': 'olap/new' },
        { 'name': 'Transactional / OLTP dataset', 'value': 'oltp/new', disabled: 'Unavailable at this time', },
        { 'name': 'Bring Your Own dataset', 'value': 'custom/new', disabled: 'Unavailable at this time', },
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
      if (answers) {
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
        if (answers.workload_type === "exit-module") {
          return "exit-module";
        }
      }
      return answers.value;
    }));
    return [nextstep, configuration];
  }
}
