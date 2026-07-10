import { LocalePreferenceService } from '@helsoft/services';
import { type Locale } from '@helsoft/types';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '../config/i18n';
import { resolveInitialLocale } from '../detector/resolve-initial-locale';

export type LocalizationContextValue = {
  /** Change the active language immediately and persist the choice. */
  setLocale: (locale: Locale) => void;
};

export const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export type LocalizationProviderProps = {
  children: ReactNode;
  /** Explicit starting locale; wins over saved preference and device (tests/pre-resolved callers). */
  initialLocale?: Locale;
  /** Raw device locale tag (e.g. `pt-BR`) from the app's `expo-localization`. */
  deviceLocale?: string | null;
};

/**
 * Wraps react-i18next's provider with an isolated i18next instance and exposes
 * `setLocale` through context. Descendants translate via `useLocalization`.
 *
 * First paint is gated (`null`) until the initial locale resolves, so no flash of
 * untranslated copy (R2). Precedence: saved preference → device detection → English.
 */
export const LocalizationProvider = ({ children, initialLocale, deviceLocale }: LocalizationProviderProps) => {
  const [i18n] = useState(() => createI18n(initialLocale ?? resolveInitialLocale(deviceLocale)));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      const next =
        initialLocale ?? (await LocalePreferenceService.getStoredLocale()) ?? resolveInitialLocale(deviceLocale);
      await i18n.changeLanguage(next);
      if (active) setReady(true);
    };

    void resolve();

    return () => {
      active = false;
    };
  }, [i18n, initialLocale, deviceLocale]);

  const setLocale = useCallback(
    (locale: Locale) => {
      void i18n.changeLanguage(locale);
      LocalePreferenceService.setStoredLocale(locale).catch((error) => {
        // TODO(FO1): robust failed-save handling (retry/queue and/or a non-blocking
        // notice) — see docs/features/localization-i18n/spec.md → Follow-on FO1.
        // Interim (human-approved): apply the switch in-memory for the session and
        // log; never block the switch or throw.
        console.warn('Failed to persist locale preference', error);
      });
    },
    [i18n],
  );

  const value = useMemo<LocalizationContextValue>(() => ({ setLocale }), [setLocale]);

  if (!ready) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
    </I18nextProvider>
  );
};
