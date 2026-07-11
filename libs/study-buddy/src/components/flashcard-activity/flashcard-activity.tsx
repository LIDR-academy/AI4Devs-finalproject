import { Flashcard } from '@helsoft/activities';
import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

export type FlashcardActivityProps = {
  slide: FlashcardSlide;
  onAnswered?: (answer: FlashcardAnswer) => void;
};

/** Thin feature wiring — organism owns reveal/self-mark/lock; self-marked, not graded. */
export const FlashcardActivity = ({ slide, onAnswered }: FlashcardActivityProps) => (
  <Flashcard slide={slide} onAnswered={onAnswered} />
);
