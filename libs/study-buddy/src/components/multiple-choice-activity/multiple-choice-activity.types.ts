import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
  /** Prior in-session answer — rehydrates locked + revealed. */
  initialAnswer?: MultipleChoiceAnswer | null;
};
