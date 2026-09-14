// Vercel Serverless handler — wraps Express app
// Path: frontend/api/index.js → exposed at /api/*
const express = require('express');
const mongoose = require('mongoose');

// Cache the connection across invocations (serverless reuse)
let cachedApp = null;
let cachedConn = null;

async function ensureDbConnection() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  cachedConn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  return cachedConn;
}

module.exports = async (req, res) => {
  try {
    await ensureDbConnection();

    if (!cachedApp) {
      // Lazy-load the Express app on first invocation
      cachedApp = require('../../backend/src/app');
    }

    return cachedApp(req, res);
  } catch (err) {
    console.error('Serverless error:', err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || 'Internal Server Error',
    });
  }
};
