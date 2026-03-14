/**
 * Auth Store (Zustand + persist)
 *
 * UI-level auth state for the active session.
 * Persists token/profile to localStorage so the session survives page refreshes.
 *
 * NO server state (meditations etc.) — that remains in React Query.
 * Authentication flow:
 *   1. Frontend gets Google id_token via @react-oauth/google
 *   2. loginWithGoogle(idToken) → POST /api/v1/identity/auth/google → own JWT
 *   3. JWT stored here; sent as Authorization: Bearer in all API calls (T010)
 *   4. logout() → POST /api/v1/identity/auth/logout → clearSession()
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { API_BASE_URL } from '@/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthSession {
  /** Own JWT issued by the backend after validating the Google id_token */
  token: string;
  /** Display name from Google profile */
  nombre: string;
  /** Google profile picture URL (nullable) */
  foto: string | null;
}

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,

      setSession: (session: AuthSession) =>
        set({ session, error: null }),

      clearSession: () =>
        set({ session: null }),

      resetError: () =>
        set({ error: null }),

      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/identity/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(
              (body as { message?: string }).message ??
                'No ha sido posible iniciar sesión. Por favor, inténtalo de nuevo.'
            );
          }

          const data = await response.json() as {
            sessionToken: string;
            nombre: string;
            urlFoto?: string | null;
          };

          set({
            session: {
              token: data.sessionToken,
              nombre: data.nombre,
              foto: data.urlFoto ?? null,
            },
            isLoading: false,
          });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : 'No ha sido posible iniciar sesión. Por favor, inténtalo de nuevo.',
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        const token = get().session?.token;
        // Best-effort: clear local session regardless of backend response
        set({ session: null, error: null });

        if (token) {
          try {
            await fetch(`${API_BASE_URL}/api/v1/identity/auth/logout`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {
            // Silently ignore network errors on logout — session is already cleared locally
          }
        }
      },
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => localStorage),
      // Only persist the session token/profile — transient UI state is ephemeral
      partialize: (state) => ({ session: state.session }),
    }
  )
);
