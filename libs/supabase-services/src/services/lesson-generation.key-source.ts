import type { Plan } from '@helsoft/types';

export const resolveLessonGenerationKey = ({
  plan,
  userApiKey,
  platformApiKey,
}: {
  plan: Plan;
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
  plan: Plan;
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
