// Mirrors libs/supabase-services/src/services/lesson-generation.key-source.ts. Deno cannot
// import workspace packages, so keep this pure decision seam manually synchronized.
export const resolveLessonGenerationKey = ({
  plan,
  userApiKey,
  platformApiKey,
}: {
  plan: 'free' | 'paid';
  userApiKey?: string | null;
  platformApiKey?: string | null;
}) => {
  if (plan === 'free' && userApiKey?.trim()) {
    return { ok: true as const, apiKey: userApiKey, source: 'user' as const };
  }
  if (plan === 'paid' && platformApiKey?.trim()) {
    return { ok: true as const, apiKey: platformApiKey, source: 'platform' as const };
  }
  if (plan === 'paid') {
    return { ok: false as const, errorCode: 'platform_key_unavailable' as const };
  }

  return { ok: false as const, errorCode: 'missing_key' as const };
};

export const resolveLessonGenerationKeyForPlan = async ({
  plan,
  readUserApiKey,
  platformApiKey,
}: {
  plan: 'free' | 'paid';
  readUserApiKey: () => Promise<string | null>;
  platformApiKey?: string | null;
}) =>
  resolveLessonGenerationKey({
    plan,
    userApiKey: plan === 'free' ? await readUserApiKey() : null,
    platformApiKey,
  });

export const callProviderWithResolvedKey = <T>(
  resolvedKey: { apiKey: string; source: 'user' | 'platform' },
  providerCall: (apiKey: string) => Promise<T>,
): Promise<T> => providerCall(resolvedKey.apiKey);
