import type { ReactNode } from 'react';

export type ApiKeyGateProps = {
  /** The generation entry point's content (the future R2 generation UI) — only rendered once
   * a key is present (AC10). */
  children: ReactNode | ((canCreate: boolean) => ReactNode);
};
