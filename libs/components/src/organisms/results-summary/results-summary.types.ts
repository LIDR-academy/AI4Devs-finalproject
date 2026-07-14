export type ResultsSummaryVariant = 'score' | 'completion';

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
  /** Correct/total counts for the score variant (ignored for completion); the organism
   * derives the percent and every localized label itself via `t('results.*', …)`. */
  correct?: number;
  total?: number;
  onRetake: () => void;
  onBackToLessons: () => void;
  /**
   * Re-attempts the failed save (@s7). Should always be given whenever `saveFailed` is true —
   * if omitted, the retry action is not rendered at all (graceful degradation; the notice text
   * still shows).
   */
  onRetrySave?: () => void;
};
