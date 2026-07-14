import type { LessonSummary } from '@helsoft/types';

type State = {
  lessons: LessonSummary[];
  isLoading: boolean;
  error: Error | null;
};

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; lessons: LessonSummary[] }
  | { type: 'load/failure'; error: Error }
  | { type: 'delete/success'; id: string }
  | { type: 'delete/failure'; error: Error };

export const useLessonsInitialState: State = {
  lessons: [],
  isLoading: true,
  error: null,
};

export function useLessonsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { ...state, isLoading: true, error: null };
    case 'load/success':
      return { lessons: action.lessons, isLoading: false, error: null };
    case 'load/failure':
      return { lessons: [], isLoading: false, error: action.error };
    case 'delete/success':
      return {
        ...state,
        lessons: state.lessons.filter((lesson) => lesson.id !== action.id),
        error: null,
      };
    case 'delete/failure':
      return { ...state, error: action.error };
  }
}
