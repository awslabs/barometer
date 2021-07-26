import * as inquirer from 'inquirer';
import { CLIModule } from '../../common/cli-module';

import { Configuration } from '../../../impl/configuration';
import { ExperimentConfiguration } from '../../../impl/experiment';

export class Module {
  public static getInstance(): ExpermientModule {
    return new ExpermientModule();
  }
}

export class ExpermientModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  prompts = [
    this.CLIModuleQuestions.promptEntryName,
  ];

  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    await inquirer.prompt(this.prompts).then(async (answers) => {
      if (answers) {
        // const settings = new ExperimentSetting();


        const entry = new ExperimentConfiguration();
        entry.name = answers.name;

        // entry.settings = settings;

        configuration = await this.addEntry(configuration, entry);
      }
    });
    let nextstep = 'continue';
    if (!(await this.promptAddMoreEntry())) {
      nextstep = 'exit-module';
    }
    return [nextstep, configuration];
  }
}
