export class InvalidEnvironmentError extends Error {
  constructor(details: string) {
    super(`Invalid production configuration: ${details}`);
    this.name = 'InvalidEnvironmentError';
  }
}

const PLACEHOLDER_SECRETS = new Set([
  'change-me-access-secret-min-32-chars',
  'change-me-refresh-secret-min-32-chars',
  'mecatrack-docker-access-secret-min-32-chars',
  'mecatrack-docker-refresh-secret-min-32-chars',
]);

const MIN_SECRET_LENGTH = 32;

export interface EnvironmentValidationInput {
  nodeEnv: string | undefined;
  jwtAccessSecret: string | undefined;
  jwtRefreshSecret: string | undefined;
  databaseUrl: string | undefined;
  enforceSecureConfig?: string | undefined;
}

export function isStrictConfigMode(input: EnvironmentValidationInput): boolean {
  const nodeEnv = (input.nodeEnv ?? '').trim().toLowerCase();
  return nodeEnv === 'production' || input.enforceSecureConfig === 'true';
}

function assertSecret(
  name: string,
  value: string | undefined,
): asserts value is string {
  if (!value || value.trim().length === 0) {
    throw new InvalidEnvironmentError(`${name} is required`);
  }

  if (value.trim().length < MIN_SECRET_LENGTH) {
    throw new InvalidEnvironmentError(
      `${name} must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }

  if (PLACEHOLDER_SECRETS.has(value.trim())) {
    throw new InvalidEnvironmentError(
      `${name} must not use a committed placeholder value`,
    );
  }
}

function assertDatabaseUrl(databaseUrl: string | undefined): void {
  if (!databaseUrl || databaseUrl.trim().length === 0) {
    throw new InvalidEnvironmentError('DATABASE_URL is required');
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new InvalidEnvironmentError('DATABASE_URL is invalid');
  }

  const password = decodeURIComponent(parsed.password || '');
  if (!password) {
    throw new InvalidEnvironmentError(
      'DATABASE_URL must include a database password',
    );
  }

  if (password === 'mecatrack' || password === 'postgres' || password === 'password') {
    throw new InvalidEnvironmentError(
      'DATABASE_URL must not use a trivial database password',
    );
  }
}

/**
 * Fail-fast validation for production or when ENFORCE_SECURE_CONFIG=true.
 * Development remains usable with local placeholders unless enforcement is enabled.
 */
export function validateEnvironment(input: EnvironmentValidationInput): void {
  if (!isStrictConfigMode(input)) {
    return;
  }

  assertSecret('JWT_ACCESS_SECRET', input.jwtAccessSecret);
  assertSecret('JWT_REFRESH_SECRET', input.jwtRefreshSecret);
  assertDatabaseUrl(input.databaseUrl);
}

export function validateEnvironmentFromProcessEnv(
  env: NodeJS.ProcessEnv = process.env,
): void {
  validateEnvironment({
    nodeEnv: env.NODE_ENV,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    databaseUrl: env.DATABASE_URL,
    enforceSecureConfig: env.ENFORCE_SECURE_CONFIG,
  });
}
