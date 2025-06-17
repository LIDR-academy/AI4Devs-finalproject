const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar configuración de Swagger
const { specs, swaggerUi, swaggerConfig } = require('./config/swagger');

// Importar rutas
const authRoutes = require('./api/routes/authRoutes');
const taskRoutes = require('./api/routes/taskRoutes');
const redmineRoutes = require('./api/routes/redmine.routes');
const equipoRoutes = require('./api/routes/equipoRoutes');
const departamentoRoutes = require('./api/routes/departamentoRoutes');

// Importar configuración de base de datos
const { disconnectDatabase } = require('./config/database');

const app = express();

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

// Configuración de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] // Cambiar por tu dominio en producción
    : ['http://localhost:3000', 'http://localhost:5173'], // Para desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskDistributor API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Documentación de la API con Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerConfig));

// Endpoint JSON de la documentación
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Información básica de la API
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskDistributor API',
    version: '1.0.0',
    documentation: {
      swagger: '/api/docs',
      json: '/api/docs.json'
    },
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile',
        logout: 'POST /api/auth/logout'
      },
      tasks: {
        list: 'GET /api/tasks',
        detail: 'GET /api/tasks/:id',
        stats: 'GET /api/tasks/stats',
        filterOptions: 'GET /api/tasks/filter-options'
      },
      redmine: {
        issues: 'GET /api/redmine/issues',
        issue: 'GET /api/redmine/issues/:id',
        createIssue: 'POST /api/redmine/issues',
        updateIssue: 'PUT /api/redmine/issues/:id',
        projects: 'GET /api/redmine/projects',
        users: 'GET /api/redmine/users',
        sync: 'POST /api/redmine/sync'
      },
      equipos: {
        list: 'GET /api/equipos',
        detail: 'GET /api/equipos/:id',
        stats: 'GET /api/equipos/stats'
      },
      departamentos: {
        list: 'GET /api/departamentos',
        detail: 'GET /api/departamentos/:id',
        stats: 'GET /api/departamentos/stats'
      }
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/redmine', redmineRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/departamentos', departamentoRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con estos datos únicos'
    });
  }
  
  // Error de registro no encontrado en Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado'
    });
  }
  
  // Error de sintaxis JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición'
    });
  }
  
  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Manejo elegante del cierre del servidor
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

module.exports = app; 