export type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
  /** True while the parent's sign-in call is in flight — drives the Loading state (@s3). */
  isSubmitting?: boolean;
  onNavigateToSignUp?: () => void;
  /**
   * Auth-level failure banner (invalid_credentials / network_error, @s5/@s6). The form stays
   * editable and submit stays enabled once fields are non-empty — retry is just re-submitting.
   */
  errorMessage?: string;
  /** Inline validation message for the email field (@s9, e.g. malformed email). Blocks submit. */
  emailError?: string;
  /** Inline validation message for the password field (@s9, e.g. empty password). Blocks submit. */
  passwordError?: string;
  /**
   * Called with the email field's next value on every change. Lets the wiring layer
   * (SignInForm) re-validate/clear `emailError` reactively as the user edits — without this,
   * once `emailError` is set the submit control that would re-trigger validation is itself
   * disabled by that same error, permanently deadlocking the form (@s9 fix).
   */
  onEmailChange?: (email: string) => void;
};
