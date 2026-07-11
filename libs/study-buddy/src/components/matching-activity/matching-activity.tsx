import { useState } from 'react';
import { Matching, MatchingLabels, MatchingPairSelection, MatchingResult } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';

import { gradeMatching, isMatchingSlideValid } from '../../grading/grade-matching';

export type MatchingActivityProps = {
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
};

/**
 * MatchingActivity — feature wiring for a matching activity slide. Owns the graded
 * answered state, grades on Submit, and reports it up via `onAnswered` exactly once.
 * Mirrors MultipleChoiceActivity.
 */
export const MatchingActivity = ({ slide, onAnswered }: MatchingActivityProps) => {
  const [answer, setAnswer] = useState<MatchingAnswer | null>(null);
  const { t } = useLocalization();
  const valid = isMatchingSlideValid(slide);

  // Only UI chrome is localized (@s16 / task-6) — item labels and explanation are slide content.
  const labels: MatchingLabels = {
    submit: t('activity.matching.submit'),
    correct: t('activity.matching.correct'),
    incorrect: t('activity.matching.incorrect'),
    correctPair: t('activity.matching.correctPair'),
    incorrectPair: t('activity.matching.incorrectPair'),
    explanationHeading: t('activity.matching.explanationHeading'),
    unavailable: t('activity.matching.unavailable'),
  };

  const handleSubmit = (pairs: MatchingPairSelection[]) => {
    if (answer || !valid) return; // locked / never grade an invalid slide
    const graded = gradeMatching(slide, pairs);
    setAnswer(graded);
    onAnswered?.(graded);
  };

  const result: MatchingResult | null = answer
    ? {
        pairs: answer.pairs,
        isCorrect: answer.isCorrect,
        summary: t('activity.matching.summary', {
          correct: answer.correctPairCount,
          total: answer.totalPairCount,
        }),
      }
    : null;

  return (
    <Matching
      prompt={slide.content}
      leftItems={slide.leftItems}
      rightItems={slide.rightItems}
      unavailable={!valid}
      result={result}
      explanation={slide.explanation}
      labels={labels}
      onSubmit={handleSubmit}
    />
  );
};
