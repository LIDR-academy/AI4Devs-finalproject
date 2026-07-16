import {
  callProviderWithResolvedKey,
  resolveLessonGenerationKey,
  resolveLessonGenerationKeyForPlan,
} from './lesson-generation.key-source';

describe('resolveLessonGenerationKey', () => {
  // @s7 — BYOK resolves exclusively to its Vault-backed user key.
  it('resolves a user-key plan to the saved user key', () => {
    expect(
      resolveLessonGenerationKey({
        usePlatformKey: false,
        userApiKey: 'user-secret',
        platformApiKey: 'platform-secret',
      }),
    ).toEqual({ ok: true, apiKey: 'user-secret', source: 'user' });
  });

  // @s8 — absent and blank Vault values both reject with the BYOK-specific code.
  it.each([
    null,
    undefined,
    '',
    '   ',
  ])('rejects a user-key plan when its saved user key is %p', (userApiKey) => {
    expect(resolveLessonGenerationKey({ usePlatformKey: false, userApiKey })).toEqual({
      ok: false,
      errorCode: 'missing_key',
    });
  });

  it('never resolves a platform key for a user-key plan without a user key', () => {
    expect(
      resolveLessonGenerationKey({
        usePlatformKey: false,
        userApiKey: null,
        platformApiKey: 'platform-secret',
      }),
    ).toEqual({ ok: false, errorCode: 'missing_key' });
  });

  // @s10/@s18 — platform flag always resolves to the platform key, regardless of saved-key state.
  it.each([
    'user-secret',
    null,
  ])('resolves a platform plan to the platform key when userApiKey is %p', (userApiKey) => {
    expect(
      resolveLessonGenerationKey({
        usePlatformKey: true,
        userApiKey,
        platformApiKey: 'platform-secret',
      }),
    ).toEqual({ ok: true, apiKey: 'platform-secret', source: 'platform' });
  });

  // @s11 — platform configuration failures never fall back to a saved user key.
  it.each([
    null,
    undefined,
    '',
    '   ',
  ])('rejects a platform plan when its platform key is %p', (platformApiKey) => {
    expect(
      resolveLessonGenerationKey({
        usePlatformKey: true,
        userApiKey: 'user-secret',
        platformApiKey,
      }),
    ).toEqual({ ok: false, errorCode: 'platform_key_unavailable' });
  });
});

describe('resolveLessonGenerationKeyForPlan', () => {
  it('reads and returns the user key when usePlatformKey is false', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('user-secret');

    await expect(
      resolveLessonGenerationKeyForPlan({
        usePlatformKey: false,
        readUserApiKey,
        platformApiKey: 'platform-secret',
      }),
    ).resolves.toEqual({ ok: true, apiKey: 'user-secret', source: 'user' });
    expect(readUserApiKey).toHaveBeenCalledTimes(1);
  });

  it('returns the resolved platform key without reading the user key when usePlatformKey is true', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('user-secret');

    await expect(
      resolveLessonGenerationKeyForPlan({
        usePlatformKey: true,
        readUserApiKey,
        platformApiKey: 'platform-secret',
      }),
    ).resolves.toEqual({ ok: true, apiKey: 'platform-secret', source: 'platform' });
    expect(readUserApiKey).not.toHaveBeenCalled();
  });
});

describe('callProviderWithResolvedKey', () => {
  it('returns the provider result after passing only the resolved key', async () => {
    const providerCall = jest.fn().mockResolvedValue('generated');

    await expect(
      callProviderWithResolvedKey({ apiKey: 'platform-secret', source: 'platform' }, providerCall),
    ).resolves.toBe('generated');
    expect(providerCall).toHaveBeenCalledWith('platform-secret');
  });
});
