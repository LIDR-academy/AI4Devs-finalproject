import { isSupportedLocale, type Locale } from '@helsoft/types';

import { LocalePreferenceDao } from '../dao/locale-preference.dao';

/**
 * Business logic over LocalePreferenceDao: validates locales against the supported
 * set and shields callers from storage failures.
 *
 * - `getStoredLocale` never throws: an unknown/absent value or a failed read → `null`,
 *   so the provider can fall back to device detection (@s12/AC15).
 * - `setStoredLocale` refuses to persist an unsupported value.
 */
export abstract class LocalePreferenceService {
  static async getStoredLocale(): Promise<Locale | null> {
    try {
      const stored = await LocalePreferenceDao.getStoredLocale();
      return isSupportedLocale(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  static setStoredLocale(locale: Locale): Promise<void> {
    if (!isSupportedLocale(locale)) {
      return Promise.reject(new Error(`Unsupported locale: ${locale}`));
    }
    return LocalePreferenceDao.setStoredLocale(locale);
  }
}
