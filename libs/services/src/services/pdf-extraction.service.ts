import type { PdfExtractionResult } from '@helsoft/types';

import { PdfUploadDao } from '../dao/pdf-upload.dao';

export type PdfExtractionInput = {
  filename: string;
  sizeBytes: number;
  bytes: Uint8Array;
};

const UUID_V4_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

/** Generates a syntactically valid (RFC 4122-shaped) v4 UUID without any platform-specific crypto
 * API — `crypto.randomUUID()` isn't universally available (notably absent from Hermes/React
 * Native without an extra native dependency), and this ID is a row/storage-path identifier, not
 * a security-sensitive secret, so `Math.random()`-backed randomness is an acceptable tradeoff. */
const generateDocumentId = (): string =>
  UUID_V4_TEMPLATE.replace(/[xy]/g, (placeholder) => {
    const random = Math.floor(Math.random() * 16);
    const value = placeholder === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

/**
 * Business layer that orchestrates the happy-path upload+extract via `PdfUploadDao`: generates
 * the document identity, then uploads, inserts, and invokes extraction — all via the DAO, never
 * `fetch`/Supabase directly (@s4). Client pre-validation and error normalization land in Slice 2
 * (task-10/task-9); this task wires the happy path only.
 */
export abstract class PdfExtractionService {
  static async extract(input: PdfExtractionInput, userId: string): Promise<PdfExtractionResult> {
    const documentId = generateDocumentId();

    await PdfUploadDao.uploadPdf({ userId, documentId, bytes: input.bytes });
    await PdfUploadDao.insertDocument({
      documentId,
      userId,
      filename: input.filename,
      sizeBytes: input.sizeBytes,
    });

    return PdfUploadDao.invokeExtraction(documentId);
  }
}
