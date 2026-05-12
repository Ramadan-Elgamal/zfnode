import app from './app.js';
import { logger } from './config/logger.js';

const PORT: number = Number(process.env.PORT) || {{PORT}};

const server = app.listen(PORT, () => {
  logger.info(`🚀 Enterprise API active and listening on port ${PORT}`);
});

// Implement safe shutdown hook capturing unhandled termination signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Executing graceful shutdown sequence...');
  server.close(() => {
    logger.info('HTTP server terminated cleanly.');
    process.exit(0);
  });
});