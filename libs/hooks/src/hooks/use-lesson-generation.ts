import { GENERATION_ERROR_CODES, LessonGenerationService } from '@helsoft/supabase-services';
import {
  GENERATION_PROGRESS_STEPS,
  type GenerateLessonRequest,
  type GenerationError,
} from '@helsoft/types';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import {
  useLessonGenerationInitialState,
  useLessonGenerationReducer,
} from './use-lesson-generation.reducer';
import type { UseLessonGenerationResult } from './use-lesson-generation.types';
import { useSession } from './use-session';

/** How long each step is shown before advancing to the next while the single `generate` call
 * is in flight — a tunable estimate (risks.md R9: reflects pipeline *order*, not real-time
 * completion), not derived from any real server signal. */
export const GENERATION_STEP_INTERVAL_MS = 4000;

/** Narrow runtime guard: a rejected LessonGenerationService.generate cause is only trusted as a
 * GenerationError when its `.code` is actually a member of the closed GenerationErrorCode union
 * (mirrors useAuth/useApiKey's isXErrorShape). Derives the closed set from
 * `LessonGenerationService`'s own exported `GENERATION_ERROR_CODES` rather than re-declaring an
 * independent, unchecked duplicate (mirrors `usePdfExtraction`'s reuse of
 * `PDF_EXTRACTION_ERROR_CODES`). */
const isGenerationErrorShape = (cause: unknown): cause is GenerationError => {
  const code = (cause as { code?: unknown } | null)?.code;
  return typeof code === 'string' && Object.hasOwn(GENERATION_ERROR_CODES, code);
};

/**
 * React integration over `LessonGenerationService` (never the DAO): a plain-state, one-shot
 * mutation hook (mirrors `useApiKey`/`usePdfExtraction` — tanstack-query not installed) that
 * also drives the multi-step progress stepper (@s14) while the single `generate` call is in
 * flight, settling to `content`/`error` on resolve.
 */
export const useLessonGeneration = (): UseLessonGenerationResult => {
  const { session } = useSession();
  const [state, dispatch] = useReducer(useLessonGenerationReducer, useLessonGenerationInitialState);
  const stepperRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Remembers the last generate() request so retry() (task-13, @s15) can re-run the exact same
  // documentId/composition rather than requiring the caller to resupply it (no duplicate side
  // effects — mirrors usePdfExtraction's lastAttemptRef).
  const lastRequestRef = useRef<GenerateLessonRequest | null>(null);
  // review.md round-1 finding #3 (major) — a plain ref (not `stage` state) so the guard is safe
  // even against two synchronous generate() calls in the same tick, before React ever commits
  // stage -> 'generating': set synchronously before the first `await`, so a second call made
  // before the first yields control sees it immediately. Blocks the duplicate in-flight LLM call
  // outright, which also means a stale first response can never clobber a later one — there is
  // no later one, the second call is a no-op.
  const isGeneratingRef = useRef(false);

  const stopStepper = useCallback(() => {
    if (stepperRef.current) {
      clearInterval(stepperRef.current);
      stepperRef.current = null;
    }
  }, []);

  // Stops a still-running stepper if the hook unmounts mid-generation.
  useEffect(() => stopStepper, [stopStepper]);

  const generate = useCallback(
    async (request: GenerateLessonRequest) => {
      // A no-op while a previous call is still in flight (review.md round-1 finding #3) — never
      // fires a second concurrent LLM call, so there is nothing left that could clobber state.
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;

      lastRequestRef.current = request;
      dispatch({ type: 'generate/start' });
      let stepIndex = 0;

      stopStepper();
      stepperRef.current = setInterval(() => {
        stepIndex = Math.min(stepIndex + 1, GENERATION_PROGRESS_STEPS.length - 1);
        dispatch({ type: 'generate/step', step: GENERATION_PROGRESS_STEPS[stepIndex] });
      }, GENERATION_STEP_INTERVAL_MS);

      const userId = session?.user.id ?? '';
      try {
        const lesson = await LessonGenerationService.generate(request, userId);
        dispatch({ type: 'generate/success', result: lesson });
      } catch (cause) {
        dispatch({
          type: 'generate/failure',
          error: isGenerationErrorShape(cause) ? cause.code : 'network_error',
        });
      } finally {
        stopStepper();
        isGeneratingRef.current = false;
      }
    },
    [session, stopStepper],
  );

  // task-13, @s15 — re-runs the last generate() request as-is; a no-op before any attempt.
  const retry = useCallback(() => {
    const lastRequest = lastRequestRef.current;
    return lastRequest ? generate(lastRequest) : Promise.resolve();
  }, [generate]);

  return {
    stage: state.stage,
    currentStep: state.currentStep,
    result: state.result,
    error: state.error,
    generate,
    retry,
  };
};
