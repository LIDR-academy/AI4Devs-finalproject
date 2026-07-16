import type { PlanEntitlements } from '@helsoft/supabase-services';

type State = {
  data: PlanEntitlements | null;
  isLoading: boolean;
  error: Error | null;
};

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; data: PlanEntitlements }
  | { type: 'load/failure'; error: Error }
  | { type: 'load/unauthenticated' };

export const useProfileInitialState: State = {
  data: null,
  isLoading: true,
  error: null,
};

export function useProfileReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { data: state.data, isLoading: true, error: null };
    case 'load/success':
      return { data: action.data, isLoading: false, error: null };
    case 'load/failure':
      return { data: null, isLoading: false, error: action.error };
    case 'load/unauthenticated':
      return { data: null, isLoading: false, error: null };
  }
}
