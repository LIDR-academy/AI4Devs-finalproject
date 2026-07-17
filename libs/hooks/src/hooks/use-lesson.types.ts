import type { Lesson } from '@helsoft/types';

export type UseLessonResult = {
  lesson: Lesson | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
