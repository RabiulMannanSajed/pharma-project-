const attendanceService = require('./attendance.service');
const asyncHandler = require('../../Utils/asyncHandler');
const ApiResponse = require('../../Utils/ApiResponse');

const markAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.markAttendance(req.user._id.toString(), req.body);
  res.status(201).json(new ApiResponse(201, record, 'Attendance marked'));
});

const listAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.listAttendance(req.user, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Attendance fetched'));
});

const myAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.myAttendance(req.user._id.toString(), req.query);
  res.status(200).json(new ApiResponse(200, data, 'Your attendance fetched'));
});

const dailyAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.dailySummary(req.user, req.query.date);
  res.status(200).json(new ApiResponse(200, data, 'Daily attendance summary'));
});

const monthlyAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.monthlySummary(req.user, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Monthly attendance summary'));
});

const myMonthlyStats = asyncHandler(async (req, res) => {
  const data = await attendanceService.myMonthlyStats(req.user._id.toString(), req.query);
  res.status(200).json(new ApiResponse(200, data, 'Your monthly stats'));
});

const updateAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.updateAttendance(req.user, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, record, 'Attendance updated'));
});

const deleteAttendance = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendance(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Attendance deleted'));
});

module.exports = {
  markAttendance,
  listAttendance,
  myAttendance,
  dailyAttendance,
  monthlyAttendance,
  myMonthlyStats,
  updateAttendance,
  deleteAttendance,
};