const express = require('express');
const userController = require('./user.controller');
const validate = require('../../Middleware/validate');
const validation = require('./user.validation');
const protect = require('../../Middleware/auth');
const authorize = require('../../Middleware/role');

const router = express.Router();

// Admin-only user management
router.post(
  '/create-salesman',
  protect,
  authorize('admin'),
  validate(validation.createSalesman),
  userController.createSalesman
);

router.get(
  '/',
  protect,
  authorize('admin'),
  validate(validation.listUsers),
  userController.listUsers
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  validate(validation.idParam),
  userController.getUser
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  validate(validation.updateUser),
  userController.updateUser
);

router.patch(
  '/:id/activate',
  protect,
  authorize('admin'),
  validate(validation.idParam),
  userController.activateUser
);

router.patch(
  '/:id/deactivate',
  protect,
  authorize('admin'),
  validate(validation.idParam),
  userController.deactivateUser
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(validation.idParam),
  userController.deleteUser
);

module.exports = router;