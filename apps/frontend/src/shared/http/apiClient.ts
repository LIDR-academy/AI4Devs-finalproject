import { AuthService } from '../../features/auth/services/auth.service.js';

const DEFAULT_BASE_URL = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  baseUrl?: string;
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
}

type TokenProvider = () => string | null;

let customTokenProvider: TokenProvider | null = null;

/**
 * Permite inyectar un proveedor de tokens desacoplado (útil para pruebas o middleware).
 */
export function setTokenProvider(provider: TokenProvider | null): void {
  customTokenProvider = provider;
}

function resolveToken(): string | null {
  if (customTokenProvider) {
    return customTokenProvider();
  }
  return AuthService.getToken();
}

/**
 * Cliente HTTP compartido — maneja autenticación, deserialización, captura de errores
 * RFC 7807 y resiliencia de red (reintentos exponenciales y cancelación con AbortSignal).
 */
import { mapToUserFriendlyError } from '../utils/errorMessageMapper.js';

async function parseErrorResponse(response: Response): Promise<never> {
  let errorBody: unknown;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = undefined;
  }
  const parsed = errorBody as { detail?: string; message?: string; error?: string; title?: string } | undefined;
  const rawMessage = parsed?.detail || parsed?.message || parsed?.error || parsed?.title || `Error HTTP ${response.status}`;

  const tempApiError = new ApiError(response.status, rawMessage, errorBody);
  const friendly = mapToUserFriendlyError(tempApiError);

  if (response.status === 401) {
    AuthService.logout();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('restostock:unauthorized', { detail: { message: friendly.message } }));
    }
  }

  throw new ApiError(response.status, friendly.message, errorBody);
}



function isTransientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return [502, 503, 504].includes(error.status);
  }
  if (error instanceof Error) {
    return error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    baseUrl = DEFAULT_BASE_URL,
    signal,
    retries = 0,
    retryDelayMs = 100,
  } = options;

  const token = resolveToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastError: unknown;
  const maxAttempts = Math.max(1, retries + 1);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });

      if (!response.ok) {
        await parseErrorResponse(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === maxAttempts - 1;
      const isAborted = signal?.aborted;

      if (isLastAttempt || isAborted || !isTransientError(err)) {
        throw err;
      }

      const backoffMs = retryDelayMs * Math.pow(2, attempt);
      await delay(backoffMs);
    }
  }

  throw lastError;
}
