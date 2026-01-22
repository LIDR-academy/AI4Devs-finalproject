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

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
