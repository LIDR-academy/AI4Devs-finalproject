import type { Session, SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useApiKey } from './use-api-key';

/**
 * Integration (ai-key-management, Slice 1 task-8 + Slice 2 task-10): useApiKey ->
 * ApiKeyService -> ApiKeyDao, exercised for real, against a mocked Supabase client boundary
 * (only `auth.getSession`, `from(...).select(...)`, and `functions.invoke` are stubbed —
 * nothing above the DAO is mocked). Mirrors the login-and-logout `auth.integration.test.ts`
 * pattern: one real `SupabaseClient` built once for the whole file (matching `initSupabase()`
 * being called once at app startup) so supabase-js never logs its "Multiple GoTrueClient
 * instances" warning.
 *
 * `functions` is a getter on `SupabaseClient` that constructs a fresh `FunctionsClient` on
 * every access (supabase-js source), so spying on one `client.functions` instance's own
 * `invoke` would not affect the DAO's own later `getSupabase().functions.invoke(...)` access.
 * Spying on the shared prototype (`Object.getPrototypeOf(client.functions)`) instead reaches
 * every instance, since `invoke` is a regular class method, not a per-instance field.
 */
let client: SupabaseClient;

const authenticatedSession = { access_token: 'tok-1' } as Session;

const mockInvoke = (impl: (...args: unknown[]) => unknown) =>
  jest.spyOn(Object.getPrototypeOf(client.functions), 'invoke').mockImplementation(impl as never);

describe('ai-key-management integration (hook -> service -> DAO)', () => {
  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  beforeEach(() => {
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({
      data: { session: authenticatedSession },
      error: null,
    } as never);
    jest
      .spyOn(client.auth, 'onAuthStateChange')
      .mockImplementation(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }) as never);
  });

  afterEach(() => jest.restoreAllMocks());

  // @s3 — on mount, the status loads through the real hook -> service -> DAO chain and
  // reflects a previously-saved key from the mocked metadata select.
  it('loads the status on mount, reflecting a previously-saved key', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
      error: null,
    });
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => useApiKey());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(select).toHaveBeenCalledWith('provider, updated_at');
    expect(result.current.status).toEqual({
      hasKey: true,
      provider: 'openai',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  // @s1 — saving a key end-to-end (hook -> service -> DAO -> mocked manage-api-key invoke)
  // reflects the masked "key saved" status the Edge Function replies with.
  it('saves a key end-to-end and reflects the masked status the Edge Function returns', async () => {
    jest.spyOn(client, 'from').mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as never);
    const invoke = mockInvoke(() =>
      Promise.resolve({
        data: { hasKey: true, provider: 'openai', updatedAt: '2026-02-01T00:00:00.000Z' },
        error: null,
      }),
    );

    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toEqual({ hasKey: false });

    await act(async () => {
      await result.current.saveApiKey('sk-test-key');
    });

    expect(invoke).toHaveBeenCalledWith('manage-api-key', {
      body: { action: 'save', provider: 'openai', apiKey: 'sk-test-key' },
    });
    expect(result.current.status).toEqual({
      hasKey: true,
      provider: 'openai',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  // @s4 — replacing an already-saved key runs the exact same end-to-end path and reflects
  // the new masked status.
  it('replaces an already-saved key end-to-end and reflects the updated masked status', async () => {
    jest.spyOn(client, 'from').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
        error: null,
      }),
    } as never);
    const invoke = mockInvoke(() =>
      Promise.resolve({
        data: { hasKey: true, provider: 'openai', updatedAt: '2026-03-01T00:00:00.000Z' },
        error: null,
      }),
    );

    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status.updatedAt).toBe('2026-01-01T00:00:00.000Z');

    await act(async () => {
      await result.current.saveApiKey('sk-replacement-key');
    });

    expect(invoke).toHaveBeenCalledWith('manage-api-key', {
      body: { action: 'save', provider: 'openai', apiKey: 'sk-replacement-key' },
    });
    expect(result.current.status.updatedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  // @s8 (Slice 2, task-10) — removing a saved key end-to-end (hook -> service -> DAO ->
  // mocked manage-api-key invoke) reflects the no-key status the Edge Function replies with.
  it('removes a saved key end-to-end and reflects the no-key status', async () => {
    jest.spyOn(client, 'from').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
        error: null,
      }),
    } as never);
    const invoke = mockInvoke(() => Promise.resolve({ data: { hasKey: false }, error: null }));

    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status.hasKey).toBe(true);

    await act(async () => {
      await result.current.removeApiKey();
    });

    expect(invoke).toHaveBeenCalledWith('manage-api-key', { body: { action: 'remove' } });
    expect(result.current.status).toEqual({ hasKey: false });
    expect(result.current.error).toBeNull();
  });

  // @s9 (Slice 2, task-10) — a failed remove end-to-end normalizes to network_error and
  // leaves the previously-saved status untouched.
  it('normalizes a failed remove end-to-end and preserves the saved status', async () => {
    jest.spyOn(client, 'from').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ provider: 'openai', updated_at: '2026-01-01T00:00:00.000Z' }],
        error: null,
      }),
    } as never);
    mockInvoke(() => Promise.reject(new Error('edge unreachable')));

    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // The service normalizes every save/remove failure (spec.md's error contract) — the raw
    // cause's message never leaks upward, only the typed `code` does (asserted below).
    await act(async () => {
      await expect(result.current.removeApiKey()).rejects.toBeInstanceOf(Error);
    });

    expect(result.current.error).toBe('network_error');
    expect(result.current.status).toEqual({
      hasKey: true,
      provider: 'openai',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
