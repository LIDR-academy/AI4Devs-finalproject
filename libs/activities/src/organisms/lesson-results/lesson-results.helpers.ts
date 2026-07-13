import type { Lesson, ScorableSlide } from '@helsoft/types';

/** Activity-only projection used by scoreLesson. */
export const toScorableSlides = (lesson: Lesson): ScorableSlide[] =>
  lesson.slides
    .filter((slide) => slide.kind === 'activity')
    .map((slide) => ({ id: slide.id, activityType: slide.activityType }));
