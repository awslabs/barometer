import { NodeType } from '@aws-cdk/aws-redshift';
import * as inquirer from 'inquirer';
import { Configuration } from '../../../../impl/configuration';

import { AthenaPlatformConfiguration, AthenaSettings } from '../../../../impl/platforms/athena/new';
import { CLIModule } from '../../../common/cli-module';

export class Module {
  public static getInstance(): AthenaModule {
    return new AthenaModule();
  }
}

export class AthenaModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  getPrompts(): Array<any> {
    return [
      this.CLIModuleQuestions.entryName, {
        type: 'input',
        name: 'bytesScannedCutoffPerQuery',
        message: 'Maximum bytes in MB scan allowed for the workgroup?',
        default: 200,
        'validate': async (input: string): Promise<any> => {
          if (parseInt(input) > 0)
            return true;
          return "Only numbers > 0 are allowed";
        }
      }, {
        type: 'confirm',
        name: 'enforceWorkgroupConfiguration',
        message: 'Do you want to enforce workgroup configuration?',
        default: false,
      }
    ];
  }

  async prompt(configuration: Configuration): Promise<[string, Configuration]> {
    configuration = await inquirer.prompt(this.getPrompts()).then(async (answers) => {
      if (answers) {
        const settings = new AthenaSettings();
        settings.bytesScannedCutoffPerQuery = answers.bytesScannedCutoffPerQuery * 1000000;
        settings.enforceWorkgroupConfiguration = answers.enforceWorkgroupConfiguration;

        const entry = new AthenaPlatformConfiguration();
        entry.name = answers.name;
        entry.settings = settings;

        configuration = await this.addEntry(configuration, entry);
      }
      return configuration;
    });
    let nextstep = 'continue';
    if (!(await this.promptAddMoreEntry())) {
      nextstep = 'exit-module';
    }
    return [nextstep, configuration];
  }
}
