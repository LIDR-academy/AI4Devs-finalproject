/**
 * T-0506-FRONT: Parts Store Tests - Filter Functionality
 * 
 * TDD RED Phase: Tests for Zustand store filter methods
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePartsStore } from './parts.store';
import { PartCanvasItem, BlockStatus } from '@/types/parts';

const mockParts: PartCanvasItem[] = [
  {
    id: '1',
    iso_code: 'SF-C12-D-001',
    status: 'validated' as BlockStatus,
    tipologia: 'capitel',
    low_poly_url: 'https://example.com/1.glb',
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
    workshop_id: 'workshop-123',
  },
  {
    id: '2',
    iso_code: 'SF-C12-D-002',
    status: 'uploaded' as BlockStatus,
    tipologia: 'columna',
    low_poly_url: 'https://example.com/2.glb',
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
    workshop_id: 'workshop-456',
  },
  {
    id: '3',
    iso_code: 'SF-C12-D-003',
    status: 'uploaded' as BlockStatus,
    tipologia: 'capitel',
    low_poly_url: 'https://example.com/3.glb',
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
    workshop_id: null,
  },
];

describe('PartsStore - Filter Functionality', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePartsStore.setState({
      parts: [],
      filters: { status: [], tipologia: [], workshop_id: null },
      selectedId: null,
      isLoading: false,
      error: null,
    });
  });

  describe('setFilters', () => {
    it('should update filters with partial updates', () => {
      const { setFilters, filters } = usePartsStore.getState();
      
      setFilters({ tipologia: ['capitel'] });
      
      expect(usePartsStore.getState().filters.tipologia).toEqual(['capitel']);
      expect(usePartsStore.getState().filters.status).toEqual([]);
    });

    it('should merge new filters with existing filters', () => {
      const { setFilters } = usePartsStore.getState();
      
      setFilters({ tipologia: ['capitel'] });
      setFilters({ status: ['validated'] });
      
      const state = usePartsStore.getState();
      expect(state.filters.tipologia).toEqual(['capitel']);
      expect(state.filters.status).toEqual(['validated']);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial empty state', () => {
      const { setFilters, clearFilters } = usePartsStore.getState();
      
      // Set some filters
      setFilters({ tipologia: ['capitel'], status: ['validated'] });
      
      // Clear filters
      clearFilters();
      
      const state = usePartsStore.getState();
      expect(state.filters.tipologia).toEqual([]);
      expect(state.filters.status).toEqual([]);
      expect(state.filters.workshop_id).toBeNull();
    });
  });

  describe('getFilteredParts', () => {
    beforeEach(() => {
      // Populate store with mock parts
      usePartsStore.setState({ parts: mockParts });
    });

    it('should return all parts when no filters applied', () => {
      const { getFilteredParts } = usePartsStore.getState();
      
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(3);
    });

    it('should filter by single tipologia', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ tipologia: ['capitel'] });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.tipologia === 'capitel')).toBe(true);
    });

    it('should filter by multiple tipologias (OR logic)', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ tipologia: ['capitel', 'columna'] });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(3);
    });

    it('should filter by single status', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ status: ['validated'] });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by multiple statuses (OR logic)', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ status: ['validated', 'uploaded'] });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(3);
    });

    it('should combine filters with AND logic (tipologia AND status)', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ tipologia: ['capitel'], status: ['validated'] });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by workshop_id', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ workshop_id: 'workshop-123' });
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should return empty array when no parts match filters', () => {
      const { setFilters, getFilteredParts } = usePartsStore.getState();
      
      setFilters({ tipologia: ['dovela'] }); // No parts with dovela
      const filtered = getFilteredParts();
      
      expect(filtered).toHaveLength(0);
    });
  });
});
