/**
 * Storybook-only stand-in for @helsoft/hooks. Re-exports the real, presentational hooks
 * (reached via a relative import into the sibling package's source, bypassing this same
 * alias — mirrors libs/study-buddy/jest.config.js's setupFiles reaching into
 * ../components/src/theme/unistyles.ts the same way) and replaces useAuth with a fake,
 * story-configurable implementation: the real one calls AuthService -> Supabase, which
 * isn't initialized in Storybook. Aliased in main.ts's viteFinal — never resolved by Jest
 * or the real app build.
 */
export * from '../../../hooks/src/hooks/use-interaction-state';
export * from '../../../hooks/src/hooks/use-session';

import { useCallback, useState } from 'react';

export type AuthErrorCode = 'invalid_credentials' | 'network_error';

export type AuthMockConfig = {
  isSubmitting?: boolean;
  error?: AuthErrorCode | null;
  scenario?: 'success' | 'invalidCredentials' | 'networkError';
};

let pendingConfig: AuthMockConfig = {};

/** Call from a story's decorator just before it renders, so useAuth's lazy initializer
 * below picks it up on that story's first (and only) mount. */
export const configureAuthMock = (config: AuthMockConfig) => {
  pendingConfig = config;
};

const SIGN_IN_DELAY_MS = 400;
const SIGN_OUT_DELAY_MS = 300;

export const useAuth = () => {
  const [config] = useState(() => {
    const next = pendingConfig;
    pendingConfig = {};
    return next;
  });
  const [isSubmitting, setIsSubmitting] = useState(config.isSubmitting ?? false);
  const [error, setError] = useState<AuthErrorCode | null>(config.error ?? null);

  const signIn = useCallback(
    (_email: string, _password: string): Promise<void> =>
      new Promise((resolve, reject) => {
        setIsSubmitting(true);
        setError(null);
        setTimeout(() => {
          setIsSubmitting(false);
          if (config.scenario === 'invalidCredentials') {
            setError('invalid_credentials');
            reject(new Error('invalid_credentials'));
            return;
          }
          if (config.scenario === 'networkError') {
            setError('network_error');
            reject(new Error('network_error'));
            return;
          }
          resolve();
        }, SIGN_IN_DELAY_MS);
      }),
    [config.scenario],
  );

  const signOut = useCallback(
    (): Promise<void> =>
      new Promise((resolve) => {
        setIsSubmitting(true);
        setTimeout(() => {
          setIsSubmitting(false);
          resolve();
        }, SIGN_OUT_DELAY_MS);
      }),
    [],
  );

  return { signIn, signOut, isSubmitting, error };
};
