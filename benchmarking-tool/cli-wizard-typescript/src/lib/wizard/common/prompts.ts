import { IConfiguration } from '../../validators/configuration';

export interface PromptComponent {

  /**
   * Implements the logic to prompt questions to the user
   * and to fill the given configuration with the provided responses.
   * @param configuration an object in which the configuration must be stored.
   */
  prompt(configuration: IConfiguration): Promise<IConfiguration>;
}


/**
* The default handler that is called when the user cancels
* a prompting question (e.g Ctrl+C). The default behavior is to exit the
* wizard.
*/
export const onCancel = (): void => process.exit(1);
