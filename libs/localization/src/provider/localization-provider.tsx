import { type Locale } from '@helsoft/types';
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '../config/i18n';
import { resolveInitialLocale } from '../detector/resolve-initial-locale';

export type LocalizationContextValue = {
  /** Change the active language (persistence is layered on in task-7). */
  setLocale: (locale: Locale) => void;
};

export const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export type LocalizationProviderProps = {
  children: ReactNode;
  /** Explicit starting locale; wins over `deviceLocale` (used by tests/callers that pre-resolved). */
  initialLocale?: Locale;
  /** Raw device locale tag (e.g. `pt-BR`) from the app's `expo-localization`; auto-detected. */
  deviceLocale?: string | null;
};

/**
 * Wraps react-i18next's provider with an isolated i18next instance and exposes
 * `setLocale` through context. Descendants translate via `useLocalization`, never
 * importing i18next directly.
 *
 * The starting locale is the explicit `initialLocale` if given, otherwise the
 * locale detected from `deviceLocale` (English when unsupported/absent).
 */
export const LocalizationProvider = ({ children, initialLocale, deviceLocale }: LocalizationProviderProps) => {
  const [i18n] = useState(() => createI18n(initialLocale ?? resolveInitialLocale(deviceLocale)));

  const setLocale = useCallback(
    (locale: Locale) => {
      void i18n.changeLanguage(locale);
    },
    [i18n],
  );

  const value = useMemo<LocalizationContextValue>(() => ({ setLocale }), [setLocale]);

  return (
    <I18nextProvider i18n={i18n}>
      <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
    </I18nextProvider>
  );
};
