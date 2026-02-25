/**
 * T-1008-FRONT: PartMetadataPanel Types
 * Type definitions for metadata display component
 * 
 * @module components/Dashboard/PartMetadataPanel.types
 */

import type { PartDetail } from '@/types/parts';

/**
 * Props for PartMetadataPanel component
 */
export interface PartMetadataPanelProps {
  /** Part detail data with all metadata fields */
  part: PartDetail;
  
  /** Optional initial expanded section (defaults to 'info') */
  initialExpandedSection?: SectionId;
  
  /** Optional className for container styling */
  className?: string;
}

/**
 * Section identifiers for collapsible sections
 */
export type SectionId = 'info' | 'workshop' | 'geometry' | 'validation';

/**
 * Internal state for section expansion
 */
export interface ExpandedSections {
  info: boolean;
  workshop: boolean;
  geometry: boolean;
  validation: boolean;
}

/**
 * Field configuration for rendering
 */
export interface FieldConfig {
  /** Display label */
  label: string;
  
  /** Data key from PartDetail */
  key: keyof PartDetail;
  
  /** Optional formatter function */
  format?: (value: any) => string;
  
  /** Placeholder for null/undefined values */
  emptyValue?: string;
  
  /** Use monospace font (for UUIDs) */
  monospace?: boolean;
  
  /** Render type */
  component?: 'text' | 'badge' | 'json' | 'coordinates' | 'link';
}

/**
 * Section configuration
 */
export interface SectionConfig {
  /** Section identifier */
  id: SectionId;
  
  /** Section title */
  title: string;
  
  /** Section icon (emoji) */
  icon: string;
  
  /** Fields in this section */
  fields: FieldConfig[];
}
