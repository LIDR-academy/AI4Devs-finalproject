/**
 * Identity API Client Wrapper
 *
 * Thin wrapper over the auto-generated IdentityApi client.
 * Provides typed functions for:
 *   - C1/C2: Authenticate with Google credential → own session token
 *   - C4:     Invalidate the active session (logout)
 *
 * Used by authStore for all backend identity operations.
 * The raw generated client lives at: src/api/generated/identity/src/
 */

import {
  IdentityApi,
  Configuration,
  type AuthResponse,
} from './generated/identity/src';
import { API_BASE_URL } from '../config';

export type { AuthResponse } from './generated/identity/src';
export type { GoogleAuthRequest } from './generated/identity/src';

// ─── Shared configuration ─────────────────────────────────────────────────────

const identityApiConfig = new Configuration({
  basePath: `${API_BASE_URL}/api/v1`,
});

const identityApi = new IdentityApi(identityApiConfig);

// ─── C1 / C2 — Authenticate with Google ──────────────────────────────────────

/**
 * Validates the Google id_token against the backend and returns the own session.
 *
 * - First access (C1): creates a PerfilDeUsuario and returns token + profile.
 * - Subsequent access (C2): recovers the existing profile and returns a fresh token.
 *
 * @param idToken  Google id_token obtained via @react-oauth/google
 * @returns        AuthResponse { sessionToken, userId, nombre, correo, urlFoto }
 * @throws         Error if the token is invalid or the backend request fails
 */
export async function authenticateWithGoogleApi(idToken: string): Promise<AuthResponse> {
  return identityApi.authenticateWithGoogle({
    googleAuthRequest: { idToken },
  });
}

// ─── C4 — Logout ─────────────────────────────────────────────────────────────

/**
 * Invalidates the active session on the backend.
 * Best-effort — the local session must already have been cleared before calling this.
 *
 * @param token  The current session JWT (from authStore.session.token)
 */
export async function logoutApi(token: string): Promise<void> {
  return identityApi.logout({
    headers: { Authorization: `Bearer ${token}` },
  });
}
