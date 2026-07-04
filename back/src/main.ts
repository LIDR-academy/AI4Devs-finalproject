import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/nestjs";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

function initializeSentry(logger: Logger): void {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  try {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  } catch (error) {
    logger.warn(
      `sentry_init_failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  initializeSentry(logger);

  app.enableCors();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
