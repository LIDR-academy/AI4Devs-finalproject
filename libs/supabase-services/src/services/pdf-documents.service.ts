import type { PdfDocumentSummary } from '@helsoft/types';

import { PdfDocumentsDao } from '../dao/pdf-documents.dao';

/**
 * Business logic over PdfDocumentsDao: validates inputs and normalizes DAO failures.
 */
export abstract class PdfDocumentsService {
  static async getDocuments(): Promise<PdfDocumentSummary[]> {
    try {
      return await PdfDocumentsDao.getDocuments();
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
