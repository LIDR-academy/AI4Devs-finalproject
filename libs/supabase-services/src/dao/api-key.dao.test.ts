jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { ApiKeyDao } from './api-key.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('ApiKeyDao', () => {
  const invoke = jest.fn();
  const select = jest.fn();
  const from = jest.fn(() => ({ select }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue({ functions: { invoke }, from });
  });

  // @s1 (client half, task-4) — saveApiKey invokes the manage-api-key Edge Function with the
  // save action + the given provider/key, and returns the masked status it replies with.
  it('saveApiKey invokes manage-api-key with the save action and returns the masked status', async () => {
    const status = { hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' };
    invoke.mockResolvedValue({ data: status, error: null });

    const result = await ApiKeyDao.saveApiKey({ provider: 'openai', apiKey: 'sk-test-key' });

    expect(invoke).toHaveBeenCalledWith('manage-api-key', {
      body: { action: 'save', provider: 'openai', apiKey: 'sk-test-key' },
    });
    expect(result).toBe(status);
  });

  // @s1 (failure path) — a structured Edge Function error is thrown as-is; normalizing it to
  // an ApiKeyErrorCode is the service's job (task-5/task-10), not the DAO's.
  it('saveApiKey throws the raw invoke error when the function call fails', async () => {
    const error = { message: 'edge function error' };
    invoke.mockResolvedValue({ data: null, error });

    await expect(ApiKeyDao.saveApiKey({ provider: 'openai', apiKey: 'sk-test-key' })).rejects.toBe(
      error,
    );
  });

  // @s3 — a saved row maps to a masked, present status.
  it('getApiKeyStatus maps a present row to a masked hasKey: true status', async () => {
    select.mockResolvedValue({
      data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
      error: null,
    });

    const result = await ApiKeyDao.getApiKeyStatus();

    expect(from).toHaveBeenCalledWith('user_ai_keys');
    expect(select).toHaveBeenCalledWith('provider, updated_at');
    expect(result).toEqual({
      hasKey: true,
      provider: 'openai',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  // @s3 — no row (no key saved yet) maps to the no-key status.
  it('getApiKeyStatus maps no row to a hasKey: false status', async () => {
    select.mockResolvedValue({ data: [], error: null });

    await expect(ApiKeyDao.getApiKeyStatus()).resolves.toEqual({ hasKey: false });
  });

  // @s3 (failure path) — a raw select error is thrown as-is; the service (task-5) is
  // responsible for degrading this to a safe hasKey: false rather than throwing to the UI.
  it('getApiKeyStatus throws the raw select error when the query fails', async () => {
    const error = { message: 'select failed' };
    select.mockResolvedValue({ data: null, error });

    await expect(ApiKeyDao.getApiKeyStatus()).rejects.toBe(error);
  });

  // @s11 — the DAO exposes no raw-key read path: the status select lists only non-secret
  // columns, and the masked result it returns carries no key-shaped field.
  it('getApiKeyStatus selects only non-secret columns and returns no key field', async () => {
    select.mockResolvedValue({
      data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
      error: null,
    });

    const result = await ApiKeyDao.getApiKeyStatus();

    expect(select).toHaveBeenCalledWith(expect.not.stringMatching(/api_?key|secret/i));
    expect(Object.keys(result).sort()).toEqual(['hasKey', 'provider', 'updatedAt'].sort());
  });

  // @s8 (client half, task-10) — removeApiKey invokes the manage-api-key Edge Function with
  // the remove action and returns the resulting (no-key) status.
  it('removeApiKey invokes manage-api-key with the remove action and returns the resulting status', async () => {
    invoke.mockResolvedValue({ data: { hasKey: false }, error: null });

    const result = await ApiKeyDao.removeApiKey();

    expect(invoke).toHaveBeenCalledWith('manage-api-key', { body: { action: 'remove' } });
    expect(result).toEqual({ hasKey: false });
  });

  // @s9 (failure path) — a structured Edge Function error is thrown as-is; normalizing it to
  // an ApiKeyErrorCode is the service's job, not the DAO's.
  it('removeApiKey throws the raw invoke error when the function call fails', async () => {
    const error = { message: 'edge function error' };
    invoke.mockResolvedValue({ data: null, error });

    await expect(ApiKeyDao.removeApiKey()).rejects.toBe(error);
  });
});
