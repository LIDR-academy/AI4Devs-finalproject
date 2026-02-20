/**
 * Zustand store for parts management
 * T-0504-FRONT: Global state for parts (placeholder for T-0506)
 * 
 * This is a minimal store definition for T-0504 tests.
 * Full implementation will be done in T-0506-FRONT.
 */

import { create } from 'zustand';
import type { PartCanvasItem } from '@/types/parts';

export interface PartsFilters {
  status: string[];
  tipologia: string[];
  workshop_id: string | null;
}

interface PartsStoreState {
  parts: PartCanvasItem[];
  isLoading: boolean;
  error: string | null;
  filters: PartsFilters;
  selectedId: string | null;
  
  // Actions
  setParts: (parts: PartCanvasItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PartsFilters>) => void;
  selectPart: (id: string | null) => void;
  getFilteredParts: () => PartCanvasItem[];
}

export const usePartsStore = create<PartsStoreState>((set, get) => ({
  parts: [],
  isLoading: false,
  error: null,
  filters: {
    status: [],
    tipologia: [],
    workshop_id: null,
  },
  selectedId: null,

  setParts: (parts) => set({ parts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (partialFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...partialFilters },
    })),
  selectPart: (selectedId) => set({ selectedId }),
  getFilteredParts: () => {
    const { parts, filters } = get();
    
    // Placeholder filtering logic (T-0506 will expand this)
    return parts.filter((part) => {
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(part.status);
      const tipologiaMatch =
        filters.tipologia.length === 0 ||
        filters.tipologia.includes(part.tipologia);
      const workshopMatch =
        !filters.workshop_id || part.workshop_id === filters.workshop_id;

      return statusMatch && tipologiaMatch && workshopMatch;
    });
  },
}));
