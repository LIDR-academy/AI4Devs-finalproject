import { useLocalization } from '@helsoft/localization';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { isRehydratedSubmission } from './open-ended.helpers';
import type { UseOpenEndedProps } from './open-ended.types';

/**
 * Open-ended interaction + derived state.
 * Owns draft text + submitted/locked; handlers stay in the component.
 */
export const useOpenEnded = ({
  initialSubmittedAnswer = null,
  unavailable = false,
}: UseOpenEndedProps) => {
  const { t } = useLocalization();
  const seeded = isRehydratedSubmission(initialSubmittedAnswer);
  const [draft, setDraft] = useState(seeded ? (initialSubmittedAnswer as string) : '');
  const [submitted, setSubmitted] = useState(seeded);

  const locked = submitted || unavailable;
  const isUnavailable = unavailable;

  useEffect(() => {
    if (!submitted || Platform.OS === 'android') return;
    AccessibilityInfo.announceForAccessibility(t('activity.openEnded.modelAnswer'));
  }, [submitted, t]);

  return {
    draft,
    setDraft,
    submitted,
    setSubmitted,
    locked,
    isUnavailable,
  };
};
