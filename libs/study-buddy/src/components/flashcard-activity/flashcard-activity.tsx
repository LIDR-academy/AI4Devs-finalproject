import { Flashcard } from '@helsoft/activities';

import type { FlashcardActivityProps } from './flashcard-activity.types';

/** Thin feature wiring — organism owns reveal/self-mark/lock; self-marked, not graded. */
export const FlashcardActivity = ({ slide, onAnswered }: FlashcardActivityProps) => (
  <Flashcard slide={slide} onAnswered={onAnswered} />
);
