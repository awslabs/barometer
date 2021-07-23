import Joi from 'joi';

export const schema = Joi.object().keys({
    nodeType: Joi.object().default({}).required(),
    numberOfNodes: Joi.object().default({}).required(),
    features: Joi.object().default({}).required(),
}).unknown().required();
