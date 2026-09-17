const authService = require('./auth.service');
const asyncHandler = require('../../Utils/asyncHandler');
const ApiResponse = require('../../Utils/ApiResponse');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id.toString(), req.body);
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user._id.toString());
  res.status(200).json(new ApiResponse(200, user, 'Current user fetched'));
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateMe(req.user._id.toString(), req.body);
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

module.exports = { login, changePassword, me, updateMe };
