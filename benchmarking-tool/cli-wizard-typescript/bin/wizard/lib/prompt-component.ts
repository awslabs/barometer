import { IConfiguration } from "../../../helpers/validators/configuration";

export interface PromptComponent {

  /**
   * Implements the logic to prompt questions to the user
   * and to fill the given configuration with the provided responses.
   * @param configuration an object in which the configuration must be stored.
   */
  prompt(configuration: IConfiguration) : Promise<IConfiguration>;
}