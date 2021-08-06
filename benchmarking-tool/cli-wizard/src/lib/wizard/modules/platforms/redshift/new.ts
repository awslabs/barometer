import { NodeType } from '@aws-cdk/aws-redshift';
import { Configuration } from '../../../../impl/configuration';

import { RedshiftPlatformConfiguration, RedshiftSettings, RedshiftFeatures } from '../../../../impl/platforms/redshift/new';
import { CLIModule } from '../../../common/cli-module';
import { CLIModuleQuestions } from '../../../common/cli-prompts';

export class Module {
  public static getInstance(configuration: Configuration): RedshiftModule {
    return new RedshiftModule(configuration, 'RedshiftModule');
  }
}

export class RedshiftModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push(CLIModuleQuestions.entryName);
    this.questions.push({
      type: 'list',
      name: 'nodeType',
      message: 'What node type you want to use?',
      choices: async (): Promise<any> => {
        const choices: Array<any> = [];
        for (const _key in NodeType) {
          choices.push({ name: NodeType[_key], value: _key });
        }
        return choices.sort();
      },
    });
    this.questions.push({
      type: 'input',
      name: 'numberOfNodes',
      message: 'How many instances you want to add to the cluster?',
      default: 2,
      validate: async (input: string): Promise<any> => {
        if (parseInt(input) > 0) return true;
        return 'Only numbers > 0 are allowed';
      },
    });
    this.questions.push({
      type: 'checkbox',
      name: 'features',
      message: 'Choose all the features you want to enable',
      choices: [
        { name: 'Work load manager (WLM)' }, // keep this comment to keep the formatting in Prettier
        { name: 'Advanced Query Accelerator (AQUA)' },
        { name: 'Concurrency Scaling' },
        { name: 'Redshift Spectrum' },
      ],
      filter: async (input: string | any[]): Promise<any> => {
        const features: RedshiftFeatures = new RedshiftFeatures();
        for (let i = 0; i < input.length; i++) {
          if (input[i].indexOf('WLM') >= 0) features.workloadManager = true;
          if (input[i].indexOf('AQUA') >= 0) features.aqua = true;
          if (input[i].indexOf('Concurrency') >= 0) features.concurrencyScaling = true;
          if (input[i].indexOf('Spectrum') >= 0) features.spectrum = true;
        }
        return features;
      },
    });
  }

  async runModuleQuestions(): Promise<[string, Configuration]> {
    await this.askQuestions(this.getQuestions()).then(async (answers) => {
      if (answers) {
        const settings = new RedshiftSettings();
        settings.numberOfNodes = answers.numberOfNodes;
        settings.features = answers.features;
        settings.nodeType = answers.nodeType;

        const entry = new RedshiftPlatformConfiguration();
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
