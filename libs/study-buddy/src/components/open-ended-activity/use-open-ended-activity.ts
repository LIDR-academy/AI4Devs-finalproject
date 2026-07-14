import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';
import { useState } from 'react';

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
  const [answered, setAnswered] = useState<OpenEndedAnswer | null>(null);
  const valid = isOpenEndedSlideValid(slide);

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
    maxLength: OPEN_ENDED_MAX_LENGTH,
    submit,
  };
};
