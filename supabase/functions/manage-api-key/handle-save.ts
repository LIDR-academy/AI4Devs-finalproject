import type { AiProvider } from './provider.ts';

export type SaveApiKeyParams = {
  userId: string;
  provider: AiProvider;
  apiKey: string;
};

export type MaskedApiKeyStatus = {
  hasKey: true;
  provider: AiProvider;
  updatedAt: string;
};

export type SaveApiKeyResult = MaskedApiKeyStatus;

export type SaveApiKeyDeps = {
  storeApiKey: (params: SaveApiKeyParams) => Promise<{ provider: string; updatedAt: string }>;
  log: (event: { action: 'save'; outcome: string; userId: string }) => void;
};

/**
 * Stores the submitted key and replies with the masked status only -- never the raw key. A
 * store failure propagates to index.ts's catch-all, which responds 502 network_error without
 * logging the request body (@s12).
 */
export const handleSaveApiKey = async (
  params: SaveApiKeyParams,
  deps: SaveApiKeyDeps,
): Promise<SaveApiKeyResult> => {
  const stored = await deps.storeApiKey(params);
  deps.log({ action: 'save', outcome: 'success', userId: params.userId });
  return { hasKey: true, provider: stored.provider as AiProvider, updatedAt: stored.updatedAt };
};
