import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Debe configurarse ANTES de helmet
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5182',
    'http://localhost:5183',
    'http://localhost:5184',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5182',
    'http://127.0.0.1:3000',
  ];

  // En desarrollo, permitir cualquier origen localhost
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const corsOptions = {
    origin: isDevelopment
      ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Permitir requests sin origin (ej: Postman, curl)
          if (!origin) {
            return callback(null, true);
          }
          // Permitir cualquier localhost o 127.0.0.1
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
          // Verificar si está en la lista de orígenes permitidos
          if (corsOrigins.includes(origin)) {
            return callback(null, true);
          }
          callback(new Error('No permitido por CORS'));
        }
      : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['X-Request-ID', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Seguridad - Configurar helmet con políticas de seguridad mejoradas
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      frameguard: { action: 'deny' },
    }),
  );
  app.use(compression());

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefijo global para API (excepto rutas raíz y health)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', '/health', '/api/v1/health'],
  });

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('SIGQ API')
    .setDescription('Sistema Integrado de Gestión Quirúrgica - API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (sin "Bearer ")',
        in: 'header',
      },
      'bearer', // Nombre del esquema - debe coincidir con @ApiBearerAuth("bearer")
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.API_PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          SIGQ - Sistema Integrado de Gestión          ║');
  console.log('║                  Quirúrgica - Backend API               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
  console.log(`🔐 Endpoints de Auth: http://localhost:${port}/api/v1/auth`);
  console.log('');
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
}

bootstrap();
