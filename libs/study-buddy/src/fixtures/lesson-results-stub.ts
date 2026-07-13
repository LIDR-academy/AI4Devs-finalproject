import type { GradedAnswer, Lesson } from '@helsoft/types';

/**
 * Stubbed lesson + answered-state for the app's results route (risk R1) — R4 (player) and R9
 * (resume) don't exist yet, so there's no live source for `answers`. `LessonResults` consumes
 * the same `GradedAnswer[]` contract either way, so swapping this for the real source later is
 * a call-site-only change.
 */
export const buildStubLessonResultsFixture = (
  lessonId: string,
): { lesson: Lesson; answers: GradedAnswer[] } => {
  const slideId = `${lessonId}-slide-1`;

  return {
    lesson: {
      id: lessonId,
      userId: 'stub-user',
      title: `Lesson ${lessonId}`,
      createdAt: new Date(0).toISOString(),
      slides: [
        {
          id: slideId,
          lessonId,
          title: 'Question 1',
          content: 'What is the capital of France?',
          position: 0,
          kind: 'activity',
          activityType: 'multiple-choice',
          options: [
            { id: 'opt-a', label: 'Paris' },
            { id: 'opt-b', label: 'Berlin' },
          ],
          correctOptionId: 'opt-a',
        },
      ],
    },
    answers: [{ slideId, activityType: 'multiple-choice', isCorrect: true }],
  };
};
