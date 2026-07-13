import type { PdfExtractionLimits } from '../types/pdf-extraction.types';

/**
 * Server-side, authoritative file-size guard (M1, security review round-1 fix). The client
 * pre-check in `pdf-extraction.service.ts`'s `validateFile` is a UX fast-path only — a caller
 * bypassing it entirely (a modified client, or a direct authenticated
 * `functions.invoke`/Storage call) must still be rejected here, in the Edge Function, before any
 * parse/image work runs. Mirrors the `too_many_pages` short-circuit pattern in
 * `extraction-failure-detection.ts`. Exclusive upper bound — a file of exactly `maxSizeBytes` is
 * within the limit (spec.md's "exceeds the size limit" language). Pure, Jest-testable TypeScript
 * (task-3 sandbox adaptation) — mirrored into `supabase/functions/extract-pdf/_shared/` as the
 * real Deno deployment source.
 */
export const isFileTooLarge = (sizeBytes: number, limits: Pick<PdfExtractionLimits, 'maxSizeBytes'>): boolean =>
  sizeBytes > limits.maxSizeBytes;
