import dotenv from 'dotenv';
import app from './src/app.js';
import prisma from './src/config/prisma.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, async () => {
  logger.banner({
    name: 'Chandrapur Land Records & Governance Platform API',
    version: '1.0.0',
    port: PORT,
    env: ENV,
    district: 'Chandrapur (Maharashtra MLRC 1966)',
    urls: [
      { label: 'Local API', url: `http://localhost:${PORT}` },
      { label: 'Health Check', url: `http://localhost:${PORT}/api/health` },
      { label: 'Parcels API', url: `http://localhost:${PORT}/api/parcels` },
    ],
  });

  // Verify database connection asynchronously
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.success('PostgreSQL Database connected successfully (Neon Cloud)', 'PRISMA');
  } catch (err) {
    logger.error('PostgreSQL connection check failed', err, 'PRISMA');
  }
});

// Graceful Shutdown
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`, 'SERVER');
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected. Process exited cleanly.', 'SERVER');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnect', err, 'SERVER');
      process.exit(1);
    }
  });
};

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, err, 'FATAL');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason, 'FATAL');
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
