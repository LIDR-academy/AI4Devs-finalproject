import type { AiProvider, ApiKeyError, ApiKeyErrorCode, ApiKeyStatus } from '@helsoft/types';

import { ApiKeyDao } from '../dao/api-key.dao';
import { toTypedError } from '../utils/typed-error';

const DEFAULT_PROVIDER: AiProvider = 'groq';

const toApiKeyError = (code: ApiKeyErrorCode, message: string): Error & ApiKeyError =>
  toTypedError(code, message);

/** A validation-layer failure — the defensive backstop (spec.md Open decision 3), mirroring
 * AuthService.signIn's empty-password rejection. */
const validationError = (message: string): Error & ApiKeyError =>
  toApiKeyError('validation_error', message);

/** Every raw ApiKeyDao.saveApiKey/removeApiKey rejection (structured Edge Function body,
 * transport failure, thrown, unknown) collapses to the one typed failure code — the raw
 * error shape never leaks upward (task-10 Goal). */
const networkError = (): Error & ApiKeyError => toApiKeyError('network_error', 'Network error');

/**
 * Business logic over ApiKeyDao: validates the key before ever calling the DAO, normalizes
 * every save/remove failure into the typed ApiKeyErrorCode contract, and shields a status
 * read from crashing the UI on failure.
 */
export abstract class ApiKeyService {
  static async saveApiKey(
    rawKey: string,
    provider: AiProvider = DEFAULT_PROVIDER,
  ): Promise<ApiKeyStatus> {
    if (!rawKey.trim()) {
      throw validationError('API key is required');
    }
    try {
      return await ApiKeyDao.saveApiKey({ provider, apiKey: rawKey });
    } catch {
      throw networkError();
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
    } catch {
      throw networkError();
    }
  }
}
