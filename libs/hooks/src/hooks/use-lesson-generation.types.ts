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
};
