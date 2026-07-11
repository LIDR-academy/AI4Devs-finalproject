/**
 * Storybook-only stand-in for @helsoft/hooks. Re-exports real presentational hooks and
 * replaces useLessonAttempt (needs Supabase). Aliased in main.ts viteFinal — never used by Jest.
 */
export * from '../../../hooks/src/hooks/use-interaction-state';
export * from '../../../hooks/src/hooks/use-session';

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
