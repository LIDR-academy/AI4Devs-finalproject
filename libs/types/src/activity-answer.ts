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

/** A learner-formed pair with its graded result. */
export type GradedPair = {
  leftId: string;
  rightId: string;
  isCorrect: boolean; // this left↔right pairing is in the slide's correctPairs
};

export type MatchingAnswer = {
  slideId: string;
  activityType: 'matching';
  /** The learner's pairs at Submit (all items paired — Submit gate), each with its result. */
  pairs: GradedPair[];
  /** Per-pair partial credit toward R7 (correct / total). */
  correctPairCount: number;
  totalPairCount: number; // === slide.correctPairs.length
  /** Derived: true iff correctPairCount === totalPairCount (every pair correct). */
  isCorrect: boolean;
};

export type FillInTheBlankAnswer = {
  slideId: string;
  activityType: 'fill-in-the-blank';
  /** Raw learner text as typed (pre-normalize). */
  submittedAnswer: string;
  /**
   * Canonical accepted string for R9 rehydrate / incorrect reveal:
   * - incorrect → always `acceptedAnswers[0]`
   * - correct → first accepted answer whose normalized form matched the submission
   */
  acceptedAnswerShown: string;
  isCorrect: boolean;
};

/**
 * Self-marked answered state (never system-graded — R7 excludes 'flashcard' via
 * `isSystemCheckedActivity`). `recalled` is the learner's own self-assessment;
 * `isCorrect` mirrors it purely to preserve the shipped structural `GradedAnswer` invariant
 * every `ActivityAnswer` member satisfies (slideId/activityType/isCorrect) — it is never
 * counted toward the score.
 */
export type FlashcardAnswer = {
  slideId: string;
  activityType: 'flashcard';
  recalled: boolean;
  isCorrect: boolean;
};

export type ActivityAnswer = MultipleChoiceAnswer | MatchingAnswer | FillInTheBlankAnswer | FlashcardAnswer;
