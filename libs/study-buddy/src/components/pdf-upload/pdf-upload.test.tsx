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
});
