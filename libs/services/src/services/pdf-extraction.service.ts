import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import type { PdfExtractionError, PdfExtractionErrorCode, PdfExtractionResult } from '@helsoft/types';

import { trackPdfExtractionEvent } from '../analytics/pdf-extraction-analytics';
import { PdfUploadDao } from '../dao/pdf-upload.dao';
import { PDF_EXTRACTION_LIMITS, PDF_FILE_EXTENSION } from './pdf-extraction.constants';

export type PdfExtractionInput = {
  filename: string;
  sizeBytes: number;
  bytes: Uint8Array;
};

const UUID_V4_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

/** Generates a syntactically valid (RFC 4122-shaped) v4 UUID without any platform-specific crypto
 * API — `crypto.randomUUID()` isn't universally available (notably absent from Hermes/React
 * Native without an extra native dependency), and this ID is a row/storage-path identifier, not
 * a security-sensitive secret, so `Math.random()`-backed randomness is an acceptable tradeoff.
 * Exported so `usePdfExtraction` (task-12) can generate and remember the same id across a retry,
 * without duplicating this generator. */
export const generateDocumentId = (): string =>
  UUID_V4_TEMPLATE.replace(/[xy]/g, (placeholder) => {
    const random = Math.floor(Math.random() * 16);
    const value = placeholder === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

/** The closed set of codes `PdfExtractionService` is contractually allowed to reject with. */
const KNOWN_ERROR_CODES: ReadonlySet<PdfExtractionErrorCode> = new Set([
  'unsupported_file_type',
  'file_too_large',
  'too_many_pages',
  'scanned_or_image_only',
  'corrupt_or_unreadable',
  'extraction_failed',
  'network_error',
  'unauthenticated',
]);

const isKnownErrorCode = (code: unknown): code is PdfExtractionErrorCode =>
  typeof code === 'string' && KNOWN_ERROR_CODES.has(code as PdfExtractionErrorCode);

/** Builds a sanitized failure the UI can safely branch on — no raw provider error escapes. */
const toExtractionError = (code: PdfExtractionErrorCode): Error & PdfExtractionError =>
  Object.assign(new Error(`PDF extraction failed: ${code}`), { code });

/** Reads the Edge Function's typed `{ errorCode }` body off a non-2xx invoke response — the raw
 * body is only reachable via `FunctionsHttpError.context` (an unread Response), never parsed by
 * supabase-js itself for error responses. Falls back to `extraction_failed` for a malformed/
 * absent body or an `errorCode` outside the known union, so a violated server contract never
 * leaks a raw shape to the UI. */
const readFunctionErrorCode = async (error: FunctionsHttpError): Promise<PdfExtractionErrorCode> => {
  try {
    const body = await error.context.json();
    return isKnownErrorCode(body?.errorCode) ? body.errorCode : 'extraction_failed';
  } catch {
    return 'extraction_failed';
  }
};

/** Normalizes every DAO-thrown cause — the Edge Function's typed result or a transport failure —
 * into the typed union so the UI never branches on a raw Supabase/function error (@s8/@s11/@s12/
 * @s13/@s14, task-9). */
const normalizeExtractionError = async (cause: unknown): Promise<Error & PdfExtractionError> => {
  if (cause instanceof FunctionsHttpError) return toExtractionError(await readFunctionErrorCode(cause));
  if (cause instanceof FunctionsFetchError || cause instanceof FunctionsRelayError) {
    return toExtractionError('network_error');
  }
  return toExtractionError('extraction_failed');
};

/** Client pre-validation (task-10, @s9/@s10) — rejected files never reach the DAO. The server
 * keeps an authoritative size backstop (task-9); this is a UX fast-path only. */
const validateFile = (input: PdfExtractionInput): void => {
  if (!input.filename.toLowerCase().endsWith(PDF_FILE_EXTENSION)) {
    throw toExtractionError('unsupported_file_type');
  }
  if (input.sizeBytes > PDF_EXTRACTION_LIMITS.maxSizeBytes) {
    throw toExtractionError('file_too_large');
  }
};

/** Emits the PII-free `pdf_extraction_failed` event (task-15, @s17) — only `document_id`,
 * `error_code`, and `stage` ever leave this function, regardless of what caused the failure. */
const trackExtractionFailure = (documentId: string, code: PdfExtractionErrorCode, stage: 'client' | 'server'): void => {
  trackPdfExtractionEvent({ name: 'pdf_extraction_failed', properties: { document_id: documentId, error_code: code, stage } });
};

/**
 * Business layer that orchestrates upload+extract via `PdfUploadDao`: validates the caller and
 * the file client-side (@s9/@s10/@s14), then uploads, inserts, and invokes extraction — all via
 * the DAO, never `fetch`/Supabase directly (@s4) — normalizing any failure into the typed
 * `PdfExtractionErrorCode` union (@s8/@s11/@s12/@s13, task-9). Accepts an optional `documentId`
 * so a retry (task-12) can reuse the same row/storage path instead of minting a new one.
 */
export abstract class PdfExtractionService {
  static async extract(
    input: PdfExtractionInput,
    userId: string,
    documentId: string = generateDocumentId(),
  ): Promise<PdfExtractionResult> {
    if (!userId) {
      trackExtractionFailure(documentId, 'unauthenticated', 'client');
      throw toExtractionError('unauthenticated');
    }

    try {
      validateFile(input);
    } catch (cause) {
      trackExtractionFailure(documentId, (cause as PdfExtractionError).code, 'client');
      throw cause;
    }

    trackPdfExtractionEvent({
      name: 'pdf_upload_started',
      properties: { size_bytes: input.sizeBytes, document_id: documentId },
    });
    const startedAt = Date.now();

    try {
      await PdfUploadDao.uploadPdf({ userId, documentId, bytes: input.bytes });
      await PdfUploadDao.insertDocument({
        documentId,
        userId,
        filename: input.filename,
        sizeBytes: input.sizeBytes,
      });
      const result = await PdfUploadDao.invokeExtraction(documentId);
      trackPdfExtractionEvent({
        name: 'pdf_extraction_succeeded',
        properties: {
          document_id: documentId,
          page_count: result.pageCount,
          image_count: result.imageCount,
          duration_ms: Date.now() - startedAt,
        },
      });
      return result;
    } catch (cause) {
      const normalized = await normalizeExtractionError(cause);
      trackExtractionFailure(documentId, normalized.code, 'server');
      throw normalized;
    }
  }
}
