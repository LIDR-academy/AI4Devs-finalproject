import type { MultipleChoiceSlide } from '@helsoft/types';

import { gradeMultipleChoice } from './grade-multiple-choice';

const slide: MultipleChoiceSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 0,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
  ],
  correctOptionId: 'opt-a',
};

describe('gradeMultipleChoice', () => {
  // @s3, @s7 — a matching selection is graded correct and the full answered-state shape is returned.
  it('returns isCorrect true and the full answered-state shape when the selection matches the correct option', () => {
    expect(gradeMultipleChoice(slide, 'opt-a')).toEqual({
      slideId: 'slide-1',
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      isCorrect: true,
    });
  });

  // @s4, @s7 — a non-matching selection is graded incorrect, and the correct option is still
  // reported alongside it in the answered-state shape.
  it('returns isCorrect false and reports the correct option when the selection does not match it', () => {
    expect(gradeMultipleChoice(slide, 'opt-b')).toEqual({
      slideId: 'slide-1',
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-b',
      correctOptionId: 'opt-a',
      isCorrect: false,
    });
  });
});
