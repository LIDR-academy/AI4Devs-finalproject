import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import type { EnvironmentVariables } from './config/env.validation';

/**
 * Every HTTP route of the API is served under `/api` (`CLAUDE.md` §3).
 */
const GLOBAL_PREFIX = 'api';

/**
 * The routes that must stay *outside* the `/api` prefix.
 *
 * These are the container liveness and readiness probes. The endpoints
 * themselves are deliberately not implemented here — observability
 * (`@nestjs/terminus`, `nestjs-pino`, Swagger) is the standalone slice
 * `T-C10-28`. What this ticket owns is the exemption list itself, reserved now
 * so that adding the probes later is a pure addition and never a change to the
 * prefix contract.
 *
 * Note on syntax: NestJS 11 runs on Express 5 and compiles each entry with
 * `path-to-regexp@8`, where the Express 4 wildcard forms are no longer valid.
 * These are literal paths, which that grammar matches exactly.
 */
const GLOBAL_PREFIX_EXCLUSIONS = ['/health/live', '/health/ready'];

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(GLOBAL_PREFIX, { exclude: GLOBAL_PREFIX_EXCLUSIONS });

  // `whitelist` strips undeclared properties, `forbidNonWhitelisted` rejects
  // the request outright rather than silently ignoring them, and `transform`
  // instantiates the DTO class so its declared types are real at runtime
  // (`ARCHITECTURE.md` §6.3).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // The port comes from the validated configuration, never from the raw
  // environment: by this point a missing or malformed `PORT` has already
  // aborted the boot inside `ConfigModule`.
  const config =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  const port = config.getOrThrow('PORT', { infer: true });

  await app.listen(port);

  Logger.log(
    `Sport ITSM API listening on http://localhost:${port}/${GLOBAL_PREFIX}`,
    'Bootstrap',
  );
}

void bootstrap();
