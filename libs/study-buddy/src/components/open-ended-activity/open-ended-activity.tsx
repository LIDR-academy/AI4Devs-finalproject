import { useState } from 'react';

import { OpenEnded } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';

import { isOpenEndedSlideValid } from '../../grading/is-open-ended-slide-valid';

export type OpenEndedActivityProps = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
};

/** Short-answer ceiling — not derived from modelAnswer (ungraded). */
export const OPEN_ENDED_MAX_LENGTH = 2000;

/**
 * Thin feature wiring — validity + labels + answered-state emission.
 * Organism owns ephemeral draft/lock; no grader.
 */
export const OpenEndedActivity = ({ slide, onAnswered }: OpenEndedActivityProps) => {
  const { t } = useLocalization();
  const [answered, setAnswered] = useState<OpenEndedAnswer | null>(null);
  const valid = isOpenEndedSlideValid(slide);

  const labels = {
    submit: t('activity.openEnded.submit'),
    yourAnswer: t('activity.openEnded.yourAnswer'),
    modelAnswer: t('activity.openEnded.modelAnswer'),
    explanationHeading: t('activity.openEnded.explanationHeading'),
    unavailable: t('activity.openEnded.unavailable'),
    answerInput: t('activity.openEnded.answerInput'),
  };

  const handleSubmit = (submittedAnswer: string) => {
    if (answered || !valid) return;
    const next: OpenEndedAnswer = {
      slideId: slide.id,
      activityType: 'open-ended',
      submittedAnswer,
    };
    setAnswered(next);
    onAnswered?.(next);
  };

  return (
    <OpenEnded
      prompt={slide.content}
      modelAnswer={slide.modelAnswer}
      explanation={slide.explanation}
      unavailable={!valid}
      maxLength={OPEN_ENDED_MAX_LENGTH}
      labels={labels}
      onSubmit={handleSubmit}
    />
  );
};
