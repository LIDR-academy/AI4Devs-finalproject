import type { AuthErrorCode } from '@helsoft/types';

/**
 * Maps useAuth()'s normalized AuthErrorCode to its i18n banner key (@s5/@s6). validation_error
 * is deliberately absent: a malformed email is caught by SignInForm's own @s9 handling before
 * ever calling signIn, and an empty password can't reach signIn either — so useAuth().error
 * should never actually surface that code through this form.
 */
export const AUTH_ERROR_KEYS: Partial<Record<AuthErrorCode, string>> = {
  invalid_credentials: 'auth.error.invalidCredentials',
  network_error: 'auth.error.network',
};

export const resolveAuthErrorMessage = (
  error: AuthErrorCode | null | undefined,
  t: (key: string) => string,
): string | undefined => {
  const errorKey = error ? AUTH_ERROR_KEYS[error] : undefined;
  return errorKey ? t(errorKey) : undefined;
};
