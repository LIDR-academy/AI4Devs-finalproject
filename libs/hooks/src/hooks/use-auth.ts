import { useCallback, useState } from 'react';
import { AuthService } from '@helsoft/services';

export type UseAuthResult = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** True while a signIn/signOut call is in flight (drives the LoginForm Loading state). */
  isSubmitting: boolean;
};

/**
 * React integration over AuthService: exposes a component-friendly sign-in/out API.
 * Never navigates — the root Stack.Protected guards react to the session change
 * driven by useSession() once AuthService flips the Supabase session.
 */
export const useAuth = (): UseAuthResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await AuthService.signIn(email, password);
      }),
    [withSubmitting],
  );

  const signOut = useCallback(() => withSubmitting(() => AuthService.signOut()), [withSubmitting]);

  return { signIn, signOut, isSubmitting };
};
