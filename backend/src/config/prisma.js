import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
    ...(process.env.PRISMA_LOG_QUERIES === 'true' ? [{ emit: 'event', level: 'query' }] : []),
  ],
});

// Suppress low-level serverless TCP disconnect logs from terminal output
prisma.$on('error', (e) => {
  if (e.message && e.message.includes('kind: Closed')) {
    logger.debug('Neon idle connection closed by serverless pooler', 'PRISMA');
    return;
  }
  logger.error(e.message, e, 'PRISMA');
});

prisma.$on('warn', (e) => {
  logger.warn(e.message, 'PRISMA');
});

if (process.env.PRISMA_LOG_QUERIES === 'true') {
  prisma.$on('query', (e) => {
    logger.debug(`[${e.duration}ms] ${e.query}`, 'PRISMA_QUERY');
  });
}

export default prisma;
