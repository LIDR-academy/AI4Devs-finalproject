import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './infrastructure/config/env';
import { sessionMiddleware } from './api/middleware/session';
import { errorHandler } from './api/middleware/errorHandler';
import { healthRouter } from './api/routes/health';
import { listingsRouter } from './api/routes/listings';
import { purchaseProcessesRouter } from './api/routes/purchaseProcesses';
import { dashboardRouter } from './api/routes/dashboard';
import { negotiationRouter } from './api/routes/negotiation';
import { timelineRouter } from './api/routes/timeline';
import { checklistRouter } from './api/routes/checklist';
import { adminPortalHealthRouter } from './api/routes/adminPortalHealth';

const logger = pino({ level: env.LOG_LEVEL });

const app = express();

app.use(pinoHttp({ logger }));
app.use(
  cors({
    origin: env.FRONTEND_URL.replace(/\/$/, ''),
    credentials: true,
    exposedHeaders: ['X-Session-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  }),
);
app.use(express.json({ limit: '1mb' }));

// Session middleware on all routes (creates/validates sessionId, attaches to req).
app.use(sessionMiddleware);

// Public routes
app.use('/health', healthRouter);

// Authenticated routes (sessionMiddleware already ran)
app.use('/api/listings', listingsRouter);
app.use('/api/purchase-processes', purchaseProcessesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/listings', negotiationRouter); // /api/listings/:id/negotiation-points
app.use('/api/timeline', timelineRouter);
app.use('/api/checklist', checklistRouter);
app.use('/api/admin/portal-health', adminPortalHealthRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `Ruta ${req.method} ${req.path} no existe` });
});

// Error handler (must be last)
app.use(errorHandler);

let server: ReturnType<typeof app.listen> | null = null;

if (!env.IS_TEST) {
  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Realista backend started');
  });
}

// FR-027 portal health monitor — stub for MVP.
// Production should use a proper cron (node-cron or external scheduler) to
// retry .m. for blocked portals every 30 min. For MVP, we just log a
// periodic reminder so operators know the feature is intentionally disabled.
const portalHealthMonitorInterval = setInterval(() => {
  logger.info('Portal health monitor: disabled in MVP (see FR-027)');
}, 6 * 60 * 60 * 1000);

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'shutting down');
  clearInterval(portalHealthMonitorInterval);
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app };
