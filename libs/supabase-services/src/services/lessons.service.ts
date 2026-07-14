import type { LessonSummary } from '@helsoft/types';

import { LessonsDao } from '../dao/lessons.dao';

/**
 * Business logic over LessonsDao: validates inputs and normalizes DAO failures.
 * Read-only in Slice 1 — the client never inserts lessons (Edge Function owns persist).
 */
export abstract class LessonsService {
  static async getLessons(): Promise<LessonSummary[]> {
    try {
      return await LessonsDao.getLessons();
    } catch {
      throw new Error('LessonsService.getLessons: failed to load lessons');
    }
  }

  static async deleteLesson(id: string): Promise<void> {
    if (!id.trim()) {
      return Promise.reject(new Error('LessonsService.deleteLesson: id must not be empty'));
    }
    try {
      await LessonsDao.deleteLesson(id);
    } catch {
      throw new Error('LessonsService.deleteLesson: failed to delete lesson');
    }
  }
}
