import * as Joi from 'joi';
import { IConfigurationItem } from './configuration';

/**
 * A description of the platform configuration
 * in Typescript.
 */
export interface IWorkloadConfiguration extends IConfigurationItem {


  /**
   * Whether to create a VPC with isolated subnets
   * as well as the required VPC endpoints deployed
   * Lambda functions can use to keep traffic internal
   * to the AWS network.
   */
  useVpcEndpoints: boolean
}

/**
 * The `Joi` schema for validating the network configuration.
 */
export const workloadSchema = Joi.object().keys({
  useVpcEndpoints: Joi.boolean().default(false).required()
});