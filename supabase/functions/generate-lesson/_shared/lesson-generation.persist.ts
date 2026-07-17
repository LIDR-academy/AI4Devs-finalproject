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
    update(payload: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{ error: unknown | null }>;
    };
  };
};

const toPersistFailedError = (message: string): Error & { code: 'persist_failed' } =>
  Object.assign(new Error(message), { code: 'persist_failed' as const });

/**
 * Inserts a `lessons` row (title + ordered slides + source `document_id`) into Supabase under
 * the caller's `auth.uid()` (the column default + RLS enforce ownership; `user_id` is never
 * sent from the client). Uses a known-uuid insert (`lesson.lessonId`) and rewrites every
 * slide's `lessonId` to that id before insert so `lessons.slides` JSON matches the returned
 * row id (@s1/@s3). `document_id` links the lesson to its source PDF (PDF list @s4/@s9).
 * On any insert failure, throws a `persist_failed` typed error (@s2).
 * Returning columns are limited to `id` — callers only need the persisted row id.
 */
export const persistLesson = async (
  supabase: PersistClient,
  lesson: GeneratedLesson,
  documentId: string,
): Promise<string> => {
  const lessonId = lesson.lessonId;
  const slides = lesson.slides.map((slide) => ({ ...slide, lessonId }));

  const { data, error } = await supabase
    .from('lessons')
    .insert({ id: lessonId, title: lesson.title, slides, document_id: documentId })
    .select('id')
    .single();

  if (error || !data) {
    throw toPersistFailedError('persistLesson: failed to persist lesson row');
  }

  // Clear a prior failure marker so the PDF list no longer shows "generation failed".
  const { error: clearError } = await supabase
    .from('documents')
    .update({ generation_error_code: null })
    .eq('id', documentId);

  if (clearError) throw clearError;

  return data.id;
};

/**
 * Records a server-side generation failure on the source document so the PDF list can show
 * "generation failed" + Retry (@s3/@s8). Only called after the document is identified.
 */
export const markDocumentGenerationFailure = async (
  supabase: PersistClient,
  documentId: string,
  errorCode: string,
): Promise<void> => {
  const { error } = await supabase
    .from('documents')
    .update({ generation_error_code: errorCode })
    .eq('id', documentId);

  if (error) throw error;
};
