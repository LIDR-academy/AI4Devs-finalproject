import type { PdfDocumentStatus } from '@helsoft/types';

export type PdfDocumentListState = 'loading' | 'content' | 'empty' | 'error';

export type PdfDocumentListItemData = {
  id: string;
  filename: string;
  status: PdfDocumentStatus;
  statusLabel: string;
  createdDateLabel: string;
  pageCountLabel: string;
  generateLabel: string;
  retryLabel: string;
  openLessonLabel: string;
  generateAccessibilityLabel: string;
  retryAccessibilityLabel: string;
  openLessonAccessibilityLabel: string;
  /** Per-item delete control name; omit for generated rows (@s11). */
  deleteAccessibilityLabel?: string;
};

type PdfDocumentListSharedProps = {
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
