/**
 * Parts Store - Zustand State Management
 * 
 * T-0505-FRONT: Global state for 3D parts scene
 * 
 * @module parts.store
 */

import { create } from 'zustand';
import { PartCanvasItem } from '@/types/parts';
import { listParts } from '@/services/parts.service';

/**
 * Parts store state interface
 */
interface PartsState {
  /** Array of all parts */
  parts: PartCanvasItem[];
  
  /** Active filters */
  filters: Record<string, string | null>;
  
  /** Currently selected part ID */
  selectedId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error message if fetch fails */
  error: string | null;
  
  /** Fetch parts from API */
  fetchParts: () => Promise<void>;
  
  /** Update filters and refetch */
  setFilters: (filters: Record<string, string | null>) => void;
  
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
 * const { parts, fetchParts, selectPart } = usePartsStore();
 * 
 * useEffect(() => {
 *   fetchParts();
 * }, []);
 * 
 * const handleClick = (id: string) => {
 *   selectPart(id);
 * };
 * ```
 */
export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  filters: {},
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

  setFilters: (filters) => {
    set({ filters });
    get().fetchParts(); // Auto-refetch when filters change
  },

  selectPart: (id) => {
    set({ selectedId: id });
  },

  clearSelection: () => {
    set({ selectedId: null });
  },
}));
