const express = require('express');
const attendanceController = require('./attendance.controller');
const validate = require('../../Middleware/validate');
const validation = require('./attendance.validation');
const protect = require('../../Middleware/auth');
const authorize = require('../../Middleware/role');

const router = express.Router();

// Reports (place BEFORE parameterized routes)
router.get('/daily', protect, attendanceController.dailyAttendance);
router.get('/monthly', protect, validate(validation.monthlyQuery), attendanceController.monthlyAttendance);
router.get('/my-monthly-stats', protect, validate(validation.monthlyQuery), attendanceController.myMonthlyStats);

router.get('/my-attendance', protect, validate(validation.myAttendanceQuery), attendanceController.myAttendance);

router.get('/', protect, validate(validation.listQuery), attendanceController.listAttendance);
router.post('/', protect, validate(validation.markAttendance), attendanceController.markAttendance);

router.patch(
  '/:id',
  protect,
  validate(validation.updateAttendance),
  attendanceController.updateAttendance
);
router.delete('/:id', protect, validate(validation.idParam), attendanceController.deleteAttendance);

module.exports = router;