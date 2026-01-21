import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './common/config';
import { GeneralConstant } from './common/constant';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllExceptionsFilter } from './shared/util/response/all.response';

async function bootstrap() {
  const logger = new Logger(GeneralConstant.AppAbr);
  const app = await NestFactory.create(AppModule);
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
    app.enableCors({
      origin: 'http://localhost:4200',
      credentials: true,
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen(envs.port);
  }

 app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.ms.natsServer,
    },
  }, { inheritAppConfig: true });
  await app.startAllMicroservices(); 
  logger.log(`${GeneralConstant.AppAbr}: en el puerto ${envs.port}`);
}


bootstrap();



