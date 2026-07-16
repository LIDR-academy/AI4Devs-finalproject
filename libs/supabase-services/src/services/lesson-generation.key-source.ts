export const resolveLessonGenerationKey = ({
  usePlatformKey,
  userApiKey,
  platformApiKey,
}: {
  usePlatformKey: boolean;
  userApiKey?: string | null;
  platformApiKey?: string | null;
}) => {
  if (!usePlatformKey && userApiKey?.trim()) {
    return { ok: true as const, apiKey: userApiKey, source: 'user' as const };
  }
  if (usePlatformKey && platformApiKey?.trim()) {
    return { ok: true as const, apiKey: platformApiKey, source: 'platform' as const };
  }
  if (usePlatformKey) {
    return { ok: false as const, errorCode: 'platform_key_unavailable' as const };
  }

  return { ok: false as const, errorCode: 'missing_key' as const };
};

export const resolveLessonGenerationKeyForPlan = async ({
  usePlatformKey,
  readUserApiKey,
  platformApiKey,
}: {
  usePlatformKey: boolean;
  readUserApiKey: () => Promise<string | null>;
  platformApiKey?: string | null;
}) =>
  resolveLessonGenerationKey({
    usePlatformKey,
    userApiKey: usePlatformKey ? null : await readUserApiKey(),
    platformApiKey: usePlatformKey ? platformApiKey : null,
  });

export const callProviderWithResolvedKey = <T>(
  resolvedKey: { apiKey: string; source: 'user' | 'platform' },
  providerCall: (apiKey: string) => Promise<T>,
): Promise<T> => providerCall(resolvedKey.apiKey);
