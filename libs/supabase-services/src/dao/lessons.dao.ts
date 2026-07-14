import type { Lesson, LessonSummary, Slide } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

/** Raw shape of a `lessons` list row (snake_case, as Supabase returns it). */
type LessonSummaryRow = {
  id: string;
  title: string;
  created_at: string;
};

/** Raw shape of a full `lessons` row including the `slides` JSON column. */
type LessonRow = {
  id: string;
  title: string;
  slides: Slide[];
  created_at: string;
  user_id: string;
};

const toLessonSummary = (row: LessonSummaryRow): LessonSummary => ({
  id: row.id,
  title: row.title,
  createdAt: row.created_at,
});

const toLesson = (row: LessonRow): Lesson => ({
  id: row.id,
  title: row.title,
  slides: row.slides,
  createdAt: row.created_at,
  userId: row.user_id,
});

/**
 * Raw Supabase data access for `lessons`. Read-only in Slice 1 — the Edge Function inserts;
 * the client never inserts. RLS scopes every query to `auth.uid()`; the DAO never filters by a
 * client-supplied user id (@s11).
 */
export abstract class LessonsDao {
  static async getLessons(): Promise<LessonSummary[]> {
    const { data, error } = await getSupabase()
      .from('lessons')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as LessonSummaryRow[]).map(toLessonSummary);
  }

  /** Full lesson by id (incl. slides JSON). RLS scopes ownership — never filter by client user id. */
  static async getLessonById(id: string): Promise<Lesson> {
    const { data, error } = await getSupabase()
      .from('lessons')
      .select('id, title, slides, created_at, user_id')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toLesson(data as LessonRow);
  }

  /** Deletes by id only — RLS scopes to `auth.uid()`; never filter by a client-supplied user id (@s12). */
  static async deleteLesson(id: string): Promise<void> {
    const { error } = await getSupabase().from('lessons').delete().eq('id', id);
    if (error) throw error;
  }
}
