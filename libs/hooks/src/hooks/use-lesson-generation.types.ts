import type {
  GeneratedLesson,
  GenerateLessonRequest,
  GenerationErrorCode,
  GenerationProgressStep,
} from '@helsoft/types';

export type LessonGenerationStage = 'idle' | 'generating' | 'content' | 'error';

export type UseLessonGenerationResult = {
  stage: LessonGenerationStage;
  /** The current step of the fixed `reading -> generating -> attaching` phase list (@s14) —
   * only meaningful while `stage === 'generating'`. */
  currentStep: GenerationProgressStep;
  result: GeneratedLesson | undefined;
  error: GenerationErrorCode | undefined;
  generate: (request: GenerateLessonRequest) => Promise<void>;
  /** Re-invokes `generate` with the exact same request as the last attempt (task-13, @s15) — a
   * no-op before any `generate` call has ever been made. */
  retry: () => Promise<void>;
};
