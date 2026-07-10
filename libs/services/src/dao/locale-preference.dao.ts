import AsyncStorage from '@react-native-async-storage/async-storage';

/** Storage key for the persisted language preference (localStorage on web, native store on iOS/Android). */
export const LOCALE_PREFERENCE_STORAGE_KEY = 'study-buddy.locale-preference';

/**
 * Raw persistence for the chosen language. Platform-store (non-Supabase) DAO:
 * reads/writes/clears a locale string via AsyncStorage. No validation, no React —
 * a storage failure surfaces as a rejected promise for the service to handle.
 */
export abstract class LocalePreferenceDao {
  static getStoredLocale(): Promise<string | null> {
    return AsyncStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
  }

  static async setStoredLocale(value: string): Promise<void> {
    await AsyncStorage.setItem(LOCALE_PREFERENCE_STORAGE_KEY, value);
  }

  static async clearStoredLocale(): Promise<void> {
    await AsyncStorage.removeItem(LOCALE_PREFERENCE_STORAGE_KEY);
  }
}
