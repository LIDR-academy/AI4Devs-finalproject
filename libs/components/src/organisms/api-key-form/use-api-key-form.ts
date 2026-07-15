import { useLocalization } from '@helsoft/localization';
import type { ApiKeyStatus } from '@helsoft/types';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

type UseApiKeyFormArgs = {
  status: ApiKeyStatus;
  isLoadingStatus?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
};

/**
 * Local field/replace/confirm state + derived Empty flags + iOS VoiceOver announcements
 * for loading/error/submitting transitions (WCAG 4.1.3).
 */
export const useApiKeyForm = ({
  status,
  isLoadingStatus = false,
  isSubmitting = false,
  errorMessage,
}: UseApiKeyFormArgs) => {
  const { t } = useLocalization();
  const [apiKey, setApiKey] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const wasSubmitting = useRef(isSubmitting);

  // @s4 — once a replace-save resolves successfully (isSubmitting flips back to false while
  // the status still reports a saved key), the form reverts to the masked state instead of
  // leaving the input open.
  useEffect(() => {
    if (wasSubmitting.current && !isSubmitting && status.hasKey) {
      setIsReplacing(false);
      setApiKey('');
    }
    wasSubmitting.current = isSubmitting;
  }, [isSubmitting, status.hasKey]);

  // @s6/@s9 — announces a save/remove failure to assistive tech (iOS VoiceOver parity;
  // Android/Web get the banner's own accessibilityLiveRegion).
  useEffect(() => {
    if (errorMessage) {
      AccessibilityInfo.announceForAccessibility(errorMessage);
    }
  }, [errorMessage]);

  // Full-review Round 1, Major 4 (WCAG 4.1.3) — accessibilityLiveRegion has no effect on iOS
  // VoiceOver, so the status-loading transition also needs this imperative announcement
  // (mirrors LoginForm's isSubmitting effect).
  useEffect(() => {
    if (isLoadingStatus) {
      AccessibilityInfo.announceForAccessibility(t('settings.apiKey.loadingStatus'));
    }
  }, [isLoadingStatus, t]);

  // Same iOS-parity need for the isSubmitting progress label (WCAG 4.1.3).
  useEffect(() => {
    if (isSubmitting) {
      AccessibilityInfo.announceForAccessibility(t('settings.apiKey.saving'));
    }
  }, [isSubmitting, t]);

  const showInput = !status.hasKey || isReplacing;
  // @s5 — a blank/whitespace-only key is never submittable (AC7).
  const isSaveDisabled = isSubmitting || !apiKey.trim();

  return {
    apiKey,
    setApiKey,
    isReplacing,
    setIsReplacing,
    isConfirmingRemove,
    setIsConfirmingRemove,
    showInput,
    isSaveDisabled,
  };
};
