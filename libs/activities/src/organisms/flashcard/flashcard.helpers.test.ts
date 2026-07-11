import type { FlashcardSlide } from '@helsoft/types';

import { buildFlashcardAnswer, isFlashcardSlideValid } from './flashcard.helpers';

const slide: FlashcardSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'What pigment absorbs light for photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Chlorophyll',
};

describe('isFlashcardSlideValid', () => {
  it('is true when front (content) and back are both non-empty', () => {
    expect(isFlashcardSlideValid(slide)).toBe(true);
  });

  it('is false when the front (content) is empty', () => {
    expect(isFlashcardSlideValid({ ...slide, content: '' })).toBe(false);
  });

  it('is false when the front (content) is whitespace-only', () => {
    expect(isFlashcardSlideValid({ ...slide, content: '   ' })).toBe(false);
  });

  it('is false when the back is empty', () => {
    expect(isFlashcardSlideValid({ ...slide, back: '' })).toBe(false);
  });

  it('is false when the back is whitespace-only', () => {
    expect(isFlashcardSlideValid({ ...slide, back: '   ' })).toBe(false);
  });
});

describe('buildFlashcardAnswer', () => {
  it('builds a recalled=true answer with isCorrect mirroring recalled', () => {
    expect(buildFlashcardAnswer(slide, true)).toEqual({
      slideId: 'slide-1',
      activityType: 'flashcard',
      recalled: true,
      isCorrect: true,
    });
  });

  it('builds a recalled=false answer with isCorrect mirroring recalled', () => {
    expect(buildFlashcardAnswer(slide, false)).toEqual({
      slideId: 'slide-1',
      activityType: 'flashcard',
      recalled: false,
      isCorrect: false,
    });
  });
});
