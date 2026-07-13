// Mirrors libs/services/src/pdf-extraction/file-size-guard.ts — kept manually in sync (task-3
// note). Plain types only; no Deno-specific globals.

import type { PdfExtractionLimits } from './types.ts';

export const isFileTooLarge = (sizeBytes: number, limits: Pick<PdfExtractionLimits, 'maxSizeBytes'>): boolean =>
  sizeBytes > limits.maxSizeBytes;
