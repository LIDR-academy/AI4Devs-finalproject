import {
  GENERATION_PROGRESS_STEPS,
  type GeneratedLesson,
  type GenerationErrorCode,
  type GenerationProgressStep,
} from '@helsoft/types';

import type { LessonGenerationStage } from './use-lesson-generation.types';

type State = {
  stage: LessonGenerationStage;
  currentStep: GenerationProgressStep;
  result: GeneratedLesson | undefined;
  error: GenerationErrorCode | undefined;
};

type Action =
  | { type: 'generate/start' }
  | { type: 'generate/step'; step: GenerationProgressStep }
  | { type: 'generate/success'; result: GeneratedLesson }
  | { type: 'generate/failure'; error: GenerationErrorCode };

export const useLessonGenerationInitialState: State = {
  stage: 'idle',
  currentStep: GENERATION_PROGRESS_STEPS[0],
  result: undefined,
  error: undefined,
};

export function useLessonGenerationReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'generate/start':
      return {
        stage: 'generating',
        currentStep: GENERATION_PROGRESS_STEPS[0],
        result: undefined,
        error: undefined,
      };
    case 'generate/step':
      return { ...state, currentStep: action.step };
    case 'generate/success':
      return { ...state, stage: 'content', result: action.result };
    case 'generate/failure':
      return { ...state, stage: 'error', error: action.error };
  }
}
