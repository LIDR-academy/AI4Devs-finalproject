import type { Entitlements } from '@helsoft/types';

export type PlanEntitlements = Omit<Entitlements, 'canCreate'> & {
  canCreateWithoutKey: boolean;
};
