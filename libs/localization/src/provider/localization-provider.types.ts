import type { Locale } from '@helsoft/types';
import type { ReactNode } from 'react';

export type LocalizationContextValue = {
  /** Change the active language immediately and persist the choice. */
  setLocale: (locale: Locale) => void;
};

export type LocalizationProviderProps = {
  children: ReactNode;
  /** Explicit starting locale; wins over saved preference and device (tests/pre-resolved callers). */
  initialLocale?: Locale;
  /** Raw device locale tag (e.g. `pt-BR`) from the app's `expo-localization`. */
  deviceLocale?: string | null;
};
