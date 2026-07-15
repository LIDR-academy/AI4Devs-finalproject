import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore';
import { parseApiError } from './apiError';

// Relative URL so the app works on localhost and on LAN IPs (e.g. http://192.168.1.10:3000).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        clearAccessToken();
        return false;
      }

      const data = (await response.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function shouldAttemptRefresh(path: string): boolean {
  return !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh');
}

export function clearSession(): void {
  clearAccessToken();
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    retry &&
    shouldAttemptRefresh(path) &&
    typeof window !== 'undefined'
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiClient<T>(path, options, false);
    }

    clearSession();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?session=expired';
    }
    throw await parseApiError(response);
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
