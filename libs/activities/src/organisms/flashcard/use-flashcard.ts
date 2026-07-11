import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import type { FlashcardAnswer } from '@helsoft/types';

import { isFlashcardSlideValid } from './flashcard.helpers';
import type { UseFlashcardProps } from './flashcard.types';

/**
 * Flashcard interaction + derived state: reveal (one-way) then self-mark (one-time lock).
 * Handlers stay in the component.
 */
export const useFlashcard = ({
  slide,
  initialAnswer = null,
  initialRevealed = false,
  labels,
}: UseFlashcardProps) => {
  const [revealed, setRevealed] = useState(initialRevealed || !!initialAnswer);
  const [answer, setAnswer] = useState<FlashcardAnswer | null>(initialAnswer);

  const locked = !!answer;
  const isRevealed = revealed || !!answer;
  const isUnavailable = !isFlashcardSlideValid(slide);

  useEffect(() => {
    if (!isRevealed || Platform.OS === 'android') return;
    AccessibilityInfo.announceForAccessibility(labels.answerHeading);
  }, [isRevealed, labels.answerHeading]);

  return {
    revealed,
    answer,
    locked,
    isRevealed,
    isUnavailable,
    setRevealed,
    setAnswer,
  };
};
