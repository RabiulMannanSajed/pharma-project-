// Vercel Serverless Function entry — wraps your Express app.
// Path: frontend/api/index.js → exposed at /api/*
const app = require('../../backend/src/app');

module.exports = app;
