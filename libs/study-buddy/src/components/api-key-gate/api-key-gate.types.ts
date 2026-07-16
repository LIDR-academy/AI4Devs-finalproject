import type { ReactNode } from 'react';

export type ApiKeyGateProps = {
  /** Screen content under the gate. Use `useApiKeyGateCanCreate()` for create/upload affordances. */
  children: ReactNode;
};
