/**
 * Hook: usePartsSpatialLayout
 * 
 * T-0505-FRONT: Calculate 3D positions for parts in the scene
 * 
 * Strategy:
 * - If part has bbox: Use center of bounding box [(min+max)/2 for each axis]
 * - If no bbox: Use grid layout (10x10 grid with GRID_SPACING units)
 * 
 * @module usePartsSpatialLayout
 */

import { useMemo } from 'react';
import { PartCanvasItem, BoundingBox } from '@/types/parts';
import { GRID_SPACING, GRID_COLUMNS } from '@/constants/dashboard3d.constants';
import { Position3D } from '@/components/Dashboard/PartsScene.types';

/**
 * Calculate the geometric center of a bounding box
 * 
 * @param bbox - Bounding box with min/max coordinates
 * @returns Position3D tuple representing the center point
 * 
 * @internal
 */
function calculateBBoxCenter(bbox: BoundingBox): Position3D {
  const centerX = (bbox.min[0] + bbox.max[0]) / 2;
  const centerY = (bbox.min[1] + bbox.max[1]) / 2;
  const centerZ = (bbox.min[2] + bbox.max[2]) / 2;
  return [centerX, centerY, centerZ];
}

/**
 * Calculate grid position for a part at given index
 * Uses 10x10 grid layout with GRID_SPACING units between parts
 * 
 * @param index - Zero-based index of the part in the array
 * @returns Position3D tuple for grid position (Y=0 for ground level)
 * 
 * @internal
 */
function calculateGridPosition(index: number): Position3D {
  const col = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  
  return [
    col * GRID_SPACING,
    0, // Y = 0 for grid layout (ground level)
    row * GRID_SPACING,
  ];
}

/**
 * Calculate spatial positions for parts in 3D scene
 * 
 * @param parts - Array of parts to position
 * @returns Array of Position3D tuples matching parts order
 * 
 * @example
 * ```typescript
 * const positions = usePartsSpatialLayout(parts);
 * // positions[0] corresponds to parts[0], etc.
 * ```
 */
export function usePartsSpatialLayout(parts: PartCanvasItem[]): Position3D[] {
  return useMemo(() => {
    return parts.map((part, index) => {
      // Strategy 1: Use bounding box center if available
      if (part.bbox) {
        return calculateBBoxCenter(part.bbox);
      }

      // Strategy 2: Use grid layout (10x10)
      return calculateGridPosition(index);
    });
  }, [parts]);
}
