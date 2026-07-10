import { PdfUploadPanel, type PdfUploadPanelState } from '@helsoft/components';
import { type PdfExtractionStage, usePdfExtraction } from '@helsoft/hooks';
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

/** A full (not partial) `Record`, matching `UPLOAD_ERROR_KEYS` below — TypeScript itself proves
 * every `PdfExtractionStage` maps to a panel state, so the lookup at the call site can never miss
 * (review round-1 fix N2, drops the previously-untestable `?? 'idle'` runtime fallback). */
const stageToPanelState: Record<PdfExtractionStage, PdfUploadPanelState> = {
  idle: 'idle',
  processing: 'loading',
  success: 'content',
  error: 'error',
};

/** Only these two codes reflect a transient failure where retrying can actually change the
 * outcome (spec.md's Error contract table) — `usePdfExtraction().retry()` re-invokes with the
 * exact same remembered input/documentId, so retrying any other code deterministically reproduces
 * the same rejection; the panel's persistent "Choose a PDF" control is the real recovery action
 * for those (@s8-@s13, review round-1 fix). */
const RETRYABLE_ERROR_CODES: ReadonlySet<PdfExtractionErrorCode> = new Set(['network_error', 'extraction_failed']);

/** Whether the Error-state retry affordance should render — defaults to `true` when there's no
 * error at all (idle/loading/content never surface it regardless, but the default still needs its
 * own, directly testable name rather than only living inline in an unreachable-by-render ternary,
 * review round-1 Part B #5). */
export const computeCanRetry = (error: PdfExtractionErrorCode | null): boolean =>
  error ? RETRYABLE_ERROR_CODES.has(error) : true;

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
      state={stageToPanelState[stage]}
      onChooseFile={handleChooseFile}
      filename={result?.filename}
      pageCount={result?.pageCount}
      imageCount={result?.imageCount}
      imageCountAnnouncement={result ? t('upload.imageCount', { count: result.imageCount }) : undefined}
      errorMessage={error ? t(UPLOAD_ERROR_KEYS[error]) : undefined}
      onRetry={retry}
      canRetry={computeCanRetry(error)}
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
