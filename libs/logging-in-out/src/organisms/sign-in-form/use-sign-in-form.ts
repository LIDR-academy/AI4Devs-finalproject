import { useLocalization } from '@helsoft/localization';
import { useState } from 'react';

/**
 * Local email-validation error + localization for SignInForm.
 * Auth/router stay on the parent — injected via props.
 */
export const useSignInForm = () => {
  const { t } = useLocalization();
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  return { t, emailError, setEmailError };
};
