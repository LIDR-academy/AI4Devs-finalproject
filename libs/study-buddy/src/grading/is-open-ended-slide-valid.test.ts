import type { OpenEndedSlide } from '@helsoft/types';

import { isOpenEndedSlideValid } from './is-open-ended-slide-valid';

const validSlide: OpenEndedSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Explain',
  content: 'What is photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'open-ended',
  modelAnswer: 'Conversion of light energy into chemical energy.',
};

// @s7 — invalid prompt or modelAnswer → false; valid trimmed both → true.
describe('isOpenEndedSlideValid', () => {
  it('returns true when trimmed content and modelAnswer are both non-empty', () => {
    expect(isOpenEndedSlideValid(validSlide)).toBe(true);
  });

  it('returns true when content and modelAnswer have surrounding whitespace', () => {
    expect(
      isOpenEndedSlideValid({
        ...validSlide,
        content: '  What is photosynthesis?  ',
        modelAnswer: '  Light to chemical energy.  ',
      }),
    ).toBe(true);
  });

  it.each([
    ['prompt', { content: '' }],
    ['prompt', { content: '   ' }],
    ['model answer', { modelAnswer: '' }],
    ['model answer', { modelAnswer: '\t\n' }],
  ] as const)('returns false when %s is empty or whitespace-only', (_field, patch) => {
    expect(isOpenEndedSlideValid({ ...validSlide, ...patch })).toBe(false);
  });
});
