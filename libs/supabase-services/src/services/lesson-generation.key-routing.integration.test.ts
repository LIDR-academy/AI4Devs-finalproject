import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  callProviderWithResolvedKey,
  resolveLessonGenerationKeyForPlan,
} from '../../../../supabase/functions/generate-lesson/_shared/lesson-generation.key-source';
import { resolveLessonGenerationKey } from './index';

const repositoryRoot = resolve(__dirname, '../../../..');
const edgeFunction = readFileSync(
  resolve(repositoryRoot, 'supabase/functions/generate-lesson/index.ts'),
  'utf8',
);
const edgeKeySource = readFileSync(
  resolve(
    repositoryRoot,
    'supabase/functions/generate-lesson/_shared/lesson-generation.key-source.ts',
  ),
  'utf8',
);

describe('generate-lesson key routing integration', () => {
  // @s10/@s18 — the paid control flow never executes the Vault reader and the provider receives
  // the platform key selected by the resolver.
  it('routes paid generation exclusively through the platform key', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');
    const providerCall = jest.fn().mockResolvedValue('generated');

    const resolvedKey = await resolveLessonGenerationKeyForPlan({
      plan: 'paid',
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

  // @s7/@s15 — server plan wins over extra crafted selector fields; free executes Vault exactly
  // once and the provider receives the user key even when a platform key is available.
  it('routes free generation through Vault despite crafted paid selectors', async () => {
    const readUserApiKey = jest.fn().mockResolvedValue('saved-user-secret');
    const providerCall = jest.fn().mockResolvedValue('generated');
    const craftedInput = {
      plan: 'free' as const,
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

  // @s7/@s10/@s15/@s18 — the Deno control flow passes the live plan into the behavioral router,
  // keeps Vault inside its lazy callback, and passes the resolver's key into the provider seam.
  it('wires the live server plan through exclusive acquisition into the provider call', () => {
    expect(resolveLessonGenerationKey).toBeDefined();
    const routingCall = edgeFunction.match(
      /const resolvedKey = await resolveLessonGenerationKeyForPlan\(\{[\s\S]*?\n  \}\);/,
    )?.[0];
    expect(routingCall).toBeDefined();
    expect(routingCall).toContain('plan: profile.plan');
    expect(routingCall).toMatch(
      /readUserApiKey: async \(\) => \{[\s\S]*adminClient\.rpc\('get_api_key', \{ p_user_id: user\.id \}\)[\s\S]*return keyRow\?\.api_key \?\? null;[\s\S]*\}/,
    );
    expect(routingCall).toContain(
      "profile.plan === 'paid' ? (Deno.env.get('PLATFORM_GROQ_API_KEY') ?? null) : null",
    );
    expect(edgeFunction.replace(routingCall ?? '', '')).not.toContain(
      "adminClient.rpc('get_api_key'",
    );
    expect(edgeFunction).toMatch(
      /callProviderWithResolvedKey\(resolvedKey, \(apiKey\) =>\s*runGeneration\(apiKey, prompt\),?\s*\)/,
    );
    expect(edgeFunction).toContain(
      'const { documentId, composition } = body as GenerateLessonRequest;',
    );
    expect(edgeFunction).not.toMatch(
      /\bbody(?:\.(?:plan|entitlements?|keySource)|\[['"](?:plan|entitlements?|keySource)['"]\])/,
    );
    expect(edgeFunction).not.toMatch(
      /const\s+\{[^}]*(?:plan|entitlements?|keySource)[^}]*\}\s*=\s*body/,
    );
    expect(edgeKeySource).toContain("errorCode: 'platform_key_unavailable'");
  });
});
