import { resolveLessonGenerationKeyForPlan } from './lesson-generation.key-source.ts';

export type PlanFlags = {
  usePlatformKey: boolean;
};

type HandleLessonGenerationRouteInput = {
  userId: string;
  requestBody: unknown;
  readPlanFlags: (userId: string) => Promise<PlanFlags | null>;
  readUserApiKey: () => Promise<string | null>;
  platformApiKey?: string | null;
  acquirePlatformSlot: (userId: string) => Promise<boolean>;
  releasePlatformSlot?: (userId: string) => Promise<void>;
  readImageMetadata?: () => Promise<unknown>;
};

export const handleLessonGenerationRoute = async ({
  userId,
  requestBody,
  readPlanFlags,
  readUserApiKey,
  platformApiKey,
  acquirePlatformSlot,
  releasePlatformSlot,
  readImageMetadata,
}: HandleLessonGenerationRouteInput) => {
  void requestBody;
  const planFlags = await readPlanFlags(userId);
  if (!planFlags) {
    return { ok: false as const, errorCode: 'generation_failed' as const };
  }

  const resolvedKey = await resolveLessonGenerationKeyForPlan({
    usePlatformKey: planFlags.usePlatformKey,
    readUserApiKey,
    platformApiKey: planFlags.usePlatformKey ? platformApiKey : null,
  });
  if (!resolvedKey.ok) {
    return resolvedKey;
  }
  if (resolvedKey.source === 'user') {
    return { ...resolvedKey, imageMetadata: await readImageMetadata?.() };
  }
  if (!(await acquirePlatformSlot(userId))) {
    return { ok: false as const, errorCode: 'rate_limited' as const };
  }
  const release = () => releasePlatformSlot?.(userId) ?? Promise.resolve();
  try {
    return { ...resolvedKey, imageMetadata: await readImageMetadata?.(), release };
  } catch (cause) {
    await release();
    throw cause;
  }
};
