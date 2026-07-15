import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';
import { useState } from 'react';

import { OpenEnded } from '../open-ended/open-ended';

/** Short-answer ceiling — not derived from modelAnswer (ungraded). */
export const OPEN_ENDED_MAX_LENGTH = 2000;

const isOpenEndedSlideValid = (slide: OpenEndedSlide): boolean =>
  slide.content.trim().length > 0 && slide.modelAnswer.trim().length > 0;

export type OpenEndedBodyProps = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
  initialAnswer?: OpenEndedAnswer | null;
};

/**
 * Slide-shaped wiring for OpenEnded (organism is prop-driven, not slide-driven).
 * Mirrors study-buddy's OpenEndedActivity without crossing the lib boundary.
 */
export const OpenEndedBody = ({ slide, onAnswered, initialAnswer = null }: OpenEndedBodyProps) => {
  const [answered, setAnswered] = useState<OpenEndedAnswer | null>(initialAnswer);
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

  return (
    <OpenEnded
      prompt={slide.content}
      modelAnswer={slide.modelAnswer}
      explanation={slide.explanation}
      unavailable={!valid}
      maxLength={OPEN_ENDED_MAX_LENGTH}
      initialSubmittedAnswer={initialAnswer?.submittedAnswer}
      onSubmit={submit}
    />
  );
};
