import { toPdfDocumentListItems, toPdfDocumentListState } from './pdf-documents.helpers';

describe('pdf-documents.helpers', () => {
  it('maps loading / error / empty / content states', () => {
    expect(toPdfDocumentListState(true, null, 0)).toBe('loading');
    expect(toPdfDocumentListState(false, new Error('x'), 0)).toBe('error');
    expect(toPdfDocumentListState(false, null, 0)).toBe('empty');
    expect(toPdfDocumentListState(false, null, 2)).toBe('content');
  });

  // Delete failure sets error but keeps docs — must stay Content, not load-Error.
  it('keeps content when error is set but documents remain', () => {
    expect(toPdfDocumentListState(false, new Error('delete failed'), 2)).toBe('content');
  });

  // @s2/@s3/@s4/@s11 — data-only items; molecule owns labels / delete visibility.
  it('maps summaries to list item data without resolving labels', () => {
    const items = toPdfDocumentListItems([
      {
        id: 'doc-ready',
        filename: 'ready.pdf',
        pageCount: 12,
        createdAt: '2026-07-13T12:00:00.000Z',
        status: 'ready',
        lessonId: null,
      },
      {
        id: 'doc-failed',
        filename: 'failed.pdf',
        pageCount: null,
        createdAt: '2026-07-12T12:00:00.000Z',
        status: 'failed',
        lessonId: null,
      },
      {
        id: 'doc-gen',
        filename: 'done.pdf',
        pageCount: 3,
        createdAt: '2026-07-11T12:00:00.000Z',
        status: 'generated',
        lessonId: 'lesson-1',
      },
    ]);

    expect(items).toEqual([
      {
        id: 'doc-ready',
        filename: 'ready.pdf',
        status: 'ready',
        createdAt: '2026-07-13T12:00:00.000Z',
        pageCount: 12,
      },
      {
        id: 'doc-failed',
        filename: 'failed.pdf',
        status: 'failed',
        createdAt: '2026-07-12T12:00:00.000Z',
        pageCount: null,
      },
      {
        id: 'doc-gen',
        filename: 'done.pdf',
        status: 'generated',
        createdAt: '2026-07-11T12:00:00.000Z',
        pageCount: 3,
      },
    ]);
  });
});
