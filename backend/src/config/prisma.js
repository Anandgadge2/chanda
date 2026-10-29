import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { logger } from '../utils/logger.js';

const connectionString = process.env.DATABASE_URL;

let prisma;

if (connectionString && connectionString.includes('neon.tech')) {
  // Use Neon WebSocket adapter over Port 443 (bypasses port 5432 ISP/firewall blocks)
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);

  prisma = new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      ...(process.env.PRISMA_LOG_QUERIES === 'true' ? [{ emit: 'event', level: 'query' }] : []),
    ],
  });
} else {
  prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      ...(process.env.PRISMA_LOG_QUERIES === 'true' ? [{ emit: 'event', level: 'query' }] : []),
    ],
  });
}

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
