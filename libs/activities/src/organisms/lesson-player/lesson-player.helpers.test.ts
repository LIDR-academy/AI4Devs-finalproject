import type { Lesson } from '@helsoft/types';

import { buildLessonGradedAnswers } from './lesson-player.helpers';

const lesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-12T12:00:00.000Z',
  slides: [
    {
      id: 'inst-1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Welcome',
      position: 0,
      kind: 'instructional',
    },
    {
      id: 'mc-1',
      lessonId: 'lesson-1',
      title: 'Q1',
      content: 'Capital of France?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Paris' },
        { id: 'b', label: 'Berlin' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'mc-2',
      lessonId: 'lesson-1',
      title: 'Q2',
      content: 'Capital of Germany?',
      position: 2,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Berlin' },
        { id: 'b', label: 'Paris' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'oe-1',
      lessonId: 'lesson-1',
      title: 'Essay',
      content: 'Explain',
      position: 3,
      kind: 'activity',
      activityType: 'open-ended',
      modelAnswer: 'Because',
    },
  ],
};

describe('buildLessonGradedAnswers', () => {
  // @s14 — unanswered system-checked → isCorrect false; instructional excluded.
  it('emits isCorrect false for unanswered activities and excludes instructional slides', () => {
    const graded = buildLessonGradedAnswers(lesson, {});

    expect(graded).toEqual([
      { slideId: 'mc-1', activityType: 'multiple-choice', isCorrect: false },
      { slideId: 'mc-2', activityType: 'multiple-choice', isCorrect: false },
      { slideId: 'oe-1', activityType: 'open-ended', isCorrect: false },
    ]);
  });

  // @s13/@s14 — answered activities keep their own isCorrect.
  it('uses the stored isCorrect for answered activities', () => {
    const graded = buildLessonGradedAnswers(lesson, {
      'mc-1': {
        slideId: 'mc-1',
        activityType: 'multiple-choice',
        selectedOptionId: 'a',
        correctOptionId: 'a',
        isCorrect: true,
      },
      'oe-1': {
        slideId: 'oe-1',
        activityType: 'open-ended',
        submittedAnswer: 'Because light',
      },
    });

    expect(graded).toEqual([
      { slideId: 'mc-1', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'mc-2', activityType: 'multiple-choice', isCorrect: false },
      { slideId: 'oe-1', activityType: 'open-ended', isCorrect: false },
    ]);
  });
});
