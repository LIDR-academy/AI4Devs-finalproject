jest.mock('@helsoft/services', () => ({
  PdfExtractionService: { extract: jest.fn() },
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
});
