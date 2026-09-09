import cors from 'cors';

/**
 * Configure Production-Ready CORS Middleware
 * Handles single domain, comma-separated domains, wildcard '*', localhost fallbacks, and Vercel preview deploys.
 */
export function configureCors() {
  const rawOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';

  // Parse comma-separated origins from env
  const configuredOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = [...configuredOrigins];

  // In development, ensure local frontend ports are automatically whitelisted
  if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
    const devDefaults = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://localhost:5000',
    ];
    for (const origin of devDefaults) {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    }
  }

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman, server-to-server, health checks)
      if (!origin) return callback(null, true);

      // If '*' is explicitly configured
      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Exact match in allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments if enabled
      if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Reject other origins
      const errorMsg = `CORS Blocked: Request origin '${origin}' is not authorized in CORS_ORIGIN settings.`;
      return callback(new Error(errorMsg), false);
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
    maxAge: 86400, // Preflight cached for 24 hours
    optionsSuccessStatus: 204,
  });
}

export default configureCors;
