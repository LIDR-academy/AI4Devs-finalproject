import {
  formatPdfDocumentCreatedDate,
  PDF_DOCUMENT_STATUS_LABEL_KEYS,
} from './pdf-document-list-item.helpers';

describe('pdf-document-list-item.helpers', () => {
  it('formats createdAt with the given locale', () => {
    const label = formatPdfDocumentCreatedDate('2026-07-13T12:00:00.000Z', 'en');
    expect(label).toMatch(/Jul(y)?\s*13,?\s*2026/);
  });

  it('returns the raw ISO string when createdAt is not a valid date', () => {
    expect(formatPdfDocumentCreatedDate('not-a-date', 'en')).toBe('not-a-date');
  });

  it('maps each status to a pdfList.status.* key', () => {
    expect(PDF_DOCUMENT_STATUS_LABEL_KEYS.ready).toBe('pdfList.status.ready');
    expect(PDF_DOCUMENT_STATUS_LABEL_KEYS.failed).toBe('pdfList.status.failed');
    expect(PDF_DOCUMENT_STATUS_LABEL_KEYS.generated).toBe('pdfList.status.generated');
  });
});
