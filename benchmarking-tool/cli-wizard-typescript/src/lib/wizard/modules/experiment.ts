import * as inquirer from 'inquirer';

import { Configuration } from '../../impl/configuration';
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
  prompts = {
    "selectAction": [{
      type: 'list',
      name: 'value',
      message: 'Which platform would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { 'name': 'Redshift DC Single Node Cluster', 'value': 'redshift-dc-single-node' },
        { 'name': 'Redshift DC Multi Node Cluster', 'value': 'redshift-dc-multi-node' },
        { 'name': 'Redshift RA3 Multi Node Cluster', 'value': 'redshift-ra-multi-node', disabled: 'Unavailable at this time', },
        new inquirer.Separator(),
        { 'name': 'Return to the previous menu', 'value': 'exit-module' },
        { 'name': 'Exit CLI', 'value': 'exit' },
        new inquirer.Separator(),
      ]
    }]
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
            conf_module = require("./platforms/" + answers.value);
            [answers.value, configuration] = await conf_module.Module.getInstance().run(configuration);
            break;
        }
      }
      return answers.value;
    }));
    return [nextstep, configuration];
  }
}
