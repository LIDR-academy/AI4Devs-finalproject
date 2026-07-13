jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ arrayBuffer: jest.fn() })),
}));

import type { PdfExtractionErrorCode, PdfExtractionStage } from '@helsoft/pdf-upload-extraction';
import { File } from 'expo-file-system';

import {
  BYTES_PER_MB,
  computeCanRetry,
  PDF_MIME_TYPE,
  readPickedFileBytes,
  stageToPanelState,
  UPLOAD_ERROR_KEYS,
} from './pdf-upload.helpers';

const MockFile = File as unknown as jest.Mock;

describe('pdf-upload.helpers', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('constants', () => {
    it('exposes the PDF mime type and bytes-per-MB conversion factor', () => {
      expect(PDF_MIME_TYPE).toBe('application/pdf');
      expect(BYTES_PER_MB).toBe(1024 * 1024);
    });
  });

  describe('UPLOAD_ERROR_KEYS', () => {
    const EXPECTED: Record<PdfExtractionErrorCode, string> = {
      unsupported_file_type: 'upload.error.unsupportedType',
      file_too_large: 'upload.error.fileTooLarge',
      too_many_pages: 'upload.error.tooManyPages',
      scanned_or_image_only: 'upload.error.scannedNotSupported',
      corrupt_or_unreadable: 'upload.error.corrupt',
      extraction_failed: 'upload.error.extractionFailed',
      network_error: 'upload.error.network',
      unauthenticated: 'upload.error.unauthenticated',
    };

    it.each(Object.entries(EXPECTED))('maps %s to %s', (code, key) => {
      expect(UPLOAD_ERROR_KEYS[code as PdfExtractionErrorCode]).toBe(key);
    });
  });

  describe('stageToPanelState', () => {
    const EXPECTED: Record<PdfExtractionStage, string> = {
      idle: 'idle',
      processing: 'loading',
      success: 'content',
      error: 'error',
    };

    it.each(Object.entries(EXPECTED))('maps stage %s to panel state %s', (stage, panelState) => {
      expect(stageToPanelState[stage as PdfExtractionStage]).toBe(panelState);
    });
  });

  describe('readPickedFileBytes', () => {
    it('reads bytes from asset.file when a web Blob is present', async () => {
      const bytes = new Uint8Array([1, 2, 3]).buffer;
      const asset = {
        name: 'notes.pdf',
        size: 3,
        uri: 'blob:notes',
        file: { arrayBuffer: () => Promise.resolve(bytes) },
      };

      await expect(readPickedFileBytes(asset as never)).resolves.toEqual(new Uint8Array(bytes));
      expect(MockFile).not.toHaveBeenCalled();
    });

    it('reads bytes via expo-file-system File when no Blob is present', async () => {
      const bytes = new Uint8Array([4, 5, 6]).buffer;
      MockFile.mockImplementation(() => ({ arrayBuffer: () => Promise.resolve(bytes) }));
      const asset = { name: 'native.pdf', size: 3, uri: 'file:///tmp/native.pdf' };

      await expect(readPickedFileBytes(asset as never)).resolves.toEqual(new Uint8Array(bytes));
      expect(MockFile).toHaveBeenCalledWith('file:///tmp/native.pdf');
    });
  });

  describe('computeCanRetry', () => {
    // Mutation-kill — default true is otherwise unreachable through rendered assertions.
    it('defaults to true when there is no error', () => {
      expect(computeCanRetry(null)).toBe(true);
    });

    it.each(['network_error', 'extraction_failed'] as const)('is true for retryable code %s', (code) => {
      expect(computeCanRetry(code)).toBe(true);
    });

    it.each([
      'unsupported_file_type',
      'file_too_large',
      'too_many_pages',
      'scanned_or_image_only',
      'corrupt_or_unreadable',
      'unauthenticated',
    ] as const)('is false for non-retryable code %s', (code) => {
      expect(computeCanRetry(code)).toBe(false);
    });
  });
});
