import type { FillInTheBlankSlide } from '@helsoft/types';

import { isFillInTheBlankSlideValid } from '../../grading/grade-fill-in-the-blank';
import type { FillInTheBlankParts } from './fill-in-the-blank.types';

export const BLANK_MARKER = '____';
export const ACCEPTED_LENGTH_HEADROOM = 1.25;

export const splitAroundBlank = (content: string): FillInTheBlankParts | null => {
  const idx = content.indexOf(BLANK_MARKER);
  if (idx === -1) return null;
  const next = content.indexOf(BLANK_MARKER, idx + BLANK_MARKER.length);
  if (next !== -1) return null;
  return {
    before: content.slice(0, idx),
    after: content.slice(idx + BLANK_MARKER.length),
  };
};

export const blankMaxLength = (slide: FillInTheBlankSlide): number => {
  if (!isFillInTheBlankSlideValid(slide)) return 0;
  return Math.ceil(slide.acceptedAnswers[0].length * ACCEPTED_LENGTH_HEADROOM);
};
