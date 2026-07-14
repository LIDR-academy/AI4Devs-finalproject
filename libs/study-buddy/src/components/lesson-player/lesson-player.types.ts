import type { Lesson } from '@helsoft/types';

export type LessonPlayerProps = {
  lesson: Lesson;
  onBackToLessons: () => void;
};
