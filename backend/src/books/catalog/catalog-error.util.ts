const TRANSIENT_STATUS_CODES = new Set([429, 502, 503, 504]);

function readHttpStatus(err: unknown): number | null {
  if (!err || typeof err !== 'object') {
    return null;
  }

  const candidate = err as {
    response?: { status?: number };
    status?: number;
  };

  return candidate.response?.status ?? candidate.status ?? null;
}

function readErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return String(err);
  }

  const candidate = err as { message?: string };
  return candidate.message ?? String(err);
}

/** HTTP errors that should be retried with backoff (rate limits + upstream overload). */
export function isTransientCatalogError(err: unknown): boolean {
  const status = readHttpStatus(err);
  if (status !== null && TRANSIENT_STATUS_CODES.has(status)) {
    return true;
  }

  return /429|502|503|504|too many requests|rate limit|service unavailable|bad gateway|gateway timeout/i.test(
    readErrorMessage(err),
  );
}

/** @deprecated Use isTransientCatalogError */
export function isRateLimitError(err: unknown): boolean {
  return isTransientCatalogError(err);
}
