/**
 * useAuth — lightweight localStorage-backed auth state helpers.
 *
 * Does NOT use React state — the helpers read/write localStorage directly.
 * Callers that need reactive updates should manage their own state.
 */

const AUTH_TOKEN_KEY = 'auth_token';

/** Decode the `sub` claim from a JWT without signature verification. */
function decodeJwtSub(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    // Base64url → Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return typeof parsed.sub === 'string' ? parsed.sub : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  return {
    /** Returns true if a token is present in localStorage. */
    isLoggedIn: (): boolean => {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /** Removes the auth token (logout). */
    logout: (): void => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    },

    /** Returns the `sub` (userId UUID) from the stored JWT, or null if not logged in. */
    userId: (): string | null => {
      if (typeof window === 'undefined') return null;
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return null;
      return decodeJwtSub(token);
    },
  };
}
