jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCALE_PREFERENCE_STORAGE_KEY, LocalePreferenceDao } from './locale-preference.dao';

const store = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('LocalePreferenceDao', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s7 — the storage key is a stable, versioned literal. Pinning the exact value (rather than
  // comparing the imported constant to itself) guards against a silent key change breaking
  // persistence across app versions.
  it('persists under a stable, well-known storage key', () => {
    expect(LOCALE_PREFERENCE_STORAGE_KEY).toBe('study-buddy.locale-preference');
  });

  // @s7 — the stored value is read back.
  it('getStoredLocale returns the value stored under the preference key', async () => {
    store.getItem.mockResolvedValue('es');

    await expect(LocalePreferenceDao.getStoredLocale()).resolves.toBe('es');
    expect(store.getItem).toHaveBeenCalledWith('study-buddy.locale-preference');
  });

  it('getStoredLocale returns null when nothing is stored', async () => {
    store.getItem.mockResolvedValue(null);

    await expect(LocalePreferenceDao.getStoredLocale()).resolves.toBeNull();
  });

  // @s7 — a chosen locale is persisted under the well-known key.
  it('setStoredLocale writes the value under the preference key', async () => {
    store.setItem.mockResolvedValue(undefined);

    await LocalePreferenceDao.setStoredLocale('pt');

    expect(store.setItem).toHaveBeenCalledWith(LOCALE_PREFERENCE_STORAGE_KEY, 'pt');
  });

  // @s12 — a read failure surfaces as a rejection so the service can fall back (no crash swallowed here).
  it('getStoredLocale surfaces a storage read failure as a rejection', async () => {
    store.getItem.mockRejectedValue(new Error('storage unavailable'));

    await expect(LocalePreferenceDao.getStoredLocale()).rejects.toThrow('storage unavailable');
  });
});
