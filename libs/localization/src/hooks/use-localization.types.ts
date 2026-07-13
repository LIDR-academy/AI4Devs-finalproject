import type { Locale } from '@helsoft/types';

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
