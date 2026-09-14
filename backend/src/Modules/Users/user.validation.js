const Joi = require('joi');
const { ROLES } = require('./user.model');

const objectId = Joi.string().hex().length(24).message('Invalid id');

const createSalesmanSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  phone: Joi.string().trim().min(7).max(20).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  profileImage: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  role: Joi.string()
    .valid(...ROLES)
    .optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  phone: Joi.string().trim().min(7).max(20).optional(),
  email: Joi.string().trim().lowercase().email().optional(),
  profileImage: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided' });

const listUsersQuery = Joi.object({
  role: Joi.string().valid(...ROLES).optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const idParam = Joi.object({ id: objectId.required() });

module.exports = {
  createSalesman: { body: createSalesmanSchema },
  updateUser: { body: updateUserSchema, params: idParam },
  listUsers: { query: listUsersQuery },
  idParam: { params: idParam },
};