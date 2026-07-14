import type { PdfDocumentStatus, PdfDocumentSummary } from './pdf-document-summary';

// @s2/@s3/@s4 — list-row contract: status variants + lessonId only when generated.
describe('PdfDocumentSummary', () => {
  it('supports ready status with a null lessonId', () => {
    const summary: PdfDocumentSummary = {
      id: 'doc-1',
      filename: 'notes.pdf',
      pageCount: 3,
      createdAt: '2026-07-14T00:00:00.000Z',
      status: 'ready',
      lessonId: null,
    };

    expect(summary.status).toBe('ready');
    expect(summary.lessonId).toBeNull();
  });

  it('supports failed status with a null lessonId', () => {
    const status: PdfDocumentStatus = 'failed';
    const summary: PdfDocumentSummary = {
      id: 'doc-2',
      filename: 'retry.pdf',
      pageCount: null,
      createdAt: '2026-07-14T00:00:00.000Z',
      status,
      lessonId: null,
    };

    expect(summary.status).toBe('failed');
    expect(summary.lessonId).toBeNull();
  });

  it('supports generated status with a non-null lessonId', () => {
    const summary: PdfDocumentSummary = {
      id: 'doc-3',
      filename: 'done.pdf',
      pageCount: 10,
      createdAt: '2026-07-14T00:00:00.000Z',
      status: 'generated',
      lessonId: 'lesson-1',
    };

    expect(summary.status).toBe('generated');
    expect(summary.lessonId).toBe('lesson-1');
  });
});
