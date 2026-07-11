import { Matching } from '@helsoft/activities';
import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';

export type MatchingActivityProps = {
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
};

/** Thin feature wiring — organism owns state + grading. */
export const MatchingActivity = ({ slide, onAnswered }: MatchingActivityProps) => (
  <Matching slide={slide} onAnswered={onAnswered} />
);
