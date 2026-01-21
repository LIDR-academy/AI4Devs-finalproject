import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs, RpcCustomExceptionFilter } from './common';
import { GeneralConstant } from './constant';
import { AllExceptionsFilter } from './shared/util/response/all.response';
import helmet from 'helmet';
import { LoggerService } from './common/log/logger.service';
import { startOpenTelemetry } from './common/monitoring/otel/otel';

async function bootstrap() {
  startOpenTelemetry(GeneralConstant.appAbr, GeneralConstant.appVersion);

  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
  const logger = app.get(LoggerService);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  const allowedOrigins = [
    envs.cors, // Variable de entorno para el origen dinámico
    'http://localhost:4200', // Desarrollo local
    'http://127.0.0.1:4200', // Otro origen de desarrollo local
    //...(envs.nodeEnv === 'production' ? ['https://your-production-url.com'] : []), // Solo en producción
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new RpcCustomExceptionFilter());
  await app.listen(envs.port);
  logger.log(`${GeneralConstant.appAbr}: en el puerto ${envs.port}`, 'Bootstrap');
  logger.log(`Health check: http://localhost:${envs.port}/${GeneralConstant.appPrefix}/health`, 'Bootstrap');
  logger.log(`Metrics: http://localhost:${envs.port}/${GeneralConstant.appPrefix}/metrics`, 'Bootstrap');

}

bootstrap();
