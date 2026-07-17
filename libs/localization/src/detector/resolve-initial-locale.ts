import { FALLBACK_LOCALE, isSupportedLocale, type Locale } from '@helsoft/types';

import { toBaseSubtag } from './device-locale';

/**
 * Map a raw device locale tag to a supported `Locale`.
 *
 * Normalizes the base subtag (`pt-BR` → `pt`); a supported base is used as-is, and
 * anything unsupported or absent falls back to English (@s3/@s4). Pure so task-7's
 * precedence logic (saved preference → this) can reuse it.
 */
export const resolveInitialLocale = (deviceTag?: string | null): Locale => {
  if (!deviceTag) {
    return FALLBACK_LOCALE;
  }

  const base = toBaseSubtag(deviceTag);
  return isSupportedLocale(base) ? base : FALLBACK_LOCALE;
};
