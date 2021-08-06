import { Configuration } from '../../impl/configuration';
import { PlatformTypeName } from '../../interface/platform';

import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(configuration: Configuration): PlatformModule {
    return new PlatformModule(configuration, 'PlatformModule');
  }
}
export class PlatformModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  setQuestions(): void {
    this.questions = new Array<any>();
    this.questions.push({
      type: 'list',
      name: 'value',
      message: 'Which platform would you like to configure ?',
      choices: [
        { name: PlatformTypeName.REDSHIFT, value: '../modules/platforms/redshift/new' },
        { name: PlatformTypeName.ATHENA, value: '../modules/platforms/athena/new' },
        this.getQuestionSeparator(),
        { name: 'Return to the previous menu', value: 'exit-module' },
        { name: 'Exit CLI', value: 'exit' },
        this.getQuestionSeparator(),
      ],
    });
  }
}
