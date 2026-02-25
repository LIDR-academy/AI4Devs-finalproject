/**
 * Navigation Service Tests
 * T-1007-FRONT: Unit tests for getPartNavigation()
 * 
 * @module services/navigation.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPartNavigation } from './navigation.service';
import type { AdjacentPartsInfo } from '@/types/modal';

describe('Navigation Service - T-1007-FRONT', () => {
  const mockPartId = 'test-uuid-123';
  const mockNavResponse: AdjacentPartsInfo = {
    prev_id: 'uuid-prev',
    next_id: 'uuid-next',
    current_index: 5,
    total_count: 20,
  };

  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Happy Path', () => {
    it('NAV-HP-01: should fetch navigation data without filters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      const result = await getPartNavigation(mockPartId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/parts/${mockPartId}/navigation`),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockNavResponse);
    });

    it('NAV-HP-02: should construct query params correctly with status filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      await getPartNavigation(mockPartId, {
        status: ['validated', 'in_fabrication'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=validated&status=in_fabrication'),
        expect.any(Object)
      );
    });

    it('NAV-HP-03: should construct query params correctly with tipologia filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      await getPartNavigation(mockPartId, {
        tipologia: ['capitel', 'columna'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('tipologia=capitel&tipologia=columna'),
        expect.any(Object)
      );
    });

    it('NAV-HP-04: should construct query params correctly with workshop_id filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      await getPartNavigation(mockPartId, {
        workshop_id: 'workshop-uuid-456',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('workshop_id=workshop-uuid-456'),
        expect.any(Object)
      );
    });

    it('NAV-HP-05: should construct query params correctly with multiple filters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      await getPartNavigation(mockPartId, {
        status: ['validated'],
        tipologia: ['capitel'],
        workshop_id: 'workshop-uuid',
      });

      const callUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(callUrl).toContain('status=validated');
      expect(callUrl).toContain('tipologia=capitel');
      expect(callUrl).toContain('workshop_id=workshop-uuid');
    });

    it('NAV-HP-06: should handle first part (prev_id null)', async () => {
      const firstPartResponse: AdjacentPartsInfo = {
        prev_id: null,
        next_id: 'uuid-next',
        current_index: 1,
        total_count: 20,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => firstPartResponse,
      });

      const result = await getPartNavigation(mockPartId);

      expect(result.prev_id).toBeNull();
      expect(result.current_index).toBe(1);
    });

    it('NAV-HP-07: should handle last part (next_id null)', async () => {
      const lastPartResponse: AdjacentPartsInfo = {
        prev_id: 'uuid-prev',
        next_id: null,
        current_index: 20,
        total_count: 20,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => lastPartResponse,
      });

      const result = await getPartNavigation(mockPartId);

      expect(result.next_id).toBeNull();
      expect(result.current_index).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('NAV-ERR-01: should throw error on 404 Not Found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getPartNavigation('invalid-uuid')).rejects.toThrow('Part not found');
    });

    it('NAV-ERR-02: should throw error on 403 Forbidden', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(getPartNavigation(mockPartId)).rejects.toThrow('Access denied');
    });

    it('NAV-ERR-03: should throw error on 500 Internal Server Error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getPartNavigation(mockPartId)).rejects.toThrow('Navigation API error: 500');
    });

    it('NAV-ERR-04: should throw error on network failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(getPartNavigation(mockPartId)).rejects.toThrow('Network error');
    });

    it('NAV-ERR-05: should handle null filters gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      const result = await getPartNavigation(mockPartId, null);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('?'),
        expect.any(Object)
      );
      expect(result).toEqual(mockNavResponse);
    });

    it('NAV-ERR-06: should handle empty filters object gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      const result = await getPartNavigation(mockPartId, {});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('?'),
        expect.any(Object)
      );
      expect(result).toEqual(mockNavResponse);
    });
  });

  describe('Contract Validation', () => {
    it('NAV-CONTRACT-01: response should match AdjacentPartsInfo interface', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNavResponse,
      });

      const result = await getPartNavigation(mockPartId);

      // Verify all required fields exist (TypeScript compile-time + runtime check)
      expect(result).toHaveProperty('prev_id');
      expect(result).toHaveProperty('next_id');
      expect(result).toHaveProperty('current_index');
      expect(result).toHaveProperty('total_count');
      
      // Verify types
      expect(typeof result.current_index).toBe('number');
      expect(typeof result.total_count).toBe('number');
      expect(result.prev_id === null || typeof result.prev_id === 'string').toBe(true);
      expect(result.next_id === null || typeof result.next_id === 'string').toBe(true);
    });
  });
});
