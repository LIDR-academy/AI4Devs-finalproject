import { SUPPORTED_LOCALES, type Locale } from '@helsoft/types';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { LocalizationContext } from '../provider/localization-provider';

export type TranslateOptions = Record<string, unknown>;

export type UseLocalizationResult = {
  /** Translate a key, with optional interpolation/pluralization values. */
  t: (key: string, options?: TranslateOptions) => string;
  /** The active locale. */
  locale: Locale;
  /** Change the active language (immediate; persisted from task-7). */
  setLocale: (locale: Locale) => void;
  /** The set of locales the app supports. */
  supportedLocales: readonly Locale[];
};

/**
 * The single entry point components use to translate and switch languages.
 * Wraps react-i18next's `useTranslation` so consumers never import i18next directly.
 */
export const useLocalization = (): UseLocalizationResult => {
  const { t, i18n } = useTranslation();
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }

  return {
    t: (key, options) => t(key, options ?? {}),
    locale: i18n.language as Locale,
    setLocale: context.setLocale,
    supportedLocales: SUPPORTED_LOCALES,
  };
};
