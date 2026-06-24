/**
 * Base API client (T020).
 *
 * A single configured Axios instance shared across the frontend service layer.
 * Responsibilities:
 *   1. Resolve the backend base URL from the public env var `NEXT_PUBLIC_API_URL`
 *      (declared in `.env.local.example`, T007). No URLs or keys are hardcoded.
 *   2. Inject a Bearer auth token on each request when one is available.
 *   3. Normalize every error into a predictable {@link NormalizedApiError} shape
 *      that mirrors the backend `ErrorResponse` contract
 *      (`contracts/error-responses.yml`: `error.code`, `error.message`,
 *      `error.details[]`, `error.trace_id`).
 *
 * Domain types (Property, Booking, etc.) intentionally live elsewhere (T021).
 * This module only owns the client and its own error/types.
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

/** A single field-level validation error, mirroring the backend contract. */
export interface ApiErrorDetail {
  field?: string;
  reason?: string;
}

/**
 * Machine-readable error codes used by the backend `ErrorResponse` contract.
 * Kept as a string union for ergonomics while tolerating unknown codes.
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'DATES_UNAVAILABLE'
  | 'PAYMENT_FAILED'
  | 'HOLD_EXPIRED'
  | 'BOOKING_CANNOT_CANCEL'
  | 'INTERNAL_ERROR'
  | (string & {});

/**
 * Predictable error object surfaced to all callers. Every rejected request
 * from {@link apiClient} rejects with an instance of this class so callers
 * never have to branch on raw Axios/network internals.
 */
export class NormalizedApiError extends Error {
  /** Machine-readable error code (from backend, or a synthetic fallback). */
  readonly code: ApiErrorCode;
  /** HTTP status code, when the request reached the server. */
  readonly status?: number;
  /** Field-level validation errors, when provided by the backend. */
  readonly details?: ApiErrorDetail[];
  /** Request trace ID for support/debugging, when present. */
  readonly traceId?: string;
  /** The original Axios error, retained for debugging. */
  readonly cause?: unknown;

  constructor(params: {
    message: string;
    code: ApiErrorCode;
    status?: number;
    details?: ApiErrorDetail[];
    traceId?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'NormalizedApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.traceId = params.traceId;
    this.cause = params.cause;
  }
}

/** Shape of the backend `ErrorResponse` body. */
interface BackendErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[];
    trace_id?: string;
  };
}

/**
 * Auth token getter. The app stores the token wherever it likes; by default we
 * read it from `localStorage` under {@link AUTH_TOKEN_STORAGE_KEY}. Replace the
 * getter via {@link setAuthTokenGetter} (e.g. to read from an auth context)
 * without touching call sites.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export type AuthTokenGetter = () => string | null | undefined;

const defaultAuthTokenGetter: AuthTokenGetter = () => {
  // Guard for SSR / non-browser execution where `window` is undefined.
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // localStorage can throw (e.g. disabled cookies / privacy mode).
    return null;
  }
};

let authTokenGetter: AuthTokenGetter = defaultAuthTokenGetter;

/**
 * Override how the auth token is resolved. Useful for wiring the client to an
 * auth context/provider. Pass nothing or the default getter to reset.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter): void {
  authTokenGetter = getter;
}

/**
 * Base URL for the backend API, resolved from the public env var. Falls back to
 * an empty string so relative requests still work in environments where the
 * var is intentionally unset; callers always pass an explicit path.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** The shared, configured Axios instance. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Request interceptor: inject Bearer token when present. ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authTokenGetter();
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error: unknown) => Promise.reject(normalizeError(error)),
);

// --- Response interceptor: redirect on auth expiry, then normalize errors. ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    maybeRedirectOnUnauthorized(error);
    return Promise.reject(normalizeError(error));
  },
);

/**
 * On a 401 from a non-auth endpoint, clear the stale token and bounce the user
 * to /login (preserving where they were). Browser-only; skips the auth endpoints
 * themselves and avoids a loop when already on /login. Exported for testing.
 */
export function maybeRedirectOnUnauthorized(error: unknown): void {
  if (typeof window === 'undefined') return;
  if (!axios.isAxiosError(error)) return;
  if (error.response?.status !== 401) return;
  const url = error.config?.url ?? '';
  if (url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/register')) return;
  if (window.location.pathname.startsWith('/login')) return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // localStorage unavailable — ignore.
  }
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?redirect=${redirect}`);
}

/**
 * Convert any thrown/rejected value into a {@link NormalizedApiError}.
 * Exported so non-Axios callers (or tests) can reuse the same logic.
 */
export function normalizeError(error: unknown): NormalizedApiError {
  if (error instanceof NormalizedApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorResponse>;
    const status = axiosError.response?.status;
    const backendError = axiosError.response?.data?.error;

    if (backendError) {
      return new NormalizedApiError({
        message: backendError.message ?? axiosError.message ?? 'Request failed',
        code: backendError.code ?? fallbackCodeForStatus(status),
        status,
        details: backendError.details,
        traceId: backendError.trace_id,
        cause: error,
      });
    }

    // Reached the server but body did not match the contract, or never
    // reached the server at all (network/timeout/cancel).
    return new NormalizedApiError({
      message: axiosError.message || 'Network error',
      code: status ? fallbackCodeForStatus(status) : 'NETWORK_ERROR',
      status,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new NormalizedApiError({
      message: error.message,
      code: 'INTERNAL_ERROR',
      cause: error,
    });
  }

  return new NormalizedApiError({
    message: 'An unknown error occurred',
    code: 'INTERNAL_ERROR',
    cause: error,
  });
}

/** Best-effort error code when the backend did not supply one. */
function fallbackCodeForStatus(status?: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'DATES_UNAVAILABLE';
    case 422:
      return 'BOOKING_CANNOT_CANCEL';
    default:
      return 'INTERNAL_ERROR';
  }
}

export default apiClient;
