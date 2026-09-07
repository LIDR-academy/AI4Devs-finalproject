import type { ConfigModuleOptions } from '@nestjs/config';
import { validateEnvironment } from './env.validation';

/**
 * Options for the single, global `ConfigModule` of the composition root.
 *
 * `isGlobal: true` is what lets every future context module inject
 * `ConfigService` without re-importing the module, and is the mechanism behind
 * the "no raw `process.env` in feature code" rule of `CLAUDE.md` §3: reading
 * the environment is a privilege of this folder, and the rest of the
 * application receives already-validated, already-typed values.
 */
export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  // Validation is the boot gate: `validateEnvironment` throws, and NestFactory
  // propagates that before a single provider is constructed.
  validate: validateEnvironment,
  // `.env` is a developer convenience only; a real deployment injects the
  // variables itself, and an absent file is not an error — a missing *key* is,
  // and that is the validator's job, not the loader's.
  envFilePath: ['.env'],
  // The validated result is immutable for the process lifetime, so there is no
  // reason to re-read `process.env` on every lookup.
  cache: true,
  expandVariables: false,
};
