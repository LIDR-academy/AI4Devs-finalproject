import type { LessonAttempt, NewLessonAttempt } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

/** Raw shape of a `lesson_attempts` row (snake_case, as Supabase returns it). */
type LessonAttemptRow = {
  id: string;
  lesson_id: string;
  score: number;
  total: number;
  created_at: string;
};

const toLessonAttempt = (row: LessonAttemptRow): LessonAttempt => ({
  id: row.id,
  lessonId: row.lesson_id,
  score: row.score,
  total: row.total,
  createdAt: row.created_at,
});

/**
 * Raw Supabase data access for `lesson_attempts`. Insert-only — no update/delete path;
 * `user_id` is never sent from the client (the column default + RLS `with check` set/enforce it).
 */
export abstract class LessonAttemptDao {
  static async insertAttempt(input: NewLessonAttempt): Promise<LessonAttempt> {
    const { data, error } = await getSupabase()
      .from('lesson_attempts')
      .insert({ lesson_id: input.lessonId, score: input.score, total: input.total })
      .select()
      .single();
    if (error) throw error;
    return toLessonAttempt(data as LessonAttemptRow);
  }
}
