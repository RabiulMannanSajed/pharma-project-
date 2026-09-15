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

// CORS: allow local dev + Vercel frontend in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin (no origin), curl, Postman, etc.
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
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