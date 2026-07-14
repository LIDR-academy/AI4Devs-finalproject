import type { PdfExtractionErrorCode, PdfExtractionResult } from '../types/pdf-extraction.types';
import type { PdfExtractionStage } from './use-pdf-extraction.types';

type State = {
  stage: PdfExtractionStage;
  result: PdfExtractionResult | null;
  error: PdfExtractionErrorCode | null;
};

type Action =
  | { type: 'extract/start' }
  | { type: 'extract/success'; result: PdfExtractionResult }
  | { type: 'extract/failure'; error: PdfExtractionErrorCode };

export const usePdfExtractionInitialState: State = {
  stage: 'idle',
  result: null,
  error: null,
};

export function usePdfExtractionReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'extract/start':
      return { stage: 'processing', result: state.result, error: null };
    case 'extract/success':
      return { stage: 'success', result: action.result, error: null };
    case 'extract/failure':
      return { stage: 'error', result: state.result, error: action.error };
  }
}
