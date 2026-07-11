import { isSystemCheckedActivity, type GradedAnswer, type ScorableSlide, type ScoreSummary } from '@helsoft/types';

/**
 * Pure end-of-lesson scorer (no I/O). Consumes the decoupled `ScorableSlide[]` projection
 * (not `Lesson`/`Slide`) so fixtures for any activity type are type-safe today (R6).
 */
export const scoreLesson = (slides: ScorableSlide[], answers: GradedAnswer[]): ScoreSummary => {
  const systemCheckedSlideIds = new Set(
    slides.filter((slide) => isSystemCheckedActivity(slide.activityType)).map((slide) => slide.id),
  );
  const total = systemCheckedSlideIds.size;
  const correct = answers.filter((answer) => systemCheckedSlideIds.has(answer.slideId) && answer.isCorrect).length;

  return { correct, total, isScorable: total > 0 };
};
