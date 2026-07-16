export type NewLessonDialogProps = {
  /** Fired when extraction yields a documentId (list refetch). */
  onExtracted?: (documentId: string) => void;
  /** Fired when generation persists a lessonId (list refetch). */
  onGenerated?: () => void;
  /** When set, opens the dialog on the generate step for this document. */
  generateDocumentId?: string;
  /** Called after `generateDocumentId` has been consumed (clear parent state). */
  onGenerateHandled?: () => void;
};
