import { EntitlementsService } from '@helsoft/supabase-services';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { useApiKey } from './use-api-key';
import { useEntitlementsInitialState, useEntitlementsReducer } from './use-entitlements.reducer';
import type { UseEntitlementsResult } from './use-entitlements.types';

// Human-waived: TanStack Query is not installed; use local reducer state over the Supabase
// service, matching sibling data hooks such as useApiKey and useLessons.
export function useEntitlements(): UseEntitlementsResult {
  const { status: apiKeyStatus, isLoading: isApiKeyLoading } = useApiKey();
  const [state, dispatch] = useReducer(useEntitlementsReducer, useEntitlementsInitialState);
  const requestId = useRef(0);

  const load = useCallback(() => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isLoading = state.isLoading || isApiKeyLoading;
  const entitlements = useMemo(() => {
    if (!state.data || isLoading || state.error) return null;
    return {
      ...state.data,
      canCreate: state.data.canCreateWithoutKey || apiKeyStatus.hasKey,
    };
  }, [apiKeyStatus.hasKey, isLoading, state.data, state.error]);

  return { entitlements, isLoading, error: state.error, retry: load };
}
