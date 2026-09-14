const express = require('express');
const saleController = require('./sale.controller');
const validate = require('../../Middleware/validate');
const validation = require('./sale.validation');
const protect = require('../../Middleware/auth');
const authorize = require('../../Middleware/role');

const router = express.Router();

// Reports (place BEFORE parameterized /:id routes)
router.get('/reports/daily', protect, saleController.dailyReport);
router.get('/reports/weekly', protect, saleController.weeklyReport);
router.get('/reports/monthly', protect, saleController.monthlyReport);
router.get('/reports/custom', protect, validate(validation.customReportQuery), saleController.customReport);
router.get('/reports/daily-series', protect, saleController.dailySeries);

router.get('/my-sales', protect, validate(validation.listQuery), saleController.mySales);

// Salesman daily/weekly/monthly shortcuts
router.get('/daily', protect, saleController.dailyReport);
router.get('/weekly', protect, saleController.weeklyReport);
router.get('/monthly', protect, saleController.monthlyReport);

// Generic list (admin sees all, salesman sees own)
router.get('/', protect, validate(validation.listQuery), saleController.listSales);
router.post('/', protect, validate(validation.createSale), saleController.createSale);

// Single-sale operations
router.patch('/:id', protect, validate(validation.updateSale), saleController.updateSale);
router.delete('/:id', protect, validate(validation.idParam), saleController.deleteSale);

module.exports = router;