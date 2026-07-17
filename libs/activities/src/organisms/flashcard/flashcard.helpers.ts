import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

/**
 * True iff the slide is renderable: front (content) and back are both non-empty after trim.
 * Guards R2 shape drift — a malformed slide degrades to the unavailable notice (@s8) instead
 * of crashing.
 */
export const isFlashcardSlideValid = (slide: FlashcardSlide): boolean =>
  slide.content.trim().length > 0 && slide.back.trim().length > 0;

/**
 * Builds the answered state from the learner's self-mark. `isCorrect` mirrors `recalled` —
 * it is never scored by R7 (`isSystemCheckedActivity('flashcard') === false`).
 */
export const buildFlashcardAnswer = (
  slide: FlashcardSlide,
  recalled: boolean,
): FlashcardAnswer => ({
  slideId: slide.id,
  activityType: 'flashcard',
  recalled,
  isCorrect: recalled,
});
