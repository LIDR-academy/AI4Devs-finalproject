import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

export type FillInTheBlankActivityProps = {
  slide: FillInTheBlankSlide;
  onAnswered?: (answer: FillInTheBlankAnswer) => void;
};
