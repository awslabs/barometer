import * as prompts from 'prompts';

import { PromptComponent } from './prompt-component';
import { onCancel } from './handlers';
import { IConfiguration } from '../../../helpers/validators/configuration';

/**
 * Prompts the user for the security rules
 * to be enabled.
 */
const securityQuestions = (configuration: IConfiguration) => ({
  type: 'multiselect',
  name: 'value',
  message: 'Which security policie(s) would you like to enable ?',
  min: 1,
  instructions: false,
  hint: '- Space to select. Return to submit. \'a\' to toggle all.',
  warn: 'This option is disabled because it depends on another option which was not selected',
  choices: [
    { title: 'Enable account-wide S3 public access block',
      value: 'enableS3PublicAccessBlock'
    },
    { title: 'Prevent accidental deletion of the Prototype Engagement Pack',
      value: 'enableStackProtection'
    },
    { title: 'Enable alerting when large EC2 instances are started (>= 4xlarge)',
      value: 'enableLargeInstanceProtection',
      disabled: !configuration.cloudtrail
    },
    { title: 'Forbid Prototype Engagement Pack resources mutation to the Prototyping Team',
      value: 'enableAccessRestriction',
      disabled: !configuration.engagement
    }
  ]
});

export class ExperimentsModule implements PromptComponent {
  
  /**
   * Implements the logic to prompt questions to the user
   * and to fill the given configuration with the provided responses.
   * @param configuration an object in which the configuration must be stored.
   */
  async prompt(configuration: IConfiguration): Promise<IConfiguration> {
    const policies = (await prompts.prompt(securityQuestions(configuration), { onCancel })).value;

    configuration.securityPolicies = {};
    
    // Adding each key to the security policies configuration.
    policies.forEach((key: string) => {
      (<any> configuration.securityPolicies)[key] = true;
    });

    return (configuration);
  }
}