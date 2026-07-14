import type { GradedAnswer, Lesson } from '@helsoft/types';

export type LessonResultsProps = {
  lesson: Lesson;
  answers: GradedAnswer[];
  onRetake: () => void;
  onBackToLessons: () => void;
  /**
   * When false, skips the save-on-mount attempt persist (deck already saved this session).
   * Defaults to true for backward-compatible R7 behavior.
   */
  persistOnMount?: boolean;
};
