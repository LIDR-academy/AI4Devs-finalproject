import type { AuthErrorCode } from '@helsoft/types';

export type UseAuthResult = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** True while a signIn/signOut call is in flight (drives the LoginForm Loading state). */
  isSubmitting: boolean;
  /** The normalized code from the most recent failed signIn — null once it succeeds. */
  error: AuthErrorCode | null;
};
