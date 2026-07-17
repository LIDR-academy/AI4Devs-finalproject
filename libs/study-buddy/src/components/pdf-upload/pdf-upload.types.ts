export type UsePdfUploadOptions = {
  /** Fired once when `usePdfExtraction()`'s own result first yields a `documentId`
   * (ai-lesson-generation decision #9) — additive/optional, so omitting it is identical to R1's
   * existing zero-prop behavior. Never fires on the idle/loading/error stages. */
  onExtracted?: (documentId: string) => void;
};

export type PdfUploadProps = UsePdfUploadOptions;
