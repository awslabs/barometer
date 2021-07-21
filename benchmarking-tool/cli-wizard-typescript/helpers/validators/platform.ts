import * as Joi from 'joi';

/**
 * A description of the Workload configuration
 */
export interface Platform {

    /**
     * The limit (in dollars) at which a notification is
     * to be sent when the actual budget is superior
     * to the limit value.
     */
    limit: number;
}

/**
 * The `Joi` schema for validating the budget configuration.
 */
export const platformSchema = Joi.object().keys({
    limit: Joi.number().min(1).required()
});