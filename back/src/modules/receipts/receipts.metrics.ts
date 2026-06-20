/**
 * Metric names emitted by the receipts pipeline. Centralised so the service and
 * its tests share a single source of truth (see TKT-011 §3.7).
 */
export const RECEIPT_METRICS = {
  uploadSuccess: "receipt_upload_success_total",
  uploadFailure: "receipt_upload_failure_total",
  ocrDurationMs: "ocr_processing_duration_ms",
  ocrFailure: "ocr_failure_total",
  confirmation: "receipt_confirmation_total",
} as const;
