/**
 * Storybook-only stand-in for @helsoft/hooks. Re-exports real presentational hooks and
 * replaces useLessonAttempt / useSlideImageUrl (need Supabase). Aliased in main.ts viteFinal —
 * never used by Jest.
 */
export * from '../../../hooks/src/hooks/use-interaction-state';
export * from '../../../hooks/src/hooks/use-session';

import type { SlideImageRef } from '@helsoft/types';
import { useCallback, useState } from 'react';

export type LessonAttemptStatus = 'idle' | 'saving' | 'saved' | 'error';

export type LessonAttemptMockConfig = {
  status?: LessonAttemptStatus;
};

let pendingLessonAttemptConfig: LessonAttemptMockConfig = {};

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

// --- useSlideImageUrl ----------------------------------------------------------

export type SlideImageUrlMockConfig = {
  url?: string | null;
  isLoading?: boolean;
};

let pendingSlideImageConfig: SlideImageUrlMockConfig = {};

export const configureSlideImageUrlMock = (config: SlideImageUrlMockConfig) => {
  pendingSlideImageConfig = config;
};

/** Storybook stand-in — never hits Supabase storage. */
export const useSlideImageUrl = (_imageRef?: SlideImageRef) => {
  const [config] = useState(() => {
    const next = pendingSlideImageConfig;
    pendingSlideImageConfig = {};
    return next;
  });
  return {
    url: config.url ?? null,
    isLoading: config.isLoading ?? false,
  };
};
