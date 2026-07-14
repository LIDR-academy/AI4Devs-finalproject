import {
  formatPdfDocumentCreatedDate,
  toPdfDocumentListItems,
  toPdfDocumentListState,
} from './pdf-documents.helpers';

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

  it('formats createdAt with the given locale', () => {
    const label = formatPdfDocumentCreatedDate('2026-07-13T12:00:00.000Z', 'en');
    expect(label).toMatch(/Jul(y)?\s*13,?\s*2026/);
  });

  it('returns the raw ISO string when createdAt is not a valid date', () => {
    expect(formatPdfDocumentCreatedDate('not-a-date', 'en')).toBe('not-a-date');
  });

  // @s2/@s3/@s4/@s11 — status labels, actions, delete only for lesson-less rows.
  it('builds list items with t()-resolved labels and conditional delete', () => {
    const t = (key: string, options?: Record<string, unknown>) => {
      if (key === 'pdfList.createdDate') return String(options?.date ?? '');
      if (key === 'pdfList.pageCount') return `${options?.count} pages`;
      if (key === 'pdfList.status.ready') return 'Ready to generate';
      if (key === 'pdfList.status.failed') return 'Generation failed';
      if (key === 'pdfList.status.generated') return 'Lesson ready';
      if (key === 'pdfList.action.generate') return 'Generate';
      if (key === 'pdfList.action.retry') return 'Retry';
      if (key === 'pdfList.action.openLesson') return 'Open lesson';
      if (key === 'pdfList.action.generateA11y') return `Generate ${options?.filename}`;
      if (key === 'pdfList.action.retryA11y') return `Retry ${options?.filename}`;
      if (key === 'pdfList.action.openLessonA11y') return `Open lesson for ${options?.filename}`;
      if (key === 'pdfList.delete.action') return `Delete ${options?.filename}`;
      return key;
    };

    const items = toPdfDocumentListItems(
      [
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
      ],
      'en',
      t,
    );

    expect(items[0]?.statusLabel).toBe('Ready to generate');
    expect(items[0]?.generateLabel).toBe('Generate');
    expect(items[0]?.deleteAccessibilityLabel).toBe('Delete ready.pdf');
    expect(items[0]?.pageCountLabel).toBe('12 pages');

    expect(items[1]?.statusLabel).toBe('Generation failed');
    expect(items[1]?.retryLabel).toBe('Retry');
    expect(items[1]?.deleteAccessibilityLabel).toBe('Delete failed.pdf');
    expect(items[1]?.pageCountLabel).toBe('0 pages');

    expect(items[2]?.statusLabel).toBe('Lesson ready');
    expect(items[2]?.openLessonLabel).toBe('Open lesson');
    expect(items[2]?.deleteAccessibilityLabel).toBeUndefined();
  });
});
