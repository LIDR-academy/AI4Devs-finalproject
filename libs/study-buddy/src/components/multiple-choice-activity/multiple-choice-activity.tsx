import { MultipleChoice } from '@helsoft/activities';

import type { MultipleChoiceActivityProps } from './multiple-choice-activity.types';

/** Thin feature wiring — organism owns state + grading. */
export const MultipleChoiceActivity = ({ slide, onAnswered }: MultipleChoiceActivityProps) => (
  <MultipleChoice slide={slide} onAnswered={onAnswered} />
);
