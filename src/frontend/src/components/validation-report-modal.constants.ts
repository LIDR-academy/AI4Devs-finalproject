/**
 * Constants for ValidationReportModal component (T-032-FRONT)
 * 
 * Following the Constants Extraction pattern from T-031-FRONT.
 * Centralizes all magic strings, colors, and configuration values.
 */

import type { TabName } from '../types/validation-modal';

/**
 * Tab labels for display.
 */
export const TAB_LABELS: Record<TabName, string> = {
  nomenclature: 'Nomenclature',
  geometry: 'Geometry',
  metadata: 'Metadata',
};

/**
 * Icon mappings for different states.
 */
export const ICON_MAP = {
  success: '✅',
  error: '❌',
  info: '📊',
} as const;

/**
 * Color scheme for the modal.
 * 
 * Following Material Design color palette.
 */
export const COLOR_SCHEME = {
  success: '#4caf50',
  error: '#f44336',
  info: '#2196f3',
  warning: '#ff9800',
  neutral: '#9e9e9e',
} as const;

/**
 * ARIA labels for accessibility.
 */
export const ARIA_LABELS = {
  closeButton: 'Close validation report',
  modal: 'Validation report dialog',
  tabList: 'Validation categories',
} as const;

/**
 * Modal configuration.
 */
export const MODAL_CONFIG = {
  zIndex: 1000,
  backdropColor: 'rgba(0, 0, 0, 0.5)',
  fadeInDuration: 200, // ms
} as const;
