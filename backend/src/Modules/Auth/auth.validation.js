const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  phone: Joi.string()
    .trim()
    .pattern(/^[+0-9\s()-]{7,20}$/, 'phone')
    .optional()
    .messages({ 'string.pattern.name': 'Invalid phone number' }),
  email: Joi.string().trim().lowercase().email().optional(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided' });

module.exports = {
  login: { body: loginSchema },
  changePassword: { body: changePasswordSchema },
  updateProfile: { body: updateProfileSchema },
};
