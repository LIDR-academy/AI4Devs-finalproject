import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';

export type MatchingActivityProps = {
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
  /** Prior in-session answer — rehydrates locked + revealed. */
  initialAnswer?: MatchingAnswer | null;
};
