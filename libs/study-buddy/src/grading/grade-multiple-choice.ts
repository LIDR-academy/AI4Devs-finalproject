import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

/**
 * Pure grader for a multiple-choice slide — no I/O, the correct answer arrives on the slide.
 * Turns the learner's pick into the answered-state consumed by the end-of-lesson score (R7)
 * and by resume (R9).
 */
export const gradeMultipleChoice = (slide: MultipleChoiceSlide, selectedOptionId: string): MultipleChoiceAnswer => ({
  slideId: slide.id,
  activityType: 'multiple-choice',
  selectedOptionId,
  correctOptionId: slide.correctOptionId,
  isCorrect: selectedOptionId === slide.correctOptionId,
});
