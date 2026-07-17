import { ApiKeyService } from '@helsoft/supabase-services';
import type { ApiKeyError, ApiKeyErrorCode, ApiKeyStatus } from '@helsoft/types';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useApiKeyInitialState, useApiKeyReducer } from './use-api-key.reducer';
import type { ApiKeyProviderProps, UseApiKeyResult } from './use-api-key.types';
import { useSession } from './use-session';

/** The closed set of codes ApiKeyService is contractually allowed to reject with. */
const API_KEY_ERROR_CODES: ReadonlySet<ApiKeyErrorCode> = new Set([
  'network_error',
  'validation_error',
]);

/** Narrow runtime guard: a rejected ApiKeyService cause is only trusted as an ApiKeyError
 * when its `.code` is actually a member of the closed ApiKeyErrorCode union — a violated
 * contract falls back to network_error rather than reading an untrusted value via an
 * unchecked cast (mirrors useAuth's isAuthErrorShape). */
const isApiKeyErrorShape = (cause: unknown): cause is ApiKeyError =>
  API_KEY_ERROR_CODES.has((cause as { code?: unknown } | null)?.code as ApiKeyErrorCode);

/**
 * The full stateful implementation, shared by both the standalone `useApiKey()` path and
 * `ApiKeyProvider` (Full-review Round 1, Minor 14). `skip` short-circuits the status-fetch
 * effect without skipping the hook call itself (rules-of-hooks: hooks are always called in the
 * same order every render) — used when a shared `ApiKeyProvider` ancestor already owns the
 * fetch, so this instance's own effect becomes an inert no-op instead of duplicating it.
 */
const useApiKeyState = (skip: boolean): UseApiKeyResult => {
  const { session, isLoading: isSessionLoading } = useSession();
  // Full-review Round 1, Major 3 — supabase-js emits a referentially-new `session` object for
  // the *same* authenticated user on several benign events (INITIAL_SESSION, periodic
  // TOKEN_REFRESHED, a refocus-triggered SIGNED_IN); none of those represent an actual
  // key-status change. Keying the effect below on this stable, derived id (rather than the
  // session object reference) avoids a redundant getApiKeyStatus() call + Loading-state
  // flicker on those events, while still reloading correctly if a genuinely different user
  // signs in (sessionUserId then changes too).
  const sessionUserId = session?.user?.id;
  const [state, dispatch] = useReducer(useApiKeyReducer, useApiKeyInitialState);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the derived sessionUserId instead of the session object on purpose — see the comment above sessionUserId
  useEffect(() => {
    // A shared ApiKeyProvider ancestor already owns the fetch for this instance — stay inert.
    if (skip) return;

    // Guards against a set-after-unmount race: a status load that resolves after the
    // component has gone away must not attempt to update state.
    let cancelled = false;

    // useSession() itself starts with session: null before its own getSession() resolves —
    // that transient "not yet known" must not be read as "definitely unauthenticated", or
    // isLoading would prematurely flip false without ever loading the real status.
    if (isSessionLoading) return;

    if (!session) {
      dispatch({ type: 'status/unauthenticated' });
      return;
    }

    dispatch({ type: 'status/load/start' });
    ApiKeyService.getApiKeyStatus().then((nextStatus) => {
      if (cancelled) return;
      dispatch({ type: 'status/load/success', status: nextStatus });
    });

    return () => {
      cancelled = true;
    };
  }, [skip, sessionUserId, isSessionLoading]);

  // Shared in-flight/error bookkeeping for either one-shot mutation (save/remove): flips
  // isSubmitting on for the duration of the call, updates status + clears error on success,
  // or sets the normalized error code and rethrows on failure — leaving status untouched
  // (@s9's "the saved key remains").
  const runMutation = useCallback(async (mutate: () => Promise<ApiKeyStatus>) => {
    dispatch({ type: 'mutation/start' });
    try {
      const nextStatus = await mutate();
      dispatch({ type: 'mutation/success', status: nextStatus });
    } catch (cause) {
      dispatch({
        type: 'mutation/failure',
        error: isApiKeyErrorShape(cause) ? cause.code : 'network_error',
      });
      throw cause;
    }
  }, []);

  const saveApiKey = useCallback(
    (rawKey: string) => runMutation(() => ApiKeyService.saveApiKey(rawKey)),
    [runMutation],
  );
  const removeApiKey = useCallback(
    () => runMutation(() => ApiKeyService.removeApiKey()),
    [runMutation],
  );

  // Full-review Round 2, Minor 2 — this object is both the standalone useApiKey() return value
  // and ApiKeyProvider's context `value`; without memoization it is a fresh allocation every
  // render, so React's Context propagation re-renders every nested useApiKey() consumer whenever
  // ApiKeyProvider (or its own ancestor) re-renders, even when none of these fields changed.
  return useMemo(
    () => ({
      status: state.status,
      isLoading: state.isLoading,
      isSubmitting: state.isSubmitting,
      error: state.error,
      saveApiKey,
      removeApiKey,
    }),
    [state.status, state.isLoading, state.isSubmitting, state.error, saveApiKey, removeApiKey],
  );
};

/** Undefined by default: `useApiKey()` only reads from this when an `ApiKeyProvider` ancestor
 * actually exists (Full-review Round 1, Minor 14) — everywhere else it keeps computing its own
 * independent state exactly as before. */
const ApiKeyContext = createContext<UseApiKeyResult | undefined>(undefined);

/**
 * React integration over ApiKeyService: loads the current key status for an authenticated
 * user and exposes a one-shot save mutation. Plain-state (no tanstack-query, spec.md Open
 * decisions) — the same shape as useAuth. Never retains the raw key in hook state: it is
 * passed straight through to the service and dropped once saveApiKey resolves.
 *
 * When called underneath an `ApiKeyProvider`, returns that provider's single shared instance
 * instead of computing its own (Full-review Round 1, Minor 14 — avoids redundant
 * `getApiKeyStatus()` reads when e.g. both the Settings and Upload screens are mounted in the
 * same expo-router session). Standalone (no provider ancestor), behavior is unchanged.
 */
export const useApiKey = (): UseApiKeyResult => {
  const shared = useContext(ApiKeyContext);
  const own = useApiKeyState(shared !== undefined);
  return shared ?? own;
};

/**
 * Computes `useApiKey()`'s state once and shares it via context with every `useApiKey()` call
 * nested underneath it (Full-review Round 1, Minor 14). Wire this once around the app screens
 * that read key status (Settings, Upload) so visiting both in one session shares a single
 * status read instead of issuing one per screen.
 */
export const ApiKeyProvider = ({ children }: ApiKeyProviderProps) => {
  const value = useApiKeyState(false);
  return createElement(ApiKeyContext.Provider, { value }, children);
};
