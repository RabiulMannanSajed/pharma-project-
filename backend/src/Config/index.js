require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmacy_sales_management',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Super Admin',
    phone: process.env.ADMIN_PHONE || '01700000000',
    email: process.env.ADMIN_EMAIL || 'admin@pharmacy.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
};

module.exports = config;