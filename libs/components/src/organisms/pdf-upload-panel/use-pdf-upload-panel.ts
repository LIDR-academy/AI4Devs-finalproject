import { useLocalization } from '@helsoft/localization';
import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

import type { PdfUploadPanelState } from './pdf-upload-panel.types';

type UsePdfUploadPanelArgs = {
  state: PdfUploadPanelState;
  errorMessage?: string;
};

/**
 * Local panel state — derived loading flag + iOS VoiceOver announcements for loading/error
 * transitions (WCAG 4.1.3). Presentational; data still comes from the wiring layer.
 */
export const usePdfUploadPanel = ({ state, errorMessage }: UsePdfUploadPanelArgs) => {
  const { t } = useLocalization();
  const isLoading = state === 'loading';

  // @s16 (WCAG 4.1.3) — accessibilityLiveRegion only reaches Android/Web; iOS VoiceOver needs
  // the imperative AccessibilityInfo call on the transition.
  useEffect(() => {
    if (isLoading) AccessibilityInfo.announceForAccessibility(t('upload.loading'));
  }, [isLoading, t]);

  useEffect(() => {
    if (errorMessage) AccessibilityInfo.announceForAccessibility(errorMessage);
  }, [errorMessage]);

  return { t, isLoading };
};
