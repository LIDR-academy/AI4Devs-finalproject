import type { ActivityType } from './activity-type';

/**
 * The decoupled projection `scoreLesson` consumes: an activity slide reduced to just its id
 * and activity type. Independent of `lesson.ts`/`Slide` so scorer fixtures for any activity
 * type (including ones without a slide shape yet) are type-safe today. The wiring layer
 * projects `lesson.slides` into this shape.
 */
export type ScorableSlide = {
  id: string;
  activityType: ActivityType;
};
