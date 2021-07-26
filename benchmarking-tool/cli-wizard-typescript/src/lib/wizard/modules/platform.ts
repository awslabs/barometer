import * as inquirer from 'inquirer';

import { Configuration } from '../../impl/configuration';
import { CLIModule } from '../common/cli-module';

export class Module {
  public static getInstance(): PlatformModule {
    return new PlatformModule();
  }
}
export class PlatformModule extends CLIModule {
  /**
   * Questions to be prompted
   */
  prompts = [
    {
      type: 'list',
      name: 'value',
      message: 'Which platform would you like to configure ?',
      hint: '- Use <space> to select and <return> to submit.',
      choices: [
        { name: 'Redshift', value: '../modules/platforms/redshift/new' },
        { name: 'Athena', value: '../modules/platforms/athena/new' },

        new inquirer.Separator(),
        { name: 'Return to the previous menu', value: 'exit-module' },
        { name: 'Exit CLI', value: 'exit' },
        new inquirer.Separator()
      ],
    },
  ];
}
