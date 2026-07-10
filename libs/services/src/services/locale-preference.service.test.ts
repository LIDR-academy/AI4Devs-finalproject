jest.mock('../dao/locale-preference.dao', () => ({
  LocalePreferenceDao: {
    getStoredLocale: jest.fn(),
    setStoredLocale: jest.fn(),
  },
}));

import { LocalePreferenceDao } from '../dao/locale-preference.dao';
import { LocalePreferenceService } from './locale-preference.service';

const dao = LocalePreferenceDao as jest.Mocked<typeof LocalePreferenceDao>;

describe('LocalePreferenceService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s7 — a valid stored locale is read back.
  it('getStoredLocale returns a supported stored locale', async () => {
    dao.getStoredLocale.mockResolvedValue('pt');

    await expect(LocalePreferenceService.getStoredLocale()).resolves.toBe('pt');
  });

  it('getStoredLocale returns null when nothing is stored', async () => {
    dao.getStoredLocale.mockResolvedValue(null);

    await expect(LocalePreferenceService.getStoredLocale()).resolves.toBeNull();
  });

  it('getStoredLocale returns null when the stored value is not a supported locale', async () => {
    dao.getStoredLocale.mockResolvedValue('fr');

    await expect(LocalePreferenceService.getStoredLocale()).resolves.toBeNull();
  });

  // @s12 — a read failure never throws; it degrades to null so the caller can fall back.
  it('getStoredLocale resolves to null when the DAO read fails', async () => {
    dao.getStoredLocale.mockRejectedValue(new Error('storage unavailable'));

    await expect(LocalePreferenceService.getStoredLocale()).resolves.toBeNull();
  });

  // @s7 — a valid locale is validated then persisted through the DAO.
  it('setStoredLocale persists a supported locale via the DAO', async () => {
    dao.setStoredLocale.mockResolvedValue(undefined);

    await LocalePreferenceService.setStoredLocale('de');

    expect(dao.setStoredLocale).toHaveBeenCalledWith('de');
  });

  it('setStoredLocale rejects an unsupported locale and does not persist it', async () => {
    await expect(
      LocalePreferenceService.setStoredLocale('fr' as never),
    ).rejects.toThrow('Unsupported locale: fr');
    expect(dao.setStoredLocale).not.toHaveBeenCalled();
  });
});
