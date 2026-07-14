import type { MultipleChoiceAnswer } from '@helsoft/types';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { hasCorrectOption, optionState } from './multiple-choice.helpers';
import type { UseMultipleChoiceProps } from './multiple-choice.types';

/**
 * Multiple-choice interaction + derived state.
 * Owns pending selection + graded answer; locks once graded. Handlers stay in the component.
 */
export const useMultipleChoice = ({
  slide,
  initialAnswer = null,
  labels,
}: UseMultipleChoiceProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    initialAnswer?.selectedOptionId ?? null,
  );
  const [answer, setAnswer] = useState<MultipleChoiceAnswer | null>(initialAnswer);

  const isUnavailable = !hasCorrectOption(slide);
  const answered = !!answer;
  const locked = answered;
  const isCorrect = answer?.isCorrect ?? false;
  const resultLabel = answered ? (isCorrect ? labels.correct : labels.incorrect) : null;
  const canSubmit = !!selectedOptionId && !locked;

  useEffect(() => {
    if (!isUnavailable && answered && Platform.OS !== 'android' && resultLabel) {
      AccessibilityInfo.announceForAccessibility(resultLabel);
    }
  }, [isUnavailable, answered, resultLabel]);

  const stateForOption = (optionId: string) =>
    optionState(optionId, slide.correctOptionId, selectedOptionId, answered);

  return {
    answer,
    setAnswer,
    selectedOptionId,
    setSelectedOptionId,
    isUnavailable,
    answered,
    locked,
    canSubmit,
    isCorrect,
    resultLabel,
    stateForOption,
  };
};
