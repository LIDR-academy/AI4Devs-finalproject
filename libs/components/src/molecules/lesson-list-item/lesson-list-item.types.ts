export type LessonListItemProps = {
  title: string;
  createdDateLabel: string;
  onOpen: () => void;
  openAccessibilityLabel: string;
  /** Optional delete affordance — wired in task-6. */
  onDelete?: () => void;
  deleteAccessibilityLabel?: string;
};
