import express from 'express';
import { configureCors } from './config/cors.js';
import { logger, requestLogger } from './utils/logger.js';
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

// Production-Ready CORS Handling
const corsMiddleware = configureCors();
app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Industry-standard HTTP request logging
app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
