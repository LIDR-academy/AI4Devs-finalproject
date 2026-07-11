import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import type { MultipleChoiceAnswer } from '@helsoft/types';

import { hasCorrectOption, optionState } from './multiple-choice.helpers';
import type { UseMultipleChoiceProps } from './multiple-choice.types';

/**
 * Multiple-choice interaction + derived state.
 * Owns graded answer; locks once set. Handlers stay in the component.
 */
export const useMultipleChoice = ({
  slide,
  initialAnswer = null,
  labels,
}: UseMultipleChoiceProps) => {
  const [answer, setAnswer] = useState<MultipleChoiceAnswer | null>(initialAnswer);

  const isUnavailable = !hasCorrectOption(slide);
  const selectedOptionId = answer?.selectedOptionId ?? null;
  const answered = !!answer;
  const isCorrect = answer?.isCorrect ?? false;
  const resultLabel = answered ? (isCorrect ? labels.correct : labels.incorrect) : null;

  useEffect(() => {
    if (!isUnavailable && answered && Platform.OS !== 'android' && resultLabel) {
      AccessibilityInfo.announceForAccessibility(resultLabel);
    }
  }, [isUnavailable, answered, resultLabel]);

  const stateForOption = (optionId: string) =>
    optionState(optionId, slide.correctOptionId, selectedOptionId);

  return {
    answer,
    setAnswer,
    isUnavailable,
    selectedOptionId,
    answered,
    isCorrect,
    resultLabel,
    stateForOption,
  };
};
