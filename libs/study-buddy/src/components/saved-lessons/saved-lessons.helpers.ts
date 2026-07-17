import type { LessonListItemData, LessonListState } from '@helsoft/components';
import type { LessonSummary } from '@helsoft/types';

/** Maps useLessons flags → LessonList state (@s4/@s5/@s13/@s14). */
export const toLessonListState = (
  isLoading: boolean,
  error: Error | null,
  lessonCount: number,
): LessonListState => {
  if (isLoading) return 'loading';
  // Load Error only when the list is gone (@s14). Delete failures keep lessons — stay Content.
  if (error && lessonCount === 0) return 'error';
  if (lessonCount === 0) return 'empty';
  return 'content';
};

/** Locale-aware medium date for a lesson createdAt ISO string. */
export const formatLessonCreatedDate = (iso: string, locale: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Maps LessonSummary[] → LessonList item props with resolved labels. */
export const toLessonListItems = (
  lessons: LessonSummary[],
  locale: string,
  t: Translate,
): LessonListItemData[] =>
  lessons.map((lesson) => {
    const date = formatLessonCreatedDate(lesson.createdAt, locale);
    return {
      id: lesson.id,
      title: lesson.title,
      createdDateLabel: t('home.createdDate', { date }),
      openAccessibilityLabel: t('home.openLesson', { title: lesson.title }),
      deleteAccessibilityLabel: t('home.delete.action', { title: lesson.title }),
    };
  });
