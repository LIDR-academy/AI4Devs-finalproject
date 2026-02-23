/**
 * Modal Types
 * T-0508-FRONT: Part selection and modal integration
 * 
 * @module modal
 */

import { PartCanvasItem } from './parts';

/**
 * Props for PartDetailModal component
 * 
 * @remarks
 * This is a FUTURE-PROOF contract for US-010 integration.
 * T-0508-FRONT implements a placeholder modal with basic info.
 * US-010 will extend this with full detail view (3D viewer, metadata tabs, history timeline).
 * 
 * @example
 * ```tsx
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   part={parts.find(p => p.id === selectedId) || null}
 *   onClose={() => clearSelection()}
 * />
 * ```
 */
export interface PartDetailModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  
  /** Selected part data (null when no selection) */
  part: PartCanvasItem | null;
  
  /** Close modal callback (triggers clearSelection in store) */
  onClose: () => void;
}
