/**
 * Selection behavior constants
 * T-0508-FRONT: Part selection and modal interaction
 * 
 * @module selection.constants
 */

/**
 * Emissive glow intensity for selected parts
 * From POC validation: 0.4 provides clear visual feedback without oversaturation
 */
export const SELECTION_EMISSIVE_INTENSITY = 0.4;

/**
 * Keyboard keys for deselection
 */
export const DESELECTION_KEYS = {
  ESCAPE: 'Escape',
  ESC: 'Esc',  // Legacy browsers
} as const;

/**
 * Aria labels for accessibility
 */
export const SELECTION_ARIA_LABELS = {
  MODAL_CLOSE_BUTTON: 'Cerrar detalle de pieza',
  PART_MESH_SELECTABLE: 'Pieza seleccionable. Clic para ver detalles',
} as const;
