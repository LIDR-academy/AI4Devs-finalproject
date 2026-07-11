import { useState } from 'react';
import {
  FillInTheBlank,
  FillInTheBlankLabels,
  FillInTheBlankResult,
} from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

import {
  gradeFillInTheBlank,
  isFillInTheBlankSlideValid,
} from '../../grading/grade-fill-in-the-blank';

export type FillInTheBlankActivityProps = {
  slide: FillInTheBlankSlide;
  onAnswered?: (answer: FillInTheBlankAnswer) => void;
};

const ACCEPTED_LENGTH_HEADROOM = 1.25;

/**
 * FillInTheBlankActivity — feature wiring for a fill-in-the-blank slide. Owns value +
 * graded answered state, grades once on Submit, reports via `onAnswered` exactly once.
 */
export const FillInTheBlankActivity = ({ slide, onAnswered }: FillInTheBlankActivityProps) => {
  const [value, setValue] = useState('');
  const [answer, setAnswer] = useState<FillInTheBlankAnswer | null>(null);
  const { t } = useLocalization();
  const valid = isFillInTheBlankSlideValid(slide);

  const labels: FillInTheBlankLabels = {
    submit: t('activity.fillInTheBlank.submit'),
    correct: t('activity.fillInTheBlank.correct'),
    incorrect: t('activity.fillInTheBlank.incorrect'),
    explanationHeading: t('activity.fillInTheBlank.explanationHeading'),
    unavailable: t('activity.fillInTheBlank.unavailable'),
    blankInput: t('activity.fillInTheBlank.blankInput'),
  };

  const maxLength = valid
    ? Math.ceil(slide.acceptedAnswers[0].length * ACCEPTED_LENGTH_HEADROOM)
    : 0;

  const handleSubmit = () => {
    if (answer || !valid) return;
    const graded = gradeFillInTheBlank(slide, value);
    setAnswer(graded);
    onAnswered?.(graded);
  };

  const result: FillInTheBlankResult | null = answer
    ? {
        isCorrect: answer.isCorrect,
        acceptedAnswerShown: answer.acceptedAnswerShown,
      }
    : null;

  return (
    <FillInTheBlank
      content={slide.content}
      value={value}
      maxLength={maxLength}
      unavailable={!valid}
      result={result}
      explanation={slide.explanation}
      labels={labels}
      onChangeValue={setValue}
      onSubmit={handleSubmit}
    />
  );
};
