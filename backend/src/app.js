const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./Modules/Auth/auth.routes');
const userRoutes = require('./Modules/Users/user.routes');
const saleRoutes = require('./Modules/Sales/sale.routes');
const attendanceRoutes = require('./Modules/Attendance/attendance.routes');
const dashboardRoutes = require('./Modules/Dashboard/dashboard.routes');
const ApiResponse = require('./Utils/ApiResponse');
const { errorHandler, notFound } = require('./Middleware/errorHandler');

const app = express();

// Security & utilities
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: 'ok', uptime: process.uptime() }, 'Healthy'));
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 + global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;