jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  usePdfExtraction: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ arrayBuffer: jest.fn() })),
}));

import { useLocalization } from '@helsoft/localization';
import { usePdfExtraction } from '@helsoft/hooks';
import { PDF_EXTRACTION_LIMITS } from '@helsoft/services';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { computeCanRetry, PdfUpload } from './pdf-upload';

const mockUsePdfExtraction = usePdfExtraction as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockGetDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;
const MockFile = File as unknown as jest.Mock;

const extractionValue = (overrides: Partial<ReturnType<typeof usePdfExtraction>> = {}) => ({
  extract: jest.fn(),
  stage: 'idle' as const,
  result: null,
  error: null,
  retry: jest.fn(),
  ...overrides,
});

describe('PdfUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s1/@s4 — choosing a web-style asset (a real `File`/Blob, per DocumentPickerAsset.file) reads
  // its bytes directly and calls usePdfExtraction().extract with the filename/size/bytes — no
  // PDF parsing happens on the client.
  it('reads a web-picked file via its Blob and calls extract with filename, size, and bytes', async () => {
    const extract = jest.fn().mockResolvedValue(undefined);
    mockUsePdfExtraction.mockReturnValue(extractionValue({ extract }));
    const bytes = new Uint8Array([1, 2, 3]).buffer;
    mockGetDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ name: 'notes.pdf', size: 3, uri: 'blob:notes', file: { arrayBuffer: () => Promise.resolve(bytes) } }],
    });

    await render(<PdfUpload />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'upload.chooseFile' }));
    });

    expect(extract).toHaveBeenCalledWith({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array(bytes) });
  });

  // @s4/risk R5 — choosing a native asset (only a file:// uri, no `.file`) reads its bytes via
  // expo-file-system's File class — the one place platform specifics are isolated.
  it('reads a native-picked file via expo-file-system when no Blob is available', async () => {
    const extract = jest.fn().mockResolvedValue(undefined);
    mockUsePdfExtraction.mockReturnValue(extractionValue({ extract }));
    const bytes = new Uint8Array([4, 5, 6]).buffer;
    MockFile.mockImplementation(() => ({ arrayBuffer: () => Promise.resolve(bytes) }));
    mockGetDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ name: 'native.pdf', size: 3, uri: 'file:///tmp/native.pdf' }],
    });

    await render(<PdfUpload />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'upload.chooseFile' }));
    });

    expect(MockFile).toHaveBeenCalledWith('file:///tmp/native.pdf');
    expect(extract).toHaveBeenCalledWith({ filename: 'native.pdf', sizeBytes: 3, bytes: new Uint8Array(bytes) });
  });

  // Mutation-kill guard (review round-1 Part B #4) — when the picked asset reports no usable
  // `size` (null, as some pickers/platforms do), `sizeBytes` falls back to the actual read byte
  // length rather than `??`'s left side degrading silently to `null` (which a `??` → `&&` mutation
  // wouldn't have caught, since every other test's `asset.size` is already a non-zero number).
  it('falls back to the read byte length when the picked asset reports no size', async () => {
    const extract = jest.fn().mockResolvedValue(undefined);
    mockUsePdfExtraction.mockReturnValue(extractionValue({ extract }));
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
    mockGetDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ name: 'notes.pdf', size: null, uri: 'blob:notes', file: { arrayBuffer: () => Promise.resolve(bytes) } }],
    });

    await render(<PdfUpload />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'upload.chooseFile' }));
    });

    expect(extract).toHaveBeenCalledWith({ filename: 'notes.pdf', sizeBytes: 4, bytes: new Uint8Array(bytes) });
  });

  // Canceling the picker must not call extract() at all.
  it('does not call extract when the picker is canceled', async () => {
    const extract = jest.fn();
    mockUsePdfExtraction.mockReturnValue(extractionValue({ extract }));
    mockGetDocumentAsync.mockResolvedValue({ canceled: true, assets: null });

    await render(<PdfUpload />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'upload.chooseFile' }));
    });

    expect(extract).not.toHaveBeenCalled();
  });

  // @s5 — while usePdfExtraction().stage is 'processing', the panel shows the Loading state
  // (choose-file control disabled).
  it('shows the loading state and disables the choose-file control while stage is processing', async () => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'processing' }));

    await render(<PdfUpload />);

    expect(screen.getByRole('button', { name: 'upload.chooseFile', disabled: true })).toBeTruthy();
    expect(screen.getByText('upload.loading')).toBeTruthy();
  });

  // @s6 — once stage is 'success', the panel shows the Content summary from the typed result.
  it('shows the content summary once stage is success', async () => {
    mockUsePdfExtraction.mockReturnValue(
      extractionValue({
        stage: 'success',
        result: { documentId: 'd1', filename: 'notes.pdf', pageCount: 4, imageCount: 2, pages: [], images: [] },
      }),
    );

    await render(<PdfUpload />);

    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  // N5 (accessibility review round-1 fix) — the wiring layer computes the image-count row's
  // pluralized announcement from `upload.imageCount` (task-13's `_one`/`_other` i18n keys) and
  // passes it through to the panel, instead of leaving it unwired.
  it('passes an imageCount announcement interpolated with the actual count once stage is success', async () => {
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue(localizationValue({ t }));
    mockUsePdfExtraction.mockReturnValue(
      extractionValue({
        stage: 'success',
        result: { documentId: 'd1', filename: 'notes.pdf', pageCount: 4, imageCount: 2, pages: [], images: [] },
      }),
    );

    await render(<PdfUpload />);

    expect(t).toHaveBeenCalledWith('upload.imageCount', { count: 2 });
    expect(screen.getByLabelText('upload.imageCount')).toBeTruthy();
  });

  // @s7 — the Empty (idle) state shows the constraints hint.
  it('shows the constraints hint in the idle state', async () => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'idle' }));

    await render(<PdfUpload />);

    expect(screen.getByText('upload.constraintsHint')).toBeTruthy();
  });

  // Mutation-kill guard (review round-1 Part B #6) — the default `t: (key) => key` mock ignores
  // its interpolation argument entirely, so a `BYTES_PER_MB`/`maxSizeBytes / BYTES_PER_MB` mutant
  // (e.g. `*` instead of `/`) would go unnoticed by the assertion above. A `t` spy that records
  // its call args proves the actual interpolated `maxMb` value, not just that `t()` was invoked.
  it('interpolates the exact maxMb/maxPages values into the constraints hint', async () => {
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue(localizationValue({ t }));
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'idle' }));

    await render(<PdfUpload />);

    const expectedMaxMb = PDF_EXTRACTION_LIMITS.maxSizeBytes / (1024 * 1024);
    expect(t).toHaveBeenCalledWith('upload.constraintsHint', {
      maxMb: expectedMaxMb,
      maxPages: PDF_EXTRACTION_LIMITS.maxPages,
    });
  });

  // @s8-@s13 — once stage is 'error' with a transient code, the panel shows the mapped error
  // message and wires retry. `network_error` is one of the two genuinely retryable codes
  // (spec.md's Error contract table) — retrying it can actually change the outcome.
  it('shows the mapped error message and wires retry into the panel when stage is error with a transient code', async () => {
    const retry = jest.fn();
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: 'network_error', retry }));

    await render(<PdfUpload />);

    expect(screen.getByText('upload.error.network')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'upload.retryAction' }));
    });

    expect(retry).toHaveBeenCalledTimes(1);
  });

  // @s14 — the unauthenticated code maps to its own clear signed-in-required message.
  it('maps the unauthenticated error code to its own message', async () => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: 'unauthenticated' }));

    await render(<PdfUpload />);

    expect(screen.getByText('upload.error.unauthenticated')).toBeTruthy();
  });

  const ERROR_CODE_TO_KEY = {
    unsupported_file_type: 'upload.error.unsupportedType',
    file_too_large: 'upload.error.fileTooLarge',
    too_many_pages: 'upload.error.tooManyPages',
    scanned_or_image_only: 'upload.error.scannedNotSupported',
    corrupt_or_unreadable: 'upload.error.corrupt',
    extraction_failed: 'upload.error.extractionFailed',
    network_error: 'upload.error.network',
    unauthenticated: 'upload.error.unauthenticated',
  } as const;

  // Guards against a code silently falling through to a missing/wrong message (i18next has no
  // missing-key handler) — every PdfExtractionErrorCode maps to its own, distinct message key.
  it.each(Object.entries(ERROR_CODE_TO_KEY))('maps error code %s to its own message key', async (code, expectedKey) => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: code as never }));

    await render(<PdfUpload />);

    expect(screen.getByText(expectedKey)).toBeTruthy();
  });

  // Review round-1 fix (design finding #1) — retrying re-invokes usePdfExtraction().retry() with
  // the exact same remembered input/documentId, so it can only change the outcome for a transient
  // failure. Only `network_error`/`extraction_failed` genuinely say "Retry" in spec.md's Error
  // contract table; the other 6 codes' recovery action ("choose a smaller file", "choose a
  // text-based PDF", etc.) is already the panel's persistent choose-file control, so the retry
  // affordance must not render for them.
  const NON_TRANSIENT_CODES = Object.keys(ERROR_CODE_TO_KEY).filter(
    (code) => code !== 'network_error' && code !== 'extraction_failed',
  ) as (keyof typeof ERROR_CODE_TO_KEY)[];

  it.each(NON_TRANSIENT_CODES)('suppresses the retry affordance for the non-transient code %s', async (code) => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: code }));

    await render(<PdfUpload />);

    expect(screen.queryByRole('button', { name: 'upload.retryAction' })).toBeNull();
  });

  it.each(['network_error', 'extraction_failed'] as const)(
    'keeps the retry affordance for the transient code %s',
    async (code) => {
      mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: code }));

      await render(<PdfUpload />);

      expect(screen.getByRole('button', { name: 'upload.retryAction' })).toBeTruthy();
    },
  );

  // Mutation-kill guard (review round-1 Part B #5) — `canRetry` defaults to `true` when there's
  // no error at all (the idle/loading/content states, none of which render the retry affordance
  // regardless of this value) — a `: true` → `: false` mutation on this default is otherwise
  // unreachable through any rendered assertion, so it's unit-tested directly on the extracted
  // `computeCanRetry` helper instead.
  describe('computeCanRetry', () => {
    it('defaults to true when there is no error', () => {
      expect(computeCanRetry(null)).toBe(true);
    });

    it('is true for a retryable code', () => {
      expect(computeCanRetry('network_error')).toBe(true);
    });

    it('is false for a non-retryable code', () => {
      expect(computeCanRetry('file_too_large')).toBe(false);
    });
  });
});
