import { useEffect, useRef } from 'react';
import { ResultsSummary } from '@helsoft/components';
import { useLessonAttempt } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { GradedAnswer, Lesson, ScorableSlide } from '@helsoft/types';

import { scoreLesson } from '../../grading/score-lesson';

export type LessonResultsProps = {
  lesson: Lesson;
  answers: GradedAnswer[];
  onRetake: () => void;
  onBackToLessons: () => void;
};

const PERCENT_MULTIPLIER = 100;

const toScorableSlides = (lesson: Lesson): ScorableSlide[] =>
  lesson.slides
    .filter((slide) => slide.kind === 'activity')
    .map((slide) => ({ id: slide.id, activityType: slide.activityType }));

/**
 * LessonResults — feature component wiring the pure `scoreLesson` scorer and
 * `useLessonAttempt()`/`useLocalization()` to the presentational `ResultsSummary`. Covers the
 * scorable happy path + loading (task-7); completion/error/retry land in task-8/9.
 */
export const LessonResults = ({ lesson, answers, onRetake, onBackToLessons }: LessonResultsProps) => {
  const { t } = useLocalization();
  const { status, saveAttempt } = useLessonAttempt();

  const summary = scoreLesson(toScorableSlides(lesson), answers);
  const percent = Math.round((summary.correct / summary.total) * PERCENT_MULTIPLIER);

  // Save exactly once per completion (risk R5) — a re-render (e.g. a parent state change)
  // must not re-fire the insert; only an actual remount resets this guard.
  const hasSaved = useRef(false);
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    saveAttempt({ lessonId: lesson.id, score: summary.correct, total: summary.total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResultsSummary
      variant="score"
      loading={status === 'saving'}
      labels={{
        score: t('results.score', { correct: summary.correct, total: summary.total }),
        percent: t('results.scorePercent', { percent }),
        retake: t('results.retake'),
        backToLessons: t('results.backHome'),
      }}
      onRetake={onRetake}
      onBackToLessons={onBackToLessons}
    />
  );
};
