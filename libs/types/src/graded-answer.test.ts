import type { FlashcardAnswer, MultipleChoiceAnswer } from './activity-answer';
import type { GradedAnswer } from './graded-answer';

// Type-level check (task-1 Done criteria) — MultipleChoiceAnswer already structurally satisfies
// GradedAnswer (same slideId/activityType/isCorrect), so the scorer consumes it unmodified.
// Compiles only if the assignment below is valid.
describe('GradedAnswer', () => {
  it('is satisfied by a MultipleChoiceAnswer without modifying activity-answer.ts', () => {
    const answer: MultipleChoiceAnswer = {
      slideId: 'slide-1',
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      isCorrect: true,
    };

    const graded: GradedAnswer = answer;

    expect(graded).toBe(answer);
  });

  // task-1 Done criteria — FlashcardAnswer mirrors recalled into isCorrect, so it too
  // structurally satisfies GradedAnswer (never scored by R7 regardless — activity-type.ts
  // excludes 'flashcard' from SYSTEM_CHECKED_ACTIVITY_TYPES).
  it('is satisfied by a FlashcardAnswer without modifying activity-answer.ts', () => {
    const answer: FlashcardAnswer = {
      slideId: 'slide-1',
      activityType: 'flashcard',
      recalled: true,
      isCorrect: true,
    };

    const graded: GradedAnswer = answer;

    expect(graded).toBe(answer);
  });
});
