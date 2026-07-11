import type { MultipleChoiceSlide } from './lesson';
import type { ScorableSlide } from './scorable-slide';

// Type-level check (task-1 Done criteria) — a MultipleChoiceSlide's `id`/`activityType` project
// cleanly into ScorableSlide without touching lesson.ts. Compiles only if the shapes line up.
describe('ScorableSlide', () => {
  it('is satisfied by a MultipleChoiceSlide projected to its id and activityType', () => {
    const slide: MultipleChoiceSlide = {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Capitals',
      content: 'What is the capital of France?',
      position: 0,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Paris' }],
      correctOptionId: 'opt-a',
    };

    const scorable: ScorableSlide = { id: slide.id, activityType: slide.activityType };

    expect(scorable).toEqual({ id: 'slide-1', activityType: 'multiple-choice' });
  });
});
