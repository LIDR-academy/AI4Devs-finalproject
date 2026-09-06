import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnvironmentFromProcessEnv } from './common/utils/validate-environment';

async function bootstrap() {
  // US-011: fail fast in production if secrets/DB password are missing or trivial.
  validateEnvironmentFromProcessEnv();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(
    helmet({
      // HTTP local Docker prod: enable HSTS only behind real HTTPS (ENABLE_HSTS=true).
      hsts: process.env.ENABLE_HSTS === 'true',
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

bootstrap();
