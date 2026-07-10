import { useCallback, useRef, useState } from 'react';
import { generateDocumentId, PdfExtractionService, type PdfExtractionInput } from '@helsoft/services';
import type { PdfExtractionError, PdfExtractionErrorCode, PdfExtractionResult } from '@helsoft/types';

import { useSession } from './use-session';

export type PdfExtractionStage = 'idle' | 'processing' | 'success' | 'error';

export type UsePdfExtractionResult = {
  extract: (input: PdfExtractionInput) => Promise<void>;
  stage: PdfExtractionStage;
  result: PdfExtractionResult | null;
  /** The normalized code from the most recent failed extract()/retry() — null once it succeeds. */
  error: PdfExtractionErrorCode | null;
  /** Re-invokes the last extraction with the exact same input and documentId (@s13) — a no-op
   * before any extract() attempt. Reusing the documentId avoids a duplicate orphaned row
   * (task-12/task-9's failure cleanup). */
  retry: () => Promise<void>;
};

/** The closed set of codes `PdfExtractionService` is contractually allowed to reject with —
 * mirrors `useAuth`'s `AUTH_ERROR_CODES` precedent. */
const PDF_EXTRACTION_ERROR_CODES: ReadonlySet<PdfExtractionErrorCode> = new Set([
  'unsupported_file_type',
  'file_too_large',
  'too_many_pages',
  'scanned_or_image_only',
  'corrupt_or_unreadable',
  'extraction_failed',
  'network_error',
  'unauthenticated',
]);

/** Narrow runtime guard: a rejected PdfExtractionService.extract cause is only trusted as a
 * PdfExtractionError when its `.code` is actually a member of the closed union — a violated
 * contract falls back to network_error rather than reading an untrusted value via an unchecked
 * cast (mirrors useAuth's isAuthErrorShape). */
const isPdfExtractionErrorShape = (cause: unknown): cause is PdfExtractionError =>
  PDF_EXTRACTION_ERROR_CODES.has((cause as { code?: unknown } | null)?.code as PdfExtractionErrorCode);

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

  const extract = useCallback((input: PdfExtractionInput) => run(input, generateDocumentId()), [run]);

  const retry = useCallback(async () => {
    const lastAttempt = lastAttemptRef.current;
    if (!lastAttempt) return;
    await run(lastAttempt.input, lastAttempt.documentId);
  }, [run]);

  return { extract, stage, result, error, retry };
};
