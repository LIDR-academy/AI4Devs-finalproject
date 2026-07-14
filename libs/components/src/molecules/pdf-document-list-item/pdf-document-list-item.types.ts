import type { PdfDocumentStatus } from '@helsoft/types';

export type PdfDocumentListItemProps = {
  filename: string;
  status: PdfDocumentStatus;
  createdAt: string;
  pageCount: number | null;
  onGenerate: () => void;
  onOpenLesson: () => void;
  /** Delete only for ready/failed when provided (@s11). */
  onDelete?: () => void;
};
