import { LessonsService } from '@helsoft/supabase-services';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useLessonsInitialState, useLessonsReducer } from './use-lessons.reducer';
import type { UseLessonsResult } from './use-lessons.types';

/**
 * React integration over LessonsService (tanstack-query not installed → local state,
 * per spec.md Open decisions). Drives Home Loading/Content/Empty/Error via
 * `{ lessons, isLoading, error, refetch, deleteLesson }`.
 */
export const useLessons = (): UseLessonsResult => {
  const [state, dispatch] = useReducer(useLessonsReducer, useLessonsInitialState);
  const isMounted = useRef(true);
  // Incremented to cancel an in-flight load when a newer one starts (mount or refetch).
  const requestId = useRef(0);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const load = useCallback(() => {
    const id = ++requestId.current;
    dispatch({ type: 'load/start' });

    void LessonsService.getLessons()
      .then((next) => {
        if (id !== requestId.current || !isMounted.current) return;
        dispatch({ type: 'load/success', lessons: next });
      })
      .catch((cause: unknown) => {
        if (id !== requestId.current || !isMounted.current) return;
        dispatch({
          type: 'load/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  const deleteLesson = useCallback(async (id: string) => {
    try {
      await LessonsService.deleteLesson(id);
      if (!isMounted.current) return;
      dispatch({ type: 'delete/success', id });
    } catch (cause) {
      if (isMounted.current) {
        dispatch({
          type: 'delete/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      }
      throw cause;
    }
  }, []);

  return {
    lessons: state.lessons,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    deleteLesson,
  };
};
