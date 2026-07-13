import type { LessonAttempt, NewLessonAttempt } from '@helsoft/types';

import { LessonAttemptDao } from '../dao/lesson-attempt.dao';

/**
 * Business logic over LessonAttemptDao: validates the score payload before persisting.
 * Insert-only — no update/upsert path. Never validates `userId`: it is server-set
 * (`auth.uid()` default + RLS), so the client-supplied payload never carries one.
 */
const validationError = (input: NewLessonAttempt): string | null => {
  if (!input.lessonId.trim()) return 'LessonAttemptService.saveAttempt: lessonId must not be empty';
  if (input.total <= 0) return 'LessonAttemptService.saveAttempt: total must be greater than 0';
  if (input.score < 0) return 'LessonAttemptService.saveAttempt: score must not be negative';
  if (input.score > input.total) return 'LessonAttemptService.saveAttempt: score must not exceed total';
  return null;
};

export abstract class LessonAttemptService {
  static saveAttempt(input: NewLessonAttempt): Promise<LessonAttempt> {
    const error = validationError(input);
    if (error) return Promise.reject(new Error(error));
    return LessonAttemptDao.insertAttempt(input);
  }
}
