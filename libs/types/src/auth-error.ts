/**
 * Normalized outcome codes for `AuthService.signIn` failures. The service maps every raw
 * Supabase/network failure onto one of these so the UI never branches on provider-specific
 * error shapes — and so a wrong email vs. a wrong password collapse to the same generic code
 * (no user enumeration). Message copy is deliberately not part of this contract: the UI layer
 * maps `code` -> an i18n key.
 */
export type AuthErrorCode = 'invalid_credentials' | 'network_error' | 'validation_error';

/** The minimal shape a normalized auth failure carries upward from the service layer. */
export type AuthError = {
  code: AuthErrorCode;
};
