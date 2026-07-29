import { isTransientCatalogError } from './catalog-error.util';

export interface RetryWithBackoffOptions {
  maxAttempts: number;
  baseDelayMs: number;
  rateLimitBaseDelayMs?: number;
  rateLimitMaxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
  isRetryable?: (err: unknown) => boolean;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryWithBackoffOptions,
): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;
  const isRetryable = options.isRetryable ?? (() => true);
  const rateLimitBaseDelayMs = options.rateLimitBaseDelayMs ?? 2000;
  const rateLimitMaxAttempts = options.rateLimitMaxAttempts ?? 5;
  let lastError: unknown;
  let attempt = 0;

  while (attempt < options.maxAttempts) {
    attempt += 1;
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err)) {
        break;
      }

      const maxAttempts = isTransientCatalogError(err)
        ? Math.max(options.maxAttempts, rateLimitMaxAttempts)
        : options.maxAttempts;
      if (attempt >= maxAttempts) {
        break;
      }

      const delayMs = isTransientCatalogError(err)
        ? rateLimitBaseDelayMs * 2 ** (attempt - 1)
        : options.baseDelayMs * 2 ** (attempt - 1);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
