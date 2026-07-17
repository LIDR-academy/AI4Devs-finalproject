import type { LessonAttempt, NewLessonAttempt } from '@helsoft/types';

export type LessonAttemptStatus = 'idle' | 'saving' | 'saved' | 'error';

export type UseLessonAttemptResult = {
  status: LessonAttemptStatus;
  attempt: LessonAttempt | null;
  saveAttempt: (input: NewLessonAttempt) => void;
  retry: () => void;
};
