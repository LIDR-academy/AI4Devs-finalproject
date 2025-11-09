/**
 * Tests for Comparisons Service
 *
 * Tests API communication for comparison persistence features.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    ComparisonCheckResponse,
    ComparisonListResponse,
    ComparisonResult,
    SaveComparisonResponse,
} from '../types/comparison.types';
import { apiService } from './apiService';
import { comparisonsService } from './comparisons.service';

// Mock apiService
vi.mock('./apiService', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ComparisonsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveComparison', () => {
    it('should save a comparison and return response with ID', async () => {
      // Arrange
      const mockComparisonResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1.0',
          target_version_number: 'v2.0',
          source_page_count: 2,
          target_page_count: 2,
          page_count_changed: false,
          source_field_count: 10,
          target_field_count: 12,
          field_count_changed: true,
          fields_added: 2,
          fields_removed: 0,
          fields_modified: 3,
          fields_unchanged: 7,
          modification_percentage: 25.0,
          source_created_at: '2025-01-01T00:00:00Z',
          target_created_at: '2025-01-02T00:00:00Z',
        },
        field_changes: [],
        analyzed_at: '2025-01-03T00:00:00Z',
      };

      const mockResponse: SaveComparisonResponse = {
        comparison_id: 42,
        message: 'Comparison saved successfully',
        created_at: '2025-01-03T00:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.saveComparison(mockComparisonResult);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith(
        '/comparisons/ingest',
        mockComparisonResult
      );
      expect(result).toEqual(mockResponse);
      expect(result.comparison_id).toBe(42);
    });

    it('should throw error if save fails', async () => {
      // Arrange
      const mockComparison: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {} as any,
        field_changes: [],
        analyzed_at: '2025-01-03T00:00:00Z',
      };

      const mockError = new Error('Failed to save comparison');
      vi.mocked(apiService.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        comparisonsService.saveComparison(mockComparison)
      ).rejects.toThrow('Failed to save comparison');
    });
  });

  describe('getComparison', () => {
    it('should retrieve a comparison by ID', async () => {
      // Arrange
      const mockComparison: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1.0',
          target_version_number: 'v2.0',
          source_page_count: 2,
          target_page_count: 2,
          page_count_changed: false,
          source_field_count: 10,
          target_field_count: 12,
          field_count_changed: true,
          fields_added: 2,
          fields_removed: 0,
          fields_modified: 3,
          fields_unchanged: 7,
          modification_percentage: 25.0,
          source_created_at: '2025-01-01T00:00:00Z',
          target_created_at: '2025-01-02T00:00:00Z',
        },
        field_changes: [
          {
            field_id: 'A0101',
            status: 'MODIFIED',
            page_number_changed: false,
            near_text_diff: 'DIFFERENT',
            value_options_diff: 'NOT_APPLICABLE',
            position_change: 'NOT_APPLICABLE',
          },
        ],
        analyzed_at: '2025-01-03T00:00:00Z',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockComparison);

      // Act
      const result = await comparisonsService.getComparison(42);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons/42');
      expect(result).toEqual(mockComparison);
      expect(result.source_version_id).toBe(1);
      expect(result.field_changes).toHaveLength(1);
    });

    it('should throw error if comparison not found', async () => {
      // Arrange
      const mockError = new Error('Comparison with ID 999 not found');
      vi.mocked(apiService.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        comparisonsService.getComparison(999)
      ).rejects.toThrow('Comparison with ID 999 not found');
    });
  });

  describe('listComparisons', () => {
    it('should list comparisons with default parameters', async () => {
      // Arrange
      const mockResponse: ComparisonListResponse = {
        items: [
          {
            id: 1,
            source_version_id: 1,
            target_version_id: 2,
            source_version_number: 'v1.0',
            target_version_number: 'v2.0',
            source_template_name: 'Template A',
            target_template_name: 'Template A',
            modification_percentage: 25.0,
            fields_added: 2,
            fields_removed: 0,
            fields_modified: 3,
            fields_unchanged: 7,
            created_at: '2025-01-03T00:00:00Z',
            created_by: 1,
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.listComparisons();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons', undefined);
      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should list comparisons with pagination parameters', async () => {
      // Arrange
      const mockResponse: ComparisonListResponse = {
        items: [],
        total: 50,
        page: 2,
        page_size: 10,
        total_pages: 5,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.listComparisons({
        page: 2,
        page_size: 10,
      });

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons', {
        page: 2,
        page_size: 10,
      });
      expect(result.page).toBe(2);
      expect(result.page_size).toBe(10);
    });

    it('should list comparisons with sorting', async () => {
      // Arrange
      const mockResponse: ComparisonListResponse = {
        items: [],
        total: 10,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.listComparisons({
        sort_by: 'modification_percentage',
        sort_order: 'desc',
      });

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons', {
        sort_by: 'modification_percentage',
        sort_order: 'desc',
      });
    });

    it('should list comparisons with search term', async () => {
      // Arrange
      const mockResponse: ComparisonListResponse = {
        items: [],
        total: 5,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.listComparisons({
        search: 'Solicitud',
      });

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons', {
        search: 'Solicitud',
      });
    });

    it('should handle empty list response', async () => {
      // Arrange
      const mockResponse: ComparisonListResponse = {
        items: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.listComparisons();

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('checkComparisonExists', () => {
    it('should return exists=true when comparison found', async () => {
      // Arrange
      const mockResponse: ComparisonCheckResponse = {
        exists: true,
        comparison_id: 42,
        created_at: '2025-01-03T00:00:00Z',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.checkComparisonExists(1, 2);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons/check', {
        source_version_id: 1,
        target_version_id: 2,
      });
      expect(result.exists).toBe(true);
      expect(result.comparison_id).toBe(42);
    });

    it('should return exists=false when comparison not found', async () => {
      // Arrange
      const mockResponse: ComparisonCheckResponse = {
        exists: false,
        comparison_id: null,
        created_at: null,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.checkComparisonExists(10, 20);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons/check', {
        source_version_id: 10,
        target_version_id: 20,
      });
      expect(result.exists).toBe(false);
      expect(result.comparison_id).toBeNull();
    });

    it('should handle bidirectional check (reverse order)', async () => {
      // Arrange
      const mockResponse: ComparisonCheckResponse = {
        exists: true,
        comparison_id: 42,
        created_at: '2025-01-03T00:00:00Z',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      // Act
      const result = await comparisonsService.checkComparisonExists(2, 1);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/comparisons/check', {
        source_version_id: 2,
        target_version_id: 1,
      });
      expect(result.exists).toBe(true);
    });
  });
});

