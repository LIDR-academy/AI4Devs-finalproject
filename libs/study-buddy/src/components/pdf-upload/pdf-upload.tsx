import { PdfUploadPanel, type PdfUploadPanelState } from '@helsoft/components';
import { usePdfExtraction } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { PDF_EXTRACTION_LIMITS } from '@helsoft/services';
import type { PdfExtractionErrorCode } from '@helsoft/types';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

const PDF_MIME_TYPE = 'application/pdf';
const BYTES_PER_MB = 1024 * 1024;

/** Maps usePdfExtraction()'s normalized PdfExtractionErrorCode to its i18n message key
 * (@s8-@s14, spec's Error contract table) — a full (not partial) map, so TypeScript itself
 * guarantees every code has its own key. */
const UPLOAD_ERROR_KEYS: Record<PdfExtractionErrorCode, string> = {
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
const readPickedFileBytes = async (asset: DocumentPicker.DocumentPickerAsset): Promise<Uint8Array> => {
  const buffer = asset.file
    ? await (asset.file as unknown as WebBlobLike).arrayBuffer()
    : await new File(asset.uri).arrayBuffer();
  return new Uint8Array(buffer);
};

const stageToPanelState: Record<string, PdfUploadPanelState> = {
  idle: 'idle',
  processing: 'loading',
  success: 'content',
  error: 'error',
};

/**
 * PdfUpload — feature component wiring the document picker, `usePdfExtraction()`, and localized
 * strings to the presentational `PdfUploadPanel`. Mirrors the established `SignInForm`/
 * `LanguageSettings` wiring pattern. Maps every `PdfExtractionErrorCode` to its `t('upload.error.*')`
 * message and wires `retry()` into the panel's retry affordance (@s8-@s14, task-12).
 */
export const PdfUpload = () => {
  const { extract, stage, result, error, retry } = usePdfExtraction();
  const { t } = useLocalization();

  const handleChooseFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: PDF_MIME_TYPE });
    if (picked.canceled) return;

    const asset = picked.assets[0];
    const bytes = await readPickedFileBytes(asset);
    await extract({ filename: asset.name, sizeBytes: asset.size ?? bytes.byteLength, bytes });
  };

  return (
    <PdfUploadPanel
      state={stageToPanelState[stage] ?? 'idle'}
      onChooseFile={handleChooseFile}
      filename={result?.filename}
      pageCount={result?.pageCount}
      imageCount={result?.imageCount}
      errorMessage={error ? t(UPLOAD_ERROR_KEYS[error]) : undefined}
      onRetry={retry}
      labels={{
        chooseFile: t('upload.chooseFile'),
        loading: t('upload.loading'),
        filenameLabel: t('upload.filenameLabel'),
        pageCountLabel: t('upload.pageCountLabel'),
        imageCountLabel: t('upload.imageCountLabel'),
        continueLabel: t('upload.continue'),
        constraintsHint: t('upload.constraintsHint', {
          maxMb: PDF_EXTRACTION_LIMITS.maxSizeBytes / BYTES_PER_MB,
          maxPages: PDF_EXTRACTION_LIMITS.maxPages,
        }),
        retry: t('upload.retryAction'),
      }}
    />
  );
};
