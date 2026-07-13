import type { GeneratedLesson, GenerateLessonRequest } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

/**
 * Raw client-side data access for generation: invokes the `generate-lesson` Edge Function. No
 * validation, no error mapping (`hooks-service-dao.mdc`). Mirrors `ApiKeyDao` — there is no
 * external-API DAO in the client: the Groq call happens inside the Edge Function (@s7).
 */
export abstract class LessonGenerationDao {
  static async generateLesson({
    documentId,
    composition,
  }: GenerateLessonRequest): Promise<GeneratedLesson> {
    const { data, error } = await getSupabase().functions.invoke('generate-lesson', {
      body: { documentId, composition },
    });
    if (error) throw error;
    return data as GeneratedLesson;
  }
}
