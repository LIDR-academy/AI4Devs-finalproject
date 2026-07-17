/**
 * The result of scoring a lesson's system-checked slides against a set of answers (R7).
 * `isScorable` is false only when `total === 0` (nothing to score → completion state,
 * never a `0 / 0` score).
 */
export type ScoreSummary = {
  correct: number;
  total: number;
  isScorable: boolean;
};
