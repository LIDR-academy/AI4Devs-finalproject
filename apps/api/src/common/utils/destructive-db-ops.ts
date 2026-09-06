export class UnsafeDestructiveOperationError extends Error {
  constructor(details: string) {
    super(`Unsafe destructive operation blocked: ${details}`);
    this.name = 'UnsafeDestructiveOperationError';
  }
}

export interface SanitizedDbTarget {
  host: string;
  port: string;
  database: string;
}

export interface DestructiveGuardInput {
  nodeEnv: string | undefined;
  allowDestructiveDbOps: string | undefined;
  argv: string[];
}

export function hasConfirmFlag(argv: string[]): boolean {
  return argv.includes('--confirm') || argv.includes('--yes');
}

export function validateDestructiveExecution(
  input: DestructiveGuardInput,
): void {
  const nodeEnv = (input.nodeEnv ?? '').trim().toLowerCase();

  if (nodeEnv === 'production') {
    throw new UnsafeDestructiveOperationError(
      'NODE_ENV=production is not allowed',
    );
  }

  if (input.allowDestructiveDbOps !== 'true') {
    throw new UnsafeDestructiveOperationError(
      'ALLOW_DESTRUCTIVE_DB_OPS=true is required',
    );
  }

  if (!hasConfirmFlag(input.argv)) {
    throw new UnsafeDestructiveOperationError(
      '--confirm (or --yes) is required',
    );
  }
}

export function getSanitizedDbTarget(databaseUrl: string): SanitizedDbTarget {
  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname || 'unknown',
      port: parsed.port || '5432',
      database: parsed.pathname.replace(/^\//, '') || 'unknown',
    };
  } catch {
    throw new UnsafeDestructiveOperationError(
      'DATABASE_URL is missing or invalid',
    );
  }
}

export function formatTargetSummary(
  target: SanitizedDbTarget,
  nodeEnv: string | undefined,
): string {
  return [
    'Destructive DB operation target:',
    `- NODE_ENV: ${nodeEnv ?? '(unset)'}`,
    `- host: ${target.host}`,
    `- port: ${target.port}`,
    `- database: ${target.database}`,
  ].join('\n');
}
