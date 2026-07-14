import type { PdfDocumentStatus } from '@helsoft/types';

export type PdfDocumentListItemProps = {
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
  onGenerate: () => void;
  onOpenLesson: () => void;
  /** Delete only for ready/failed when both this and deleteAccessibilityLabel are set (@s11). */
  onDelete?: () => void;
  deleteAccessibilityLabel?: string;
};
