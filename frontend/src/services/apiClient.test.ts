import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import {
  apiClient,
  AUTH_TOKEN_STORAGE_KEY,
  maybeRedirectOnUnauthorized,
  NormalizedApiError,
  normalizeError,
  setAuthTokenGetter,
} from './apiClient';

// Pull the request interceptor's fulfilled handler off the shared instance so
// we can assert on the config it produces without making a real HTTP call.
function runRequestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  // axios stores interceptors in a private `handlers` array.
  const handlers = (apiClient.interceptors.request as unknown as {
    handlers: Array<{ fulfilled: (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
  }).handlers;
  return handlers[0].fulfilled(config);
}

function emptyConfig(): InternalAxiosRequestConfig {
  return { headers: AxiosHeaders.from({}) } as InternalAxiosRequestConfig;
}

describe('apiClient auth injection', () => {
  afterEach(() => {
    // Reset to default getter so tests don't leak token state.
    setAuthTokenGetter(() => null);
  });

  it('adds a Bearer Authorization header when a token is present', () => {
    setAuthTokenGetter(() => 'tok-123');
    const out = runRequestInterceptor(emptyConfig());
    expect(AxiosHeaders.from(out.headers).get('Authorization')).toBe('Bearer tok-123');
  });

  it('does not add an Authorization header when no token is available', () => {
    setAuthTokenGetter(() => null);
    const out = runRequestInterceptor(emptyConfig());
    expect(AxiosHeaders.from(out.headers).has('Authorization')).toBe(false);
  });
});

describe('normalizeError', () => {
  it('maps a backend ErrorResponse body into NormalizedApiError fields', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: [{ field: 'check_in', reason: 'Check-in date must be in the future' }],
            trace_id: 'abc123-def456',
          },
        },
      },
    } as unknown as AxiosError;

    const result = normalizeError(axiosError);

    expect(result).toBeInstanceOf(NormalizedApiError);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.message).toBe('Invalid request parameters');
    expect(result.status).toBe(400);
    expect(result.details).toEqual([
      { field: 'check_in', reason: 'Check-in date must be in the future' },
    ]);
    expect(result.traceId).toBe('abc123-def456');
  });

  it('falls back to a status-derived code when the body is not the contract shape', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 404',
      response: { status: 404, data: {} },
    } as unknown as AxiosError;

    const result = normalizeError(axiosError);

    expect(result.code).toBe('NOT_FOUND');
    expect(result.status).toBe(404);
  });

  it('uses NETWORK_ERROR when the request never reached the server', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      response: undefined,
    } as unknown as AxiosError;

    const result = normalizeError(axiosError);

    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.status).toBeUndefined();
  });

  it('wraps non-Axios errors as INTERNAL_ERROR', () => {
    const result = normalizeError(new Error('boom'));
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('boom');
  });

  it('returns the same instance when given an already-normalized error', () => {
    const original = new NormalizedApiError({ message: 'x', code: 'FORBIDDEN' });
    expect(normalizeError(original)).toBe(original);
  });
});

describe('default auth token getter (localStorage-backed)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    setAuthTokenGetter(() => null);
  });

  it('exposes the storage key the app reads tokens from', () => {
    expect(AUTH_TOKEN_STORAGE_KEY).toBe('auth_token');
  });
});

describe('maybeRedirectOnUnauthorized', () => {
  const realLocation = window.location;

  function stubLocation(pathname: string, search = '') {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname, search, assign: vi.fn() },
    });
  }

  afterEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
    vi.restoreAllMocks();
  });

  function axios401(url: string) {
    return { isAxiosError: true, response: { status: 401 }, config: { url } };
  }

  it('clears the stale token and redirects to /login with the current path on a 401 from a non-auth endpoint', () => {
    stubLocation('/booking/checkout', '?propertyId=p1');
    window.localStorage.setItem('auth_token', 'stale-token');

    maybeRedirectOnUnauthorized(axios401('/api/v1/bookings'));

    expect(window.localStorage.getItem('auth_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith(
      '/login?redirect=' + encodeURIComponent('/booking/checkout?propertyId=p1'),
    );
  });

  it('does NOT redirect on a 401 from the login endpoint', () => {
    stubLocation('/login');
    maybeRedirectOnUnauthorized(axios401('/api/v1/auth/login'));
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('does NOT redirect when already on /login', () => {
    stubLocation('/login', '?redirect=%2Ftrips');
    maybeRedirectOnUnauthorized(axios401('/api/v1/bookings'));
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('ignores non-401 errors', () => {
    stubLocation('/trips');
    maybeRedirectOnUnauthorized({ isAxiosError: true, response: { status: 500 }, config: { url: '/api/v1/bookings/my-trips' } });
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
