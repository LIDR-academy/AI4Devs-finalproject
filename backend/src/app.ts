import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar configuraciones
import { sequelize } from './models';
import redisClient from './config/redis';

// Importar middleware
import { criticalRoutesRateLimit } from './middleware/rateLimit';

// Importar rutas
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import passwordResetRoutes from './routes/passwordReset';
import favoriteRoutes from './routes/favorites';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de compresión
app.use(compression());

// Middleware de logging
app.use(morgan('combined'));

// Middleware de rate limiting solo para rutas críticas
app.use(criticalRoutesRateLimit);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Zonmatch API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/favorites', favoriteRoutes);

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Middleware para manejo global de errores
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', error);

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      error: 'VALIDATION_ERROR',
      validation_errors: validationErrors
    });
  }

  // Error de restricción única de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path;
    return res.status(400).json({
      success: false,
      message: `El campo ${field} ya existe`,
      error: 'DUPLICATE_FIELD',
      field
    });
  }

  // Error de base de datos
  if (error.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: 'Error de base de datos',
      error: 'DATABASE_ERROR'
    });
  }

  // Error de conexión a base de datos
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Servicio temporalmente no disponible',
      error: 'SERVICE_UNAVAILABLE'
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_ERROR'
  });
});

// Función para inicializar la aplicación
async function startApp() {
  try {
    // Conectar a Redis
    await redisClient.connect();
    console.log('✅ Redis conectado correctamente');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada correctamente');

    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados correctamente');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Zonmatch API ejecutándose en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('🔄 Recibida señal SIGTERM, cerrando aplicación...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Recibida señal SIGINT, cerrando aplicación...');
  await redisClient.quit();
  process.exit(0);
});

// Iniciar la aplicación
startApp();

export default app;
