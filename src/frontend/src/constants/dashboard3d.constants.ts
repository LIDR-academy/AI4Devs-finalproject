/**
 * Dashboard 3D Constants
 * 
 * T-0505-FRONT: Constants for 3D Parts Scene rendering
 * 
 * @module dashboard3d.constants
 */

import { BlockStatus } from '@/types/parts';

/**
 * Color mapping for part status in 3D scene
 * Colors use Tailwind CSS palette for consistency
 */
export const STATUS_COLORS: Record<BlockStatus, string> = {
  uploaded: '#94A3B8',        // Slate 400 - neutral gray
  processing: '#A78BFA',      // Violet 400 - processing indicator
  validated: '#3B82F6',       // Blue 500 - approved
  rejected: '#EF4444',        // Red 500 - rejected
  in_fabrication: '#F59E0B',  // Amber 500 - in progress
  completed: '#10B981',       // Emerald 500 - done
  error_processing: '#DC2626',// Red 600 - error state
  archived: '#6B7280',        // Gray 500 - archived
};

/**
 * Grid layout configuration for automatic part positioning
 */
export const GRID_SPACING = 5;  // Units between parts in grid layout (meters)
export const GRID_COLUMNS = 10; // 10x10 grid for automatic layout

/**
 * LOD (Level of Detail) distance thresholds in scene units
 * Used by T-0507-FRONT LOD System
 */
export const LOD_DISTANCES = {
  NEAR: 0,    // <20 units: Full detail (1000 triangles)
  MID: 20,    // 20-50 units: Mid detail (500 triangles)
  FAR: 50,    // >50 units: Bounding box proxy
};

/**
 * Camera configuration defaults
 */
export const CAMERA_DEFAULTS = {
  POSITION: [50, 50, 50] as [number, number, number],
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000,
};
