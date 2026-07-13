export type PdfUploadPanelState = 'idle' | 'loading' | 'content' | 'error';

export type PdfUploadPanelProps = {
  state: PdfUploadPanelState;
  /** Picks a (new) file — disabled while `state` is 'loading' (@s5); stays enabled in every other
   * state, including 'error', so the panel is always "usable again". */
  onChooseFile: () => void;
  /** Max file size in MB for the idle constraints hint. Default mirrors `PDF_EXTRACTION_LIMITS`;
   * wiring should pass the live constant so the hint never drifts from the service ceiling. */
  maxMb?: number;
  /** Max page count for the idle constraints hint. Default mirrors `PDF_EXTRACTION_LIMITS`;
   * wiring should pass the live constant so the hint never drifts from the service ceiling. */
  maxPages?: number;
  /** Content-state summary fields (@s6). */
  filename?: string;
  pageCount?: number;
  imageCount?: number;
  /** The image-count row's already-pluralized, screen-reader announcement (e.g. i18next's
   * `upload.imageCount_one`/`_other`, task-13) — falls back to a plain composed
   * `"{imageCountLabel}: {imageCount}"` label when omitted (N5, accessibility review round-1 fix). */
  imageCountAnnouncement?: string;
  /** Content-state continue affordance (@s6) — the generation hand-off is out of scope here. */
  onContinue?: () => void;
  /** Error-state message for the current `PdfExtractionErrorCode` (@s8-@s13) — already localized
   * by the wiring layer. */
  errorMessage?: string;
  /** Error-state retry affordance (@s8-@s13) — re-attempts the last extraction. */
  onRetry?: () => void;
  /** Whether the Error-state retry affordance should render at all. Defaults to `true`. The
   * wiring layer sets this to `false` for the 6 non-transient `PdfExtractionErrorCode`s
   * (spec.md's Error contract table) — where `retry()` would deterministically reproduce the
   * same failure — since the persistent choose-file control is already the real recovery action
   * for those. */
  canRetry?: boolean;
};
