jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import type { GeneratedLesson } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';
import { LessonGenerationDao } from './lesson-generation.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('LessonGenerationDao', () => {
  const invoke = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue({ functions: { invoke } });
  });

  // @s6/@s7 — invokes generate-lesson with exactly { documentId, composition } in the body; no
  // key material and no page/image content is ever sent by the client.
  it('invokes generate-lesson with the documentId and composition, and returns the deck', async () => {
    const lesson: GeneratedLesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [],
    };
    invoke.mockResolvedValue({ data: lesson, error: null });

    const result = await LessonGenerationDao.generateLesson({
      documentId: 'doc-1',
      composition: 'both',
    });

    expect(invoke).toHaveBeenCalledWith('generate-lesson', {
      body: { documentId: 'doc-1', composition: 'both' },
    });
    expect(result).toBe(lesson);
  });

  // Failure path — a structured Edge Function error is thrown as-is; normalizing it to a
  // GenerationErrorCode is the service's job (task-6), not the DAO's.
  it('throws the raw invoke error when the function call fails', async () => {
    const error = { message: 'edge function error' };
    invoke.mockResolvedValue({ data: null, error });

    await expect(
      LessonGenerationDao.generateLesson({ documentId: 'doc-1', composition: 'both' }),
    ).rejects.toBe(error);
  });
});
