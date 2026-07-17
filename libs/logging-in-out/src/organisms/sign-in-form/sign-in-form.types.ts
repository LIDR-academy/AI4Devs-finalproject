import type { AuthErrorCode } from '@helsoft/types';

export type SignInFormProps = {
  /**
   * Called with validated credentials; parent owns auth (e.g. useAuth().signIn). May reject —
   * SignInForm observes and discards the rejection, so the parent MUST surface failures
   * through the `error` prop (the way useAuth records its normalized code before rethrowing);
   * a rejection that leaves `error` unset is invisible to the user.
   */
  onSignIn: (email: string, password: string) => Promise<void>;
  /** True while the parent's sign-in is in flight — drives LoginForm Loading (@s3). */
  isSubmitting?: boolean;
  /** Normalized auth failure from the parent; mapped to a banner via i18n (@s5/@s6). */
  error?: AuthErrorCode | null;
  onNavigateToSignUp?: () => void;
  /** Injected so this lib stays free of AuthService / supabase-services. */
  isValidEmail: (email: string) => boolean;
};
