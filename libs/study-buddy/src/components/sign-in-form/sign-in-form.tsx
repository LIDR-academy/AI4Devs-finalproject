import { LoginForm } from '@helsoft/components';
import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';

/**
 * SignInForm — feature component wiring useAuth()/useLocalization() to the
 * presentational LoginForm. No navigation on success: the root Stack.Protected
 * guard reacts to the session change once signIn resolves. The sign-up link is
 * a plain route push, unrelated to session state.
 */
export const SignInForm = () => {
  const { signIn, isSubmitting } = useAuth();
  const { t } = useLocalization();
  const router = useRouter();

  return (
    <LoginForm
      onSubmit={({ email, password }) => {
        void signIn(email, password);
      }}
      isSubmitting={isSubmitting}
      onNavigateToSignUp={() => router.push('/sign-up')}
      labels={{
        email: t('auth.email'),
        password: t('auth.password'),
        submit: t('auth.submit'),
        signUpPrompt: t('auth.toSignUp'),
      }}
    />
  );
};
