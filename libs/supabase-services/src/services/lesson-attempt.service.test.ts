jest.mock('../dao/lesson-attempt.dao', () => ({
  LessonAttemptDao: { insertAttempt: jest.fn() },
}));

import { LessonAttemptDao } from '../dao/lesson-attempt.dao';
import { LessonAttemptService } from './lesson-attempt.service';

const dao = LessonAttemptDao as jest.Mocked<typeof LessonAttemptDao>;

describe('LessonAttemptService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s6 — a valid attempt is persisted via the DAO; the service composes no update path.
  it('saveAttempt delegates a valid attempt to LessonAttemptDao.insertAttempt', async () => {
    const attempt = {
      id: 'attempt-1',
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
      createdAt: '2026-07-11T00:00:00.000Z',
    };
    dao.insertAttempt.mockResolvedValue(attempt);

    const result = await LessonAttemptService.saveAttempt({
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
    });

    expect(dao.insertAttempt).toHaveBeenCalledWith({ lessonId: 'lesson-1', score: 3, total: 3 });
    expect(result).toBe(attempt);
  });

  // Validation — a non-positive total, a negative score, a score exceeding the total, and an
  // empty lessonId all reject with a descriptive error and never reach the DAO.
  it.each([
    ['total is zero', { lessonId: 'lesson-1', score: 0, total: 0 }, /total/i],
    ['total is negative', { lessonId: 'lesson-1', score: 0, total: -1 }, /total/i],
    ['score is negative', { lessonId: 'lesson-1', score: -1, total: 3 }, /score/i],
    ['score exceeds total', { lessonId: 'lesson-1', score: 4, total: 3 }, /score/i],
    ['lessonId is empty', { lessonId: '', score: 1, total: 3 }, /lessonId/i],
    ['lessonId is whitespace only', { lessonId: '   ', score: 1, total: 3 }, /lessonId/i],
  ])('rejects when %s, without calling the DAO', async (_case, input, expectedMessage) => {
    await expect(LessonAttemptService.saveAttempt(input)).rejects.toThrow(expectedMessage);
    expect(dao.insertAttempt).not.toHaveBeenCalled();
  });

  // Mutation-kill — pins the exact `score < 0` boundary: a score of exactly zero is valid (the
  // rejection tests above only exercise a negative score, which would still reject even if the
  // operator were mistakenly `<=`).
  it('does not reject when score is exactly zero', async () => {
    const attempt = {
      id: 'attempt-2',
      lessonId: 'lesson-1',
      score: 0,
      total: 3,
      createdAt: '2026-07-11T00:00:00.000Z',
    };
    dao.insertAttempt.mockResolvedValue(attempt);

    const result = await LessonAttemptService.saveAttempt({
      lessonId: 'lesson-1',
      score: 0,
      total: 3,
    });

    expect(dao.insertAttempt).toHaveBeenCalledWith({ lessonId: 'lesson-1', score: 0, total: 3 });
    expect(result).toBe(attempt);
  });
});
