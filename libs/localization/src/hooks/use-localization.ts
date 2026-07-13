import { FALLBACK_LOCALE, isSupportedLocale, SUPPORTED_LOCALES } from '@helsoft/types';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LocalizationContext } from '../provider/localization-provider';

import type { TranslateOptions, UseLocalizationResult } from './use-localization.types';

/**
 * The single entry point components use to translate and switch languages.
 * Wraps react-i18next's `useTranslation` so consumers never import i18next directly.
 */
export const useLocalization = (): UseLocalizationResult => {
  const { t, i18n } = useTranslation();
  const context = useContext(LocalizationContext);

  const language = i18n.language;
  const setLocale = context?.setLocale;

  // Memoized so consumers get a stable result reference across renders that don't change the
  // language or the switcher; recomputes only when i18next's `t`, the active language, or the
  // provider's `setLocale` change. `null` marks "used outside the provider" (thrown below).
  const result = useMemo<UseLocalizationResult | null>(() => {
    if (!setLocale) {
      return null;
    }

    return {
      t: (key: string, options?: TranslateOptions) => t(key, options ?? {}),
      locale: isSupportedLocale(language) ? language : FALLBACK_LOCALE,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
    };
  }, [t, language, setLocale]);

  if (!result) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }

  return result;
};
