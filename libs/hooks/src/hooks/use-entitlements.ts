import { EntitlementsService } from '@helsoft/supabase-services';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { useApiKey } from './use-api-key';
import { useEntitlementsInitialState, useEntitlementsReducer } from './use-entitlements.reducer';
import type { ProfileProviderProps, UseEntitlementsResult } from './use-entitlements.types';
import { useSession } from './use-session';

/**
 * Shared entitlements state. `skip` keeps hooks-order stable when a `ProfileProvider`
 * ancestor already owns the single profile+flags fetch.
 */
const useEntitlementsState = (skip: boolean): UseEntitlementsResult => {
  const { session, isLoading: isSessionLoading } = useSession();
  const sessionUserId = session?.user?.id;
  const { status: apiKeyStatus, isLoading: isApiKeyLoading } = useApiKey();
  const [state, dispatch] = useReducer(useEntitlementsReducer, useEntitlementsInitialState);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (skip) return;
    const id = ++requestId.current;
    dispatch({ type: 'load/start' });
    void EntitlementsService.getEntitlements()
      .then((data) => {
        if (id !== requestId.current) return;
        dispatch({ type: 'load/success', data });
      })
      .catch((cause: unknown) => {
        if (id !== requestId.current) return;
        dispatch({
          type: 'load/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      });
  }, [skip]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on sessionUserId, not session object
  useEffect(() => {
    if (skip) return;
    if (isSessionLoading) return;
    if (!sessionUserId) {
      dispatch({ type: 'load/unauthenticated' });
      return;
    }
    load();
  }, [skip, sessionUserId, isSessionLoading, load]);

  const isLoading = state.isLoading || isApiKeyLoading || isSessionLoading;
  const entitlements = useMemo(() => {
    if (!state.data || isLoading || state.error) return null;
    return {
      ...state.data,
      canCreate: state.data.canCreateWithoutKey || apiKeyStatus.hasKey,
    };
  }, [apiKeyStatus.hasKey, isLoading, state.data, state.error]);

  return useMemo(
    () => ({ entitlements, isLoading, error: state.error, retry: load }),
    [entitlements, isLoading, state.error, load],
  );
};

const EntitlementsContext = createContext<UseEntitlementsResult | undefined>(undefined);

/**
 * One profile→plans join (via EntitlementsService) shared app-wide when under
 * `ProfileProvider`. Standalone still works for tests/Storybook without a provider.
 */
export const useEntitlements = (): UseEntitlementsResult => {
  const shared = useContext(EntitlementsContext);
  const own = useEntitlementsState(shared !== undefined);
  return shared ?? own;
};

/** Owns the single profile+flags fetch for the authenticated app shell. Nest under `ApiKeyProvider`. */
export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const value = useEntitlementsState(false);
  return createElement(EntitlementsContext.Provider, { value }, children);
};
