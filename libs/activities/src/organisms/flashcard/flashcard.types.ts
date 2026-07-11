import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

export type FlashcardLabels = {
  reveal: string;
  recalled: string;
  notRecalled: string;
  recalledConfirmed: string;
  notRecalledConfirmed: string;
  answerHeading: string;
  explanationHeading: string;
  unavailable: string;
};

export type FlashcardProps = {
  slide: FlashcardSlide;
  onAnswered?: (answer: FlashcardAnswer) => void;
  /** Pre-marked answer (Storybook demos / R9 resume) — implies revealed + locked. */
  initialAnswer?: FlashcardAnswer | null;
  /** Seeds the revealed state before any tap (Storybook demos). */
  initialRevealed?: boolean;
};

export type UseFlashcardProps = {
  slide: FlashcardSlide;
  initialAnswer?: FlashcardAnswer | null;
  initialRevealed?: boolean;
  labels: FlashcardLabels;
};
