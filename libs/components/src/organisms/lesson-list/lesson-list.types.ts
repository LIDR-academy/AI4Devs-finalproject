export type LessonListState = 'loading' | 'content' | 'empty' | 'error';

export type LessonListItemData = {
  id: string;
  title: string;
  createdDateLabel: string;
  openAccessibilityLabel: string;
  /** Per-item delete control name (@s16); falls back to list-level `deleteLabel`. */
  deleteAccessibilityLabel?: string;
};

export type LessonListBaseLabels = {
  loading: string;
  empty: string;
  error: string;
  retry: string;
};

/** Delete-confirmation Dialog copy (@s8/@s9) — required when `onDelete` is wired. */
export type LessonListDeleteLabels = {
  deleteConfirmHeadline: string;
  deleteConfirmBody: string;
  deleteConfirmAction: string;
  deleteConfirmCancelAction: string;
};

export type LessonListLabels = LessonListBaseLabels & Partial<LessonListDeleteLabels>;

type LessonListSharedProps = {
  state: LessonListState;
  lessons: LessonListItemData[];
  onOpenLesson: (id: string) => void;
  onRetry: () => void;
  deleteLabel?: string;
};

export type LessonListProps =
  | (LessonListSharedProps & {
      onDelete?: undefined;
      labels: LessonListBaseLabels & Partial<LessonListDeleteLabels>;
    })
  | (LessonListSharedProps & {
      onDelete: (id: string) => void;
      labels: LessonListBaseLabels & LessonListDeleteLabels;
    });
