/**
 * T-1008-FRONT: PartMetadataPanel Constants
 * Configuration constants for metadata display
 * 
 * @module components/Dashboard/PartMetadataPanel.constants
 */

import type { SectionConfig, SectionId } from './PartMetadataPanel.types';

/**
 * Default values for component props
 */
export const DEFAULTS = {
  INITIAL_EXPANDED_SECTION: 'info' as SectionId,
} as const;

/**
 * Empty value placeholders
 */
export const EMPTY_VALUES = {
  NO_ASSIGNED: 'No asignado',
  NO_DATA: 'Sin datos',
  NOT_AVAILABLE: 'N/A',
  NO_VALIDATION: 'Sin reporte de validación disponible',
} as const;

/**
 * ARIA labels for accessibility
 */
export const ARIA_LABELS = {
  SECTION_BUTTON: (title: string) => `Sección ${title}`,
  SECTION_REGION: (title: string) => `Contenido de ${title}`,
  EXPAND_ICON: 'Expandir/colapsar',
} as const;

/**
 * Section configuration
 * Defines the 4 collapsible sections and their fields
 */
export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: 'info',
    title: 'Información',
    icon: 'ℹ️',
    fields: [
      { label: 'Código ISO', key: 'iso_code', component: 'text' },
      { label: 'Tipología', key: 'tipologia', component: 'text' },
      { label: 'Estado', key: 'status', component: 'badge' },
      { label: 'Fecha creación', key: 'created_at', component: 'text' },
      { label: 'ID', key: 'id', component: 'text', monospace: true },
    ],
  },
  {
    id: 'workshop',
    title: 'Taller',
    icon: '🏭',
    fields: [
      { label: 'Nombre', key: 'workshop_name', component: 'text', emptyValue: EMPTY_VALUES.NO_ASSIGNED },
      { label: 'ID Taller', key: 'workshop_id', component: 'text', monospace: true, emptyValue: EMPTY_VALUES.NOT_AVAILABLE },
    ],
  },
  {
    id: 'geometry',
    title: 'Geometría',
    icon: '📐',
    fields: [
      { label: 'Bounding Box', key: 'bbox', component: 'coordinates', emptyValue: EMPTY_VALUES.NO_DATA },
      { label: 'Tamaño archivo', key: 'glb_size_bytes', component: 'text', emptyValue: EMPTY_VALUES.NO_DATA },
      { label: 'Triángulos', key: 'triangle_count', component: 'text', emptyValue: EMPTY_VALUES.NO_DATA },
      { label: 'URL GLB', key: 'low_poly_url', component: 'link', emptyValue: EMPTY_VALUES.NOT_AVAILABLE },
    ],
  },
  {
    id: 'validation',
    title: 'Validación',
    icon: '✅',
    fields: [
      { label: 'Reporte', key: 'validation_report', component: 'json', emptyValue: EMPTY_VALUES.NO_VALIDATION },
    ],
  },
];

/**
 * Inline styles for Portal-safe rendering
 * (Tailwind classes may not apply inside React Portal)
 */
export const SECTION_STYLES = {
  container: {
    padding: '1.5rem',
    maxWidth: '100%',
    overflowY: 'auto' as const,
  },
  section: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E7EB',
  },
  sectionLast: {
    borderBottom: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  headerTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  expandIcon: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    transition: 'transform 0.2s',
  },
  expandIconExpanded: {
    transform: 'rotate(90deg)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '0.75rem',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '1rem',
    alignItems: 'baseline',
  },
  fieldLabel: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  fieldValue: {
    fontSize: '0.875rem',
    color: '#111827',
    wordBreak: 'break-word' as const,
  },
  fieldValueMono: {
    fontFamily: "'Monaco', 'Courier New', monospace",
    fontSize: '0.75rem',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  fieldValueEmpty: {
    color: '#9CA3AF',
    fontStyle: 'italic' as const,
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  link: {
    color: '#2563EB',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  coordinates: {
    fontFamily: "'Monaco', 'Courier New', monospace",
    fontSize: '0.75rem',
    backgroundColor: '#F9FAFB',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  json: {
    fontFamily: "'Monaco', 'Courier New', monospace",
    fontSize: '0.75rem',
    backgroundColor: '#F9FAFB',
    padding: '0.75rem',
    borderRadius: '4px',
    overflowX: 'auto' as const,
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
} as const;

/**
 * Status badge color mapping
 */
export const STATUS_COLORS: Record<string, { backgroundColor: string; color: string }> = {
  validated: { backgroundColor: '#D1FAE5', color: '#065F46' },
  uploaded: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
  processing: { backgroundColor: '#FEF3C7', color: '#92400E' },
  rejected: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  error_processing: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  in_fabrication: { backgroundColor: '#E0E7FF', color: '#3730A3' },
  completed: { backgroundColor: '#D1FAE5', color: '#065F46' },
  archived: { backgroundColor: '#F3F4F6', color: '#6B7280' },
} as const;
