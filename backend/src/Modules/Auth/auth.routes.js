const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../Middleware/validate');
const authValidation = require('./auth.validation');
const protect = require('../../Middleware/auth');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post(
  '/change-password',
  protect,
  validate(authValidation.changePassword),
  authController.changePassword
);
router.get('/me', protect, authController.me);

module.exports = router;