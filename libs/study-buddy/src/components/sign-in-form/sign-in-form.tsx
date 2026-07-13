import { LoginForm } from '@helsoft/components';
import { AuthService } from '@helsoft/services';

import { resolveAuthErrorMessage } from './sign-in-form.helpers';
import { useSignInForm } from './use-sign-in-form';

/**
 * SignInForm — feature component wiring useAuth()/useLocalization() to the
 * presentational LoginForm. No navigation on success: the root Stack.Protected
 * guard reacts to the session change once signIn resolves. The sign-up link is
 * a plain route push, unrelated to session state.
 *
 * Owns the @s9 malformed-email decision (via AuthService.isValidEmail) so LoginForm stays
 * presentational: a malformed-but-non-empty email never reaches signIn/AuthService. `emailError`
 * is re-validated on every email keystroke once it has been set by a failed submit (see
 * handleEmailChange) so correcting the email re-enables submit without another submit attempt —
 * otherwise the disabled submit control would be the only way left to clear its own error. The
 * empty-password half of @s9 needs no separate wiring here — LoginForm's own Empty-state
 * gating (@s8) already keeps submit disabled whenever the password is blank, so handleSubmit
 * is never invoked with one; AuthService.signIn still defensively rejects a blank password
 * (validation_error) for any caller that bypasses the form entirely. This is a reviewed,
 * explicit scope decision — see spec.md's "Open decisions" section.
 */
export const SignInForm = () => {
  const { signIn, isSubmitting, error, t, router, emailError, setEmailError } = useSignInForm();

  const handleSubmit = ({ email, password }: { email: string; password: string }) => {
    const nextEmailError = AuthService.isValidEmail(email) ? undefined : t('auth.error.email');
    setEmailError(nextEmailError);
    if (nextEmailError) return;
    // useAuth().signIn already records the failure via `error` state before it rejects (Major 2,
    // full-review Round 1) — the rejection itself must still be observed here so it never becomes
    // an unhandled promise rejection; no separate handling is needed since `error` already drives
    // the banner above.
    void signIn(email, password).catch(() => {});
  };

  // Re-validates once an emailError is already showing, so correcting the email re-enables the
  // (otherwise permanently disabled) submit control without requiring another submit attempt.
  // Before any error exists, validation stays submit-triggered only (@s9's "attempt to submit").
  const handleEmailChange = (value: string) => {
    if (!emailError) return;
    setEmailError(AuthService.isValidEmail(value) ? undefined : t('auth.error.email'));
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onNavigateToSignUp={() => router.push('/sign-up')}
      errorMessage={resolveAuthErrorMessage(error, t)}
      emailError={emailError}
      onEmailChange={handleEmailChange}
    />
  );
};
