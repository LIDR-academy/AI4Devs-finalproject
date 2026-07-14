import type { Lesson } from '@helsoft/types';

export type LessonPlayerProps = {
  /** Loaded lesson; null when load failed (pair with `error`). */
  lesson: Lesson | null;
  /** Present when the lesson fetch failed (@s16). */
  error?: Error | null;
  /** Re-runs the load via `useLesson.refetch` (@s16). */
  onRetry?: () => void;
  onBackToLessons: () => void;
};
