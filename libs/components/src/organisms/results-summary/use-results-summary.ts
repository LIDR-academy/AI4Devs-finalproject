import { useLocalization } from '@helsoft/localization';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { calculateResultsPercent } from './results-summary.helpers';
import type { ResultsSummaryVariant } from './results-summary.types';

type UseResultsSummaryArgs = {
  variant: ResultsSummaryVariant;
  loading?: boolean;
  saveFailed?: boolean;
  correct?: number;
  total?: number;
};

/**
 * Derived save-failure flag + iOS VoiceOver announcements for loading/error transitions
 * (WCAG 4.1.3).
 */
export const useResultsSummary = ({
  variant,
  loading = false,
  saveFailed = false,
  correct = 0,
  total = 0,
}: UseResultsSummaryArgs) => {
  const { t } = useLocalization();
  // Shared predicate: the save-failure notice only ever applies to the score variant (nothing
  // is ever saved for completion).
  const showSaveFailure = saveFailed && variant === 'score';

  // accessibilityLiveRegion is Android/Web-only — iOS VoiceOver needs this imperative call
  // fired directly on the saveFailed transition (WCAG 4.1.3).
  useEffect(() => {
    if (showSaveFailure) {
      AccessibilityInfo.announceForAccessibility(t('results.saveFailed'));
    }
  }, [showSaveFailure, t]);

  // Announces the final content once saving resolves (@s13). Skip when the combined
  // loading→error transition lands on a save failure — the failure notice already announces.
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current && !loading && !showSaveFailure) {
      const percent = calculateResultsPercent(correct, total);
      const announcement =
        variant === 'score'
          ? t('results.scoreAnnouncement', {
              score: t('results.score', { correct, total }),
              percent: t('results.scorePercent', { percent }),
            })
          : t('results.completeHeadline');
      AccessibilityInfo.announceForAccessibility(announcement);
    }
    wasLoading.current = loading;
  }, [loading, showSaveFailure, variant, correct, total, t]);

  return { showSaveFailure };
};
