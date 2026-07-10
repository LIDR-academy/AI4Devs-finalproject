import { useCallback, useState } from 'react';
import { PdfExtractionService, type PdfExtractionInput } from '@helsoft/services';
import type { PdfExtractionErrorCode, PdfExtractionResult } from '@helsoft/types';

import { useSession } from './use-session';

export type PdfExtractionStage = 'idle' | 'processing' | 'success' | 'error';

export type UsePdfExtractionResult = {
  extract: (input: PdfExtractionInput) => Promise<void>;
  stage: PdfExtractionStage;
  result: PdfExtractionResult | null;
  error: PdfExtractionErrorCode | null;
  reset: () => void;
};

/**
 * React integration over `PdfExtractionService`: exposes the upload+extract action plus the
 * state `PdfUploadPanel` renders (@s1 success, @s5 processing). Plain-state (`useState`),
 * matching the `useAuth`/`useSession` precedent — not tanstack-query (spec's locked hook-style
 * decision). Error/retry state is fleshed out in task-12 (Slice 2); the return shape is ready
 * for it.
 */
export const usePdfExtraction = (): UsePdfExtractionResult => {
  const { session } = useSession();
  const [stage, setStage] = useState<PdfExtractionStage>('idle');
  const [result, setResult] = useState<PdfExtractionResult | null>(null);
  const [error, setError] = useState<PdfExtractionErrorCode | null>(null);

  const extract = useCallback(
    async (input: PdfExtractionInput) => {
      setStage('processing');
      setError(null);
      const userId = session?.user.id;
      const extracted = await PdfExtractionService.extract(input, userId ?? '');
      setResult(extracted);
      setStage('success');
    },
    [session],
  );

  const reset = useCallback(() => {
    setStage('idle');
    setResult(null);
    setError(null);
  }, []);

  return { extract, stage, result, error, reset };
};
