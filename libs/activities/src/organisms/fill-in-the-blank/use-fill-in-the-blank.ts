import type { FillInTheBlankAnswer } from '@helsoft/types';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { isFillInTheBlankSlideValid } from '../../grading/grade-fill-in-the-blank';
import { blankMaxLength, splitAroundBlank } from './fill-in-the-blank.helpers';
import type { UseFillInTheBlankProps } from './fill-in-the-blank.types';

/**
 * Fill-in-the-blank interaction + derived state.
 * Owns blank value + graded answer; locks once graded. Handlers stay in the component.
 */
export const useFillInTheBlank = ({
  slide,
  initialAnswer = null,
  labels,
}: UseFillInTheBlankProps) => {
  const [value, setValue] = useState(initialAnswer?.submittedAnswer ?? '');
  const [answer, setAnswer] = useState<FillInTheBlankAnswer | null>(initialAnswer);

  const valid = isFillInTheBlankSlideValid(slide);
  const parts = splitAroundBlank(slide.content);
  const locked = !!answer;
  const isUnavailable = !valid || !parts;
  const maxLength = blankMaxLength(slide);
  const resultLabel = answer ? (answer.isCorrect ? labels.correct : labels.incorrect) : null;

  useEffect(() => {
    if (!answer || Platform.OS === 'android') return;
    AccessibilityInfo.announceForAccessibility(
      answer.isCorrect ? labels.correct : labels.incorrect,
    );
  }, [answer, labels.correct, labels.incorrect]);

  return {
    value,
    setValue,
    answer,
    setAnswer,
    parts,
    locked,
    isUnavailable,
    maxLength,
    resultLabel,
  };
};
