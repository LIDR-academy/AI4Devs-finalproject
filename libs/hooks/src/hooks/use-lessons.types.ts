import type { LessonSummary } from '@helsoft/types';

export type UseLessonsResult = {
  lessons: LessonSummary[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
