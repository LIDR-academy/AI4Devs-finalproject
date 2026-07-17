import { LessonsService } from '@helsoft/supabase-services';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import { nextRequestId } from './next-request-id';
import { useLessonInitialState, useLessonReducer } from './use-lesson.reducer';
import type { UseLessonResult } from './use-lesson.types';

/**
 * React integration over LessonsService.getLesson. Drives player Loading / Content / Empty /
 * Error via `{ lesson, isLoading, error, refetch }`. Empty = loaded lesson with slides: [].
 */
export const useLesson = (id: string): UseLessonResult => {
  const [state, dispatch] = useReducer(useLessonReducer, useLessonInitialState);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const req = nextRequestId(requestId.current);
    requestId.current = req;
    dispatch({ type: 'load/start' });

    void LessonsService.getLesson(id)
      .then((lesson) => {
        if (req !== requestId.current) return;
        dispatch({ type: 'load/success', lesson });
      })
      .catch((cause: unknown) => {
        if (req !== requestId.current) return;
        dispatch({
          type: 'load/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  return {
    lesson: state.lesson,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
};
