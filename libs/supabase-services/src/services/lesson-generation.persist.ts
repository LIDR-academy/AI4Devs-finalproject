// Hand-mirrored into supabase/functions/generate-lesson/_shared/lesson-generation.persist.ts
// (Deno can't import workspace packages — kept in sync manually, same rule as types.ts mirror).
// Whenever this file changes, update the _shared copy too.

import type { GeneratedLesson } from '@helsoft/types';

import { toTypedError } from '../utils/typed-error';

// Minimal Supabase client shape needed for the persist call — avoids importing the full
// SupabaseClient type on the Deno side (the _shared mirror uses a duck-typed equivalent).
type PersistClient = {
  from(table: string): {
    insert(payload: Record<string, unknown>): {
      select(): {
        single(): Promise<{ data: { id: string } | null; error: unknown | null }>;
      };
    };
  };
};

/**
 * Inserts a `lessons` row (title + ordered slides) into Supabase under the caller's `auth.uid()`
 * (the column default + RLS enforce ownership; `user_id` is never sent from the client).
 * Uses a known-uuid insert (`lesson.lessonId`) and rewrites every slide's `lessonId` to that id
 * before insert so `lessons.slides` JSON matches the returned row id (@s1/@s3).
 * On any insert failure, throws a `persist_failed` typed error (@s2).
 */
export const persistLesson = async (
  supabase: PersistClient,
  lesson: GeneratedLesson,
): Promise<string> => {
  const lessonId = lesson.lessonId;
  const slides = lesson.slides.map((slide) => ({ ...slide, lessonId }));

  const { data, error } = await supabase
    .from('lessons')
    .insert({ id: lessonId, title: lesson.title, slides })
    .select()
    .single();

  if (error || !data) {
    throw toTypedError('persist_failed', 'persistLesson: failed to persist lesson row');
  }

  return data.id;
};
