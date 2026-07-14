jest.mock('@helsoft/supabase-services', () => ({
  PdfDocumentsService: { getDocuments: jest.fn(), deleteDocument: jest.fn() },
}));

import { PdfDocumentsService } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react';

import { usePdfDocuments } from './use-pdf-documents';

const service = PdfDocumentsService as jest.Mocked<typeof PdfDocumentsService>;

const documents = [
  {
    id: 'doc-2',
    filename: 'newer.pdf',
    pageCount: 5,
    createdAt: '2026-07-14T12:00:00.000Z',
    status: 'ready' as const,
    lessonId: null,
  },
  {
    id: 'doc-1',
    filename: 'older.pdf',
    pageCount: 2,
    createdAt: '2026-07-13T12:00:00.000Z',
    status: 'failed' as const,
    lessonId: null,
  },
];

describe('usePdfDocuments', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s15 — Loading until the first load resolves.
  it('initializes isLoading to true on the first render before effects flush', () => {
    const loadingOnRender: boolean[] = [];
    service.getDocuments.mockReturnValue(new Promise(() => {}) as never);

    renderHook(() => {
      const value = usePdfDocuments();
      loadingOnRender.push(value.isLoading);
      return value;
    });

    expect(loadingOnRender[0]).toBe(true);
  });

  it('starts loading and resolves with documents from PdfDocumentsService.getDocuments', async () => {
    service.getDocuments.mockResolvedValue(documents);
    const { result } = renderHook(() => usePdfDocuments());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.documents).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.getDocuments).toHaveBeenCalledTimes(1);
    expect(result.current.documents).toEqual(documents);
    expect(result.current.error).toBeNull();
  });

  // @s16 — Error path feeds retry UI.
  it('sets error and clears loading when the service rejects', async () => {
    const failure = new Error('PdfDocumentsService.getDocuments: failed to load documents');
    service.getDocuments.mockRejectedValue(failure);
    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(failure);
    expect(result.current.documents).toEqual([]);
  });

  // @s8/@s9/@s10 — refetch reloads after generation/extract events.
  it('refetch reloads documents from the service', async () => {
    const flipped = [
      {
        ...documents[0],
        status: 'generated' as const,
        lessonId: 'lesson-1',
      },
    ];
    service.getDocuments.mockResolvedValueOnce([]).mockResolvedValueOnce(flipped);
    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.documents).toEqual([]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.documents).toEqual(flipped));
    expect(service.getDocuments).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('refetch clears a prior error on success', async () => {
    service.getDocuments.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(documents);
    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.documents).toEqual(documents);
  });

  it('ignores a stale successful load that resolves after a newer refetch', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    service.getDocuments
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)) as never)
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)) as never);

    const { result } = renderHook(() => usePdfDocuments());

    await act(async () => {
      result.current.refetch();
    });

    await act(async () => {
      resolveSecond(documents);
    });
    await waitFor(() => expect(result.current.documents).toEqual(documents));

    await act(async () => {
      resolveFirst([
        {
          id: 'stale',
          filename: 'stale.pdf',
          pageCount: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          status: 'ready',
          lessonId: null,
        },
      ]);
    });

    expect(result.current.documents).toEqual(documents);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not apply a successful load after unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let resolveLoad: (value: unknown) => void = () => {};
    service.getDocuments.mockReturnValue(
      new Promise((resolve) => (resolveLoad = resolve)) as never,
    );

    const { unmount } = renderHook(() => usePdfDocuments());
    unmount();

    await act(async () => {
      resolveLoad(documents);
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // @s12 — deleteDocument removes the row from local state on success.
  it('deleteDocument removes the document from the list after a successful service delete', async () => {
    service.getDocuments.mockResolvedValue(documents);
    service.deleteDocument.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.documents).toEqual(documents);

    await act(async () => {
      await result.current.deleteDocument('doc-2');
    });

    expect(service.deleteDocument).toHaveBeenCalledWith('doc-2');
    expect(result.current.documents).toEqual([documents[1]]);
  });

  it('deleteDocument leaves the list unchanged and sets error when the service rejects', async () => {
    const failure = new Error('PdfDocumentsService.deleteDocument: failed to delete document');
    service.getDocuments.mockResolvedValue(documents);
    service.deleteDocument.mockRejectedValue(failure);
    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.deleteDocument('doc-2')).rejects.toBe(failure);
    });

    expect(result.current.documents).toEqual(documents);
    expect(result.current.error).toBe(failure);
  });
});
