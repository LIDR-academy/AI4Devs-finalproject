/**
 * Storybook-only stand-in for @helsoft/pdf-upload-extraction. Re-exports real constants/
 * types via relative imports into the sibling package, and replaces usePdfExtraction with a
 * story-configurable fake (the real hook hits Supabase). Aliased in main.ts's viteFinal.
 *
 * Config lives on globalThis so a relative import of `configurePdfExtractionMock` from
 * stories and the Vite-aliased `@helsoft/pdf-upload-extraction` used by PdfUpload still
 * share one pending config (Vite can otherwise treat those as separate module instances).
 */
export { PDF_EXTRACTION_LIMITS } from '../../../pdf-upload-extraction/src/services/pdf-extraction.constants';

import { useCallback, useState } from 'react';
import type {
  PdfExtractionErrorCode,
  PdfExtractionInput,
  PdfExtractionResult,
} from '../../../pdf-upload-extraction/src/types/pdf-extraction.types';

export type PdfExtractionStage = 'idle' | 'processing' | 'success' | 'error';

export type PdfExtractionMockConfig = {
  stage?: PdfExtractionStage;
  result?: PdfExtractionResult | null;
  error?: PdfExtractionErrorCode | null;
};

const CONFIG_KEY = '__studyBuddyPdfExtractionMockConfig';

type GlobalWithConfig = typeof globalThis & {
  [CONFIG_KEY]?: PdfExtractionMockConfig;
};

export const configurePdfExtractionMock = (config: PdfExtractionMockConfig) => {
  (globalThis as GlobalWithConfig)[CONFIG_KEY] = config;
};

/** Read-only: keep config until the next story's decorator overwrites it (survives Strict Mode
 * double-mount that would otherwise clear a one-shot pending bag before the remount). */
const readConfig = (): PdfExtractionMockConfig =>
  (globalThis as GlobalWithConfig)[CONFIG_KEY] ?? {};

const EXTRACT_DELAY_MS = 500;

export const usePdfExtraction = () => {
  const [config] = useState(() => readConfig());
  const [stage, setStage] = useState<PdfExtractionStage>(config.stage ?? 'idle');
  const [result, setResult] = useState<PdfExtractionResult | null>(config.result ?? null);
  const [error, setError] = useState<PdfExtractionErrorCode | null>(config.error ?? null);
  const [lastInput, setLastInput] = useState<PdfExtractionInput | null>(null);

  const extract = useCallback(
    (input: PdfExtractionInput): Promise<void> =>
      new Promise((resolve) => {
        setLastInput(input);
        setStage('processing');
        setError(null);
        setTimeout(() => {
          if (config.error) {
            setStage('error');
            setError(config.error);
            resolve();
            return;
          }
          const next: PdfExtractionResult = config.result ?? {
            documentId: 'doc-story-1',
            filename: input.filename,
            pageCount: 8,
            imageCount: 2,
            pages: [{ page: 1, text: 'Sample page text' }],
            images: [],
          };
          setResult(next);
          setStage('success');
          resolve();
        }, EXTRACT_DELAY_MS);
      }),
    [config.error, config.result],
  );

  const retry = useCallback((): Promise<void> => {
    if (!lastInput) return Promise.resolve();
    return extract(lastInput);
  }, [extract, lastInput]);

  return { extract, stage, result, error, retry };
};
