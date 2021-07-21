import * as prompts from 'prompts';

import { PromptComponent } from './prompt-component';
import { onCancel } from './handlers';
import { IConfiguration } from '../../../helpers/validators/configuration';
import { ICloudTrail } from '../../../helpers/validators/cloudtrail';

/**
 * Prompts whether CloudTrail should audit all
 * AWS regions.
 */
const cloudtrailQuestions = [{
  type: 'toggle',
  name: 'multiRegion',
  initial: true,
  active: 'Audit all regions',
  inactive: 'Audit only the target region',
  message: 'Would you like AWS CloudTrail to audit actions from all regions (may incur additional charges) ?'
}];

export class PlatformsModule implements PromptComponent {
  
  /**
   * Implements the logic to prompt questions to the user
   * and to fill the given configuration with the provided responses.
   * @param configuration an object in which the configuration must be stored.
   */
  async prompt(configuration: IConfiguration): Promise<IConfiguration> {
    configuration.cloudtrail = <ICloudTrail> await prompts.prompt(cloudtrailQuestions, { onCancel });
    return (configuration);
  }
}