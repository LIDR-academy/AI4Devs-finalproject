import type { Entitlements } from '@helsoft/types';
import type { ReactNode } from 'react';

export type UseProfileResult = {
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

export type ProfileProviderProps = {
  children: ReactNode;
};
