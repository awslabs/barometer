import Joi from 'joi';
import { experimentSchema } from './experiment';
import { platformSchema } from './platform';
import { workloadSchema } from './workload';

/**
 * The `Joi` schema for validating the configuration.
 */
export const schema = Joi.object().keys({
  experiment: experimentSchema.optional(),
  platform: platformSchema.optional(),
  workload: workloadSchema.optional(),
  tags: Joi.object().default({}).optional()
}).unknown().required();

