import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

/**
 * Pure grader for a multiple-choice slide — no I/O, the correct answer arrives on the slide.
 * Turns the learner's pick into the answered-state consumed by the end-of-lesson score (R7)
 * and by resume (R9).
 */
export const gradeMultipleChoice = (slide: MultipleChoiceSlide, selectedOptionId: string): MultipleChoiceAnswer => {
  const isKnownOption = slide.options.some((option) => option.id === selectedOptionId);
  if (!isKnownOption) {
    throw new Error(`gradeMultipleChoice: "${selectedOptionId}" is not one of the slide's options`);
  }

  return {
    slideId: slide.id,
    activityType: 'multiple-choice',
    selectedOptionId,
    correctOptionId: slide.correctOptionId,
    isCorrect: selectedOptionId === slide.correctOptionId,
  };
};
