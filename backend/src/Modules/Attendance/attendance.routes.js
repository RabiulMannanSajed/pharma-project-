const express = require('express');
const attendanceController = require('./attendance.controller');
const validate = require('../../Middleware/validate');
const validation = require('./attendance.validation');
const protect = require('../../Middleware/auth');
const authorize = require('../../Middleware/role');

const router = express.Router();

// Admin-only reports
router.get('/daily', protect, authorize('admin'), attendanceController.dailyAttendance);
router.get('/monthly', protect, authorize('admin'), validate(validation.monthlyQuery), attendanceController.monthlyAttendance);
router.get('/my-monthly-stats', protect, validate(validation.monthlyQuery), attendanceController.myMonthlyStats);

router.get('/my-attendance', protect, validate(validation.myAttendanceQuery), attendanceController.myAttendance);

// Listing all attendance is admin-only. Salesmen must use /my-attendance.
router.get('/', protect, authorize('admin'), validate(validation.listQuery), attendanceController.listAttendance);
router.post('/', protect, validate(validation.markAttendance), attendanceController.markAttendance);

// PATCH and DELETE go through the controller, which enforces ownership: admin can modify any,
// salesman can modify only their own.
router.patch(
  '/:id',
  protect,
  validate(validation.updateAttendance),
  attendanceController.updateAttendance
);
router.delete('/:id', protect, validate(validation.idParam), attendanceController.deleteAttendance);

module.exports = router;
