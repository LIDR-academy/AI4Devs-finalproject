import { FillInTheBlank } from '@helsoft/activities';
import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

export type FillInTheBlankActivityProps = {
  slide: FillInTheBlankSlide;
  onAnswered?: (answer: FillInTheBlankAnswer) => void;
};

/** Thin feature wiring — organism owns state + grading. */
export const FillInTheBlankActivity = ({ slide, onAnswered }: FillInTheBlankActivityProps) => (
  <FillInTheBlank slide={slide} onAnswered={onAnswered} />
);
