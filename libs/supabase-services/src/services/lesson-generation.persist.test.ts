import type { GeneratedLesson, InstructionalSlide } from '@helsoft/types';

import { markDocumentGenerationFailure, persistLesson } from './lesson-generation.persist';

const makeSlide = (overrides: Partial<InstructionalSlide> = {}): InstructionalSlide => ({
  id: 'slide-1',
  lessonId: 'in-memory-id',
  title: 'Intro',
  content: 'Hello',
  position: 0,
  kind: 'instructional',
  ...overrides,
});

const makeLesson = (overrides: Partial<GeneratedLesson> = {}): GeneratedLesson => ({
  lessonId: 'in-memory-id',
  title: 'Photosynthesis',
  composition: 'both',
  slides: [],
  ...overrides,
});

const makeMockSupabase = (
  overrides: { data?: { id: string } | null; error?: { message: string } | null } = {},
) => {
  const { error = null } = overrides;
  let resolvedId = overrides.data?.id ?? 'db-row-id';
  const single = jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: overrides.data === null ? null : { id: resolvedId },
      error,
    }),
  );
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn((payload: { id?: string }) => {
    if (typeof payload?.id === 'string') {
      resolvedId = payload.id;
    }
    return { select };
  });
  const eq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ insert, update }));
  return { from, insert, select, single, update, eq };
};

describe('persistLesson', () => {
  // @s1 — a successful insert returns the real DB row id (the persisted lessonId)
  it('inserts title and slides into lessons and returns the DB row id', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase();

    const id = await persistLesson(mock as never, lesson, 'doc-1');

    expect(mock.from).toHaveBeenCalledWith('lessons');
    expect(mock.insert).toHaveBeenCalledWith({
      id: lesson.lessonId,
      title: lesson.title,
      slides: lesson.slides,
      document_id: 'doc-1',
    });
    // Full-review minor [perf] — only `id` is used; avoid returning full slides jsonb.
    expect(mock.select).toHaveBeenCalledWith('id');
    expect(id).toBe(lesson.lessonId);
  });

  // pending-pdfs-generate @s4/@s9 — link the lesson to its source document on success.
  it('writes document_id on the lessons insert', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase();

    await persistLesson(mock as never, lesson, 'doc-42');

    expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({ document_id: 'doc-42' }));
  });

  // Full-review minor [code] — clear stale generation_error_code after a successful persist.
  it('clears documents.generation_error_code for the source document on success', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase();

    await persistLesson(mock as never, lesson, 'doc-1');

    expect(mock.from).toHaveBeenCalledWith('documents');
    expect(mock.update).toHaveBeenCalledWith({ generation_error_code: null });
    expect(mock.eq).toHaveBeenCalledWith('id', 'doc-1');
  });

  it('throws when clearing generation_error_code fails after insert', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase();
    mock.eq.mockResolvedValue({ error: { message: 'clear failed' } });

    await expect(persistLesson(mock as never, lesson, 'doc-1')).rejects.toEqual({
      message: 'clear failed',
    });
  });

  // @s1/@s3 — stored slides must key on the real row id (not a stale minted id)
  it('rewrites slide lessonIds to the persisted row id before insert', async () => {
    const lesson = makeLesson({
      lessonId: 'minted-in-memory-id',
      slides: [makeSlide({ lessonId: 'stale-other-id' })],
    });
    const mock = makeMockSupabase({ data: { id: 'db-row-id' } });

    const id = await persistLesson(mock as never, lesson, 'doc-1');

    expect(mock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id,
        slides: [expect.objectContaining({ lessonId: id })],
      }),
    );
    const [insertPayload] = mock.insert.mock.calls as unknown as Array<
      [{ slides: Array<{ lessonId: string }> }]
    >;
    expect(insertPayload[0].slides[0]?.lessonId).not.toBe('stale-other-id');
  });

  // @s1 — client never sends user_id (RLS default auth.uid() stamps it)
  it('never sends user_id in the insert payload', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase();

    await persistLesson(mock as never, lesson, 'doc-1');

    expect(mock.insert).toHaveBeenCalledWith(
      expect.not.objectContaining({ user_id: expect.anything() }),
    );
    expect(mock.insert).toHaveBeenCalledWith({
      id: lesson.lessonId,
      title: lesson.title,
      slides: lesson.slides,
      document_id: 'doc-1',
    });
  });

  // @s2 — a Supabase error during persist throws a persist_failed typed error
  it('throws a persist_failed error when the insert returns a Supabase error', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase({ data: null, error: { message: 'insert failed' } });

    await expect(persistLesson(mock as never, lesson, 'doc-1')).rejects.toMatchObject({
      code: 'persist_failed',
      message: 'persistLesson: failed to persist lesson row',
    });
  });

  // @s2 — a missing data row (null data, no explicit error) also throws persist_failed
  it('throws a persist_failed error when the insert returns null data', async () => {
    const lesson = makeLesson();
    const mock = makeMockSupabase({ data: null, error: null });

    await expect(persistLesson(mock as never, lesson, 'doc-1')).rejects.toMatchObject({
      code: 'persist_failed',
      message: 'persistLesson: failed to persist lesson row',
    });
  });
});

describe('markDocumentGenerationFailure', () => {
  // pending-pdfs-generate @s3/@s8 — record generation_error_code after the doc is identified.
  it('updates documents.generation_error_code for the given document id', async () => {
    const mock = makeMockSupabase();

    await markDocumentGenerationFailure(mock as never, 'doc-1', 'timeout');

    expect(mock.from).toHaveBeenCalledWith('documents');
    expect(mock.update).toHaveBeenCalledWith({ generation_error_code: 'timeout' });
    expect(mock.eq).toHaveBeenCalledWith('id', 'doc-1');
  });

  it('throws when the documents update fails', async () => {
    const mock = makeMockSupabase();
    mock.eq.mockResolvedValue({ error: { message: 'update failed' } });

    await expect(
      markDocumentGenerationFailure(mock as never, 'doc-1', 'provider_error'),
    ).rejects.toEqual({ message: 'update failed' });
  });
});
