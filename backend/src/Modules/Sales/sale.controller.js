const saleService = require('./sale.service');
const asyncHandler = require('../../Utils/asyncHandler');
const ApiResponse = require('../../Utils/ApiResponse');

const createSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale(req.user._id.toString(), req.body);
  res.status(201).json(new ApiResponse(201, sale, 'Sale created'));
});

const listSales = asyncHandler(async (req, res) => {
  const result = await saleService.listSales(req.user, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales fetched'));
});

const mySales = asyncHandler(async (req, res) => {
  const result = await saleService.mySales(req.user._id.toString(), req.query);
  res.status(200).json(new ApiResponse(200, result, 'Your sales fetched'));
});

const updateSale = asyncHandler(async (req, res) => {
  const sale = await saleService.updateSale(req.user, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, sale, 'Sale updated'));
});

const deleteSale = asyncHandler(async (req, res) => {
  await saleService.deleteSale(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Sale deleted'));
});

const dailyReport = asyncHandler(async (req, res) => {
  const data = await saleService.dailyReport(req.user, req.query.date);
  res.status(200).json(new ApiResponse(200, data, 'Daily sales report'));
});

const weeklyReport = asyncHandler(async (req, res) => {
  const data = await saleService.weeklyReport(req.user, req.query.date);
  res.status(200).json(new ApiResponse(200, data, 'Weekly sales report'));
});

const monthlyReport = asyncHandler(async (req, res) => {
  const data = await saleService.monthlyReport(req.user, req.query.date);
  res.status(200).json(new ApiResponse(200, data, 'Monthly sales report'));
});

const customReport = asyncHandler(async (req, res) => {
  const data = await saleService.customReport(req.user, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Custom sales report'));
});

const dailySeries = asyncHandler(async (req, res) => {
  const data = await saleService.dailySeries(req.user, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Daily series fetched'));
});

module.exports = {
  createSale,
  listSales,
  mySales,
  updateSale,
  deleteSale,
  dailyReport,
  weeklyReport,
  monthlyReport,
  customReport,
  dailySeries,
};