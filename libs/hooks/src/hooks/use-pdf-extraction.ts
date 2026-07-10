import { useCallback, useState } from 'react';
import { PdfExtractionService, type PdfExtractionInput } from '@helsoft/services';
import type { PdfExtractionResult } from '@helsoft/types';

import { useSession } from './use-session';

export type PdfExtractionStage = 'idle' | 'processing' | 'success';

export type UsePdfExtractionResult = {
  extract: (input: PdfExtractionInput) => Promise<void>;
  stage: PdfExtractionStage;
  result: PdfExtractionResult | null;
};

/**
 * React integration over `PdfExtractionService`: exposes the upload+extract action plus the
 * state `PdfUploadPanel` renders (@s1 success, @s5 processing). Plain-state (`useState`),
 * matching the `useAuth`/`useSession` precedent — not tanstack-query (spec's locked hook-style
 * decision). Error/retry state (an `error` field, `reset()`, and an `'error'` stage) lands in
 * task-12 (Slice 2) behind its own RED tests.
 */
export const usePdfExtraction = (): UsePdfExtractionResult => {
  const { session } = useSession();
  const [stage, setStage] = useState<PdfExtractionStage>('idle');
  const [result, setResult] = useState<PdfExtractionResult | null>(null);

  const extract = useCallback(
    async (input: PdfExtractionInput) => {
      setStage('processing');
      const userId = session?.user.id;
      const extracted = await PdfExtractionService.extract(input, userId ?? '');
      setResult(extracted);
      setStage('success');
    },
    [session],
  );

  return { extract, stage, result };
};
