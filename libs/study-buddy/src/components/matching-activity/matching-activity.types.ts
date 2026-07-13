import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';

export type MatchingActivityProps = {
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
};
