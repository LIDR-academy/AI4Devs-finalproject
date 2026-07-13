import { useCallback, useState } from 'react';
import { AuthService } from '@helsoft/supabase-services';
import type { AuthError, AuthErrorCode } from '@helsoft/types';

import type { UseAuthResult } from './use-auth.types';

/** The closed set of codes AuthService is contractually allowed to reject with. */
const AUTH_ERROR_CODES: ReadonlySet<AuthErrorCode> = new Set([
  'invalid_credentials',
  'network_error',
  'validation_error',
]);

/** Narrow runtime guard: a rejected AuthService.signIn cause is only trusted as an AuthError
 * when its `.code` is actually a member of the closed AuthErrorCode union — a violated contract
 * (missing code, or a string outside the union, Full-review Round 1, Minor 7) falls back to
 * network_error rather than reading an untrusted value via an unchecked cast. */
const isAuthErrorShape = (cause: unknown): cause is AuthError =>
  AUTH_ERROR_CODES.has((cause as { code?: unknown } | null)?.code as AuthErrorCode);

/**
 * React integration over AuthService: exposes a component-friendly sign-in/out API.
 * Never navigates — the root Stack.Protected guards react to the session change
 * driven by useSession() once AuthService flips the Supabase session.
 */
export const useAuth = (): UseAuthResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  // Shared in-flight bookkeeping for any one-shot auth mutation (sign-in/out): flips
  // isSubmitting on for the duration of the call, off again on either outcome.
  const withSubmitting = useCallback(async <T>(task: () => Promise<T>): Promise<T> => {
    setIsSubmitting(true);
    try {
      return await task();
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signIn = useCallback(
    (email: string, password: string) =>
      withSubmitting(async () => {
        setError(null);
        try {
          await AuthService.signIn(email, password);
        } catch (cause) {
          setError(isAuthErrorShape(cause) ? cause.code : 'network_error');
          throw cause;
        }
      }),
    [withSubmitting],
  );

  const signOut = useCallback(() => withSubmitting(() => AuthService.signOut()), [withSubmitting]);

  return { signIn, signOut, isSubmitting, error };
};
