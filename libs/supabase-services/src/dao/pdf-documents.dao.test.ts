jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { PdfDocumentsDao } from './pdf-documents.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('PdfDocumentsDao', () => {
  const order = jest.fn();
  const select = jest.fn();
  const from = jest.fn();
  const getUser = jest.fn();
  const list = jest.fn();
  const remove = jest.fn();
  const storageFrom = jest.fn();
  const delEq = jest.fn();
  const del = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    order.mockReset();
    select.mockReset();
    from.mockReset();
    getUser.mockReset();
    list.mockReset();
    remove.mockReset();
    storageFrom.mockReset();
    delEq.mockReset();
    del.mockReset();

    order.mockResolvedValue({ data: [], error: null });
    select.mockReturnValue({ order });
    delEq.mockResolvedValue({ error: null });
    del.mockReturnValue({ eq: delEq });
    list.mockResolvedValue({ data: [], error: null });
    remove.mockResolvedValue({ data: [], error: null });
    storageFrom.mockReturnValue({ list, remove });
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    from.mockReturnValue({ select, delete: del });
    mockGetSupabase.mockReturnValue({
      from,
      auth: { getUser },
      storage: { from: storageFrom },
    });
  });

  // @s1 — list from the view, newest first; no client-supplied user_id filter (@s18).
  // Full-review major [arch] — DAO returns raw view rows; service derives status.
  it('selects from user_documents ordered by created_at descending with no user_id filter', async () => {
    order.mockResolvedValue({
      data: [
        {
          id: 'doc-2',
          filename: 'newer.pdf',
          page_count: 5,
          created_at: '2026-07-14T12:00:00.000Z',
          generation_error_code: null,
          lesson_id: null,
        },
        {
          id: 'doc-1',
          filename: 'older.pdf',
          page_count: 2,
          created_at: '2026-07-13T12:00:00.000Z',
          generation_error_code: null,
          lesson_id: null,
        },
      ],
      error: null,
    });

    const result = await PdfDocumentsDao.getDocuments();

    expect(from).toHaveBeenCalledWith('user_documents');
    expect(select).toHaveBeenCalledWith(
      'id, filename, page_count, created_at, generation_error_code, lesson_id',
    );
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual([
      {
        id: 'doc-2',
        filename: 'newer.pdf',
        page_count: 5,
        created_at: '2026-07-14T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: null,
      },
      {
        id: 'doc-1',
        filename: 'older.pdf',
        page_count: 2,
        created_at: '2026-07-13T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: null,
      },
    ]);
  });

  // @s17 — view itself filters extracted; DAO never joins client-side and never filters user_id.
  it('never passes a user_id equality filter on getDocuments', async () => {
    await PdfDocumentsDao.getDocuments();
    expect(from).toHaveBeenCalledWith('user_documents');
    expect(from).not.toHaveBeenCalledWith('documents');
  });

  it('throws the raw supabase error when getDocuments fails', async () => {
    const error = { message: 'select failed' };
    order.mockResolvedValue({ data: null, error });

    await expect(PdfDocumentsDao.getDocuments()).rejects.toBe(error);
  });

  // Full-review major [arch] — DAO must not invent status / camelCase product fields.
  it('returns raw view rows without deriving status or remapping field names', async () => {
    order.mockResolvedValue({
      data: [
        {
          id: 'doc-1',
          filename: 'done.pdf',
          page_count: 4,
          created_at: '2026-07-14T00:00:00.000Z',
          generation_error_code: 'provider_error',
          lesson_id: 'lesson-1',
        },
      ],
      error: null,
    });

    const result = await PdfDocumentsDao.getDocuments();

    expect(result).toEqual([
      {
        id: 'doc-1',
        filename: 'done.pdf',
        page_count: 4,
        created_at: '2026-07-14T00:00:00.000Z',
        generation_error_code: 'provider_error',
        lesson_id: 'lesson-1',
      },
    ]);
    expect(result[0]).not.toHaveProperty('status');
    expect(result[0]).not.toHaveProperty('pageCount');
    expect(result[0]).not.toHaveProperty('lessonId');
  });

  // @s12/@s19 — purge both buckets then delete the documents row by id (RLS scopes ownership).
  it('deleteDocument removes storage objects then deletes the documents row by id', async () => {
    list
      .mockResolvedValueOnce({
        data: [{ name: 'p1-0.png' }, { name: 'p1-1.png' }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ name: 'source.pdf' }],
        error: null,
      });

    await PdfDocumentsDao.deleteDocument('doc-1');

    expect(getUser).toHaveBeenCalled();
    expect(storageFrom).toHaveBeenCalledWith('pdf-images');
    expect(storageFrom).toHaveBeenCalledWith('pdf-uploads');
    expect(list).toHaveBeenCalledWith('user-1/doc-1', { limit: 100, offset: 0 });
    expect(remove).toHaveBeenCalledWith(['user-1/doc-1/p1-0.png', 'user-1/doc-1/p1-1.png']);
    expect(remove).toHaveBeenCalledWith(['user-1/doc-1/source.pdf']);
    expect(from).toHaveBeenCalledWith('documents');
    expect(delEq).toHaveBeenCalledWith('id', 'doc-1');
    expect(delEq.mock.calls.every((call) => call[0] !== 'user_id')).toBe(true);
  });

  // Full-review major [security] — paginate storage.list until no residual objects (@s12).
  it('deleteDocument paginates storage.list until both buckets are empty', async () => {
    const page = Array.from({ length: 100 }, (_, i) => ({ name: `img-${i}.png` }));
    list
      // pdf-images: full page then remainder (< page size → stop)
      .mockResolvedValueOnce({ data: page, error: null })
      .mockResolvedValueOnce({ data: [{ name: 'img-100.png' }], error: null })
      // pdf-uploads: one object (< page size → stop)
      .mockResolvedValueOnce({ data: [{ name: 'source.pdf' }], error: null });

    await PdfDocumentsDao.deleteDocument('doc-1');

    expect(list).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledWith(page.map((file) => `user-1/doc-1/${file.name}`));
    expect(remove).toHaveBeenCalledWith(['user-1/doc-1/img-100.png']);
    expect(remove).toHaveBeenCalledWith(['user-1/doc-1/source.pdf']);
    expect(delEq).toHaveBeenCalledWith('id', 'doc-1');
  });

  it('throws when listing storage objects fails', async () => {
    const error = { message: 'list failed' };
    list.mockResolvedValueOnce({ data: null, error });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).rejects.toBe(error);
    expect(del).not.toHaveBeenCalled();
  });

  it('throws when removing storage objects fails', async () => {
    const error = { message: 'remove failed' };
    list.mockResolvedValueOnce({ data: [{ name: 'p1-0.png' }], error: null });
    remove.mockResolvedValueOnce({ data: null, error });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).rejects.toBe(error);
    expect(del).not.toHaveBeenCalled();
  });

  it('throws the raw supabase error when deleting the documents row fails', async () => {
    const error = { message: 'delete failed' };
    delEq.mockResolvedValue({ error });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).rejects.toBe(error);
  });

  it('throws when there is no authenticated user for storage paths', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).rejects.toThrow(/authenticated/i);
    expect(list).not.toHaveBeenCalled();
  });

  // Mutation: `if (userError) throw` → `if (false) throw` — must surface auth errors.
  it('throws when getUser returns an error', async () => {
    const userError = { message: 'auth failed' };
    getUser.mockResolvedValue({ data: { user: null }, error: userError });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).rejects.toBe(userError);
    expect(list).not.toHaveBeenCalled();
  });

  // Mutation: `if (!files?.length) return` → `if (false) return` — empty folder must skip remove.
  it('skips storage remove when the folder lists no files', async () => {
    list.mockResolvedValue({ data: [], error: null });

    await PdfDocumentsDao.deleteDocument('doc-1');

    expect(remove).not.toHaveBeenCalled();
    expect(delEq).toHaveBeenCalledWith('id', 'doc-1');
  });

  // Mutation: `files?.length` → `files.length` — null list data must not throw.
  it('treats a null storage list as empty and skips remove', async () => {
    list.mockResolvedValue({ data: null, error: null });

    await expect(PdfDocumentsDao.deleteDocument('doc-1')).resolves.toBeUndefined();
    expect(remove).not.toHaveBeenCalled();
    expect(delEq).toHaveBeenCalledWith('id', 'doc-1');
  });
});
