import { getSupabase } from '@helsoft/services';

import { PDF_UPLOAD_BUCKET } from '../services/pdf-extraction.constants';
import type { PdfExtractionResult } from '../types/pdf-extraction';

const PDF_CONTENT_TYPE = 'application/pdf';
const EXTRACT_FUNCTION_NAME = 'extract-pdf';
const DOCUMENTS_TABLE = 'documents';
const PROCESSING_STATUS = 'processing';

export type UploadPdfParams = {
  userId: string;
  documentId: string;
  bytes: Uint8Array;
};

export type InsertDocumentParams = {
  documentId: string;
  userId: string;
  filename: string;
  sizeBytes: number;
};

const buildSourcePath = (userId: string, documentId: string): string => `${userId}/${documentId}/source.pdf`;

/**
 * Raw Supabase data access for the client side of upload: writes the raw PDF to the private
 * `pdf-uploads` bucket, upserts the `documents` row, and invokes the `extract-pdf` function. No
 * validation, no error mapping, and — critically — no PDF parsing (@s4): the client never reads
 * the PDF's own bytes beyond passing them through. Both writes use upsert-by-id (@s13, task-12)
 * so a retry that reuses the same documentId overwrites the prior attempt instead of erroring on
 * a conflict.
 */
export abstract class PdfUploadDao {
  static async uploadPdf({ userId, documentId, bytes }: UploadPdfParams) {
    const { data, error } = await getSupabase()
      .storage.from(PDF_UPLOAD_BUCKET)
      .upload(buildSourcePath(userId, documentId), bytes, { contentType: PDF_CONTENT_TYPE, upsert: true });
    if (error) throw error;
    return data;
  }

  static async insertDocument({ documentId, userId, filename, sizeBytes }: InsertDocumentParams) {
    const { data, error } = await getSupabase()
      .from(DOCUMENTS_TABLE)
      .upsert({
        id: documentId,
        user_id: userId,
        filename,
        size_bytes: sizeBytes,
        status: PROCESSING_STATUS,
        error_code: null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async invokeExtraction(documentId: string): Promise<PdfExtractionResult> {
    const { data, error } = await getSupabase().functions.invoke(EXTRACT_FUNCTION_NAME, {
      body: { documentId },
    });
    if (error) throw error;
    return data;
  }
}
