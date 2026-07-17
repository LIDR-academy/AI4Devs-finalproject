/** Derived list-row status for an extracted PDF (service derives from lesson link + error code). */
export type PdfDocumentStatus = 'ready' | 'failed' | 'generated';

/** List-row shape for the upload-screen PDF list (camelCase; service maps from the view). */
export type PdfDocumentSummary = {
  id: string;
  filename: string;
  pageCount: number | null;
  createdAt: string;
  status: PdfDocumentStatus;
  /** Non-null only when `status === 'generated'` — Open-lesson target. */
  lessonId: string | null;
};
