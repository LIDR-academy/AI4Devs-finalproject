import type { Lesson } from '@helsoft/types';

type State = {
  lesson: Lesson | null;
  isLoading: boolean;
  error: Error | null;
};

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; lesson: Lesson }
  | { type: 'load/failure'; error: Error };

export const useLessonInitialState: State = {
  lesson: null,
  isLoading: true,
  error: null,
};

export function useLessonReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { ...state, isLoading: true, error: null };
    case 'load/success':
      return { lesson: action.lesson, isLoading: false, error: null };
    case 'load/failure':
      return { lesson: null, isLoading: false, error: action.error };
  }
}
