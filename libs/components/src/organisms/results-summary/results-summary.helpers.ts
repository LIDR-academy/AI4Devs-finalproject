const PERCENT_MULTIPLIER = 100;

/** Rounds correct/total into a whole-number percent; 0 when nothing is scorable yet. */
export const calculateResultsPercent = (correct: number, total: number): number =>
  total > 0 ? Math.round((correct / total) * PERCENT_MULTIPLIER) : 0;
