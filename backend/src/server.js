const app = require('./app');
const config = require('./Config');
const connectDB = require('./Config/db');

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`API base:      http://localhost:${config.port}/api`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled rejections / exceptions gracefully
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Let the process keep running so logs continue; in production you'd shut down.
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});