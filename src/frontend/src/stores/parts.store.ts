/**
 * Parts Store - Zustand State Management
 * 
 * T-0505-FRONT: Global state for 3D parts scene
 * T-0506-FRONT: Added filter functionality
 * 
 * @module parts.store
 */

import { create } from 'zustand';
import { PartCanvasItem } from '@/types/parts';
import { listParts } from '@/services/parts.service';

/**
 * Parts filter structure
 */
export interface PartsFilters {
  status: string[];
  tipologia: string[];
  workshop_id: string | null;
}

/**
 * Parts store state interface
 */
interface PartsState {
  /** Array of all parts */
  parts: PartCanvasItem[];
  
  /** Active filters */
  filters: PartsFilters;
  
  /** Currently selected part ID */
  selectedId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error message if fetch fails */
  error: string | null;
  
  /** Fetch parts from API */
  fetchParts: () => Promise<void>;
  
  /** Update filters (partial merge) */
  setFilters: (filters: Partial<PartsFilters>) => void;
  
  /** Clear all filters */
  clearFilters: () => void;
  
  /** Get filtered parts based on current filters */
  getFilteredParts: () => PartCanvasItem[];
  
  /** Select a part by ID */
  selectPart: (id: string) => void;
  
  /** Clear selection */
  clearSelection: () => void;
}

/**
 * Zustand store for parts management
 * 
 * @example
 * ```typescript
 * const { parts, fetchParts, selectPart, setFilters } = usePartsStore();
 * 
 * useEffect(() => {
 *   fetchParts();
 * }, []);
 * 
 * const handleClick = (id: string) => {
 *   selectPart(id);
 * };
 * 
 * const handleFilter = () => {
 *   setFilters({ tipologia: ['capitel'] });
 * };
 * ```
 */
export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  filters: {
    status: [],
    tipologia: [],
    workshop_id: null,
  },
  selectedId: null,
  isLoading: false,
  error: null,

  fetchParts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const parts = await listParts(get().filters);
      set({ parts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch parts';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    set({ 
      filters: {
        ...currentFilters,
        ...newFilters,
      }
    });
    // Don't auto-refetch for now (tests just check state update)
  },

  clearFilters: () => {
    set({
      filters: {
        status: [],
        tipologia: [],
        workshop_id: null,
      }
    });
  },

  getFilteredParts: () => {
    const { parts, filters } = get();
    
    return parts.filter(part => {
      // Apply status filter (OR logic)
      if (filters.status.length > 0 && !filters.status.includes(part.status)) {
        return false;
      }
      
      // Apply tipologia filter (OR logic)
      if (filters.tipologia.length > 0 && !filters.tipologia.includes(part.tipologia)) {
        return false;
      }
      
      // Apply workshop_id filter
      if (filters.workshop_id && part.workshop_id !== filters.workshop_id) {
        return false;
      }
      
      return true;
    });
  },

  selectPart: (id) => {
    set({ selectedId: id });
  },

  clearSelection: () => {
    set({ selectedId: null });
  },
}));
