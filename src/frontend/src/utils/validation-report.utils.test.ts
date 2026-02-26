/**
 * Tests for validation-report.utils (T-032-FRONT)
 * 
 * TDD RED PHASE - Tests for pure utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  groupErrorsByCategory,
  formatValidatedAt,
  getErrorCountForCategory,
} from './validation-report.utils';
import type { ValidationErrorItem } from '../types/validation';

describe('validation-report.utils', () => {
  describe('groupErrorsByCategory', () => {
    it('should group errors by nomenclature, geometry, and other', () => {
      const errors: ValidationErrorItem[] = [
        { category: 'nomenclature', message: 'Error 1', target: 'Layer::test' },
        { category: 'nomenclature', message: 'Error 2', target: 'Layer::test2' },
        { category: 'geometry', message: 'Error 3', target: 'Object::123' },
        { category: 'other', message: 'Error 4' },
      ];

      const grouped = groupErrorsByCategory(errors);

      expect(grouped.nomenclature).toHaveLength(2);
      expect(grouped.geometry).toHaveLength(1);
      expect(grouped.other).toHaveLength(1);
    });

    it('should handle empty errors array', () => {
      const grouped = groupErrorsByCategory([]);

      expect(grouped.nomenclature).toHaveLength(0);
      expect(grouped.geometry).toHaveLength(0);
      expect(grouped.other).toHaveLength(0);
    });

    it('should categorize unknown categories as "other"', () => {
      const errors: ValidationErrorItem[] = [
        { category: 'unknown', message: 'Error 1' },
        { category: 'io', message: 'Error 2' },
      ];

      const grouped = groupErrorsByCategory(errors);

      expect(grouped.other).toHaveLength(2);
    });
  });

  describe('formatValidatedAt', () => {
    it('should format ISO date to human-readable format', () => {
      const isoDate = '2026-02-16T10:30:00Z';
      const formatted = formatValidatedAt(isoDate);

      // Now using UTC timezone in function, output predictable
      expect(formatted).toMatch(/Feb/);
      expect(formatted).toMatch(/16/);
      expect(formatted).toMatch(/2026/);
      expect(formatted).toMatch(/10:30/);
    });

    it('should handle different ISO date formats', () => {
      // Use mid-day date to avoid midnight edge cases
      const isoDate = '2026-12-15T15:00:00.000Z';
      const formatted = formatValidatedAt(isoDate);

      expect(formatted).toMatch(/Dec/);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/2026/);
    });
  });

  describe('getErrorCountForCategory', () => {
    it('should return count of errors for specific category', () => {
      const errors: ValidationErrorItem[] = [
        { category: 'nomenclature', message: 'Error 1', target: 'Layer::test' },
        { category: 'nomenclature', message: 'Error 2', target: 'Layer::test2' },
        { category: 'geometry', message: 'Error 3', target: 'Object::123' },
      ];

      const nomenclatureCount = getErrorCountForCategory(errors, 'nomenclature');
      const geometryCount = getErrorCountForCategory(errors, 'geometry');

      expect(nomenclatureCount).toBe(2);
      expect(geometryCount).toBe(1);
    });

    it('should return 0 for category with no errors', () => {
      const errors: ValidationErrorItem[] = [
        { category: 'nomenclature', message: 'Error 1', target: 'Layer::test' },
      ];

      const geometryCount = getErrorCountForCategory(errors, 'geometry');
      expect(geometryCount).toBe(0);
    });

    it('should return 0 for empty errors array', () => {
      const count = getErrorCountForCategory([], 'nomenclature');
      expect(count).toBe(0);
    });
  });
});
