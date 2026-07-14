import { LessonsService } from '@helsoft/supabase-services';
import type { LessonSummary } from '@helsoft/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UseLessonsResult } from './use-lessons.types';

/**
 * React integration over LessonsService (tanstack-query not installed → local state,
 * per spec.md Open decisions). Drives Home Loading/Content/Empty/Error via
 * `{ lessons, isLoading, error, refetch, deleteLesson }`.
 */
export const useLessons = (): UseLessonsResult => {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
    setIsLoading(true);
    setError(null);

    void LessonsService.getLessons()
      .then((next) => {
        if (id !== requestId.current || !isMounted.current) return;
        setLessons(next);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (id !== requestId.current || !isMounted.current) return;
        setLessons([]);
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setIsLoading(false);
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
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      setError(null);
    } catch (cause) {
      if (isMounted.current) {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      }
      throw cause;
    }
  }, []);

  return { lessons, isLoading, error, refetch, deleteLesson };
};
