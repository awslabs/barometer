import * as Joi from 'joi';
import {Workload, workloadSchema} from './workload';
import {Experiment, experimentSchema} from "./experiment";
import {Platform, platformSchema} from "./platform";

/**
 * Describes a configuration associated with the
 * current stack in Typescript.
 */
export interface IConfiguration {

    /**
     * This key defines all the workloads defined by the user
     */
    workloads?: Array<Workload>;

    /**
     * This key defines all the workloads defined by the user
     */
    platforms?: Array<Platform>;

    /**
     * This key defines all the workloads defined by the user
     */
    experiments?: Array<Experiment>;

}

/**
 * The `Joi` schema for validating the configuration.
 */
export const schema = Joi.object().keys({
    workloads: workloadSchema.optional(),
    platforms: platformSchema.optional(),
    experiments: experimentSchema.optional(),
}).unknown().required();