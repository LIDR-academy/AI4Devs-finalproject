export type RemoveApiKeyParams = {
  userId: string;
};

export type RemoveApiKeyErrorResult = { code: 'network_error' };

export type RemoveApiKeyResult = { hasKey: false } | RemoveApiKeyErrorResult;

export type RemoveApiKeyDeps = {
  removeApiKey: (params: RemoveApiKeyParams) => Promise<void>;
  log: (event: { action: 'remove'; outcome: string; userId: string }) => void;
};

/**
 * Deletes the caller's stored key (Vault secret + metadata row, via the injected
 * `removeApiKey`) and replies with the no-key status. A failure normalizes to
 * `network_error` and leaves the stored key untouched -- there is no separate store/delete
 * step here for the caller to accidentally trigger on the failure branch (task-9 Goal).
 */
export const handleRemoveApiKey = async (
  params: RemoveApiKeyParams,
  deps: RemoveApiKeyDeps,
): Promise<RemoveApiKeyResult> => {
  try {
    await deps.removeApiKey(params);
    deps.log({ action: 'remove', outcome: 'success', userId: params.userId });
    return { hasKey: false };
  } catch {
    deps.log({ action: 'remove', outcome: 'network_error', userId: params.userId });
    return { code: 'network_error' };
  }
};
