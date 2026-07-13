import { useEffect, useRef } from 'react';
import { useLessonAttempt } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { GradedAnswer, Lesson } from '@helsoft/types';

import { toScorableSlides } from './lesson-results.helpers';
import { scoreLesson } from './score-lesson';

const PERCENT_MULTIPLIER = 100;

type UseLessonResultsArgs = {
  lesson: Lesson;
  answers: GradedAnswer[];
};

/**
 * Score derivation + one-shot attempt save + localized ResultsSummary labels.
 */
export const useLessonResults = ({ lesson, answers }: UseLessonResultsArgs) => {
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

  return {
    variant: summary.isScorable ? ('score' as const) : ('completion' as const),
    loading: status === 'saving',
    saveFailed: status === 'error',
    labels: {
      score: scoreLabel,
      percent: percentLabel,
      scoreAnnouncement: t('results.scoreAnnouncement', { score: scoreLabel, percent: percentLabel }),
      retake: t('results.retake'),
      backToLessons: t('results.backHome'),
      completeHeadline: t('results.completeHeadline'),
      completeBody: t('results.completeBody'),
      saveFailed: t('results.saveFailed'),
      retrySave: t('results.retrySave'),
    },
    onRetrySave: retry,
  };
};
