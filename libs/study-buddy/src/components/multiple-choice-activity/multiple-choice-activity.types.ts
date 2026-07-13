import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
};
