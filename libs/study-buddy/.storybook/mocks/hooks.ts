/**
 * Storybook-only stand-in for @helsoft/hooks. Re-exports the real, presentational hooks
 * (reached via a relative import into the sibling package's source, bypassing this same
 * alias — mirrors libs/study-buddy/jest.config.js's setupFiles reaching into
 * ../components/src/theme/unistyles.ts the same way) and replaces hooks that hit Supabase
 * with fake, story-configurable implementations. Aliased in main.ts's viteFinal — never
 * resolved by Jest or the real app build.
 */
export * from '../../../hooks/src/hooks/use-interaction-state';
export * from '../../../hooks/src/hooks/use-session';

import type {
  ApiKeyErrorCode,
  ApiKeyStatus,
  GeneratedLesson,
  GenerateLessonRequest,
  GenerationErrorCode,
  GenerationProgressStep,
  LessonSummary,
} from '@helsoft/types';
import { useCallback, useState } from 'react';

export type AuthErrorCode = 'invalid_credentials' | 'network_error';

export type AuthMockConfig = {
  isSubmitting?: boolean;
  error?: AuthErrorCode | null;
  scenario?: 'success' | 'invalidCredentials' | 'networkError';
};

let pendingConfig: AuthMockConfig = {};

/** Call from a story's decorator just before it renders, so useAuth's lazy initializer
 * below picks it up on that story's first (and only) mount. */
export const configureAuthMock = (config: AuthMockConfig) => {
  pendingConfig = config;
};

const SIGN_IN_DELAY_MS = 400;
const SIGN_OUT_DELAY_MS = 300;

export const useAuth = () => {
  const [config] = useState(() => {
    const next = pendingConfig;
    pendingConfig = {};
    return next;
  });
  const [isSubmitting, setIsSubmitting] = useState(config.isSubmitting ?? false);
  const [error, setError] = useState<AuthErrorCode | null>(config.error ?? null);

  const signIn = useCallback(
    (_email: string, _password: string): Promise<void> =>
      new Promise((resolve, reject) => {
        setIsSubmitting(true);
        setError(null);
        setTimeout(() => {
          setIsSubmitting(false);
          if (config.scenario === 'invalidCredentials') {
            setError('invalid_credentials');
            reject(new Error('invalid_credentials'));
            return;
          }
          if (config.scenario === 'networkError') {
            setError('network_error');
            reject(new Error('network_error'));
            return;
          }
          resolve();
        }, SIGN_IN_DELAY_MS);
      }),
    [config.scenario],
  );

  const signOut = useCallback(
    (): Promise<void> =>
      new Promise((resolve) => {
        setIsSubmitting(true);
        setTimeout(() => {
          setIsSubmitting(false);
          resolve();
        }, SIGN_OUT_DELAY_MS);
      }),
    [],
  );

  return { signIn, signOut, isSubmitting, error };
};

export type LessonAttemptStatus = 'idle' | 'saving' | 'saved' | 'error';

export type LessonAttemptMockConfig = {
  status?: LessonAttemptStatus;
};

let pendingLessonAttemptConfig: LessonAttemptMockConfig = {};

/** Call from a story's decorator just before it renders, so useLessonAttempt's lazy
 * initializer below picks it up on that story's first (and only) mount. */
export const configureLessonAttemptMock = (config: LessonAttemptMockConfig) => {
  pendingLessonAttemptConfig = config;
};

export const useLessonAttempt = () => {
  const [config] = useState(() => {
    const next = pendingLessonAttemptConfig;
    pendingLessonAttemptConfig = {};
    return next;
  });
  const [status] = useState<LessonAttemptStatus>(config.status ?? 'idle');
  const saveAttempt = useCallback(() => {}, []);
  const retry = useCallback(() => {}, []);

  return { status, attempt: null, saveAttempt, retry };
};

// --- useApiKey -----------------------------------------------------------------

export type ApiKeyMockConfig = {
  status?: ApiKeyStatus;
  isLoading?: boolean;
  isSubmitting?: boolean;
  error?: ApiKeyErrorCode | null;
  scenario?: 'success' | 'networkError';
};

let pendingApiKeyConfig: ApiKeyMockConfig = {};

export const configureApiKeyMock = (config: ApiKeyMockConfig) => {
  pendingApiKeyConfig = config;
};

const API_KEY_DELAY_MS = 400;

export const useApiKey = () => {
  const [config] = useState(() => {
    const next = pendingApiKeyConfig;
    pendingApiKeyConfig = {};
    return next;
  });
  const [status, setStatus] = useState<ApiKeyStatus>(config.status ?? { hasKey: false });
  const [isLoading] = useState(config.isLoading ?? false);
  const [isSubmitting, setIsSubmitting] = useState(config.isSubmitting ?? false);
  const [error, setError] = useState<ApiKeyErrorCode | null>(config.error ?? null);

  const saveApiKey = useCallback(
    (_rawKey: string): Promise<void> =>
      new Promise((resolve, reject) => {
        setIsSubmitting(true);
        setError(null);
        setTimeout(() => {
          setIsSubmitting(false);
          if (config.scenario === 'networkError') {
            setError('network_error');
            reject(new Error('network_error'));
            return;
          }
          setStatus({
            hasKey: true,
            provider: 'groq',
            updatedAt: new Date().toISOString(),
          });
          resolve();
        }, API_KEY_DELAY_MS);
      }),
    [config.scenario],
  );

  const removeApiKey = useCallback(
    (): Promise<void> =>
      new Promise((resolve, reject) => {
        setIsSubmitting(true);
        setError(null);
        setTimeout(() => {
          setIsSubmitting(false);
          if (config.scenario === 'networkError') {
            setError('network_error');
            reject(new Error('network_error'));
            return;
          }
          setStatus({ hasKey: false });
          resolve();
        }, API_KEY_DELAY_MS);
      }),
    [config.scenario],
  );

  return { status, isLoading, isSubmitting, error, saveApiKey, removeApiKey };
};

// --- useLessons ----------------------------------------------------------------

export type LessonsMockConfig = {
  lessons?: LessonSummary[];
  isLoading?: boolean;
  error?: Error | null;
};

let pendingLessonsConfig: LessonsMockConfig = {};

export const configureLessonsMock = (config: LessonsMockConfig) => {
  pendingLessonsConfig = config;
};

export const useLessons = () => {
  const [config] = useState(() => {
    const next = pendingLessonsConfig;
    pendingLessonsConfig = {};
    return next;
  });
  const [lessons, setLessons] = useState<LessonSummary[]>(config.lessons ?? []);
  const [isLoading] = useState(config.isLoading ?? false);
  const [error, setError] = useState<Error | null>(config.error ?? null);

  const refetch = useCallback(() => {
    setError(null);
  }, []);

  const deleteLesson = useCallback((id: string): Promise<void> => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    return Promise.resolve();
  }, []);

  return { lessons, isLoading, error, refetch, deleteLesson };
};

// --- useLessonGeneration -------------------------------------------------------

export type LessonGenerationStage = 'idle' | 'generating' | 'content' | 'error';

export type LessonGenerationMockConfig = {
  stage?: LessonGenerationStage;
  currentStep?: GenerationProgressStep;
  result?: GeneratedLesson;
  error?: GenerationErrorCode;
};

let pendingLessonGenerationConfig: LessonGenerationMockConfig = {};

export const configureLessonGenerationMock = (config: LessonGenerationMockConfig) => {
  pendingLessonGenerationConfig = config;
};

const GENERATE_DELAY_MS = 600;

export const useLessonGeneration = () => {
  const [config] = useState(() => {
    const next = pendingLessonGenerationConfig;
    pendingLessonGenerationConfig = {};
    return next;
  });
  const [stage, setStage] = useState<LessonGenerationStage>(config.stage ?? 'idle');
  const [currentStep] = useState<GenerationProgressStep>(config.currentStep ?? 'reading');
  const [result, setResult] = useState<GeneratedLesson | undefined>(config.result);
  const [error, setError] = useState<GenerationErrorCode | undefined>(config.error);

  const generate = useCallback(
    (request: GenerateLessonRequest): Promise<void> =>
      new Promise((resolve) => {
        setStage('generating');
        setError(undefined);
        setTimeout(() => {
          if (config.error) {
            setStage('error');
            setError(config.error);
            resolve();
            return;
          }
          const next: GeneratedLesson = config.result ?? {
            lessonId: 'lesson-story-1',
            title: 'Generated lesson',
            composition: request.composition,
            slides: [],
          };
          setResult(next);
          setStage('content');
          resolve();
        }, GENERATE_DELAY_MS);
      }),
    [config.error, config.result],
  );

  const retry = useCallback((): Promise<void> => {
    if (!result && !error) return Promise.resolve();
    return generate({
      documentId: 'doc-story-1',
      composition: result?.composition ?? 'both',
    });
  }, [error, generate, result]);

  return { stage, currentStep, result, error, generate, retry };
};
