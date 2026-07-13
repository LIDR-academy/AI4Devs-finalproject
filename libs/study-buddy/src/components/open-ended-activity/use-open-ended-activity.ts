import { useState } from 'react';

import { useLocalization } from '@helsoft/localization';
import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';

import { isOpenEndedSlideValid } from '../../grading/is-open-ended-slide-valid';

import { OPEN_ENDED_MAX_LENGTH } from './open-ended-activity.helpers';

type UseOpenEndedActivityArgs = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
};

/**
 * Validity + labels + answered-state emission for OpenEndedActivity.
 */
export const useOpenEndedActivity = ({ slide, onAnswered }: UseOpenEndedActivityArgs) => {
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

  const submit = (submittedAnswer: string) => {
    if (answered || !valid) return;
    const next: OpenEndedAnswer = {
      slideId: slide.id,
      activityType: 'open-ended',
      submittedAnswer,
    };
    setAnswered(next);
    onAnswered?.(next);
  };

  return {
    valid,
    labels,
    maxLength: OPEN_ENDED_MAX_LENGTH,
    submit,
  };
};
