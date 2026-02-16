/**
 * Types for Validation Report Modal (T-032-FRONT)
 * 
 * This module defines TypeScript interfaces for the ValidationReportModal component.
 * These types extend the base ValidationReport and ValidationErrorItem from validation.ts.
 */

import type { ValidationReport, ValidationErrorItem } from './validation';

// Re-export ValidationErrorItem for use in utils
export type { ValidationErrorItem };

/**
 * Props for ValidationReportModal component.
 * 
 * @example
 * ```tsx
 * <ValidationReportModal
 *   report={validationReport}
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   isoCode="SF-C12-M-001"
 * />
 * ```
 */
export interface ValidationReportModalProps {
  /**
   * The validation report to visualize.
   * If null, shows a "no validation data" placeholder.
   */
  report: ValidationReport | null;

  /**
   * Controls modal visibility.
   */
  isOpen: boolean;

  /**
   * Callback when user closes the modal.
   */
  onClose: () => void;

  /**
   * Optional block ID for context display.
   * Used to show which part is being validated.
   */
  blockId?: string;

  /**
   * Optional ISO code for header display.
   */
  isoCode?: string;
}

/**
 * Tab names for the modal navigation.
 * 
 * - nomenclature: Shows errors related to layer naming and ISO-19650 compliance
 * - geometry: Shows errors related to geometry validity and integrity
 * - metadata: Shows extracted metadata from the 3dm file
 */
export type TabName = 'nomenclature' | 'geometry' | 'metadata';

/**
 * Grouped errors by category for tab organization.
 * 
 * Errors from ValidationReport are grouped into these categories
 * based on their `category` field.
 */
export interface GroupedErrors {
  /**
   * Errors with category="nomenclature"
   */
  nomenclature: ValidationErrorItem[];

  /**
   * Errors with category="geometry"
   */
  geometry: ValidationErrorItem[];

  /**
   * Errors with other categories (fallback)
   */
  other: ValidationErrorItem[];
}
