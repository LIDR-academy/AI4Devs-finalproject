import { useLessonAttempt } from '@helsoft/hooks';
import type { GradedAnswer, Lesson } from '@helsoft/types';
import { useEffect, useRef } from 'react';

import { toScorableSlides } from './lesson-results.helpers';
import { scoreLesson } from './score-lesson';

type UseLessonResultsArgs = {
  lesson: Lesson;
  answers: GradedAnswer[];
};

/**
 * Score derivation + one-shot attempt save. ResultsSummary owns every localized label itself.
 */
export const useLessonResults = ({ lesson, answers }: UseLessonResultsArgs) => {
  const { status, saveAttempt, retry } = useLessonAttempt();

  const summary = scoreLesson(toScorableSlides(lesson), answers);

  const hasSaved = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: save-once-on-mount effect; hasSaved guards re-entry and the attempt must not re-save on re-render
  useEffect(() => {
    if (!summary.isScorable) return;
    if (hasSaved.current) return;
    hasSaved.current = true;
    saveAttempt({ lessonId: lesson.id, score: summary.correct, total: summary.total });
  }, []);

  return {
    variant: summary.isScorable ? ('score' as const) : ('completion' as const),
    loading: status === 'saving',
    saveFailed: status === 'error',
    correct: summary.correct,
    total: summary.total,
    onRetrySave: retry,
  };
};
