import type { PdfExtractionErrorCode } from '../types/pdf-extraction';

/** The three PII-free extraction-lifecycle events (spec.md's Analytics decision, task-15,
 * @s17) — a closed, discriminated union rather than an open-ended event type, since these three
 * are the only ones locked at the gate. No filename, file bytes, or user text is ever a valid
 * property on any of them. */
export type PdfExtractionAnalyticsEvent =
  | { name: 'pdf_upload_started'; properties: { size_bytes: number; document_id: string } }
  | {
      name: 'pdf_extraction_succeeded';
      properties: { document_id: string; page_count: number; image_count: number; duration_ms: number };
    }
  | {
      name: 'pdf_extraction_failed';
      properties: { document_id?: string; error_code: PdfExtractionErrorCode; stage: 'client' | 'server' };
    };

/**
 * Vendor-agnostic analytics sink for the extraction lifecycle. No analytics vendor is installed
 * in this codebase yet (spec.md's Analytics decision) — this is the single, thin seam
 * `PdfExtractionService` calls; wiring in a real vendor later means changing this one function's
 * body, never the business logic that emits events. Intentionally a no-op today.
 */
export const trackPdfExtractionEvent = (_event: PdfExtractionAnalyticsEvent): void => {};
