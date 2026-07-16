import {
  callProviderWithResolvedKey,
  resolveLessonGenerationKeyForPlan,
} from '../../../../supabase/functions/generate-lesson/_shared/lesson-generation.key-source';
import { handleLessonGenerationRoute } from '../../../../supabase/functions/generate-lesson/_shared/lesson-generation.route';

describe('generate-lesson key routing integration', () => {
  // @s10/@s18 — the platform control flow never executes the Vault reader and the provider
  // receives the platform key selected by the resolver.
  it('routes platform generation exclusively through the platform key', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');
    const providerCall = jest.fn().mockResolvedValue('generated');

    const resolvedKey = await resolveLessonGenerationKeyForPlan({
      usePlatformKey: true,
      readUserApiKey,
      platformApiKey: 'platform-secret',
    });

    expect(readUserApiKey).not.toHaveBeenCalled();
    expect(resolvedKey).toEqual({
      ok: true,
      apiKey: 'platform-secret',
      source: 'platform',
    });
    if (!resolvedKey.ok) throw new Error('expected a resolved platform key');
    await callProviderWithResolvedKey(resolvedKey, providerCall);
    expect(providerCall).toHaveBeenCalledWith('platform-secret');
  });

  // @s7/@s15 — server flags win over extra crafted selector fields; BYOK executes Vault exactly
  // once and the provider receives the user key even when a platform key is available.
  it('routes user-key generation through Vault despite crafted platform selectors', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');
    const providerCall = jest.fn().mockResolvedValue('generated');
    const craftedInput = {
      usePlatformKey: false,
      readUserApiKey,
      platformApiKey: 'platform-secret',
      requestPlan: 'paid',
      entitlement: 'paid',
      keySource: 'platform',
    };

    const resolvedKey = await resolveLessonGenerationKeyForPlan(craftedInput);

    expect(readUserApiKey).toHaveBeenCalledTimes(1);
    expect(resolvedKey).toEqual({
      ok: true,
      apiKey: 'saved-user-secret',
      source: 'user',
    });
    if (!resolvedKey.ok) throw new Error('expected a resolved user key');
    await callProviderWithResolvedKey(resolvedKey, providerCall);
    expect(providerCall).toHaveBeenCalledWith('saved-user-secret');
  });

  // @s14 — the executable Edge routing seam reads live plan flags for each request.
  it('applies a dashboard plan flip to the next generation route', async () => {
    let usePlatformKey = true;
    const readPlanFlags = jest.fn(async () => ({ usePlatformKey }));
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');

    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: { documentId: 'doc-1', composition: 'both' },
        readPlanFlags,
        readUserApiKey,
        platformApiKey: 'platform-secret',
        acquirePlatformSlot: jest.fn().mockResolvedValue(true),
      }),
    ).resolves.toMatchObject({ ok: true, source: 'platform', apiKey: 'platform-secret' });

    usePlatformKey = false;

    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: { documentId: 'doc-1', composition: 'both' },
        readPlanFlags,
        readUserApiKey,
        platformApiKey: 'platform-secret',
        acquirePlatformSlot: jest.fn().mockResolvedValue(true),
      }),
    ).resolves.toMatchObject({ ok: true, source: 'user', apiKey: 'saved-user-secret' });
    expect(readPlanFlags).toHaveBeenCalledTimes(2);
  });

  // @s15 — crafted client route selectors are inert at the executable Edge routing seam.
  it('uses live user-key flags when crafted route fields claim platform access', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');

    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: {
          documentId: 'doc-1',
          composition: 'both',
          plan: 'paid',
          entitlements: { keySource: 'platform' },
          keySource: 'platform',
        },
        readPlanFlags: jest.fn().mockResolvedValue({ usePlatformKey: false }),
        readUserApiKey,
        platformApiKey: 'platform-secret',
        acquirePlatformSlot: jest.fn().mockResolvedValue(true),
      }),
    ).resolves.toMatchObject({ ok: true, source: 'user', apiKey: 'saved-user-secret' });
    expect(readUserApiKey).toHaveBeenCalledTimes(1);
  });

  it('acquires a server-funded inference slot before returning the platform key', async () => {
    const acquirePlatformSlot = jest.fn().mockResolvedValue(true);

    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: { documentId: 'doc-1', composition: 'both' },
        readPlanFlags: jest.fn().mockResolvedValue({ usePlatformKey: true }),
        readUserApiKey: jest.fn(),
        platformApiKey: 'platform-secret',
        acquirePlatformSlot,
      }),
    ).resolves.toMatchObject({ ok: true, source: 'platform' });
    expect(acquirePlatformSlot).toHaveBeenCalledWith('user-1');
  });

  it('returns a release callback for an acquired funded inference slot', async () => {
    const releasePlatformSlot = jest.fn().mockResolvedValue(undefined);
    const route = await handleLessonGenerationRoute({
      userId: 'user-1',
      requestBody: { documentId: 'doc-1', composition: 'both' },
      readPlanFlags: jest.fn().mockResolvedValue({ usePlatformKey: true }),
      readUserApiKey: jest.fn(),
      platformApiKey: 'platform-secret',
      acquirePlatformSlot: jest.fn().mockResolvedValue(true),
      releasePlatformSlot,
    });

    expect(route.ok).toBe(true);
    if (!route.ok || route.source !== 'platform') throw new Error('expected funded route');
    await route.release();
    expect(releasePlatformSlot).toHaveBeenCalledWith('user-1');
  });

  it('rejects funded inference when the server-side slot is denied', async () => {
    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: { documentId: 'doc-1', composition: 'both' },
        readPlanFlags: jest.fn().mockResolvedValue({ usePlatformKey: true }),
        readUserApiKey: jest.fn(),
        platformApiKey: 'platform-secret',
        acquirePlatformSlot: jest.fn().mockResolvedValue(false),
      }),
    ).resolves.toEqual({ ok: false, errorCode: 'rate_limited' });
  });

  it('rejects an unresolved key before loading image metadata', async () => {
    const readImageMetadata = jest.fn().mockResolvedValue([]);

    await expect(
      handleLessonGenerationRoute({
        userId: 'user-1',
        requestBody: { documentId: 'doc-1', composition: 'both' },
        readPlanFlags: jest.fn().mockResolvedValue({ usePlatformKey: false }),
        readUserApiKey: jest.fn().mockResolvedValue(null),
        platformApiKey: 'platform-secret',
        acquirePlatformSlot: jest.fn().mockResolvedValue(true),
        readImageMetadata,
      }),
    ).resolves.toEqual({ ok: false, errorCode: 'missing_key' });
    expect(readImageMetadata).not.toHaveBeenCalled();
  });
});
