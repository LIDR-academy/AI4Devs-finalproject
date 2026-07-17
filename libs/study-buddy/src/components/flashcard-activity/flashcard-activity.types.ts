import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

export type FlashcardActivityProps = {
  slide: FlashcardSlide;
  onAnswered?: (answer: FlashcardAnswer) => void;
  /** Prior in-session answer — rehydrates revealed + locked. */
  initialAnswer?: FlashcardAnswer | null;
};
