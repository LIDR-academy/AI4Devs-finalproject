import type { Entitlements } from '@helsoft/types';

export type UseEntitlementsResult = {
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};
