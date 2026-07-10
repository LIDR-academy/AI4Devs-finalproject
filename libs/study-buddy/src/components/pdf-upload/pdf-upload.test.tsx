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
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { PdfUpload } from './pdf-upload';

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

  // @s7 — the Empty (idle) state shows the constraints hint.
  it('shows the constraints hint in the idle state', async () => {
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'idle' }));

    await render(<PdfUpload />);

    expect(screen.getByText('upload.constraintsHint')).toBeTruthy();
  });

  // @s8-@s13 — once stage is 'error', the panel shows the mapped error message and wires retry.
  it('shows the mapped error message and wires retry into the panel when stage is error', async () => {
    const retry = jest.fn();
    mockUsePdfExtraction.mockReturnValue(extractionValue({ stage: 'error', error: 'too_many_pages', retry }));

    await render(<PdfUpload />);

    expect(screen.getByText('upload.error.tooManyPages')).toBeTruthy();

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
});
