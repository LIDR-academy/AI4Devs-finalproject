jest.mock('../dao/api-key.dao', () => ({
  ApiKeyDao: {
    saveApiKey: jest.fn(),
    getApiKeyStatus: jest.fn(),
    removeApiKey: jest.fn(),
  },
}));

import { FunctionsHttpError } from '@supabase/supabase-js';

import { ApiKeyDao } from '../dao/api-key.dao';
import { ApiKeyService } from './api-key.service';

const dao = ApiKeyDao as jest.Mocked<typeof ApiKeyDao>;

/** Builds the exact shape ApiKeyDao.saveApiKey/removeApiKey rejects with when the
 * manage-api-key Edge Function replies with a structured, non-2xx JSON error body
 * (real supabase-js `functions.invoke` behavior — see FunctionsClient.invoke). */
const edgeFunctionError = (body: unknown) =>
  new FunctionsHttpError({ json: () => Promise.resolve(body) });

describe('ApiKeyService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('saveApiKey', () => {
    // @s1 (service half) — a non-blank key is forwarded to the DAO (defaulting to the v1
    // 'openai' provider) and the masked status it returns is passed straight back.
    it('saves a non-blank key through the DAO with the default openai provider and returns the masked status', async () => {
      const status = {
        hasKey: true,
        provider: 'openai' as const,
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      dao.saveApiKey.mockResolvedValue(status);

      await expect(ApiKeyService.saveApiKey('sk-test-key')).resolves.toBe(status);
      expect(dao.saveApiKey).toHaveBeenCalledWith({ provider: 'openai', apiKey: 'sk-test-key' });
    });

    // @s4 — replacing an already-saved key runs through the exact same DAO call; the service
    // never special-cases first-save vs. update (the Edge Function upserts).
    it('runs the same save path again when a key is already saved (update/replace)', async () => {
      const firstStatus = {
        hasKey: true,
        provider: 'openai' as const,
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const secondStatus = {
        hasKey: true,
        provider: 'openai' as const,
        updatedAt: '2026-02-01T00:00:00.000Z',
      };
      dao.saveApiKey.mockResolvedValueOnce(firstStatus).mockResolvedValueOnce(secondStatus);

      await expect(ApiKeyService.saveApiKey('sk-first-key')).resolves.toBe(firstStatus);
      await expect(ApiKeyService.saveApiKey('sk-replacement-key')).resolves.toBe(secondStatus);

      expect(dao.saveApiKey).toHaveBeenNthCalledWith(1, {
        provider: 'openai',
        apiKey: 'sk-first-key',
      });
      expect(dao.saveApiKey).toHaveBeenNthCalledWith(2, {
        provider: 'openai',
        apiKey: 'sk-replacement-key',
      });
    });

    // @s5 (service half + defensive backstop, spec.md Open decision 3) — a blank key is
    // rejected before any DAO round-trip. Unreachable through ApiKeyForm (its Save control
    // stays disabled until non-blank, @s5/task-7) — this is the backstop for any future
    // caller that bypasses the form, mirroring AuthService.signIn's empty-password rejection.
    it('rejects a blank key without calling the DAO', async () => {
      await expect(ApiKeyService.saveApiKey('')).rejects.toThrow('API key is required');
      await expect(ApiKeyService.saveApiKey('')).rejects.toMatchObject({
        code: 'validation_error',
      });
      expect(dao.saveApiKey).not.toHaveBeenCalled();
    });

    it('rejects a whitespace-only key without calling the DAO', async () => {
      await expect(ApiKeyService.saveApiKey('   ')).rejects.toMatchObject({
        code: 'validation_error',
      });
      expect(dao.saveApiKey).not.toHaveBeenCalled();
    });

    // The Edge Function's structured error rejection normalizes to the typed network_error
    // code; the raw FunctionsHttpError never leaks upward.
    it('normalizes a structured Edge Function rejection to a typed network_error', async () => {
      dao.saveApiKey.mockRejectedValue(edgeFunctionError({ code: 'network_error' }));

      await expect(ApiKeyService.saveApiKey('sk-bad-key')).rejects.toMatchObject({
        code: 'network_error',
      });
    });

    // @s7 — a transport/thrown failure normalizes to
    // the safer default, network_error; a retry is just calling saveApiKey again.
    it('normalizes a transport failure to a typed network_error, and a retry succeeds independently', async () => {
      dao.saveApiKey.mockRejectedValueOnce(new Error('offline'));
      const status = {
        hasKey: true,
        provider: 'openai' as const,
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      dao.saveApiKey.mockResolvedValueOnce(status);

      await expect(ApiKeyService.saveApiKey('sk-test-key')).rejects.toMatchObject({
        code: 'network_error',
        message: 'Network error',
      });
      await expect(ApiKeyService.saveApiKey('sk-test-key')).resolves.toBe(status);
    });
  });

  describe('getApiKeyStatus', () => {
    // @s3 — the DAO's masked status is returned as-is.
    it('returns the masked status from the DAO', async () => {
      const status = {
        hasKey: true,
        provider: 'openai' as const,
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      dao.getApiKeyStatus.mockResolvedValue(status);

      await expect(ApiKeyService.getApiKeyStatus()).resolves.toBe(status);
    });

    // @s3 — a failed read degrades to the safe no-key status rather than throwing, so the UI
    // never crashes on a status-load failure.
    it('resolves to hasKey: false when the DAO read fails (never throws)', async () => {
      dao.getApiKeyStatus.mockRejectedValue(new Error('network down'));

      await expect(ApiKeyService.getApiKeyStatus()).resolves.toEqual({ hasKey: false });
    });
  });

  describe('removeApiKey', () => {
    // @s8 — a successful remove returns the DAO's no-key status as-is.
    it('returns the no-key status from the DAO on success', async () => {
      dao.removeApiKey.mockResolvedValue({ hasKey: false });

      await expect(ApiKeyService.removeApiKey()).resolves.toEqual({ hasKey: false });
    });

    // @s9 — a failed remove normalizes to the typed network_error code; the raw DAO error
    // never leaks upward.
    it('normalizes a failed remove to a typed network_error', async () => {
      dao.removeApiKey.mockRejectedValue(new Error('delete failed'));

      await expect(ApiKeyService.removeApiKey()).rejects.toMatchObject({ code: 'network_error' });
    });
  });
});
