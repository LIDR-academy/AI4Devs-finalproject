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

  // Mutation-kill — the slide id is scoped to the given lessonId (not a shared/collision-prone
  // constant), so two different lessons never yield the same slide id.
  it('scopes the generated slide id to the given lessonId', () => {
    const a = buildStubLessonResultsFixture('lesson-a');
    const b = buildStubLessonResultsFixture('lesson-b');

    expect(a.lesson.slides[0].id).toBe('lesson-a-slide-1');
    expect(b.lesson.slides[0].id).toBe('lesson-b-slide-1');
    expect(a.lesson.slides[0].id).not.toBe(b.lesson.slides[0].id);
  });

  // Mutation-kill — the slide models a genuine two-option multiple-choice question: both
  // options are distinct and labeled, and correctOptionId references one of them. This is a
  // structural/referential-integrity contract (the eventual player screen will render these
  // options), independent of the specific placeholder wording.
  it('models a two-option multiple-choice question with correctOptionId referencing a real option', () => {
    const { lesson } = buildStubLessonResultsFixture('lesson-1');
    const slide = lesson.slides[0];
    if (slide.kind !== 'activity' || slide.activityType !== 'multiple-choice') {
      throw new Error('expected a multiple-choice activity slide');
    }

    expect(slide.options).toHaveLength(2);
    slide.options.forEach((option) => {
      expect(typeof option.id).toBe('string');
      expect(option.id.length).toBeGreaterThan(0);
      expect(typeof option.label).toBe('string');
      expect(option.label.length).toBeGreaterThan(0);
    });
    const ids = slide.options.map((option) => option.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toContain(slide.correctOptionId);
  });
});
