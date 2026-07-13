import { useState } from 'react';

import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';

/**
 * Local email-validation error + data-layer auth/localization/router wiring for SignInForm.
 */
export const useSignInForm = () => {
  const { signIn, isSubmitting, error } = useAuth();
  const { t } = useLocalization();
  const router = useRouter();
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  return { signIn, isSubmitting, error, t, router, emailError, setEmailError };
};
