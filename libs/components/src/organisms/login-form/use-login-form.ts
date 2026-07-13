import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useLocalization } from '@helsoft/localization';

type UseLoginFormArgs = {
  isSubmitting?: boolean;
  errorMessage?: string;
  emailError?: string;
  passwordError?: string;
};

/**
 * Local field state + derived Empty/validation flags + iOS VoiceOver announcements
 * for loading/error transitions (WCAG 4.1.3).
 */
export const useLoginForm = ({
  isSubmitting = false,
  errorMessage,
  emailError,
  passwordError,
}: UseLoginFormArgs) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Empty state (@s8): a pristine form (either field still blank) keeps submit disabled.
  const isPristine = !email.trim() || !password.trim();
  // Inline validation (@s9): a field-level error blocks submit even once fields are non-empty.
  const hasFieldError = !!emailError || !!passwordError;

  // accessibilityLiveRegion is Android/Web-only — iOS VoiceOver needs this imperative call.
  useEffect(() => {
    if (isSubmitting) {
      AccessibilityInfo.announceForAccessibility(t('auth.signingIn'));
    }
  }, [isSubmitting, t]);

  useEffect(() => {
    if (errorMessage) {
      AccessibilityInfo.announceForAccessibility(errorMessage);
    }
  }, [errorMessage]);

  return {
    t,
    email,
    password,
    setEmail,
    setPassword,
    isPristine,
    hasFieldError,
  };
};
