import type { PdfDocumentStatus } from '@helsoft/types';

export type PdfDocumentListState = 'loading' | 'content' | 'empty' | 'error';

/** Row payload for PdfDocumentList — raw fields; the molecule owns i18n. */
export type PdfDocumentListItemData = {
  id: string;
  filename: string;
  status: PdfDocumentStatus;
  createdAt: string;
  pageCount: number | null;
};

export type PdfDocumentListSharedProps = {
  state: PdfDocumentListState;
  documents: PdfDocumentListItemData[];
  onGenerate: (id: string) => void;
  onOpenLesson: (id: string) => void;
  onRetry: () => void;
};

export type PdfDocumentListProps =
  | (PdfDocumentListSharedProps & {
      onDelete?: undefined;
    })
  | (PdfDocumentListSharedProps & {
      onDelete: (id: string) => void;
    });
