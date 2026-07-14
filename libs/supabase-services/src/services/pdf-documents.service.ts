import type { PdfDocumentStatus, PdfDocumentSummary } from '@helsoft/types';

import { PdfDocumentsDao, type UserDocumentRow } from '../dao/pdf-documents.dao';

const deriveStatus = (row: UserDocumentRow): PdfDocumentStatus => {
  if (row.lesson_id) return 'generated';
  if (row.generation_error_code) return 'failed';
  return 'ready';
};

const toPdfDocumentSummary = (row: UserDocumentRow): PdfDocumentSummary => {
  const status = deriveStatus(row);
  return {
    id: row.id,
    filename: row.filename,
    pageCount: row.page_count,
    createdAt: row.created_at,
    status,
    lessonId: status === 'generated' ? row.lesson_id : null,
  };
};

/**
 * Business logic over PdfDocumentsDao: validates inputs, derives list status, normalizes failures.
 */
export abstract class PdfDocumentsService {
  static async getDocuments(): Promise<PdfDocumentSummary[]> {
    try {
      const rows = await PdfDocumentsDao.getDocuments();
      return rows.map(toPdfDocumentSummary);
    } catch {
      throw new Error('PdfDocumentsService.getDocuments: failed to load documents');
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    if (!id.trim()) {
      return Promise.reject(new Error('PdfDocumentsService.deleteDocument: id must not be empty'));
    }
    try {
      await PdfDocumentsDao.deleteDocument(id);
    } catch {
      throw new Error('PdfDocumentsService.deleteDocument: failed to delete document');
    }
  }
}
