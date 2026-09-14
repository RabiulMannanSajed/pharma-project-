const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
  login: { body: loginSchema },
  changePassword: { body: changePasswordSchema },
};