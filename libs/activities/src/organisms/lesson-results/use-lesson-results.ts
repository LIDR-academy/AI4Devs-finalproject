import { useLessonAttempt } from '@helsoft/hooks';
import type { GradedAnswer, Lesson } from '@helsoft/types';
import { useEffect, useRef } from 'react';

import { toScorableSlides } from './lesson-results.helpers';
import { scoreLesson } from './score-lesson';

type UseLessonResultsArgs = {
  lesson: Lesson;
  answers: GradedAnswer[];
  persistOnMount?: boolean;
};

/**
 * Score derivation + one-shot attempt save. ResultsSummary owns every localized label itself.
 * `persistOnMount: false` skips save (deck already persisted this session — @s21).
 */
export const useLessonResults = ({
  lesson,
  answers,
  persistOnMount = true,
}: UseLessonResultsArgs) => {
  const { status, saveAttempt, retry } = useLessonAttempt();

  const summary = scoreLesson(toScorableSlides(lesson), answers);

  const hasSaved = useRef(false);
  useEffect(() => {
    if (!persistOnMount) return;
    if (!summary.isScorable) return;
    if (hasSaved.current) return;
    hasSaved.current = true;
    saveAttempt({ lessonId: lesson.id, score: summary.correct, total: summary.total });
  }, [
    persistOnMount,
    summary.isScorable,
    summary.correct,
    summary.total,
    lesson.id,
    saveAttempt,
  ]);

  return {
    variant: summary.isScorable ? ('score' as const) : ('completion' as const),
    loading: status === 'saving',
    saveFailed: status === 'error',
    correct: summary.correct,
    total: summary.total,
    onRetrySave: retry,
  };
};
