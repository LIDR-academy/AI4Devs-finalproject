import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './common/config';
import { LoggerService } from './common/log/logger.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from './shared/util/response/all.response';
import { GeneralConstant } from './common/config/constant';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
  const config = new DocumentBuilder()
    .setTitle(GeneralConstant.appName)
    .setDescription(GeneralConstant.appDescription)
    .setVersion(GeneralConstant.appVersion)
    .addTag(GeneralConstant.appAbr)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  const logger = app.get(LoggerService);
  app.setGlobalPrefix('api/v1');
  if (envs.nodeEnv === 'development') {
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen(envs.port);
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.ms.natsServer,
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  }, { inheritAppConfig: true });

  await app.startAllMicroservices();
  logger.log(`Microservicio ${GeneralConstant.appAbr}[${envs.nodeEnv}]: iniciado en puerto ${envs.port}`, 'Bootstrap');
}
bootstrap();