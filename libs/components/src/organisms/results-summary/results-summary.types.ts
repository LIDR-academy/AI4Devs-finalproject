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
