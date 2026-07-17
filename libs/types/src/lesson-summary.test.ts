import type { LessonSummary } from './lesson-summary';

// @s4 — Home list needs only id/title/createdAt (full Lesson is for reopen/player).
describe('LessonSummary', () => {
  it('carries id, title, and createdAt', () => {
    const summary: LessonSummary = {
      id: 'lesson-1',
      title: 'Photosynthesis',
      createdAt: '2026-07-13T00:00:00.000Z',
    };

    expect(summary).toEqual({
      id: 'lesson-1',
      title: 'Photosynthesis',
      createdAt: '2026-07-13T00:00:00.000Z',
    });
  });
});
