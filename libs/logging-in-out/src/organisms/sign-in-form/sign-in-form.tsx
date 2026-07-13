import { LoginForm } from '../login-form/login-form';
import { resolveAuthErrorMessage } from './sign-in-form.helpers';
import type { SignInFormProps } from './sign-in-form.types';
import { useSignInForm } from './use-sign-in-form';

/**
 * SignInForm — prop-driven feature UI over LoginForm. No useAuth/router: parent injects
 * onSignIn / isSubmitting / error / onNavigateToSignUp / isValidEmail.
 *
 * Owns the @s9 malformed-email decision (via injected isValidEmail) so LoginForm stays
 * presentational. `emailError` re-validates on every email keystroke once set by a failed
 * submit (see handleEmailChange). Empty-password half of @s9 is LoginForm Empty-state gating.
 */
export const SignInForm = ({
  onSignIn,
  isSubmitting = false,
  error,
  onNavigateToSignUp,
  isValidEmail,
}: SignInFormProps) => {
  const { t, emailError, setEmailError } = useSignInForm();

  const handleSubmit = ({ email, password }: { email: string; password: string }) => {
    const nextEmailError = isValidEmail(email) ? undefined : t('auth.error.email');
    setEmailError(nextEmailError);
    if (nextEmailError) return;
    // Contract (SignInFormProps.onSignIn): the parent surfaces failures via `error` — observed
    // here only so the rethrow never becomes an unhandled promise rejection.
    void onSignIn(email, password).catch(() => {});
  };

  // Re-validates once an emailError is already showing, so correcting the email re-enables the
  // (otherwise permanently disabled) submit control without requiring another submit attempt.
  const handleEmailChange = (value: string) => {
    if (!emailError) return;
    setEmailError(isValidEmail(value) ? undefined : t('auth.error.email'));
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onNavigateToSignUp={onNavigateToSignUp}
      errorMessage={resolveAuthErrorMessage(error, t)}
      emailError={emailError}
      onEmailChange={handleEmailChange}
    />
  );
};
