import { FillInTheBlank } from '@helsoft/activities';

import type { FillInTheBlankActivityProps } from './fill-in-the-blank-activity.types';

/** Thin feature wiring — organism owns state + grading. */
export const FillInTheBlankActivity = ({ slide, onAnswered }: FillInTheBlankActivityProps) => (
  <FillInTheBlank slide={slide} onAnswered={onAnswered} />
);
