import { GENERATION_ERROR_CODES, LessonGenerationService } from '@helsoft/supabase-services';
import type {
  GenerateLessonRequest,
  GenerationError,
  GenerationProgressStep,
} from '@helsoft/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  LessonGenerationStage,
  UseLessonGenerationResult,
} from './use-lesson-generation.types';
import { useSession } from './use-session';

/** The fixed, ordered phase list the stepper advances through (@s14, spec.md "Progress
 * model") — mirrors the real server pipeline order so a later server-driven upgrade slots in
 * behind the same contract without touching the UI. */
export const GENERATION_STEP_ORDER = ['reading', 'generating', 'attaching'] as const;

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
  const [stage, setStage] = useState<LessonGenerationStage>('idle');
  const [currentStep, setCurrentStep] = useState<GenerationProgressStep>(GENERATION_STEP_ORDER[0]);
  const [result, setResult] = useState<UseLessonGenerationResult['result']>(undefined);
  const [error, setError] = useState<UseLessonGenerationResult['error']>(undefined);
  const stepperRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Remembers the last generate() request so retry() (task-13, @s15) can re-run the exact same
  // documentId/composition rather than requiring the caller to resupply it (no duplicate side
  // effects — mirrors usePdfExtraction's lastAttemptRef).
  const lastRequestRef = useRef<GenerateLessonRequest | null>(null);

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
      lastRequestRef.current = request;
      setStage('generating');
      setResult(undefined);
      setError(undefined);
      let stepIndex = 0;
      setCurrentStep(GENERATION_STEP_ORDER[0]);

      stopStepper();
      stepperRef.current = setInterval(() => {
        stepIndex = Math.min(stepIndex + 1, GENERATION_STEP_ORDER.length - 1);
        setCurrentStep(GENERATION_STEP_ORDER[stepIndex]);
      }, GENERATION_STEP_INTERVAL_MS);

      const userId = session?.user.id ?? '';
      try {
        const lesson = await LessonGenerationService.generate(request, userId);
        stopStepper();
        setResult(lesson);
        setStage('content');
      } catch (cause) {
        stopStepper();
        setError(isGenerationErrorShape(cause) ? cause.code : 'network_error');
        setStage('error');
      }
    },
    [session, stopStepper],
  );

  // task-13, @s15 — re-runs the last generate() request as-is; a no-op before any attempt.
  const retry = useCallback(() => {
    const lastRequest = lastRequestRef.current;
    return lastRequest ? generate(lastRequest) : Promise.resolve();
  }, [generate]);

  return { stage, currentStep, result, error, generate, retry };
};
