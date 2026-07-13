import { LessonGenerationService } from '@helsoft/supabase-services';
import type {
  GenerateLessonRequest,
  GenerationError,
  GenerationErrorCode,
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
 * (mirrors useAuth/useApiKey's isXErrorShape). */
const GENERATION_ERROR_CODES: ReadonlySet<GenerationErrorCode> = new Set([
  'missing_key',
  'invalid_key',
  'rate_limited',
  'timeout',
  'generation_failed',
  'document_not_ready',
  'network_error',
  'unauthenticated',
]);

const isGenerationErrorShape = (cause: unknown): cause is GenerationError =>
  GENERATION_ERROR_CODES.has((cause as { code?: unknown } | null)?.code as GenerationErrorCode);

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

  return { stage, currentStep, result, error, generate };
};
