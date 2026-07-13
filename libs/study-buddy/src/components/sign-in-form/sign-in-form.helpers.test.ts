import type { AuthErrorCode } from '@helsoft/types';

import { AUTH_ERROR_KEYS, resolveAuthErrorMessage } from './sign-in-form.helpers';

describe('sign-in-form.helpers', () => {
  it('maps known auth error codes to i18n keys', () => {
    expect(AUTH_ERROR_KEYS.invalid_credentials).toBe('auth.error.invalidCredentials');
    expect(AUTH_ERROR_KEYS.network_error).toBe('auth.error.network');
  });

  it('resolves a localized message for a known code', () => {
    const t = (key: string) => `t:${key}`;
    expect(resolveAuthErrorMessage('network_error', t)).toBe('t:auth.error.network');
  });

  it('returns undefined when there is no error or no mapped key', () => {
    const t = (key: string) => key;
    expect(resolveAuthErrorMessage(null, t)).toBeUndefined();
    expect(resolveAuthErrorMessage(undefined, t)).toBeUndefined();
    expect(resolveAuthErrorMessage('validation_error' as AuthErrorCode, t)).toBeUndefined();
  });
});
