import { IConfigurationItem } from './configuration';

/**
 * A description of the experiment configuration
 * in Typescript.
 */
export interface IExperimentConfiguration extends IConfigurationItem {
  experimentType: string;
}
