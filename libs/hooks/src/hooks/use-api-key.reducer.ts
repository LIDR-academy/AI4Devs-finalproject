import type { ApiKeyErrorCode, ApiKeyStatus } from '@helsoft/types';

const NO_KEY_STATUS: ApiKeyStatus = { hasKey: false };

type State = {
  status: ApiKeyStatus;
  isLoading: boolean;
  isSubmitting: boolean;
  error: ApiKeyErrorCode | null;
};

type Action =
  | { type: 'status/unauthenticated' }
  | { type: 'status/load/start' }
  | { type: 'status/load/success'; status: ApiKeyStatus }
  | { type: 'mutation/start' }
  | { type: 'mutation/success'; status: ApiKeyStatus }
  | { type: 'mutation/failure'; error: ApiKeyErrorCode };

export const useApiKeyInitialState: State = {
  status: NO_KEY_STATUS,
  isLoading: true,
  isSubmitting: false,
  error: null,
};

export function useApiKeyReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'status/unauthenticated':
      return { ...state, isLoading: false };
    case 'status/load/start':
      return { ...state, isLoading: true };
    case 'status/load/success':
      return { ...state, status: action.status, isLoading: false };
    case 'mutation/start':
      return { ...state, isSubmitting: true };
    case 'mutation/success':
      return { ...state, status: action.status, error: null, isSubmitting: false };
    case 'mutation/failure':
      return { ...state, error: action.error, isSubmitting: false };
  }
}
