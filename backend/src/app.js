import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configureCors } from './config/cors.js';
import { logger, requestLogger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import parcelRoutes from './routes/parcelRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Polyfill BigInt serialization for Prisma fileSizeBytes
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate limiter for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'खूप जास्त लॉगिन प्रयत्न. कृपया १५ मिनिटांनंतर पुन्हा प्रयत्न करा. (Too many login attempts. Try again after 15 minutes.)',
  },
});
app.use('/api/auth/login', authLimiter);

// Production-Ready CORS Handling
const corsMiddleware = configureCors();
app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Industry-standard HTTP request logging
app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root API Welcome / Status Index
const apiIndexHandler = (req, res) => {
  res.json({
    name: 'Chandrapur Land Records & Governance Platform API',
    version: '1.0.0',
    status: 'online',
    district: 'Chandrapur (Maharashtra MLRC 1966)',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      parcels: '/api/parcels',
      cases: '/api/cases',
      reports: '/api/reports',
      documents: '/api/documents',
      analytics: '/api/analytics',
    },
  });
};

app.get('/', apiIndexHandler);
app.get('/api', apiIndexHandler);

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1E3A8A" stroke="#F59E0B" stroke-width="2.5"/><circle cx="32" cy="32" r="26" fill="#0F172A"/><text x="32" y="38" font-size="20" font-weight="bold" fill="#F59E0B" text-anchor="middle">चं</text></svg>`;

app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(faviconSvg);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Chandrapur Land Records & Governance Platform API',
    district: 'Chandrapur',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl} [${req.id || 'N/A'}]`, 'ROUTER');
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled API Error on ${req.method} ${req.originalUrl} [${req.id || 'N/A'}]: ${err.message}`, err, 'API');
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    requestId: req.id,
  });
});

export default app;
