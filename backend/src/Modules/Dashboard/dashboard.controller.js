const dashboardService = require('./dashboard.service');
const asyncHandler = require('../../Utils/asyncHandler');
const ApiResponse = require('../../Utils/ApiResponse');

const admin = asyncHandler(async (req, res) => {
  const data = await dashboardService.adminDashboard();
  res.status(200).json(new ApiResponse(200, data, 'Admin dashboard'));
});

const salesman = asyncHandler(async (req, res) => {
  const data = await dashboardService.salesmanDashboard(req.user._id.toString());
  res.status(200).json(new ApiResponse(200, data, 'Salesman dashboard'));
});

module.exports = { admin, salesman };