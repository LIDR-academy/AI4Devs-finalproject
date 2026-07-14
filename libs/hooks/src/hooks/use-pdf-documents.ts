import { PdfDocumentsService } from '@helsoft/supabase-services';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import { usePdfDocumentsInitialState, usePdfDocumentsReducer } from './use-pdf-documents.reducer';
import type { UsePdfDocumentsResult } from './use-pdf-documents.types';

/**
 * React integration over PdfDocumentsService (tanstack-query not installed → local state).
 * Drives PDF-list Loading/Content/Empty/Error via
 * `{ documents, isLoading, error, refetch, deleteDocument }`.
 */
export const usePdfDocuments = (): UsePdfDocumentsResult => {
  const [state, dispatch] = useReducer(usePdfDocumentsReducer, usePdfDocumentsInitialState);
  const isMounted = useRef(true);
  // Incremented to cancel an in-flight load when a newer one starts (mount or refetch).
  const requestId = useRef(0);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const load = useCallback(() => {
    const id = ++requestId.current;
    dispatch({ type: 'load/start' });

    void PdfDocumentsService.getDocuments()
      .then((next) => {
        if (id !== requestId.current || !isMounted.current) return;
        dispatch({ type: 'load/success', documents: next });
      })
      .catch((cause: unknown) => {
        if (id !== requestId.current || !isMounted.current) return;
        dispatch({
          type: 'load/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await PdfDocumentsService.deleteDocument(id);
      if (!isMounted.current) return;
      dispatch({ type: 'delete/success', id });
    } catch (cause) {
      if (isMounted.current) {
        dispatch({
          type: 'delete/failure',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      }
      throw cause;
    }
  }, []);

  return {
    documents: state.documents,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    deleteDocument,
  };
};
