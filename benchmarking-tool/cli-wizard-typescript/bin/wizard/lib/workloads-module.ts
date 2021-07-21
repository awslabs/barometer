import Joi from 'joi';
import * as prompts from 'prompts';

import {PromptComponent} from './prompt-component';
import {onCancel} from './handlers';
import {IConfiguration} from '../../../helpers/validators/configuration';
import {Workload} from '../../../helpers/validators/workload';

/**
 * Question prompting user with edit to all past workloads with option to define new
 */
export class WorkloadsModule implements PromptComponent {

    /**
     * Implements the logic to prompt questions to the user
     * and to fill the given configuration with the provided responses.
     * @param configuration an object in which the configuration must be stored.
     */
    async prompt(configuration: IConfiguration): Promise<IConfiguration> {
        configuration.budget = <Workload>await prompts.prompt({}, {onCancel});
        return (configuration);
    }
}