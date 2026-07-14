import type { ActivityAnswer } from '@helsoft/types';

type State = {
  currentIndex: number;
  answers: Record<string, ActivityAnswer>;
  attemptSaved: boolean;
  persistOnMount: boolean;
};

type Action =
  | { type: 'next'; maxIndex: number }
  | { type: 'back' }
  | { type: 'answer'; slideId: string; answer: ActivityAnswer }
  | { type: 'reset' };

export const lessonPlayerInitialState: State = {
  currentIndex: 0,
  answers: {},
  attemptSaved: false,
  persistOnMount: true,
};

export function lessonPlayerReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'next': {
      const nextIndex = Math.min(state.currentIndex + 1, action.maxIndex);
      const enteringResults = nextIndex === action.maxIndex && state.currentIndex < action.maxIndex;
      if (enteringResults) {
        return {
          ...state,
          currentIndex: nextIndex,
          persistOnMount: !state.attemptSaved,
          attemptSaved: true,
        };
      }
      return { ...state, currentIndex: nextIndex };
    }
    case 'back':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    case 'answer':
      return {
        ...state,
        answers: { ...state.answers, [action.slideId]: action.answer },
      };
    case 'reset':
      return lessonPlayerInitialState;
  }
}
