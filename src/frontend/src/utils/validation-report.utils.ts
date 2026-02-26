/**
 * Utility functions for ValidationReportModal (T-032-FRONT)
 * 
 * Pure functions for data transformation and formatting.
 */

import type { ValidationErrorItem, GroupedErrors } from '../types/validation-modal';

/**
 * Groups validation errors by category.
 * 
 * @param errors - Array of validation errors
 * @returns Errors grouped by category (nomenclature, geometry, other)
 * 
 * @example
 * ```ts
 * const errors = [
 *   { category: 'nomenclature', message: 'Invalid name', target: 'Layer::test' },
 *   { category: 'geometry', message: 'Invalid geometry', target: 'Object::123' },
 * ];
 * const grouped = groupErrorsByCategory(errors);
 * // grouped.nomenclature.length === 1
 * // grouped.geometry.length === 1
 * ```
 */
export function groupErrorsByCategory(errors: ValidationErrorItem[]): GroupedErrors {
  const grouped: GroupedErrors = {
    nomenclature: [],
    geometry: [],
    other: [],
  };

  for (const error of errors) {
    if (error.category === 'nomenclature') {
      grouped.nomenclature.push(error);
    } else if (error.category === 'geometry') {
      grouped.geometry.push(error);
    } else {
      grouped.other.push(error);
    }
  }

  return grouped;
}

/**
 * Formats an ISO datetime string to human-readable format.
 * 
 * @param isoDate - ISO 8601 datetime string
 * @returns Formatted date (e.g., "Feb 16, 2026 10:30 AM")
 * 
 * @example
 * ```ts
 * formatValidatedAt("2026-02-16T10:30:00Z") // "Feb 16, 2026 10:30 AM"
 * ```
 */
export function formatValidatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC', // Force UTC to avoid timezone-dependent output
  });
}

/**
 * Gets the count of errors for a specific category.
 * 
 * @param errors - Array of validation errors
 * @param category - Category to count
 * @returns Number of errors in that category
 * 
 * @example
 * ```ts
 * const errors = [
 *   { category: 'nomenclature', message: 'Invalid', target: 'Layer::test' },
 *   { category: 'nomenclature', message: 'Invalid', target: 'Layer::test2' },
 * ];
 * getErrorCountForCategory(errors, 'nomenclature') // 2
 * ```
 */
export function getErrorCountForCategory(
  errors: ValidationErrorItem[],
  category: string
): number {
  return errors.filter((error) => error.category === category).length;
}
