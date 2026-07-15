export class AdminBootstrapError extends Error {
  constructor(details: string) {
    super(`Admin bootstrap blocked: ${details}`);
    this.name = 'AdminBootstrapError';
  }
}

export class DevSeedError extends Error {
  constructor(details: string) {
    super(`Development seed blocked: ${details}`);
    this.name = 'DevSeedError';
  }
}

export interface AdminBootstrapEnv {
  enableAdminBootstrap: string | undefined;
  email: string | undefined;
  password: string | undefined;
  fullName: string | undefined;
}

export interface AdminBootstrapCredentials {
  email: string;
  password: string;
  fullName: string;
}

export function shouldRunAdminBootstrap(
  enableAdminBootstrap: string | undefined,
): boolean {
  return enableAdminBootstrap === 'true';
}

export function validateAdminBootstrapEnv(
  env: AdminBootstrapEnv,
): AdminBootstrapCredentials {
  if (!shouldRunAdminBootstrap(env.enableAdminBootstrap)) {
    throw new AdminBootstrapError(
      'ENABLE_ADMIN_BOOTSTRAP=true is required to run bootstrap',
    );
  }

  const email = env.email?.trim().toLowerCase() ?? '';
  const password = env.password ?? '';
  const fullName = env.fullName?.trim() ?? '';

  if (!email) {
    throw new AdminBootstrapError('BOOTSTRAP_ADMIN_EMAIL is required');
  }

  if (!password || password.length < 8) {
    throw new AdminBootstrapError(
      'BOOTSTRAP_ADMIN_PASSWORD is required and must be at least 8 characters',
    );
  }

  if (!fullName) {
    throw new AdminBootstrapError('BOOTSTRAP_ADMIN_NAME is required');
  }

  return { email, password, fullName };
}

export function assertUserTableEmpty(userCount: number): void {
  if (userCount > 0) {
    throw new AdminBootstrapError(
      'User table is not empty; refusing to create or overwrite users',
    );
  }
}

export function assertNotProductionSeed(nodeEnv: string | undefined): void {
  if ((nodeEnv ?? '').trim().toLowerCase() === 'production') {
    throw new DevSeedError(
      'Development seed is not allowed when NODE_ENV=production',
    );
  }
}
