import Joi from 'joi';

/**
 * The `Joi` schema for validating the network configuration.
 */
export const experimentSchema = Joi.object().keys({
  useVpcEndpoints: Joi.boolean().default(false).required()
});