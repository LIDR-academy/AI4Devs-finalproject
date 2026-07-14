export type LessonListState = 'loading' | 'content' | 'empty' | 'error';

export type LessonListItemData = {
  id: string;
  title: string;
  createdDateLabel: string;
  openAccessibilityLabel: string;
};

export type LessonListLabels = {
  loading: string;
  empty: string;
  error: string;
  retry: string;
};

export type LessonListProps = {
  state: LessonListState;
  lessons: LessonListItemData[];
  labels: LessonListLabels;
  onOpenLesson: (id: string) => void;
  onRetry: () => void;
  /** Optional delete affordance — wired in task-6. */
  onDelete?: (id: string) => void;
  deleteLabel?: string;
};
