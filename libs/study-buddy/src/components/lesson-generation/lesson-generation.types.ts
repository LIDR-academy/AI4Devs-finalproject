export type LessonGenerationProps = {
  /** The extracted PDF's documentId, lifted by `upload.tsx` from `PdfUpload`'s `onExtracted`
   * (ai-lesson-generation decision #9). Undefined until extraction succeeds — Generate stays
   * gated on it (@s16). */
  documentId?: string;
};
