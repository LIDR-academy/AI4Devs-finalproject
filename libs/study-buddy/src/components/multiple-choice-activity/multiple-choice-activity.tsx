import { MultipleChoice } from '@helsoft/activities';
import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
};

/** Thin feature wiring — organism owns state + grading. */
export const MultipleChoiceActivity = ({ slide, onAnswered }: MultipleChoiceActivityProps) => (
  <MultipleChoice slide={slide} onAnswered={onAnswered} />
);
