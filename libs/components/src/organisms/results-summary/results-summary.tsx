import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

export type ResultsSummaryVariant = 'score' | 'completion';

export type ResultsSummaryLabels = {
  score: string;
  percent: string;
  /**
   * Pre-joined, localized announcement for the score variant's loading→content transition
   * (@s13) — the wiring layer composes this from `labels.score`/`percent` (e.g. via
   * `t('results.scoreAnnouncement', …)`); the organism never formats it itself.
   */
  scoreAnnouncement: string;
  retake: string;
  backToLessons: string;
  /** Completion-variant headline (@s8/@s9) — shown instead of a score. */
  completeHeadline: string;
  /** Completion-variant supporting copy (@s8/@s9). */
  completeBody: string;
  /** Non-blocking save-failure notice text (@s7). */
  saveFailed: string;
  /** Retry action label for the save-failure notice (@s7). */
  retrySave: string;
};

export type ResultsSummaryProps = {
  variant: ResultsSummaryVariant;
  /** True while the attempt is being saved — shows the loading affordance and disables actions (@s5). */
  loading?: boolean;
  /**
   * True when the attempt insert failed (@s7) — keeps the score visible and shows a
   * non-blocking notice + retry action alongside it. Ignored for the completion variant
   * (nothing is ever saved there).
   */
  saveFailed?: boolean;
  labels: ResultsSummaryLabels;
  onRetake: () => void;
  onBackToLessons: () => void;
  /**
   * Re-attempts the failed save (@s7). Should always be given whenever `saveFailed` is true —
   * if omitted, the retry action is not rendered at all (graceful degradation; the notice text
   * still shows).
   */
  onRetrySave?: () => void;
};

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;
/** testID for the Loading-state affordance (@s5). */
export const RESULTS_LOADING_TEST_ID = 'results-summary-loading-indicator';

/**
 * ResultsSummary — presentational organism (Score, Completion, Loading, and save-failure
 * states). Receives pre-formatted label strings — never self-formats a score/percentage
 * (that's the wiring layer's job, per codebase precedent LoginForm/LanguageSettings).
 */
export const ResultsSummary = ({
  variant,
  loading = false,
  saveFailed = false,
  labels,
  onRetake,
  onBackToLessons,
  onRetrySave,
}: ResultsSummaryProps) => {
  // Shared predicate: the save-failure notice only ever applies to the score variant (nothing
  // is ever saved for completion). Derived once, referenced by the announcement effect below,
  // the loading-resolved effect's combined-transition guard, and the notice's render condition.
  const showSaveFailure = saveFailed && variant === 'score';

  // accessibilityLiveRegion (below) is Android/Web-only (@platform android) — iOS VoiceOver
  // needs this imperative call fired directly on the saveFailed transition (WCAG 4.1.3),
  // mirroring LoginForm's errorMessage announcement.
  useEffect(() => {
    if (showSaveFailure) {
      AccessibilityInfo.announceForAccessibility(labels.saveFailed);
    }
  }, [showSaveFailure, labels.saveFailed]);

  // Announces the final content once saving resolves (@s13 — a loading→score/completion
  // state change) — same iOS-parity rationale as the saveFailed effect above: there is no
  // visual content change to hang a `accessibilityLiveRegion` off of (the headline is already
  // rendered underneath the spinner), so the imperative call is the only way to notify a
  // screen-reader user the wait is over.
  //
  // Slice-3 review round 1, Finding 1: `useLessonAttempt`'s saving→error transition flips
  // `loading` and `saveFailed` in the *same* commit, which would otherwise fire this effect
  // alongside the saveFailed effect above — two competing announcements back to back. Skip this
  // one when that combined transition lands on a save failure; the failure notice above is the
  // more actionable message and already announces on its own.
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current && !loading && !showSaveFailure) {
      const announcement = variant === 'score' ? labels.scoreAnnouncement : labels.completeHeadline;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
    wasLoading.current = loading;
  }, [loading, showSaveFailure, variant, labels.scoreAnnouncement, labels.completeHeadline]);

  return (
    <Card>
      <View style={styles.content}>
        {variant === 'score' ? (
          <>
            <Text style={styles.headline}>{labels.score}</Text>
            <Text style={styles.body}>{labels.percent}</Text>
          </>
        ) : (
          <>
            <Text style={styles.headline}>{labels.completeHeadline}</Text>
            <Text style={styles.body}>{labels.completeBody}</Text>
          </>
        )}
        {showSaveFailure ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Text style={styles.noticeText} accessibilityLiveRegion="assertive">
              {labels.saveFailed}
            </Text>
            {onRetrySave ? (
              <Button variant="text" onPress={onRetrySave}>
                {labels.retrySave}
              </Button>
            ) : null}
          </View>
        ) : null}
        {loading ? (
          <View testID={RESULTS_LOADING_TEST_ID}>
            <ProgressIndicator variant="circular" size={LOADING_SPINNER_SIZE} thickness={LOADING_SPINNER_THICKNESS} />
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button disabled={loading} onPress={onRetake}>
            {labels.retake}
          </Button>
          <Button variant="text" disabled={loading} onPress={onBackToLessons}>
            {labels.backToLessons}
          </Button>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.s2,
  },
  headline: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
  },
  body: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  notice: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  noticeText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onErrorContainer,
  },
}));
