import cors from 'cors';
import { logger } from '../utils/logger.js';

/**
 * Production-Grade Strict CORS Configuration
 * Disallows wildcard '*', explicitly whitelists development and production domains,
 * and strips trailing slashes to prevent false rejection.
 */
export function configureCors() {
  // Built-in explicit whitelist of verified environments
  const baseWhitelist = [
    'https://chanda-eta.vercel.app', // Production Frontend
    'http://localhost:3000',         // Local Next.js Frontend
    'http://127.0.0.1:3000',         // Local IP
    'http://localhost:3001',         // Secondary local dev port
  ];

  // Merge extra origins from CORS_ORIGIN or FRONTEND_URL env variables
  const rawOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
  const envOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim().replace(/\/$/, '')) // strip trailing slash
    .filter((o) => o && o !== '*');         // strictly reject wildcard '*'

  // Combine and deduplicate
  const allowedOrigins = Array.from(new Set([...baseWhitelist, ...envOrigins]));

  return cors({
    origin: (origin, callback) => {
      // Allow non-browser requests without origin (curl, mobile apps, Postman, health checks, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Normalize incoming origin by removing trailing slash
      const normalizedOrigin = origin.trim().replace(/\/$/, '');

      // Check against explicit whitelist
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Check Vercel preview deployments if explicitly permitted
      if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && normalizedOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Block unauthorized origins
      const reason = `Strict CORS: Request from unauthorized origin '${origin}' was blocked. Allowed: [${allowedOrigins.join(', ')}]`;
      logger.warn(reason, 'SECURITY-CORS');
      return callback(new Error(reason), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'Content-Disposition',
      'X-Request-Id',
      'Content-Length',
    ],
    maxAge: 86400, // Cache preflight checks for 24 hours
    optionsSuccessStatus: 204,
  });
}

export default configureCors;
