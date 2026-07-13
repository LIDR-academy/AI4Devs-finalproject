import { ResultsSummary } from '@helsoft/components';

import type { LessonResultsProps } from './lesson-results.types';
import { useLessonResults } from './use-lesson-results';

export { toScorableSlides } from './lesson-results.helpers';

/**
 * LessonResults — organism owning scoreLesson + save + i18n, wiring presentational
 * ResultsSummary. Completion variant (no save) when nothing system-checked; otherwise
 * score variant with loading/save-failure from useLessonAttempt.
 */
export const LessonResults = ({
  lesson,
  answers,
  onRetake,
  onBackToLessons,
}: LessonResultsProps) => {
  const { variant, loading, saveFailed, labels, onRetrySave } = useLessonResults({
    lesson,
    answers,
  });

  return (
    <ResultsSummary
      variant={variant}
      loading={loading}
      saveFailed={saveFailed}
      labels={labels}
      onRetake={onRetake}
      onBackToLessons={onBackToLessons}
      onRetrySave={onRetrySave}
    />
  );
};
