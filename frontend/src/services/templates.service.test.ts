/**
 * Tests for Templates Service - analyzeComparison method
 *
 * Tests cover:
 * - Successful comparison requests
 * - Request validation (same IDs, negative IDs, zero IDs)
 * - Error handling (404, network errors)
 * - Response structure validation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    ComparisonRequest,
    ComparisonResult,
    DiffStatus,
    FieldChangeStatus,
} from '../types/comparison.types';
import { apiService } from './apiService';
import { TemplatesService } from './templates.service';

// Mock apiService
vi.mock('./apiService', () => ({
  apiService: {
    post: vi.fn(),
  },
}));

describe('TemplatesService.analyzeComparison', () => {
  let templatesService: TemplatesService;

  beforeEach(() => {
    templatesService = new TemplatesService();
    vi.clearAllMocks();
  });

  describe('Successful comparison', () => {
    it('should successfully analyze comparison between two versions', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: '2024-Q1',
          target_version_number: '2024-Q2',
          source_page_count: 5,
          target_page_count: 6,
          page_count_changed: true,
          source_field_count: 48,
          target_field_count: 52,
          field_count_changed: true,
          fields_added: 4,
          fields_removed: 0,
          fields_modified: 3,
          fields_unchanged: 45,
          modification_percentage: 14.58,
          source_created_at: '2024-01-15T10:30:00Z',
          target_created_at: '2024-04-20T14:25:00Z',
        },
        field_changes: [
          {
            field_id: 'NEW_FIELD_01',
            status: 'ADDED' as FieldChangeStatus,
            field_type: 'text',
            target_page_number: 6,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
            target_near_text: 'New field label',
          },
          {
            field_id: 'MODIFIED_FIELD_01',
            status: 'MODIFIED' as FieldChangeStatus,
            field_type: 'text',
            source_page_number: 3,
            target_page_number: 3,
            page_number_changed: false,
            near_text_diff: 'DIFFERENT' as DiffStatus,
            source_near_text: 'Old label',
            target_near_text: 'New label',
            value_options_diff: 'NOT_APPLICABLE' as DiffStatus,
            position_change: {
              x_changed: false,
              y_changed: true,
              width_changed: false,
              height_changed: false,
              source_x: 100.0,
              source_y: 200.0,
              source_width: 150.0,
              source_height: 20.0,
              target_x: 100.0,
              target_y: 210.0,
              target_width: 150.0,
              target_height: 20.0,
            },
          },
        ],
        analyzed_at: '2025-10-26T15:45:30Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      const result = await templatesService.analyzeComparison(request);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith(
        '/comparisons/analyze',
        { source_version_id: 1, target_version_id: 2 }
      );
      expect(result).toEqual(mockResult);
      expect(result.global_metrics.fields_added).toBe(4);
      expect(result.field_changes).toHaveLength(2);
    });

    it('should call API with correct parameters', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 5,
        target_version_id: 10,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 5,
        target_version_id: 10,
        global_metrics: {
          source_version_number: 'v1',
          target_version_number: 'v2',
          source_page_count: 1,
          target_page_count: 1,
          page_count_changed: false,
          source_field_count: 10,
          target_field_count: 10,
          field_count_changed: false,
          fields_added: 0,
          fields_removed: 0,
          fields_modified: 0,
          fields_unchanged: 10,
          modification_percentage: 0.0,
          source_created_at: '2024-01-01T00:00:00Z',
          target_created_at: '2024-02-01T00:00:00Z',
        },
        field_changes: [],
        analyzed_at: '2025-10-26T16:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      await templatesService.analyzeComparison(request);

      // Assert
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(apiService.post).toHaveBeenCalledWith(
        '/comparisons/analyze',
        { source_version_id: 5, target_version_id: 10 }
      );
    });
  });

  describe('Request validation', () => {
    it('should throw error when source and target IDs are the same', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 1,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Source and target versions must be different');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when source ID is zero', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 0,
        target_version_id: 5,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when target ID is zero', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 5,
        target_version_id: 0,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when source ID is negative', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: -1,
        target_version_id: 5,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when target ID is negative', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 5,
        target_version_id: -1,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when both IDs are zero', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 0,
        target_version_id: 0,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should throw error when both IDs are negative', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: -1,
        target_version_id: -5,
      };

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Version IDs must be positive integers');

      expect(apiService.post).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should throw enhanced error when version not found (404)', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 999,
        target_version_id: 1000,
      };

      vi.mocked(apiService.post).mockRejectedValue(
        new Error('Version with ID 999 not found')
      );

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('One or both versions not found');

      expect(apiService.post).toHaveBeenCalledTimes(1);
    });

    it('should throw enhanced error when "not found" in error message', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      vi.mocked(apiService.post).mockRejectedValue(
        new Error('Target version not found in database')
      );

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('One or both versions not found');
    });

    it('should handle network errors with context', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      vi.mocked(apiService.post).mockRejectedValue(
        new Error('Network error occurred')
      );

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Failed to analyze comparison: Network error occurred');
    });

    it('should handle server errors with context', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      vi.mocked(apiService.post).mockRejectedValue(
        new Error('Internal server error')
      );

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Failed to analyze comparison: Internal server error');
    });

    it('should handle non-Error objects', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      vi.mocked(apiService.post).mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(
        templatesService.analyzeComparison(request)
      ).rejects.toThrow('Failed to analyze comparison due to an unknown error');
    });
  });

  describe('Response validation', () => {
    it('should return response with correct structure', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1',
          target_version_number: 'v2',
          source_page_count: 1,
          target_page_count: 1,
          page_count_changed: false,
          source_field_count: 5,
          target_field_count: 5,
          field_count_changed: false,
          fields_added: 0,
          fields_removed: 0,
          fields_modified: 0,
          fields_unchanged: 5,
          modification_percentage: 0.0,
          source_created_at: '2024-01-01T00:00:00Z',
          target_created_at: '2024-02-01T00:00:00Z',
        },
        field_changes: [],
        analyzed_at: '2025-10-26T16:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      const result = await templatesService.analyzeComparison(request);

      // Assert
      expect(result).toHaveProperty('source_version_id');
      expect(result).toHaveProperty('target_version_id');
      expect(result).toHaveProperty('global_metrics');
      expect(result).toHaveProperty('field_changes');
      expect(result).toHaveProperty('analyzed_at');

      expect(result.global_metrics).toHaveProperty('source_version_number');
      expect(result.global_metrics).toHaveProperty('target_version_number');
      expect(result.global_metrics).toHaveProperty('fields_added');
      expect(result.global_metrics).toHaveProperty('fields_removed');
      expect(result.global_metrics).toHaveProperty('fields_modified');
      expect(result.global_metrics).toHaveProperty('fields_unchanged');
      expect(result.global_metrics).toHaveProperty('modification_percentage');
    });

    it('should handle empty field changes array', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1',
          target_version_number: 'v2',
          source_page_count: 1,
          target_page_count: 1,
          page_count_changed: false,
          source_field_count: 0,
          target_field_count: 0,
          field_count_changed: false,
          fields_added: 0,
          fields_removed: 0,
          fields_modified: 0,
          fields_unchanged: 0,
          modification_percentage: 0.0,
          source_created_at: '2024-01-01T00:00:00Z',
          target_created_at: '2024-02-01T00:00:00Z',
        },
        field_changes: [],
        analyzed_at: '2025-10-26T16:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      const result = await templatesService.analyzeComparison(request);

      // Assert
      expect(result.field_changes).toEqual([]);
      expect(result.global_metrics.source_field_count).toBe(0);
      expect(result.global_metrics.target_field_count).toBe(0);
    });

    it('should handle comparison with only ADDED fields', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1',
          target_version_number: 'v2',
          source_page_count: 1,
          target_page_count: 1,
          page_count_changed: false,
          source_field_count: 0,
          target_field_count: 3,
          field_count_changed: true,
          fields_added: 3,
          fields_removed: 0,
          fields_modified: 0,
          fields_unchanged: 0,
          modification_percentage: 100.0,
          source_created_at: '2024-01-01T00:00:00Z',
          target_created_at: '2024-02-01T00:00:00Z',
        },
        field_changes: [
          {
            field_id: 'FIELD_01',
            status: 'ADDED' as FieldChangeStatus,
            field_type: 'text',
            target_page_number: 1,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
          },
          {
            field_id: 'FIELD_02',
            status: 'ADDED' as FieldChangeStatus,
            field_type: 'checkbox',
            target_page_number: 1,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
          },
          {
            field_id: 'FIELD_03',
            status: 'ADDED' as FieldChangeStatus,
            field_type: 'select',
            target_page_number: 1,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
          },
        ],
        analyzed_at: '2025-10-26T16:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      const result = await templatesService.analyzeComparison(request);

      // Assert
      expect(result.global_metrics.fields_added).toBe(3);
      expect(result.field_changes).toHaveLength(3);
      expect(result.field_changes.every(f => f.status === 'ADDED')).toBe(true);
    });

    it('should handle comparison with only REMOVED fields', async () => {
      // Arrange
      const request: ComparisonRequest = {
        source_version_id: 1,
        target_version_id: 2,
      };

      const mockResult: ComparisonResult = {
        source_version_id: 1,
        target_version_id: 2,
        global_metrics: {
          source_version_number: 'v1',
          target_version_number: 'v2',
          source_page_count: 1,
          target_page_count: 1,
          page_count_changed: false,
          source_field_count: 2,
          target_field_count: 0,
          field_count_changed: true,
          fields_added: 0,
          fields_removed: 2,
          fields_modified: 0,
          fields_unchanged: 0,
          modification_percentage: 100.0,
          source_created_at: '2024-01-01T00:00:00Z',
          target_created_at: '2024-02-01T00:00:00Z',
        },
        field_changes: [
          {
            field_id: 'OLD_FIELD_01',
            status: 'REMOVED' as FieldChangeStatus,
            field_type: 'text',
            source_page_number: 1,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
          },
          {
            field_id: 'OLD_FIELD_02',
            status: 'REMOVED' as FieldChangeStatus,
            field_type: 'text',
            source_page_number: 1,
            near_text_diff: 'NOT_APPLICABLE' as DiffStatus,
          },
        ],
        analyzed_at: '2025-10-26T16:00:00Z',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResult);

      // Act
      const result = await templatesService.analyzeComparison(request);

      // Assert
      expect(result.global_metrics.fields_removed).toBe(2);
      expect(result.field_changes).toHaveLength(2);
      expect(result.field_changes.every(f => f.status === 'REMOVED')).toBe(true);
    });
  });
});

