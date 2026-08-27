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
}

/**
 * Cliente HTTP compartido — reemplaza el fetch reimplementado a mano en cada
 * feature service. Centraliza el header Authorization (antes solo lo adjuntaba
 * auth.service.ts, dejando los otros 4 servicios sin token) y la distinción
 * entre "request exitoso" y "error real" (nunca trata un !response.ok como
 * éxito silencioso — el fallback offline, si aplica, es decisión de cada
 * servicio en su propio catch, no algo que el cliente esconda).
 */
async function parseErrorResponse(response: Response): Promise<never> {
  let errorBody: unknown;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = undefined;
  }
  const parsed = errorBody as { message?: string; error?: string } | undefined;
  const message = parsed?.message || parsed?.error || `Error HTTP ${response.status}`;
  throw new ApiError(response.status, message, errorBody);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, baseUrl = DEFAULT_BASE_URL } = options;
  const token = AuthService.getToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
