jest.mock('@helsoft/services', () => ({
  PdfExtractionService: { extract: jest.fn() },
  generateDocumentId: jest.fn(() => 'generated-document-id'),
}));
jest.mock('./use-session', () => ({ useSession: jest.fn() }));

import { act, renderHook } from '@testing-library/react';
import { PdfExtractionService } from '@helsoft/services';

import { useSession } from './use-session';
import { usePdfExtraction } from './use-pdf-extraction';

const service = PdfExtractionService as jest.Mocked<typeof PdfExtractionService>;
const mockUseSession = useSession as jest.Mock;

const AUTHENTICATED_SESSION = { session: { user: { id: 'user-1' } }, isLoading: false };

describe('usePdfExtraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue(AUTHENTICATED_SESSION);
  });

  // @s1 — a successful extract() call flips stage to 'success' and exposes the typed result.
  it('sets stage to success and exposes the result after a successful extract()', async () => {
    const extractionResult = {
      documentId: 'd1',
      filename: 'notes.pdf',
      pageCount: 2,
      imageCount: 1,
      pages: [],
      images: [],
    };
    service.extract.mockResolvedValue(extractionResult);
    const { result } = renderHook(() => usePdfExtraction());

    expect(result.current.stage).toBe('idle');

    await act(async () => {
      await result.current.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() });
    });

    expect(result.current.stage).toBe('success');
    expect(result.current.result).toBe(extractionResult);
    expect(service.extract).toHaveBeenCalledWith(
      { filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() },
      'user-1',
      expect.any(String),
    );
  });

  // @s5 — stage is 'processing' while the extract() call is in flight, so the panel can show
  // the Loading state and disable the upload control.
  it('sets stage to processing while extract() is in flight', async () => {
    let resolveExtract: (value: unknown) => void = () => {};
    service.extract.mockReturnValue(
      new Promise((resolve) => {
        resolveExtract = resolve;
      }) as never,
    );
    const { result } = renderHook(() => usePdfExtraction());

    let extractPromise!: Promise<void>;
    act(() => {
      extractPromise = result.current.extract({ filename: 'a.pdf', sizeBytes: 1, bytes: new Uint8Array() });
    });

    expect(result.current.stage).toBe('processing');

    await act(async () => {
      resolveExtract({ documentId: 'd1', filename: 'a.pdf', pageCount: 1, imageCount: 0, pages: [], images: [] });
      await extractPromise;
    });

    expect(result.current.stage).toBe('success');
  });

  // @s13/@s14 (Slice 2, task-12) — a typed rejection (PdfExtractionService already normalizes
  // every failure into a { code } shape) flips stage to 'error' and exposes that code as-is.
  it('sets stage to error and exposes the typed error code when extract() rejects', async () => {
    service.extract.mockRejectedValue(Object.assign(new Error('too many pages'), { code: 'too_many_pages' }));
    const { result } = renderHook(() => usePdfExtraction());

    await act(async () => {
      await result.current.extract({ filename: 'big.pdf', sizeBytes: 1, bytes: new Uint8Array() });
    });

    expect(result.current.stage).toBe('error');
    expect(result.current.error).toBe('too_many_pages');
  });

  // Defensive fallback (mirrors useAuth's isAuthErrorShape precedent) — an unexpected, untyped
  // rejection never leaks a raw shape to the UI; it degrades to network_error.
  it('falls back to network_error when extract() rejects with an untyped error', async () => {
    service.extract.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => usePdfExtraction());

    await act(async () => {
      await result.current.extract({ filename: 'a.pdf', sizeBytes: 1, bytes: new Uint8Array() });
    });

    expect(result.current.stage).toBe('error');
    expect(result.current.error).toBe('network_error');
  });

  // @s13 — retry() re-invokes extract() with the exact same input and documentId as the failed
  // attempt (no duplicate orphaned row, task-12), and a successful retry flips stage to success.
  it('retry() re-invokes extract with the same input and documentId, resolving to success', async () => {
    service.extract.mockRejectedValueOnce(Object.assign(new Error('offline'), { code: 'network_error' }));
    const extractionResult = { documentId: 'd1', filename: 'a.pdf', pageCount: 1, imageCount: 0, pages: [], images: [] };
    service.extract.mockResolvedValueOnce(extractionResult);
    const { result } = renderHook(() => usePdfExtraction());

    await act(async () => {
      await result.current.extract({ filename: 'a.pdf', sizeBytes: 1, bytes: new Uint8Array() });
    });
    expect(result.current.stage).toBe('error');
    expect(result.current.error).toBe('network_error');

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.stage).toBe('success');
    expect(result.current.result).toBe(extractionResult);

    const [firstCall, secondCall] = service.extract.mock.calls;
    expect(secondCall[0]).toBe(firstCall[0]);
    expect(secondCall[2]).toBe(firstCall[2]);
  });

  // Guard — calling retry() before any extract() attempt is a no-op (nothing to retry).
  it('retry() does nothing when extract has never been called', async () => {
    const { result } = renderHook(() => usePdfExtraction());

    await act(async () => {
      await result.current.retry();
    });

    expect(service.extract).not.toHaveBeenCalled();
    expect(result.current.stage).toBe('idle');
  });
});
