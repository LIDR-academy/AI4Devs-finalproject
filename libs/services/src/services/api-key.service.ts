import type { AiProvider, ApiKeyError, ApiKeyErrorCode, ApiKeyStatus } from '@helsoft/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

import { ApiKeyDao } from '../dao/api-key.dao';
import { toTypedError } from '../utils/typed-error';

const DEFAULT_PROVIDER: AiProvider = 'openai';

const toApiKeyError = (code: ApiKeyErrorCode, message: string): Error & ApiKeyError => toTypedError(code, message);

/** A validation-layer failure — the defensive backstop (spec.md Open decision 3), mirroring
 * AuthService.signIn's empty-password rejection. */
const validationError = (message: string): Error & ApiKeyError => toApiKeyError('validation_error', message);

/**
 * Reads the manage-api-key Edge Function's structured `{ code: 'invalid_key' }` body off a
 * thrown `FunctionsHttpError` (real supabase-js `functions.invoke` shape, spec.md's error
 * contract). Anything else — a malformed/unreadable body, a transport failure
 * (`FunctionsFetchError`), or any other unexpected exception — is not classified as
 * invalid_key here (task-10 Goal: "the safer default").
 */
const readsInvalidKeyBody = async (cause: unknown): Promise<boolean> => {
  if (!(cause instanceof FunctionsHttpError)) return false;
  try {
    const body = (await (cause.context as { json: () => Promise<unknown> }).json()) as { code?: unknown } | null;
    return body?.code === 'invalid_key';
  } catch {
    return false;
  }
};

/**
 * Maps a raw ApiKeyDao.saveApiKey/removeApiKey rejection onto the typed ApiKeyErrorCode
 * contract (task-10 Goal). Only the Edge Function's own invalid_key body becomes
 * `invalid_key`; every other failure (transport, thrown, unknown) becomes `network_error` —
 * the safer default, since we never want to claim "invalid key" when we don't actually know.
 */
const normalizeApiKeyError = async (cause: unknown): Promise<Error & ApiKeyError> => {
  if (await readsInvalidKeyBody(cause)) {
    return toApiKeyError('invalid_key', "That key didn't validate");
  }
  return toApiKeyError('network_error', 'Network error');
};

/**
 * Business logic over ApiKeyDao: validates the key before ever calling the DAO, normalizes
 * every save/remove failure into the typed ApiKeyErrorCode contract, and shields a status
 * read from crashing the UI on failure.
 */
export abstract class ApiKeyService {
  static async saveApiKey(rawKey: string, provider: AiProvider = DEFAULT_PROVIDER): Promise<ApiKeyStatus> {
    if (!rawKey.trim()) {
      throw validationError('API key is required');
    }
    try {
      return await ApiKeyDao.saveApiKey({ provider, apiKey: rawKey });
    } catch (cause) {
      throw await normalizeApiKeyError(cause);
    }
  }

  static async getApiKeyStatus(): Promise<ApiKeyStatus> {
    try {
      return await ApiKeyDao.getApiKeyStatus();
    } catch {
      return { hasKey: false };
    }
  }

  static async removeApiKey(): Promise<ApiKeyStatus> {
    try {
      return await ApiKeyDao.removeApiKey();
    } catch (cause) {
      throw await normalizeApiKeyError(cause);
    }
  }
}
