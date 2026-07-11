import type { FillInTheBlankSlide } from '@helsoft/types';

import {
  gradeFillInTheBlank,
  isFillInTheBlankSlideValid,
  normalizeFillInAnswer,
} from './grade-fill-in-the-blank';

const slide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'The capital of France is ____.',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris', 'City of Light'],
};

describe('gradeFillInTheBlank', () => {
  // @s2, @s10 — matching answer → correct + matched acceptedAnswerShown + full shape.
  it('returns isCorrect true and the matched acceptedAnswerShown when normalized input matches', () => {
    expect(gradeFillInTheBlank(slide, 'paris')).toEqual({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'paris',
      acceptedAnswerShown: 'Paris',
      isCorrect: true,
    });
  });

  // @s3, @s10 — non-matching → incorrect + acceptedAnswers[0].
  it('returns isCorrect false and reveals acceptedAnswers[0] when input matches nothing', () => {
    expect(gradeFillInTheBlank(slide, 'london')).toEqual({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'london',
      acceptedAnswerShown: 'Paris',
      isCorrect: false,
    });
  });

  // @s6, @s10 — empty submit → incorrect + [0].
  it('returns isCorrect false and reveals acceptedAnswers[0] when the input is empty', () => {
    expect(gradeFillInTheBlank(slide, '')).toEqual({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: '',
      acceptedAnswerShown: 'Paris',
      isCorrect: false,
    });
  });

  // @s9, @s10 — non-first accepted match.
  it('returns the matched non-first acceptedAnswerShown when a later synonym matches', () => {
    expect(gradeFillInTheBlank(slide, 'city of light')).toEqual({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'city of light',
      acceptedAnswerShown: 'City of Light',
      isCorrect: true,
    });
  });

  // @s8 — normalization outline.
  it.each([
    ['Paris', 'paris'],
    ['Paris', '  Paris  '],
    ['New York', 'new   york'],
    ['café', 'cafe'],
    ['café', 'CAFÉ'],
  ])('marks correct when accepted "%s" and typed "%s" (@s8)', (accepted, typed) => {
    const outlineSlide: FillInTheBlankSlide = {
      ...slide,
      acceptedAnswers: [accepted],
    };
    expect(gradeFillInTheBlank(outlineSlide, typed).isCorrect).toBe(true);
  });

  // @s11/@s12 — invalid slide → throw.
  it('throws when the slide is invalid', () => {
    const invalid: FillInTheBlankSlide = { ...slide, acceptedAnswers: [] };
    expect(() => gradeFillInTheBlank(invalid, 'paris')).toThrow(
      /not a valid fill-in-the-blank slide/,
    );
  });
});

describe('normalizeFillInAnswer', () => {
  // @s8 — each normalize step observable.
  it('trims, lowercases, collapses whitespace, and strips diacritics', () => {
    expect(normalizeFillInAnswer('  Café  AU  LAIT  ')).toBe('cafe au lait');
  });
});

describe('isFillInTheBlankSlideValid', () => {
  // @s11/@s12 — well-formed.
  it('returns true for a well-formed slide with one blank and non-empty answers', () => {
    expect(isFillInTheBlankSlideValid(slide)).toBe(true);
  });

  // @s11 — empty list.
  it('returns false when acceptedAnswers is empty', () => {
    expect(isFillInTheBlankSlideValid({ ...slide, acceptedAnswers: [] })).toBe(false);
  });

  // @s11 — empty-string entry.
  it('returns false when acceptedAnswers contains an empty string', () => {
    expect(isFillInTheBlankSlideValid({ ...slide, acceptedAnswers: ['Paris', ''] })).toBe(false);
  });

  // @s12 — missing blank marker.
  it('returns false when content has no blank marker', () => {
    expect(isFillInTheBlankSlideValid({ ...slide, content: 'The capital of France is Paris.' })).toBe(
      false,
    );
  });

  // @s12 — multiple blank markers.
  it('returns false when content has more than one blank marker', () => {
    expect(
      isFillInTheBlankSlideValid({ ...slide, content: '____ is the capital of ____.' }),
    ).toBe(false);
  });
});
