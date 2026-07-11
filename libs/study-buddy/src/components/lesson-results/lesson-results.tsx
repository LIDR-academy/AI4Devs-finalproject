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
 * `useLessonAttempt()`/`useLocalization()` to the presentational `ResultsSummary`. Renders the
 * completion variant (no save) when `scoreLesson` finds nothing system-checked (@s8/@s9);
 * otherwise the score variant, binding the hook's `saving`/`error` status to the loading and
 * save-failure affordances (@s5/@s7) and `retry` to the retry action.
 */
export const LessonResults = ({ lesson, answers, onRetake, onBackToLessons }: LessonResultsProps) => {
  const { t } = useLocalization();
  const { status, saveAttempt, retry } = useLessonAttempt();

  const summary = scoreLesson(toScorableSlides(lesson), answers);
  // Unrendered (and NaN via a 0/0 division) for the completion variant — scoreLesson only
  // reports isScorable: false when total is 0, so a guard here would be dead code.
  const percent = Math.round((summary.correct / summary.total) * PERCENT_MULTIPLIER);

  // Save exactly once per completion (risk R5) — a re-render (e.g. a parent state change)
  // must not re-fire the insert; only an actual remount resets this guard. Nothing is ever
  // saved for an unscorable lesson (@s8/@s9) — no attempt record is created.
  const hasSaved = useRef(false);
  useEffect(() => {
    if (!summary.isScorable) return;
    if (hasSaved.current) return;
    hasSaved.current = true;
    saveAttempt({ lessonId: lesson.id, score: summary.correct, total: summary.total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResultsSummary
      variant={summary.isScorable ? 'score' : 'completion'}
      loading={status === 'saving'}
      saveFailed={status === 'error'}
      labels={{
        score: t('results.score', { correct: summary.correct, total: summary.total }),
        percent: t('results.scorePercent', { percent }),
        retake: t('results.retake'),
        backToLessons: t('results.backHome'),
        completeHeadline: t('results.completeHeadline'),
        completeBody: t('results.completeBody'),
        saveFailed: t('results.saveFailed'),
        retrySave: t('results.retrySave'),
      }}
      onRetake={onRetake}
      onBackToLessons={onBackToLessons}
      onRetrySave={retry}
    />
  );
};
