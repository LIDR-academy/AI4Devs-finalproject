import { useSession } from '@helsoft/hooks';
import { useCallback, useRef, useState } from 'react';

import {
  generateDocumentId,
  PDF_EXTRACTION_ERROR_CODES,
  PdfExtractionService,
} from '../services/pdf-extraction.service';
import type {
  PdfExtractionError,
  PdfExtractionErrorCode,
  PdfExtractionInput,
  PdfExtractionResult,
} from '../types/pdf-extraction.types';
import type { PdfExtractionStage, UsePdfExtractionResult } from './use-pdf-extraction.types';

/** Narrow runtime guard: a rejected PdfExtractionService.extract cause is only trusted as a
 * PdfExtractionError when its `.code` is actually a member of the closed union — a violated
 * contract falls back to network_error rather than reading an untrusted value via an unchecked
 * cast (mirrors useAuth's isAuthErrorShape). Derives the closed set from
 * `PdfExtractionService`'s own exported `PDF_EXTRACTION_ERROR_CODES` (review round-1 fix N1)
 * rather than re-declaring an independent, unchecked duplicate. */
const isPdfExtractionErrorShape = (cause: unknown): cause is PdfExtractionError => {
  const code = (cause as { code?: unknown } | null)?.code;
  return typeof code === 'string' && Object.hasOwn(PDF_EXTRACTION_ERROR_CODES, code);
};

type LastAttempt = {
  input: PdfExtractionInput;
  documentId: string;
};

/**
 * React integration over `PdfExtractionService`: exposes the upload+extract action plus the
 * state `PdfUploadPanel` renders (@s1 success, @s5 processing, @s8-@s13 error). Plain-state
 * (`useState`), matching the `useAuth`/`useSession` precedent — not tanstack-query (spec's locked
 * hook-style decision). Remembers the last attempt's input/documentId so `retry()` (@s13) can
 * re-run the exact same extraction rather than minting a new document row.
 */
export const usePdfExtraction = (): UsePdfExtractionResult => {
  const { session } = useSession();
  const [stage, setStage] = useState<PdfExtractionStage>('idle');
  const [result, setResult] = useState<PdfExtractionResult | null>(null);
  const [error, setError] = useState<PdfExtractionErrorCode | null>(null);
  const lastAttemptRef = useRef<LastAttempt | null>(null);

  const run = useCallback(
    async (input: PdfExtractionInput, documentId: string) => {
      lastAttemptRef.current = { input, documentId };
      setStage('processing');
      setError(null);
      const userId = session?.user.id;
      try {
        const extracted = await PdfExtractionService.extract(input, userId ?? '', documentId);
        setResult(extracted);
        setStage('success');
      } catch (cause) {
        setError(isPdfExtractionErrorShape(cause) ? cause.code : 'network_error');
        setStage('error');
      }
    },
    [session],
  );

  const extract = useCallback(
    (input: PdfExtractionInput) => run(input, generateDocumentId()),
    [run],
  );

  const retry = useCallback(async () => {
    const lastAttempt = lastAttemptRef.current;
    if (!lastAttempt) return;
    await run(lastAttempt.input, lastAttempt.documentId);
  }, [run]);

  return { extract, stage, result, error, retry };
};
