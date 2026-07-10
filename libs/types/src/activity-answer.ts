/**
 * The answered-state exposed for a graded activity slide — consumed by the end-of-lesson
 * score (R7) and by resume (R9). Lives in its own file so those callers can import the
 * answer shape without pulling in slide types.
 */
export type MultipleChoiceAnswer = {
  slideId: string;
  activityType: 'multiple-choice';
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

export type ActivityAnswer = MultipleChoiceAnswer; // union grows with sibling activity types
