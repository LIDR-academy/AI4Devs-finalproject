/**
 * LOD (Level of Detail) System Configuration
 * 
 * T-0507-FRONT: 3-level LOD system for performance optimization
 * 
 * Based on POC validation (docs/US-005/PERFORMANCE-ANALYSIS-3D-FORMATS.md):
 * - 60 FPS achieved with 1197 meshes (39,360 triangles)
 * - 41 MB heap memory (5x better than 500 MB target)
 * - Extrapolation: 150 parts × 12 tris/bbox = 1,800 triangles (96% reduction at distance)
 * 
 * @module lod.constants
 */

/**
 * LOD level distances in world units
 * 
 * Arrays are passed to drei <Lod distances={LOD_DISTANCES}>:
 * - Index 0 (Level 0): 0 to LOD_DISTANCES[1] units
 * - Index 1 (Level 1): LOD_DISTANCES[1] to LOD_DISTANCES[2] units
 * - Index 2 (Level 2): LOD_DISTANCES[2]+ units
 * 
 * @constant
 * @readonly
 */
export const LOD_DISTANCES = [0, 20, 50] as const;

/**
 * LOD level identifiers
 * Maps semantic names to array indices for clarity
 * 
 * @constant
 * @readonly
 */
export const LOD_LEVELS = {
  /** Level 0: Mid-poly geometry (<20 units) - 1000 triangles */
  MID_POLY: 0,
  
  /** Level 1: Low-poly geometry (20-50 units) - 500 triangles */
  LOW_POLY: 1,
  
  /** Level 2: BBox wireframe proxy (>50 units) - 12 triangles */
  BBOX_PROXY: 2,
} as const;

/**
 * LOD Configuration Metadata
 * Targets and thresholds for performance monitoring
 * 
 * @constant
 * @readonly
 */
export const LOD_CONFIG = {
  /** Target FPS with 150 parts rendered */
  TARGET_FPS: 30,
  
  /** Maximum acceptable memory heap size (MB) */
  MAX_MEMORY_MB: 500,
  
  /** Triangle counts per LOD level */
  TRIANGLES: {
    MID_POLY: 1000,
    LOW_POLY: 500,
    BBOX: 12,
  },
  
  /** Distance thresholds (duplicate of LOD_DISTANCES for docs) */
  DISTANCE_THRESHOLDS: {
    MID_POLY_MAX: 20,    // Level 0 active from 0 to 20 units
    LOW_POLY_MIN: 20,    // Level 1 active from 20 to 50 units
    LOW_POLY_MAX: 50,
    BBOX_MIN: 50,        // Level 2 active from 50+ units
  },
} as const;

/**
 * Type guard: Check if value is valid LOD level
 * 
 * @param level - Value to check
 * @returns True if level is 0, 1, or 2
 * 
 * @example
 * ```ts
 * if (isValidLodLevel(userInput)) {
 *   switchToLevel(userInput); // TypeScript knows it's 0 | 1 | 2
 * }
 * ```
 */
export function isValidLodLevel(level: number): level is 0 | 1 | 2 {
  return level === 0 || level === 1 || level === 2;
}
