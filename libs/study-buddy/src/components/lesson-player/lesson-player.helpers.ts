import type { ActivityAnswer, ActivitySlide, GradedAnswer, Lesson } from '@helsoft/types';

/**
 * Finalize GradedAnswer[] for every activity slide when entering results.
 * Unanswered system-checked activities → isCorrect: false; instructional → omitted.
 * Open-ended (no isCorrect) → isCorrect: false.
 */
export const buildLessonGradedAnswers = (
  lesson: Lesson,
  answersBySlideId: Record<string, ActivityAnswer>,
): GradedAnswer[] =>
  lesson.slides
    .filter((slide): slide is ActivitySlide => slide.kind === 'activity')
    .map((slide) => {
      const stored = answersBySlideId[slide.id];
      if (stored && 'isCorrect' in stored) {
        return {
          slideId: slide.id,
          activityType: slide.activityType,
          isCorrect: stored.isCorrect,
        };
      }
      // Open-ended (no isCorrect) and unanswered alike → isCorrect false.
      return {
        slideId: slide.id,
        activityType: slide.activityType,
        isCorrect: false,
      };
    });
