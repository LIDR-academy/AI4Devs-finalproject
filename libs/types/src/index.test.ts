import type { LessonAttempt, NewLessonAttempt, ScoreSummary } from './index';

// Barrel coverage (task-1 Done criteria) — ScoreSummary and LessonAttempt/NewLessonAttempt are
// plain shapes with no runtime guard of their own; this pins their fields and that they resolve
// through the types barrel (compiles only once index.ts re-exports them).
describe('types barrel', () => {
  it('exposes a ScoreSummary shape with correct/total/isScorable', () => {
    const summary: ScoreSummary = { correct: 2, total: 4, isScorable: true };

    expect(summary).toEqual({ correct: 2, total: 4, isScorable: true });
  });

  it('exposes a LessonAttempt shape with id/lessonId/score/total/createdAt', () => {
    const attempt: LessonAttempt = {
      id: 'attempt-1',
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
      createdAt: '2026-07-11T00:00:00.000Z',
    };

    expect(attempt).toEqual({
      id: 'attempt-1',
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
      createdAt: '2026-07-11T00:00:00.000Z',
    });
  });

  it('exposes a NewLessonAttempt shape without id/createdAt/userId', () => {
    const newAttempt: NewLessonAttempt = { lessonId: 'lesson-1', score: 3, total: 3 };

    expect(newAttempt).toEqual({ lessonId: 'lesson-1', score: 3, total: 3 });
  });
});
