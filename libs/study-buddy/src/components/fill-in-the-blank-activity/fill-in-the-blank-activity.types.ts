import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

export type FillInTheBlankActivityProps = {
  slide: FillInTheBlankSlide;
  onAnswered?: (answer: FillInTheBlankAnswer) => void;
  /** Prior in-session answer — rehydrates locked + revealed. */
  initialAnswer?: FillInTheBlankAnswer | null;
};
