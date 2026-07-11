import { useCallback, useEffect, useRef, useState } from 'react';
import { LessonAttemptService } from '@helsoft/services';
import type { LessonAttempt, NewLessonAttempt } from '@helsoft/types';

export type LessonAttemptStatus = 'idle' | 'saving' | 'saved' | 'error';

export type UseLessonAttemptResult = {
  status: LessonAttemptStatus;
  attempt: LessonAttempt | null;
  saveAttempt: (input: NewLessonAttempt) => void;
  retry: () => void;
};

/**
 * React integration over LessonAttemptService (tanstack-query not installed → local state,
 * per spec.md Open decisions). Drives the results-summary Loading/Content/Error states.
 */
export const useLessonAttempt = (): UseLessonAttemptResult => {
  const [status, setStatus] = useState<LessonAttemptStatus>('idle');
  const [attempt, setAttempt] = useState<LessonAttempt | null>(null);
  const lastInput = useRef<NewLessonAttempt | null>(null);
  const isMounted = useRef(true);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const runSave = useCallback((input: NewLessonAttempt) => {
    lastInput.current = input;
    setStatus('saving');
    void LessonAttemptService.saveAttempt(input)
      .then((saved) => {
        if (!isMounted.current) return;
        setAttempt(saved);
        setStatus('saved');
      })
      .catch(() => {
        if (!isMounted.current) return;
        setStatus('error');
      });
  }, []);

  const saveAttempt = useCallback(
    (input: NewLessonAttempt) => {
      // Guard against overlapping saves (risk R4/R5) — a second call while one is already in
      // flight is refused, not queued.
      if (status === 'saving') return;
      runSave(input);
    },
    [runSave, status],
  );

  const retry = useCallback(() => {
    if (!lastInput.current) return;
    runSave(lastInput.current);
  }, [runSave]);

  return { status, attempt, saveAttempt, retry };
};
