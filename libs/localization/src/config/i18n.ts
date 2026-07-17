import { FALLBACK_LOCALE, type Locale } from '@helsoft/types';
import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from '../resources';

/**
 * Build an isolated i18next instance wired to react-i18next.
 *
 * - `fallbackLng: 'en'` so a key missing from the active locale resolves to English (AC10/@s9).
 * - `initImmediate: false` initializes synchronously from the inline resources (no backend),
 *   so the provider can gate first paint on a resolved locale without a flash (R2).
 * - Each call returns a fresh instance so providers/tests don't share global state.
 */
export const createI18n = (initialLocale: Locale = FALLBACK_LOCALE): i18n => {
  const instance = i18next.createInstance();

  instance.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: FALLBACK_LOCALE,
    interpolation: { escapeValue: false },
    initImmediate: false,
    returnNull: false,
  });

  return instance;
};
