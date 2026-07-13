import type { AuthError, AuthErrorCode } from '@helsoft/types';
import { isAuthApiError } from '@supabase/supabase-js';

import { AuthDao } from '../dao/auth.dao';
import type { SignInWithPasswordResult } from '../dao/auth.types';
import { toTypedError } from '../utils/typed-error';

// Lightweight MVP check: local-part@domain-label.tld — enough to catch missing
// "@", missing domain, or missing TLD without a full RFC 5322 implementation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Builds a sanitized failure the UI can safely branch on — no raw provider error escapes. */
const toAuthError = (code: AuthErrorCode, message: string): Error & AuthError => toTypedError(code, message);

/** The exact GoTrue error code a wrong email/password rejection carries (HTTP 400). Every
 * other GoTrue `AuthApiError` — rate limiting, an unconfirmed/banned account, a 5xx, etc. —
 * carries a different code and must NOT be classified as invalid_credentials. */
const INVALID_LOGIN_CODE = 'invalid_credentials';

/**
 * Maps a raw AuthDao.signInWithPassword rejection onto the typed AuthErrorCode contract.
 * Only the specific Supabase invalid-login error (wrong email or wrong password — supabase
 * itself returns the identical generic shape for both, distinguished from every other
 * AuthApiError by `code: 'invalid_credentials'`) becomes `invalid_credentials`; anything else
 * (any other-coded AuthApiError, a retryable/thrown fetch failure, offline, or any other
 * unexpected exception) becomes `network_error` — the safer default, since we never want to
 * claim "wrong credentials" when we don't actually know that.
 */
const normalizeAuthError = (cause: unknown): Error & AuthError => {
  if (isAuthApiError(cause) && cause.code === INVALID_LOGIN_CODE) {
    return toAuthError('invalid_credentials', 'Invalid credentials');
  }
  return toAuthError('network_error', 'Network error');
};

/**
 * Business logic over AuthDao: validates credentials before ever calling Supabase.
 * Password *strength* is reserved for the signup story — login only requires a
 * well-formed email and a non-empty password (spec.md Open decisions).
 */
export abstract class AuthService {
  static isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email);
  }

  static isNonEmptyPassword(password: string): boolean {
    return password.trim().length > 0;
  }

  static async signIn(email: string, password: string): Promise<SignInWithPasswordResult> {
    if (!AuthService.isValidEmail(email)) {
      throw toAuthError('validation_error', 'Invalid email');
    }
    if (!AuthService.isNonEmptyPassword(password)) {
      throw toAuthError('validation_error', 'Password is required');
    }
    try {
      return await AuthDao.signInWithPassword({ email, password });
    } catch (cause) {
      throw normalizeAuthError(cause);
    }
  }

  static async signOut(): Promise<void> {
    try {
      await AuthDao.signOut();
    } catch (cause) {
      throw normalizeAuthError(cause);
    }
  }
}
