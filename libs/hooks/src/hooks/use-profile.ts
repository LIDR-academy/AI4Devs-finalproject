import { ProfileService } from '@helsoft/supabase-services';
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
import { useProfileInitialState, useProfileReducer } from './use-profile.reducer';
import type { ProfileProviderProps, UseProfileResult } from './use-profile.types';
import { useSession } from './use-session';

/**
 * Shared profile+flags state. `skip` keeps hooks-order stable when a `ProfileProvider`
 * ancestor already owns the single profile+flags fetch.
 */
const useProfileState = (skip: boolean): UseProfileResult => {
  const { session, isLoading: isSessionLoading } = useSession();
  const sessionUserId = session?.user?.id;
  const { status: apiKeyStatus, isLoading: isApiKeyLoading } = useApiKey();
  const [state, dispatch] = useReducer(useProfileReducer, useProfileInitialState);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (skip) return;
    const id = ++requestId.current;
    dispatch({ type: 'load/start' });
    void ProfileService.getProfile()
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
  const profile = useMemo(() => {
    if (!state.data || isLoading || state.error) return null;
    return {
      ...state.data,
      canCreate: state.data.keySource === 'platform' || apiKeyStatus.hasKey,
    };
  }, [apiKeyStatus.hasKey, isLoading, state.data, state.error]);

  return useMemo(
    () => ({ profile, isLoading, error: state.error, retry: load }),
    [profile, isLoading, state.error, load],
  );
};

const ProfileContext = createContext<UseProfileResult | undefined>(undefined);

/**
 * One profile→plans join (via ProfileService) shared app-wide when under
 * `ProfileProvider`. Standalone still works for tests/Storybook without a provider.
 */
export const useProfile = (): UseProfileResult => {
  const shared = useContext(ProfileContext);
  const own = useProfileState(shared !== undefined);
  return shared ?? own;
};

/** Owns the single profile+flags fetch for the authenticated app shell. Nest under `ApiKeyProvider`. */
export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const value = useProfileState(false);
  return createElement(ProfileContext.Provider, { value }, children);
};
