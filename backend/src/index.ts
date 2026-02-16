import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import redisClient from './config/redis';
import { errorHandler } from './middleware/error-handler.middleware';
import { logger } from './utils/logger';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import doctorsRoutes from './routes/doctors.routes';
import specialtiesRoutes from './routes/specialties.routes';
import appointmentsRoutes from './routes/appointments.routes';
import verificationRoutes from './routes/verification.routes';
import adminRoutes from './routes/admin.routes';
import { startAdminMetricsJob } from './jobs/admin-metrics.job';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 4000;

const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envAllowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean) as string[];
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sin Origin (curl, health checks, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy para obtener IP real en producción (detrás de proxy/load balancer)
app.set('trust proxy', 1);

// Rutas
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorsRoutes);
app.use('/api/v1/specialties', specialtiesRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/verification-documents', verificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Manejo de errores
app.use(errorHandler);

// Inicializar servidor
async function startServer() {
  try {
    // Intentar conectar a base de datos (opcional para primera versión)
    try {
      await AppDataSource.initialize();
      logger.info('✅ Base de datos conectada');
    } catch (dbError) {
      logger.warn('⚠️  No se pudo conectar a la base de datos (continuando sin BD):', dbError);
    }

    // Intentar conectar a Redis (opcional)
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
        logger.info('✅ Redis conectado');
      }
    } catch (redisError) {
      logger.warn('⚠️  No se pudo conectar a Redis (continuando sin cache):', redisError);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📡 API disponible en http://localhost:${PORT}/api/v1`);
    });

    if (process.env.NODE_ENV !== 'test') {
      startAdminMetricsJob();
    }
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});
