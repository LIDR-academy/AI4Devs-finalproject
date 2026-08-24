const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type AuthTokenProvider = () => string | null;

let getAuthToken: AuthTokenProvider = () => null;

/**
 * Wired by the auth module once it exists (add-auth-rbac). Until then this
 * client works unauthenticated, matching the current backend health check.
 */
export function setAuthTokenProvider(provider: AuthTokenProvider) {
   getAuthToken = provider;
}

type UnauthorizedHandler = () => Promise<string | null>;

let onUnauthorized: UnauthorizedHandler | null = null;

/**
 * Registered by AuthContext: called once when a request comes back 401
 * (e.g. the 15-minute access token expired mid-session). Should attempt a
 * silent refresh and return the new access token, or null if the session
 * cannot be recovered (caller is expected to log the user out in that case).
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
   onUnauthorized = handler;
}

async function request<T>(
   path: string,
   init: RequestInit = {},
   options: { tokenOverride?: string | null; skipAuth?: boolean } = {},
): Promise<T> {
   const { tokenOverride, skipAuth = false } = options;

   const headers = new Headers(init.headers);
   headers.set("Accept", "application/json");
   if (init.body) {
      headers.set("Content-Type", "application/json");
   }

   // Public endpoints (login, refresh) must NEVER carry a Bearer token: an
   // expired access token still lingering in memory makes DRF's JWT
   // authentication reject the request with 401 *before* the view's own
   // AllowAny permission is even checked - which would break login/refresh
   // exactly when they're needed most, and (via the 401-retry below) can
   // spiral into a refresh-retries-refresh loop that ends in a forced logout.
   if (!skipAuth) {
      const token = tokenOverride !== undefined ? tokenOverride : getAuthToken();
      if (token) {
         headers.set("Authorization", `Bearer ${token}`);
      }
   }

   const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

   // Only attempt one silent-refresh-and-retry per request, and never for
   // public endpoints (they don't need a session and must not recurse into
   // the refresh flow themselves).
   if (response.status === 401 && !skipAuth && tokenOverride === undefined && onUnauthorized) {
      const refreshedToken = await onUnauthorized();
      if (refreshedToken) {
         return request<T>(path, init, { tokenOverride: refreshedToken });
      }
   }

   if (!response.ok) {
      throw new Error(`Request to ${path} failed with status ${response.status}`);
   }

   if (response.status === 204) {
      return undefined as T;
   }

   return (await response.json()) as T;
}

export const httpClient = {
   get: <T>(path: string) => request<T>(path, { method: "GET" }),
   post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
   put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
   patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
   delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
   /** For unauthenticated endpoints only (login, refresh): never attaches a
    * Bearer token and never triggers the 401 silent-refresh retry. */
   postPublic: <T>(path: string, body?: unknown) =>
      request<T>(
         path,
         { method: "POST", body: body ? JSON.stringify(body) : undefined },
         { skipAuth: true },
      ),
};
