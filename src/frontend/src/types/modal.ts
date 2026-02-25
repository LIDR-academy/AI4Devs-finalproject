/**
 * Modal Types
 * T-0508-FRONT: Part selection and modal integration
 * T-1007-FRONT: Modal Integration - 3D Viewer with Tabs & Navigation
 * 
 * @module modal
 */

import { PartCanvasItem } from './parts';

/**
 * Tab identifiers for PartDetailModal
 * T-1007-FRONT: Three-tab system (viewer default, metadata placeholder, validation reused)
 */
export type TabId = 'viewer' | 'metadata' | 'validation';

/**
 * Navigation direction for prev/next buttons
 * T-1007-FRONT: Keyboard navigation (← →)
 */
export type NavigationDirection = 'prev' | 'next';

/**
 * Adjacent part IDs from T-1003-BACK /api/parts/{id}/navigation
 * 
 * @remarks
 * CRITICAL CONTRACT ALIGNMENT with T-1003-BACK NavigationResponse
 * Backend returns exactly these 4 fields (with snake_case)
 * 
 * @see src/backend/schemas.py - NavigationResponse
 */
export interface AdjacentPartsInfo {
  /** Previous part UUID (null if current part is first in filtered set) */
  prev_id: string | null;
  
  /** Next part UUID (null if current part is last in filtered set) */
  next_id: string | null;
  
  /** Current part's 1-based position (e.g., 5 means "5 of 20") */
  current_index: number;
  
  /** Total parts in filtered set (respects active filters) */
  total_count: number;
}

/**
 * Props for PartDetailModal component (T-0508 + T-1007 combined)
 * 
 * @remarks
 * T-1007-FRONT BREAKING CHANGES from T-0508:
 * - REMOVED: `part: PartCanvasItem | null` prop
 * - ADDED: `partId: string` prop (modal fetches own data via GET /api/parts/{id})
 *   Rationale: Decouples modal from Dashboard3D state, enables direct URL navigation
 * - ADDED: `initialTab` for deep linking support (e.g., ?tab=metadata)
 * - ADDED: `enableNavigation` to toggle prev/next buttons (default: true)
 * - ADDED: `filters` to pass to navigation API (respects user's current filter state)
 * 
 * @example
 * ```tsx
 * // T-0508 OLD (deprecated):
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   part={parts.find(p => p.id === selectedId) || null}
 *   onClose={() => clearSelection()}
 * />
 * 
 * // T-1007 NEW:
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   partId={selectedId}
 *   onClose={() => clearSelection()}
 *   initialTab="viewer"
 *   enableNavigation={true}
 *   filters={{ status: ['validated'], tipologia: ['capitel'] }}
 * />
 * ```
 */
export interface PartDetailModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  
  /** Part UUID to display (T-1007: Changed from `part: PartCanvasItem | null`) */
  partId: string;
  
  /** Close modal callback (triggers clearSelection in store) */
  onClose: () => void;
  
  /** Initial tab to display (default: 'viewer') */
  initialTab?: TabId;
  
  /** Enable prev/next navigation buttons (default: true) */
  enableNavigation?: boolean;
  
  /** Current filter state to pass to navigation API (default: null) */
  filters?: {
    status?: string[];
    tipologia?: string[];
    workshop_id?: string;
  } | null;
}

/**
 * DEPRECATED: T-0508 Props (kept for backward compatibility during migration)
 * @deprecated Use PartDetailModalProps with `partId` instead of `part`
 */
export interface PartDetailModalPropsLegacy {
  isOpen: boolean;
  part: PartCanvasItem | null;
  onClose: () => void;
}
