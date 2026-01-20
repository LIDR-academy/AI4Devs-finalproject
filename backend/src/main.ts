import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Debe configurarse ANTES de helmet
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Accept'],
    exposedHeaders: ['X-Request-ID'],
  });

  // Seguridad - Configurar helmet para no bloquear CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
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
