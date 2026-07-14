export type LessonListState = 'loading' | 'content' | 'empty' | 'error';

export type LessonListItemData = {
  id: string;
  title: string;
  createdDateLabel: string;
  openAccessibilityLabel: string;
  /** Per-item delete control name (@s16); falls back to list-level `deleteLabel`. */
  deleteAccessibilityLabel?: string;
};

export type LessonListLabels = {
  loading: string;
  empty: string;
  error: string;
  retry: string;
  /** Delete-confirmation Dialog copy (@s8/@s9) — required when `onDelete` is wired. */
  deleteConfirmHeadline?: string;
  deleteConfirmBody?: string;
  deleteConfirmAction?: string;
  deleteConfirmCancelAction?: string;
};

export type LessonListProps = {
  state: LessonListState;
  lessons: LessonListItemData[];
  labels: LessonListLabels;
  onOpenLesson: (id: string) => void;
  onRetry: () => void;
  /** Delete affordance — fires only after the confirmation Dialog is accepted (@s8/@s9). */
  onDelete?: (id: string) => void;
  deleteLabel?: string;
};
