import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

const BLANK_MARKER = '____';

/**
 * True iff acceptedAnswers is non-empty (every entry a non-empty string) AND
 * content contains exactly one `____` blank marker.
 */
export const isFillInTheBlankSlideValid = (slide: FillInTheBlankSlide): boolean => {
  const { acceptedAnswers, content } = slide;
  if (acceptedAnswers.length === 0) return false;
  if (acceptedAnswers.some((answer) => answer.length === 0)) return false;

  let from = 0;
  let count = 0;
  while (from <= content.length) {
    const idx = content.indexOf(BLANK_MARKER, from);
    if (idx === -1) break;
    count += 1;
    if (count > 1) return false;
    from = idx + BLANK_MARKER.length;
  }
  return count === 1;
};

/**
 * trim → lowercase → collapse /\s+/ → NFD + strip combining marks.
 */
export const normalizeFillInAnswer = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

/**
 * Pure grader for a fill-in-the-blank slide — no I/O.
 * Match any normalized accepted answer → correct.
 * acceptedAnswerShown: matched accepted (first in list order) when correct; else acceptedAnswers[0].
 * Throws if the slide is invalid.
 */
export const gradeFillInTheBlank = (
  slide: FillInTheBlankSlide,
  submittedAnswer: string,
): FillInTheBlankAnswer => {
  if (!isFillInTheBlankSlideValid(slide)) {
    throw new Error('gradeFillInTheBlank: slide is not a valid fill-in-the-blank slide');
  }

  const normalized = normalizeFillInAnswer(submittedAnswer);
  const matched = slide.acceptedAnswers.find(
    (accepted) => normalizeFillInAnswer(accepted) === normalized,
  );

  return {
    slideId: slide.id,
    activityType: 'fill-in-the-blank',
    submittedAnswer,
    acceptedAnswerShown: matched ?? slide.acceptedAnswers[0],
    isCorrect: matched !== undefined,
  };
};
