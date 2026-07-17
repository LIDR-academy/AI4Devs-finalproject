import type { Locale } from '@helsoft/types';

/**
 * Native-language labels (endonyms) for each supported locale.
 *
 * These are deliberately NOT translation keys: the story requires each language be
 * labeled in its own name regardless of the active UI language, so they must not
 * change when the locale changes (spec Open decision). The language selector reads
 * these to render its options.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  de: 'Deutsch',
};
