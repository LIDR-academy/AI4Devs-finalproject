jest.mock('../dao/pdf-documents.dao', () => ({
  PdfDocumentsDao: { getDocuments: jest.fn(), deleteDocument: jest.fn() },
}));

import type { PdfDocumentSummary } from '@helsoft/types';

import { PdfDocumentsDao } from '../dao/pdf-documents.dao';
import { PdfDocumentsService } from './pdf-documents.service';

const dao = PdfDocumentsDao as jest.Mocked<typeof PdfDocumentsDao>;

describe('PdfDocumentsService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s1 — list delegates to the DAO; RLS + view filter are DB-side.
  // Full-review major [arch] — service owns status derivation; DAO returns raw view rows.
  it('getDocuments maps raw DAO rows into PdfDocumentSummary with derived status', async () => {
    dao.getDocuments.mockResolvedValue([
      {
        id: 'doc-2',
        filename: 'newer.pdf',
        page_count: 5,
        created_at: '2026-07-14T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: null,
      },
      {
        id: 'doc-gen',
        filename: 'done.pdf',
        page_count: 4,
        created_at: '2026-07-14T00:00:00.000Z',
        generation_error_code: 'provider_error',
        lesson_id: 'lesson-1',
      },
      {
        id: 'doc-fail',
        filename: 'fail.pdf',
        page_count: null,
        created_at: '2026-07-13T00:00:00.000Z',
        generation_error_code: 'timeout',
        lesson_id: null,
      },
      {
        id: 'doc-empty',
        filename: 'empty-lesson.pdf',
        page_count: 1,
        created_at: '2026-07-12T00:00:00.000Z',
        generation_error_code: null,
        lesson_id: '',
      },
    ]);

    const result = await PdfDocumentsService.getDocuments();

    expect(dao.getDocuments).toHaveBeenCalledWith();
    expect(result).toEqual([
      {
        id: 'doc-2',
        filename: 'newer.pdf',
        pageCount: 5,
        createdAt: '2026-07-14T12:00:00.000Z',
        status: 'ready',
        lessonId: null,
      },
      {
        id: 'doc-gen',
        filename: 'done.pdf',
        pageCount: 4,
        createdAt: '2026-07-14T00:00:00.000Z',
        status: 'generated',
        lessonId: 'lesson-1',
      },
      {
        id: 'doc-fail',
        filename: 'fail.pdf',
        pageCount: null,
        createdAt: '2026-07-13T00:00:00.000Z',
        status: 'failed',
        lessonId: null,
      },
      {
        id: 'doc-empty',
        filename: 'empty-lesson.pdf',
        pageCount: 1,
        createdAt: '2026-07-12T00:00:00.000Z',
        status: 'ready',
        lessonId: null,
      },
    ] satisfies PdfDocumentSummary[]);
  });

  it('getDocuments normalizes a DAO failure into a clear Error', async () => {
    dao.getDocuments.mockRejectedValue({ message: 'select failed' });

    await expect(PdfDocumentsService.getDocuments()).rejects.toThrow(
      'PdfDocumentsService.getDocuments: failed to load documents',
    );
  });

  // @s12 — delete validates id then delegates; empty id never hits the DAO.
  it('deleteDocument rejects an empty id without calling the DAO', async () => {
    await expect(PdfDocumentsService.deleteDocument('')).rejects.toThrow(/id/i);
    await expect(PdfDocumentsService.deleteDocument('   ')).rejects.toThrow(/id/i);
    expect(dao.deleteDocument).not.toHaveBeenCalled();
  });

  it('deleteDocument delegates a valid id to PdfDocumentsDao.deleteDocument', async () => {
    dao.deleteDocument.mockResolvedValue(undefined);

    await PdfDocumentsService.deleteDocument('doc-1');

    expect(dao.deleteDocument).toHaveBeenCalledWith('doc-1');
  });

  it('deleteDocument normalizes a DAO failure into a clear Error', async () => {
    dao.deleteDocument.mockRejectedValue({ message: 'delete failed' });

    await expect(PdfDocumentsService.deleteDocument('doc-1')).rejects.toThrow(
      'PdfDocumentsService.deleteDocument: failed to delete document',
    );
  });
});
