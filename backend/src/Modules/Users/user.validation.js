const Joi = require('joi');
const { ROLES } = require('./user.model');

const objectId = Joi.string().hex().length(24).message('Invalid id');

const createSalesmanSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[+0-9\s()-]{7,20}$/, 'phone')
    .required()
    .messages({ 'string.pattern.name': 'Invalid phone number' }),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  profileImage: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  // role is intentionally NOT accepted here. Admin can only create salesman accounts.
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  phone: Joi.string()
    .trim()
    .pattern(/^[+0-9\s()-]{7,20}$/, 'phone')
    .optional()
    .messages({ 'string.pattern.name': 'Invalid phone number' }),
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

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
  createSalesman: { body: createSalesmanSchema },
  updateUser: { body: updateUserSchema, params: idParam },
  listUsers: { query: listUsersQuery },
  idParam: { params: idParam },
  resetPassword: { body: resetPasswordSchema, params: idParam },
};
