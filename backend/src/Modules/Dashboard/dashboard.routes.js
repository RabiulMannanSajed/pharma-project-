const express = require('express');
const controller = require('./dashboard.controller');
const protect = require('../../Middleware/auth');
const authorize = require('../../Middleware/role');

const router = express.Router();

router.get('/admin', protect, authorize('admin'), controller.admin);
router.get('/salesman', protect, authorize('salesman'), controller.salesman);

module.exports = router;