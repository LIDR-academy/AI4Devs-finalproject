import type { ReactNode } from 'react';

export type ApiKeyGateProps = {
  /** Screen content under the gate. Gate create/upload with `useProfile().profile?.canCreate`. */
  children: ReactNode;
};
