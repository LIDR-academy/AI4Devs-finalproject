import type { Entitlements } from '@helsoft/types';
import type { ReactNode } from 'react';

export type UseEntitlementsResult = {
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

export type EntitlementsProviderProps = {
  children: ReactNode;
};
