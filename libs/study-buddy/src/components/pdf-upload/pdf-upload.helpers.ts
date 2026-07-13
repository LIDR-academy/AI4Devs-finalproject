import type { PdfUploadPanelState } from '@helsoft/components';
import type { PdfExtractionErrorCode, PdfExtractionStage } from '@helsoft/pdf-upload-extraction';
import type * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

export const PDF_MIME_TYPE = 'application/pdf';
export const BYTES_PER_MB = 1024 * 1024;

/** Maps usePdfExtraction()'s normalized PdfExtractionErrorCode to its i18n message key
 * (@s8-@s14, spec's Error contract table) — a full (not partial) map, so TypeScript itself
 * guarantees every code has its own key. */
export const UPLOAD_ERROR_KEYS: Record<PdfExtractionErrorCode, string> = {
  unsupported_file_type: 'upload.error.unsupportedType',
  file_too_large: 'upload.error.fileTooLarge',
  too_many_pages: 'upload.error.tooManyPages',
  scanned_or_image_only: 'upload.error.scannedNotSupported',
  corrupt_or_unreadable: 'upload.error.corrupt',
  extraction_failed: 'upload.error.extractionFailed',
  network_error: 'upload.error.network',
  unauthenticated: 'upload.error.unauthenticated',
};

/** React Native's own ambient `Blob`/`File` global types (declared in `react-native/src/types/
 * globals.d.ts`, picked up automatically — no DOM lib in this tsconfig) don't declare
 * `arrayBuffer()`, even though a real web `File` (what `asset.file` actually is at runtime on
 * web) always has it. This narrow type + cast documents that gap instead of silently widening it. */
type WebBlobLike = { arrayBuffer(): Promise<ArrayBuffer> };

/** Reads the picked asset's bytes — the one place platform specifics are isolated (risk R5):
 * web assets carry a real `File`/Blob (`asset.file`); native assets carry only a `file://` uri,
 * read via expo-file-system's `File`. */
export const readPickedFileBytes = async (
  asset: DocumentPicker.DocumentPickerAsset,
): Promise<Uint8Array> => {
  const buffer = asset.file
    ? await (asset.file as unknown as WebBlobLike).arrayBuffer()
    : await new File(asset.uri).arrayBuffer();
  return new Uint8Array(buffer);
};

/** A full (not partial) `Record` — TypeScript itself proves every `PdfExtractionStage` maps to a
 * panel state, so the lookup at the call site can never miss (review round-1 fix N2). */
export const stageToPanelState: Record<PdfExtractionStage, PdfUploadPanelState> = {
  idle: 'idle',
  processing: 'loading',
  success: 'content',
  error: 'error',
};

/** Only these two codes reflect a transient failure where retrying can actually change the
 * outcome (spec.md's Error contract table). */
const RETRYABLE_ERROR_CODES: ReadonlySet<PdfExtractionErrorCode> = new Set([
  'network_error',
  'extraction_failed',
]);

/** Whether the Error-state retry affordance should render — defaults to `true` when there's no
 * error at all (idle/loading/content never surface it regardless). */
export const computeCanRetry = (error: PdfExtractionErrorCode | null): boolean =>
  error ? RETRYABLE_ERROR_CODES.has(error) : true;
