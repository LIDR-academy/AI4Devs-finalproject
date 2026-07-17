import { Matching } from '@helsoft/activities';

import type { MatchingActivityProps } from './matching-activity.types';

/** Thin feature wiring — organism owns state + grading. */
export const MatchingActivity = ({ slide, onAnswered, initialAnswer }: MatchingActivityProps) => (
  <Matching slide={slide} onAnswered={onAnswered} initialAnswer={initialAnswer} />
);
