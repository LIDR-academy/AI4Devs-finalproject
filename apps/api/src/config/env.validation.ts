import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, Max, Min, validateSync } from 'class-validator';

/**
 * The deployment environments the API recognises. Declared as an enum rather
 * than a free string so that a typo in `NODE_ENV` fails the boot instead of
 * silently selecting the "not production" branch of every conditional.
 */
export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

/**
 * The validated shape of the process environment.
 *
 * This class is the *only* declaration of what the API reads from its
 * environment. Every key is mandatory and has no in-code default: a default
 * would let a missing key boot the process with a plausible-but-wrong value,
 * which is exactly the failure mode `CLAUDE.md` §3 forbids ("no raw
 * `process.env` in feature code") and that this ticket's acceptance criteria
 * test for. Keys are added here as the capabilities that need them arrive —
 * the database connection with `T-C10-16`, observability with `T-C10-28`.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment, {
    message: `NODE_ENV must be one of: ${Object.values(NodeEnvironment).join(', ')}`,
  })
  NODE_ENV!: NodeEnvironment;

  @IsInt({ message: 'PORT must be an integer' })
  @Min(1, { message: 'PORT must be a valid TCP port (1-65535)' })
  @Max(65535, { message: 'PORT must be a valid TCP port (1-65535)' })
  PORT!: number;
}

/**
 * `@nestjs/config`'s `validate` hook: runs once, before any provider is
 * instantiated, and must throw to abort the boot.
 *
 * The returned instance — not the raw environment — becomes the config source,
 * so `ConfigService` hands out values that are already coerced to their
 * declared types (`PORT` is a `number`, never the string `'3300'`).
 *
 * @throws Error naming every offending key, so that an operator reading the
 *   crash sees *which* variable is missing rather than a stack trace about
 *   `undefined`.
 */
export function validateEnvironment(
  raw: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, raw, {
    // `process.env` values are always strings; the declared types drive the
    // coercion, which is what makes `PORT` an actual number downstream.
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => {
        // An absent key trips every constraint on the property at once, which
        // buries the actual problem under type complaints. Report the cause
        // instead of its symptoms.
        const supplied = raw[error.property];
        if (supplied === undefined || supplied === '') {
          return `  - ${error.property}: required, but not set in the environment`;
        }

        // Distinct reasons only: overlapping range constraints otherwise repeat
        // the same sentence.
        const reasons = [...new Set(Object.values(error.constraints ?? {}))];
        const reason = reasons.length
          ? reasons.join('; ')
          : 'failed validation';
        return `  - ${error.property}: ${reason}`;
      })
      .join('\n');

    throw new Error(
      `Invalid environment configuration. The API will not start.\n${details}`,
    );
  }

  return validated;
}
