import type { AiProvider, ProbeOutcome } from './validate-key.ts';

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

export type ApiKeyErrorResult = { code: 'invalid_key' | 'network_error' };

export type SaveApiKeyResult = MaskedApiKeyStatus | ApiKeyErrorResult;

export type SaveApiKeyDeps = {
  validateKey: (provider: AiProvider, apiKey: string) => Promise<ProbeOutcome>;
  storeApiKey: (params: SaveApiKeyParams) => Promise<{ provider: string; updatedAt: string }>;
  log: (event: { action: 'save'; outcome: string; userId: string }) => void;
};

/**
 * Orchestrates the validate-THEN-store flow (spec.md Open decision 2, task-2 Goal): the
 * provider probe always runs first, and `storeApiKey` is only ever reached on a 'valid'
 * outcome -- an invalid/transient result returns the normalized error code straight away,
 * with nothing written to Vault or the metadata table.
 */
export const handleSaveApiKey = async (
  params: SaveApiKeyParams,
  deps: SaveApiKeyDeps,
): Promise<SaveApiKeyResult> => {
  const outcome = await deps.validateKey(params.provider, params.apiKey);

  if (outcome !== 'valid') {
    deps.log({ action: 'save', outcome, userId: params.userId });
    return { code: outcome === 'invalid' ? 'invalid_key' : 'network_error' };
  }

  const stored = await deps.storeApiKey(params);
  deps.log({ action: 'save', outcome: 'success', userId: params.userId });
  return { hasKey: true, provider: stored.provider as AiProvider, updatedAt: stored.updatedAt };
};
