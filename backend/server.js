const http = require('http');

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');
const { env } = require('./src/config/env');

const server = http.createServer(app);

async function start() {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down...');
  server.close(() => process.exit(0));
});
