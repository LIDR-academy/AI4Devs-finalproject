import {
  LessonResults as LessonResultsOrganism,
  type LessonResultsProps,
} from '@helsoft/activities';

export type { LessonResultsProps };

/** Thin feature wiring — organism owns scoring, save, and i18n. */
export const LessonResults = (props: LessonResultsProps) => <LessonResultsOrganism {...props} />;
