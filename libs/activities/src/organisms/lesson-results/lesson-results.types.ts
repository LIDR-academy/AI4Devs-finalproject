import type { GradedAnswer, Lesson } from '@helsoft/types';

export type LessonResultsProps = {
  lesson: Lesson;
  answers: GradedAnswer[];
  onRetake: () => void;
  onBackToLessons: () => void;
};
