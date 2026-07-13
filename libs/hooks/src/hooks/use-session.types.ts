import type { Session } from '@helsoft/services';

export type UseSessionResult = {
  session: Session | null;
  /** True until the initial getSession() resolves — distinguishes "logged out" from "not yet known". */
  isLoading: boolean;
};
