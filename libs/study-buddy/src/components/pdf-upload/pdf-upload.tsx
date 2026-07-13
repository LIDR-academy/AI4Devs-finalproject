import { PdfUploadPanel } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { PDF_EXTRACTION_LIMITS, usePdfExtraction } from '@helsoft/pdf-upload-extraction';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useRef } from 'react';

import {
  BYTES_PER_MB,
  computeCanRetry,
  PDF_MIME_TYPE,
  readPickedFileBytes,
  stageToPanelState,
  UPLOAD_ERROR_KEYS,
} from './pdf-upload.helpers';
import type { PdfUploadProps } from './pdf-upload.types';

/**
 * PdfUpload — feature component wiring the document picker, `usePdfExtraction()`, and localized
 * strings to the presentational `PdfUploadPanel`. Mirrors the established `SignInForm`/
 * `LanguageSettings` wiring pattern. Maps every `PdfExtractionErrorCode` to its `t('upload.error.*')`
 * message and wires `retry()` into the panel's retry affordance (@s8-@s14, task-12).
 *
 * `onExtracted` (ai-lesson-generation decision #9) is additive/optional: fires once when
 * `usePdfExtraction()`'s own result first yields a `documentId`, so a sibling (`LessonGeneration`)
 * can learn it without `PdfUpload` giving up ownership of its own extraction lifecycle.
 */
export const PdfUpload = ({ onExtracted }: PdfUploadProps = {}) => {
  const { extract, stage, result, error, retry } = usePdfExtraction();
  const { t } = useLocalization();
  const lastAnnouncedDocumentId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const documentId = result?.documentId;
    if (!documentId || documentId === lastAnnouncedDocumentId.current) return;
    lastAnnouncedDocumentId.current = documentId;
    onExtracted?.(documentId);
  }, [result?.documentId, onExtracted]);

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
      imageCountAnnouncement={
        result ? t('upload.imageCount', { count: result.imageCount }) : undefined
      }
      errorMessage={error ? t(UPLOAD_ERROR_KEYS[error]) : undefined}
      onRetry={retry}
      canRetry={computeCanRetry(error)}
      maxMb={PDF_EXTRACTION_LIMITS.maxSizeBytes / BYTES_PER_MB}
      maxPages={PDF_EXTRACTION_LIMITS.maxPages}
    />
  );
};
