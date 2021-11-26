import { Configuration } from '../../../../impl/configuration';

import { AthenaPlatformConfiguration, AthenaSettings } from '../../../../impl/platforms/athena/new';
import { CLIModule } from '../../../common/cli-module';
import { CLIModuleQuestions } from '../../../common/cli-prompts';

export class Module {
  public static getInstance(configuration: Configuration): AthenaModule {
    return new AthenaModule(configuration, 'AthenaModule');
  }
}

export class AthenaModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push(CLIModuleQuestions.entryName);
    this.questions.push({
      type: 'number',
      name: 'bytesScannedCutoffPerQuery',
      message: 'Maximum bytes in MB scan allowed for the workgroup?',
      default: 200,
      validate: async (input: number): Promise<any> => {
        if (input > 0) return true;
        return 'Only numbers > 0 are allowed';
      },
    });
    this.questions.push({
      type: 'confirm',
      name: 'enforceWorkgroupConfiguration',
      message: 'Do you want to enforce workgroup configuration?',
      default: false,
    });
  }

  async runModuleQuestions(): Promise<[string, Configuration]> {
    await this.askQuestions(this.getQuestions()).then(async (answers) => {
      if (answers) {
        const settings = new AthenaSettings();
        settings.bytesScannedCutoffPerQuery = answers.bytesScannedCutoffPerQuery * 1000000;
        settings.enforceWorkgroupConfiguration = answers.enforceWorkgroupConfiguration;

        const entry = new AthenaPlatformConfiguration();
        entry.name = answers.name;
        entry.settings = settings;
        entry.loadDataset = false;

        await this.addEntry(entry);
      }
    });
    this.nextstep = 'continue';
    if (!(await this.askAddMoreEntry())) {
      this.nextstep = 'exit-module';
    }
    return [this.nextstep, this.configuration];
  }
}
