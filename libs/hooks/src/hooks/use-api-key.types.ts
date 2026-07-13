import type { ApiKeyErrorCode, ApiKeyStatus } from '@helsoft/types';
import type { ReactNode } from 'react';

export type UseApiKeyResult = {
  status: ApiKeyStatus;
  /** True while the initial status fetch is in flight. */
  isLoading: boolean;
  /** True while a save/remove call is in flight — drives the ApiKeyForm Loading state. */
  isSubmitting: boolean;
  /** The normalized code from the most recent failed save/remove — null once it succeeds. */
  error: ApiKeyErrorCode | null;
  saveApiKey: (rawKey: string) => Promise<void>;
  removeApiKey: () => Promise<void>;
};

export type ApiKeyProviderProps = {
  children: ReactNode;
};
