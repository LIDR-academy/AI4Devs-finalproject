export type LessonGenerationProps = {
  /** The extracted PDF's documentId, lifted by `upload.tsx` from `PdfUpload`'s `onExtracted`
   * (ai-lesson-generation decision #9). Undefined until extraction succeeds — Generate stays
   * gated on it (@s16). */
  documentId?: string;
  /** Fired once when generation reaches Content/ready with a persisted lessonId
   * (pending-pdfs-generate decision #5 / @s9). Additive/optional — omit = no-op. */
  onGenerated?: () => void;
};
