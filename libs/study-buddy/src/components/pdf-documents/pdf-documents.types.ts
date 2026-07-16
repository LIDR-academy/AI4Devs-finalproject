export type PdfDocumentsProps = {
  /** Ready/failed row Generate/Retry → screen sets active documentId (@s5/@s6). */
  onGenerate?: (documentId: string) => void;
  /** Generated row Open lesson → navigate to player with lessonId (@s7). */
  onOpenLesson: (lessonId: string) => void;
  /** Bumped by upload screen on extract/generate so the list refetches (@s9/@s10). */
  reloadToken?: number;
};
