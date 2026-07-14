export type LessonProgressIndicatorProps = {
  /** 1-based current step. */
  current: number;
  /** Total steps (content slides + results). */
  total: number;
  /** Localized "slide X of N" label (caller resolves via t()). */
  label: string;
};
