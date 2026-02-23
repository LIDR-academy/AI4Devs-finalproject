/**
 * T-0506-FRONT: Parts Filter Constants
 * 
 * Centralized constants for parts filtering UI
 */

/**
 * Tipología options for filter UI
 * Source: Product brief (docs/productContext.md)
 */
export const TIPOLOGIA_OPTIONS = [
  { value: 'capitel', label: 'Capitel' },
  { value: 'columna', label: 'Columna' },
  { value: 'dovela', label: 'Dovela' },
  { value: 'clave', label: 'Clave' },
  { value: 'imposta', label: 'Imposta' },
  { value: 'arco', label: 'Arco' },
  { value: 'bóveda', label: 'Bóveda' },
  { value: 'decorativo', label: 'Decorativo' },
] as const;

/**
 * BlockStatus options for filter UI
 * Includes color coding for visual feedback
 */
export const STATUS_OPTIONS = [
  { value: 'uploaded', label: 'Cargado', color: '#9ca3af' },       // gray-400
  { value: 'processing', label: 'Procesando', color: '#f59e0b' },  // amber-500
  { value: 'validated', label: 'Validado', color: '#10b981' },     // green-500
  { value: 'rejected', label: 'Rechazado', color: '#ef4444' },     // red-500
  { value: 'in_fabrication', label: 'En Fabricación', color: '#3b82f6' }, // blue-500
  { value: 'completed', label: 'Completado', color: '#8b5cf6' },   // violet-500
] as const;

/**
 * Visual feedback constants for non-matching parts
 */
export const FILTER_VISUAL_FEEDBACK = {
  /** Opacity for matching parts (fully visible) */
  MATCH_OPACITY: 1.0,
  
  /** Opacity for non-matching parts (faded out) */
  NON_MATCH_OPACITY: 0.2,
  
  /** CSS transition duration for smooth fade (milliseconds) */
  TRANSITION_DURATION: 300,
} as const;

/**
 * URL param keys for filter persistence
 */
export const FILTER_URL_PARAMS = {
  STATUS: 'status',
  TIPOLOGIA: 'tipologia',
  WORKSHOP: 'workshop_id',
  SEPARATOR: ',', // For multi-select arrays: status=validated,uploaded
} as const;
