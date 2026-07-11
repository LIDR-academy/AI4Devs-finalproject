import {
  ACCEPTED_LENGTH_HEADROOM,
  BLANK_MARKER,
  blankMaxLength,
  splitAroundBlank,
} from './fill-in-the-blank.helpers';
import type { FillInTheBlankSlide } from '@helsoft/types';

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

describe('splitAroundBlank', () => {
  it('splits once around the blank marker', () => {
    expect(splitAroundBlank('The capital of France is ____.')).toEqual({
      before: 'The capital of France is ',
      after: '.',
    });
  });

  it('returns empty before when the marker is at the start', () => {
    expect(splitAroundBlank('____ is the capital.')).toEqual({
      before: '',
      after: ' is the capital.',
    });
  });

  it('returns empty after when the marker is at the end', () => {
    expect(splitAroundBlank('The capital is ____')).toEqual({
      before: 'The capital is ',
      after: '',
    });
  });

  it('returns null when there is no marker', () => {
    expect(splitAroundBlank('No blank here.')).toBeNull();
  });

  it('returns null when there is more than one marker', () => {
    expect(splitAroundBlank('____ is the capital of ____.')).toBeNull();
  });

  it('uses the canonical blank marker', () => {
    expect(BLANK_MARKER).toBe('____');
  });
});

describe('blankMaxLength', () => {
  it('ceil of first accepted length times headroom', () => {
    expect(blankMaxLength(slide)).toBe(Math.ceil('Paris'.length * ACCEPTED_LENGTH_HEADROOM));
  });

  it('returns 0 when the slide is invalid', () => {
    expect(blankMaxLength({ ...slide, acceptedAnswers: [] })).toBe(0);
  });
});
