import { IConfigurationItem } from './configuration';

/**
 * A description of the platform configuration
 * in Typescript.
 */
export interface IExperimentConfiguration extends IConfigurationItem {


  /**
   * Whether to create a VPC with isolated subnets
   * as well as the required VPC endpoints deployed
   * Lambda functions can use to keep traffic internal
   * to the AWS network.
   */
  useVpcEndpoints: boolean
}
