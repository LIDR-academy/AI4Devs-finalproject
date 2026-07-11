import { buildStubLessonResultsFixture } from './lesson-results-stub';

// task-7 (risk R1) — the app results route has no live lesson/answers source yet (R4/R9
// unbuilt); this fixture stands in until then, so it must yield a genuinely scorable lesson.
describe('buildStubLessonResultsFixture', () => {
  it('returns a scorable lesson (one multiple-choice slide) for the given lessonId', () => {
    const { lesson } = buildStubLessonResultsFixture('lesson-1');

    expect(lesson.id).toBe('lesson-1');
    expect(lesson.slides).toHaveLength(1);
    expect(lesson.slides[0]).toMatchObject({ kind: 'activity', activityType: 'multiple-choice' });
  });

  it('returns one correct answer matching the lesson slide id', () => {
    const { lesson, answers } = buildStubLessonResultsFixture('lesson-1');

    expect(answers).toEqual([
      { slideId: lesson.slides[0].id, activityType: 'multiple-choice', isCorrect: true },
    ]);
  });
});
