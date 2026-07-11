import { useEffect, useRef } from 'react';
import { ResultsSummary } from '@helsoft/components';
import { useLessonAttempt } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { GradedAnswer, Lesson, ScorableSlide } from '@helsoft/types';

import { scoreLesson } from './score-lesson';

export type LessonResultsProps = {
  lesson: Lesson;
  answers: GradedAnswer[];
  onRetake: () => void;
  onBackToLessons: () => void;
};

const PERCENT_MULTIPLIER = 100;

/** Exported for direct unit coverage of the activity-only projection. */
export const toScorableSlides = (lesson: Lesson): ScorableSlide[] =>
  lesson.slides
    .filter((slide) => slide.kind === 'activity')
    .map((slide) => ({ id: slide.id, activityType: slide.activityType }));

/**
 * LessonResults — organism owning scoreLesson + save + i18n, wiring presentational
 * ResultsSummary. Completion variant (no save) when nothing system-checked; otherwise
 * score variant with loading/save-failure from useLessonAttempt.
 */
export const LessonResults = ({ lesson, answers, onRetake, onBackToLessons }: LessonResultsProps) => {
  const { t } = useLocalization();
  const { status, saveAttempt, retry } = useLessonAttempt();

  const summary = scoreLesson(toScorableSlides(lesson), answers);
  const percent = Math.round((summary.correct / summary.total) * PERCENT_MULTIPLIER);
  const scoreLabel = t('results.score', { correct: summary.correct, total: summary.total });
  const percentLabel = t('results.scorePercent', { percent });

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
        score: scoreLabel,
        percent: percentLabel,
        scoreAnnouncement: t('results.scoreAnnouncement', { score: scoreLabel, percent: percentLabel }),
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
