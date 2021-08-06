import { CLIModule, ICLIModule } from '../../../common/cli-module';

import { Configuration } from '../../../../impl/configuration';
import { OLAPWorkloadSettings, OLAPWorkloadConfiguration } from '../../../../impl/workloads/olap/new';
import { CLIModuleQuestions } from '../../../common/cli-prompts';

export class Module {
  public static getInstance(configuration: Configuration): OLAPWorkloadModule {
    return  new OLAPWorkloadModule(configuration, 'OLAPWorkloadModule');
  }
}

export class OLAPWorkloadModule extends CLIModule implements ICLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push(CLIModuleQuestions.entryName);
    this.questions.push({
      type: 'list',
      name: 'dataset',
      message: 'Which Analytics / OLAP dataset would you like to use ?',
      choices: [
        { name: 'TPC-DS Version 3', value: 'tpc-ds/v3' },
        {
          name: 'TPC-H Version 3',
          value: 'tpc-h/v3',
          disabled: 'Unavailable at this time',
        },
      ],
    });
    this.questions.push({
      type: 'list',
      name: 'scalingFactor',
      message: 'Which scaling factor would you like to use ?',
      choices: [
        { name: '100', value: '100' },
        { name: '1k', value: '1000' },
        { name: '3k', value: '3000' },
        { name: '10k', value: '10000' },
        { name: '30k', value: '30000' },
        { name: '100k', value: '100000' },
      ],
      when: function (answers): boolean {
        // Only run if user set a name
        return answers.dataset.startsWith('tpc-h');
      },
    });
    this.questions.push({
      type: 'list',
      name: 'scalingFactor',
      message: 'Which scaling factor would you like to use ?',
      choices: [
        { name: '10k', value: '10000' },
        { name: '100k', value: '100000' },
      ],
      when: function (answers): boolean {
        // Only run if user set a name
        return answers.dataset.startsWith('tpc-ds');
      },
    });
    this.questions.push({
      type: 'confirm',
      name: 'usePartitioning',
      message: 'Do you want to partition the data whenever possible ?',
      default: true,
    });
    this.questions.push({
      type: 'list',
      name: 'loadMethod',
      message: 'How do you want to import the data ?',
      choices: [
        { name: 'Import directly from the source bucket', value: 'direct' },
        { name: 'Make a copy in a local S3 bucket first', value: 'copy' },
      ],
    });
  }

  async runModuleQuestions(): Promise<[string, Configuration]> {
    await this.askQuestions(this.getQuestions()).then(async (answers) => {
      if (answers) {
        const settings = new OLAPWorkloadSettings();
        settings.scalingFactor = answers.scalingFactor;
        settings.usePartitioning = answers.usePartitioning;
        settings.loadMethod = answers.loadMethod;
        settings.dataset = answers.dataset;

        const entry = new OLAPWorkloadConfiguration();
        entry.name = answers.name;
        entry.settings = settings;

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
