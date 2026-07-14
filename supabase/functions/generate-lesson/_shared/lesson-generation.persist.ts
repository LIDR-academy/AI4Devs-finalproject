// Hand-mirrored from libs/supabase-services/src/services/lesson-generation.persist.ts
// (Deno can't import workspace packages — kept in sync manually, same rule as types.ts mirror).
// Whenever the JS source changes, update this copy too.

import type { GeneratedLesson } from './types.ts';

// Minimal Supabase client shape needed for the persist call — duck-typed so we don't pull the
// full SupabaseClient type into this pure module.
type PersistClient = {
  from(table: string): {
    insert(payload: Record<string, unknown>): {
      select(columns: string): {
        single(): Promise<{ data: { id: string } | null; error: unknown | null }>;
      };
    };
  };
};

const toPersistFailedError = (message: string): Error & { code: 'persist_failed' } =>
  Object.assign(new Error(message), { code: 'persist_failed' as const });

/**
 * Inserts a `lessons` row (title + ordered slides) into Supabase under the caller's `auth.uid()`
 * (the column default + RLS enforce ownership; `user_id` is never sent from the client).
 * Uses a known-uuid insert (`lesson.lessonId`) and rewrites every slide's `lessonId` to that id
 * before insert so `lessons.slides` JSON matches the returned row id (@s1/@s3).
 * On any insert failure, throws a `persist_failed` typed error (@s2).
 * Returning columns are limited to `id` — callers only need the persisted row id.
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
    .select('id')
    .single();

  if (error || !data) {
    throw toPersistFailedError('persistLesson: failed to persist lesson row');
  }

  return data.id;
};
