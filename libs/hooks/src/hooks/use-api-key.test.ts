jest.mock('@helsoft/services', () => ({
  ApiKeyService: {
    saveApiKey: jest.fn(),
    getApiKeyStatus: jest.fn(),
    removeApiKey: jest.fn(),
  },
}));
jest.mock('./use-session', () => ({ useSession: jest.fn() }));

import { createElement } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { ApiKeyService } from '@helsoft/services';

import { ApiKeyProvider, useApiKey } from './use-api-key';
import { useSession } from './use-session';

const service = ApiKeyService as jest.Mocked<typeof ApiKeyService>;
const mockUseSession = useSession as jest.Mock;

const authenticatedSession = { session: { access_token: 'tok' }, isLoading: false };
const noSession = { session: null, isLoading: false };

describe('useApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.getApiKeyStatus.mockResolvedValue({ hasKey: false });
  });

  // @s3 — on mount for an authenticated user, the status loads and hasKey reflects the
  // stored state.
  it('loads the status on mount when authenticated and reflects hasKey: true', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    const status = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.getApiKeyStatus.mockResolvedValue(status);

    const { result } = renderHook(() => useApiKey());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toEqual(status);
    expect(service.getApiKeyStatus).toHaveBeenCalledWith();
  });

  // @s3 — isLoading is true for the initial fetch, false once it resolves.
  it('sets isLoading true during the initial fetch and false once it resolves', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    let resolveStatus: (value: unknown) => void = () => {};
    service.getApiKeyStatus.mockReturnValue(
      new Promise((resolve) => {
        resolveStatus = resolve;
      }) as never,
    );

    const { result } = renderHook(() => useApiKey());
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveStatus({ hasKey: false });
    });

    expect(result.current.isLoading).toBe(false);
  });

  // Task-6 Goal — the status load only runs "when authenticated"; an unauthenticated session
  // never calls the service, and loading resolves to false with the default no-key status.
  it('does not load the status when there is no session', async () => {
    mockUseSession.mockReturnValue(noSession);

    const { result } = renderHook(() => useApiKey());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(service.getApiKeyStatus).not.toHaveBeenCalled();
    expect(result.current.status).toEqual({ hasKey: false });
  });

  // Integration regression (task-8) — useSession() itself starts with isLoading: true and
  // session: null before its own getSession() resolves. useApiKey must not read that
  // transient "not yet known" null as "definitely unauthenticated" and prematurely flip its
  // own isLoading to false without ever having loaded the real status.
  it('keeps isLoading true (and never calls the service) while the session itself is still resolving', async () => {
    mockUseSession.mockReturnValue({ session: null, isLoading: true });

    const { result } = renderHook(() => useApiKey());

    expect(result.current.isLoading).toBe(true);
    expect(service.getApiKeyStatus).not.toHaveBeenCalled();
  });

  // Same regression, the other half: once the session resolves to authenticated, the status
  // load runs (it doesn't stay stuck skipped just because it was previously "not yet known").
  it('loads the status once the session resolves from still-loading to authenticated', async () => {
    const status = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.getApiKeyStatus.mockResolvedValue(status);
    mockUseSession.mockReturnValue({ session: null, isLoading: true });

    const { result, rerender } = renderHook(() => useApiKey());
    expect(result.current.isLoading).toBe(true);

    mockUseSession.mockReturnValue(authenticatedSession);
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toEqual(status);
  });

  // Full-review Round 1, Major 3 — supabase-js emits a referentially-new `session` object for
  // the *same* authenticated user on benign events (INITIAL_SESSION, TOKEN_REFRESHED, a
  // refocus-triggered SIGNED_IN). None of these represent an actual key-status change, so once
  // the status has already loaded, a same-user session replacement must not re-trigger
  // getApiKeyStatus (which would flip isLoading back on and flash the Loading state for no
  // reason).
  it('does not reload the status when the session is replaced by a referentially-new object for the same user', async () => {
    const sessionForUser1 = { access_token: 'tok-1', user: { id: 'user-1' } };
    mockUseSession.mockReturnValue({ session: sessionForUser1, isLoading: false });
    service.getApiKeyStatus.mockResolvedValue({
      hasKey: true,
      provider: 'openai',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const { result, rerender } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(service.getApiKeyStatus).toHaveBeenCalledTimes(1);

    const refreshedSessionSameUser = { access_token: 'tok-2', user: { id: 'user-1' } };
    mockUseSession.mockReturnValue({ session: refreshedSessionSameUser, isLoading: false });
    rerender();

    expect(service.getApiKeyStatus).toHaveBeenCalledTimes(1);
  });

  // @s1 (hook half) — saveApiKey calls the service and updates status to the masked saved
  // state on success.
  it('saveApiKey calls ApiKeyService.saveApiKey and updates status on success', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    const status = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.saveApiKey.mockResolvedValue(status);
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveApiKey('sk-test-key');
    });

    expect(service.saveApiKey).toHaveBeenCalledWith('sk-test-key');
    expect(result.current.status).toEqual(status);
  });

  // @s2 — isSubmitting is true while a save is in flight, false once it resolves.
  it('sets isSubmitting true during saveApiKey and false after it resolves', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    let resolveSave: (value: unknown) => void = () => {};
    service.saveApiKey.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }) as never,
    );
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isSubmitting).toBe(false);

    let savePromise!: Promise<void>;
    act(() => {
      savePromise = result.current.saveApiKey('sk-test-key');
    });
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSave({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
      await savePromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  // isSubmitting must also return to false when the save rejects, not only when it resolves.
  it('sets isSubmitting back to false after a failed saveApiKey', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.saveApiKey('sk-test-key')).rejects.toThrow('boom');
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  // error starts out null and stays null through a successful save.
  it('exposes a null error by default and after a successful save', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockResolvedValue({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();

    await act(async () => {
      await result.current.saveApiKey('sk-test-key');
    });

    expect(result.current.error).toBeNull();
  });

  // @s6/@s7 (task-10) — a failed saveApiKey sets error to the service's normalized code
  // (ApiKeyService already narrows every failure to a closed ApiKeyErrorCode).
  it('sets error to the normalized code after a failed saveApiKey', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockRejectedValue(Object.assign(new Error('bad key'), { code: 'invalid_key' }));
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.saveApiKey('sk-bad-key')).rejects.toThrow('bad key');
    });

    expect(result.current.error).toBe('invalid_key');
  });

  // @s7 — a retry (a subsequent successful saveApiKey) clears a previously set error.
  it('clears a previously set error once a retried saveApiKey succeeds', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockRejectedValueOnce(Object.assign(new Error('offline'), { code: 'network_error' }));
    const status = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.saveApiKey.mockResolvedValueOnce(status);
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.saveApiKey('sk-test-key')).rejects.toThrow('offline');
    });
    expect(result.current.error).toBe('network_error');

    await act(async () => {
      await result.current.saveApiKey('sk-test-key');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.status).toEqual(status);
  });

  // Task-10 Notes — an off-contract rejection (missing/unrecognized code) falls back to
  // network_error rather than trusting an unchecked cast (mirrors useAuth's isAuthErrorShape).
  it('falls back to network_error when the rejection carries no recognized code', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockRejectedValue(new Error('unexpected'));
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.saveApiKey('sk-test-key')).rejects.toThrow('unexpected');
    });

    expect(result.current.error).toBe('network_error');
  });

  // Task-6 Goal — a status load that resolves after unmount must not attempt a state update
  // on the unmounted hook (set-after-unmount race guard).
  it('ignores a status load that resolves after unmount', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    let resolveStatus: (value: unknown) => void = () => {};
    service.getApiKeyStatus.mockReturnValue(
      new Promise((resolve) => {
        resolveStatus = resolve;
      }) as never,
    );
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = renderHook(() => useApiKey());
    unmount();

    await act(async () => {
      resolveStatus({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // The `cancelled` guard also protects a session-change-while-in-flight race (not just
  // unmount): the effect re-runs (with cleanup) whenever the session changes, so a status load
  // still in flight for a now-logged-out user must not be allowed to overwrite the already-reset
  // no-key state once it resolves.
  it('does not let a status load in flight before logout clobber the reset no-key status once it resolves', async () => {
    const sessionForUser1 = { access_token: 'tok-1', user: { id: 'user-1' } };
    mockUseSession.mockReturnValue({ session: sessionForUser1, isLoading: false });
    let resolveStatus: (value: unknown) => void = () => {};
    service.getApiKeyStatus.mockReturnValue(
      new Promise((resolve) => {
        resolveStatus = resolve;
      }) as never,
    );

    const { result, rerender } = renderHook(() => useApiKey());

    mockUseSession.mockReturnValue({ session: null, isLoading: false });
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toEqual({ hasKey: false });

    await act(async () => {
      resolveStatus({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    });

    expect(result.current.status).toEqual({ hasKey: false });
  });

  // The raw key must never be retained in hook state -- it is passed through to the service
  // and nothing else keeps a reference to it.
  it('does not retain the raw key anywhere in the returned hook state', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.saveApiKey.mockResolvedValue({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveApiKey('sk-should-never-be-retained');
    });

    expect(JSON.stringify(result.current)).not.toContain('sk-should-never-be-retained');
  });

  // @s8 — a successful removeApiKey calls the service and updates status to the no-key state.
  it('removeApiKey calls ApiKeyService.removeApiKey and updates status on success', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.getApiKeyStatus.mockResolvedValue({ hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    service.removeApiKey.mockResolvedValue({ hasKey: false });
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeApiKey();
    });

    expect(service.removeApiKey).toHaveBeenCalledWith();
    expect(result.current.status).toEqual({ hasKey: false });
    expect(result.current.error).toBeNull();
  });

  // @s9 — a failed removeApiKey sets the normalized error code and leaves the previously
  // saved status untouched (the key is preserved).
  it('sets error and preserves the saved status after a failed removeApiKey', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    const savedStatus = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.getApiKeyStatus.mockResolvedValue(savedStatus);
    service.removeApiKey.mockRejectedValue(Object.assign(new Error('delete failed'), { code: 'network_error' }));
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.removeApiKey()).rejects.toThrow('delete failed');
    });

    expect(result.current.error).toBe('network_error');
    expect(result.current.status).toEqual(savedStatus);
  });

  // isSubmitting also drives the removeApiKey in-flight window, same as saveApiKey.
  it('sets isSubmitting true during removeApiKey and false once it resolves', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    let resolveRemove: (value: unknown) => void = () => {};
    service.removeApiKey.mockReturnValue(
      new Promise((resolve) => {
        resolveRemove = resolve;
      }) as never,
    );
    const { result } = renderHook(() => useApiKey());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let removePromise!: Promise<void>;
    act(() => {
      removePromise = result.current.removeApiKey();
    });
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveRemove({ hasKey: false });
      await removePromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});

// Full-review Round 1, Minor 14 — api-key-settings.tsx and api-key-gate.tsx each call
// useApiKey() independently; without a shared source, visiting both Settings and Upload in one
// session (expo-router keeps both mounted) issues two redundant getApiKeyStatus() reads of the
// same row. ApiKeyProvider computes the status once and shares it via context with every
// useApiKey() call nested underneath it, while a useApiKey() call with no ApiKeyProvider
// ancestor keeps behaving exactly as it always has (all tests above are unaffected).
describe('ApiKeyProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  // A tiny consumer that reports every render's hook result up via a callback, so the test can
  // assert on values without needing JSX/`.tsx` in a lib that has neither configured.
  const Consumer = ({ onRender }: { onRender: (result: ReturnType<typeof useApiKey>) => void }) => {
    onRender(useApiKey());
    return null;
  };

  it('shares one underlying status fetch across multiple useApiKey() consumers nested under one ApiKeyProvider', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    const status = { hasKey: true, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
    service.getApiKeyStatus.mockResolvedValue(status);

    const renders1: Array<ReturnType<typeof useApiKey>> = [];
    const renders2: Array<ReturnType<typeof useApiKey>> = [];
    render(
      createElement(
        ApiKeyProvider,
        null,
        createElement(Consumer, { onRender: (r) => renders1.push(r) }),
        createElement(Consumer, { onRender: (r) => renders2.push(r) }),
      ),
    );

    await waitFor(() => expect(renders1.at(-1)?.isLoading).toBe(false));

    expect(service.getApiKeyStatus).toHaveBeenCalledTimes(1);
    expect(renders1.at(-1)?.status).toEqual(status);
    expect(renders2.at(-1)?.status).toEqual(status);
  });

  // Without a provider ancestor, useApiKey() keeps computing its own independent state (every
  // test above this describe block exercises exactly this path, unwrapped).
  it('falls back to its own independent state when rendered without an ApiKeyProvider ancestor', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.getApiKeyStatus.mockResolvedValue({ hasKey: false });

    const { result } = renderHook(() => useApiKey());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(service.getApiKeyStatus).toHaveBeenCalledTimes(1);
  });

  // Full-review Round 2, Minor 2 — the context value handed to every nested useApiKey() call
  // must stay referentially stable across a re-render where none of status/isLoading/
  // isSubmitting/error actually changed, or every consumer re-renders unnecessarily whenever
  // ApiKeyProvider's own ancestor re-renders for an unrelated reason.
  it('returns a referentially stable context value across an unrelated parent re-render', async () => {
    mockUseSession.mockReturnValue(authenticatedSession);
    service.getApiKeyStatus.mockResolvedValue({ hasKey: false });

    const renders: Array<ReturnType<typeof useApiKey>> = [];
    const tree = (label: string) =>
      createElement(
        ApiKeyProvider,
        null,
        createElement(Consumer, { onRender: (r) => renders.push(r) }),
        createElement('span', null, label),
      );

    const { rerender } = render(tree('first'));
    await waitFor(() => expect(renders.at(-1)?.isLoading).toBe(false));
    const stableValue = renders.at(-1);

    rerender(tree('second'));

    expect(renders.at(-1)).toBe(stableValue);
  });
});
