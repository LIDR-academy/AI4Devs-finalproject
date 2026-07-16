import { useLocalization } from '@helsoft/localization';
import { PDF_EXTRACTION_LIMITS, usePdfExtraction } from '@helsoft/pdf-upload-extraction';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useRef } from 'react';

import {
  BYTES_PER_MB,
  computeCanRetry,
  PDF_MIME_TYPE,
  readPickedFileBytes,
  stageToPanelState,
  UPLOAD_ERROR_KEYS,
} from './pdf-upload.helpers';
import type { UsePdfUploadOptions } from './pdf-upload.types';

/**
 * Owns document-picker + `usePdfExtraction` + localized panel props.
 * `chooseFile` must be called from a user-gesture handler (picker requirement).
 */
export const usePdfUpload = ({ onExtracted }: UsePdfUploadOptions = {}) => {
  const { extract, stage, result, error, retry, reset } = usePdfExtraction();
  const { t } = useLocalization();
  const lastAnnouncedDocumentId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const documentId = result?.documentId;
    if (!documentId || documentId === lastAnnouncedDocumentId.current) return;
    lastAnnouncedDocumentId.current = documentId;
    onExtracted?.(documentId);
  }, [result?.documentId, onExtracted]);

  const chooseFile = useCallback(async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: PDF_MIME_TYPE });
    if (picked.canceled) return;

    const asset = picked.assets[0];
    const bytes = await readPickedFileBytes(asset);
    await extract({ filename: asset.name, sizeBytes: asset.size ?? bytes.byteLength, bytes });
  }, [extract]);

  const resetUpload = useCallback(() => {
    lastAnnouncedDocumentId.current = undefined;
    reset();
  }, [reset]);

  return {
    chooseFile,
    retry,
    resetUpload,
    panelProps: {
      state: stageToPanelState[stage],
      onChooseFile: chooseFile,
      filename: result?.filename,
      pageCount: result?.pageCount,
      imageCount: result?.imageCount,
      imageCountAnnouncement: result
        ? t('upload.imageCount', { count: result.imageCount })
        : undefined,
      errorMessage: error ? t(UPLOAD_ERROR_KEYS[error]) : undefined,
      onRetry: retry,
      canRetry: computeCanRetry(error),
      maxMb: PDF_EXTRACTION_LIMITS.maxSizeBytes / BYTES_PER_MB,
      maxPages: PDF_EXTRACTION_LIMITS.maxPages,
    },
  };
};
