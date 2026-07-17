import type { PdfDocumentSummary } from '@helsoft/types';

type State = {
  documents: PdfDocumentSummary[];
  isLoading: boolean;
  error: Error | null;
};

type Action =
  | { type: 'load/start' }
  | { type: 'load/success'; documents: PdfDocumentSummary[] }
  | { type: 'load/failure'; error: Error }
  | { type: 'delete/success'; id: string }
  | { type: 'delete/failure'; error: Error };

export const usePdfDocumentsInitialState: State = {
  documents: [],
  isLoading: true,
  error: null,
};

export function usePdfDocumentsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load/start':
      return { ...state, isLoading: true, error: null };
    case 'load/success':
      return { documents: action.documents, isLoading: false, error: null };
    case 'load/failure':
      return { documents: [], isLoading: false, error: action.error };
    case 'delete/success':
      return {
        ...state,
        documents: state.documents.filter((document) => document.id !== action.id),
        error: null,
      };
    case 'delete/failure':
      return { ...state, error: action.error };
  }
}
