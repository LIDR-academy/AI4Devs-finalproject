import { LessonAttemptService } from '@helsoft/supabase-services';
import type { LessonAttempt, NewLessonAttempt } from '@helsoft/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LessonAttemptStatus, UseLessonAttemptResult } from './use-lesson-attempt.types';

/**
 * React integration over LessonAttemptService (tanstack-query not installed → local state,
 * per spec.md Open decisions). Drives the results-summary Loading/Content/Error states.
 */
export const useLessonAttempt = (): UseLessonAttemptResult => {
  const [status, setStatus] = useState<LessonAttemptStatus>('idle');
  const [attempt, setAttempt] = useState<LessonAttempt | null>(null);
  const lastInput = useRef<NewLessonAttempt | null>(null);
  const isMounted = useRef(true);
  // Tracks whether a save is currently in flight. A ref (not `status` state) is required so
  // both call sites below — saveAttempt AND retry — see the guard synchronously, before either
  // triggers a re-render.
  const isSaving = useRef(false);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const runSave = useCallback((input: NewLessonAttempt) => {
    // Guard against overlapping saves (risk R4/R5) — a second invocation, whether via
    // saveAttempt or retry, while one is already in flight is refused, not queued. Enforced
    // once here so both call sites below share the same guarantee.
    if (isSaving.current) return;
    isSaving.current = true;
    lastInput.current = input;
    setStatus('saving');
    void LessonAttemptService.saveAttempt(input)
      .then((saved) => {
        isSaving.current = false;
        if (!isMounted.current) return;
        setAttempt(saved);
        setStatus('saved');
      })
      .catch(() => {
        isSaving.current = false;
        if (!isMounted.current) return;
        setStatus('error');
      });
  }, []);

  const saveAttempt = useCallback(
    (input: NewLessonAttempt) => {
      runSave(input);
    },
    [runSave],
  );

  const retry = useCallback(() => {
    if (!lastInput.current) return;
    runSave(lastInput.current);
  }, [runSave]);

  return { status, attempt, saveAttempt, retry };
};
