/**
 * Type definitions for PartsScene components
 * 
 * T-0505-FRONT: 3D Parts Scene - Low-Poly Meshes
 * T-0507-FRONT: Extended with LOD system props
 * 
 * @module PartsScene.types
 */

import { PartCanvasItem, BoundingBox } from '@/types/parts';

/**
 * Props for PartsScene orchestrator component
 * 
 * Renders N parts with useGLTF(part.low_poly_url)
 */
export interface PartsSceneProps {
  /** Array of parts to render in 3D scene */
  parts: PartCanvasItem[];
}

/**
 * Props for individual PartMesh component
 * 
 * Renders single part with useGLTF, status color, tooltip
 */
export interface PartMeshProps {
  /** Part data including low_poly_url, status, iso_code */
  part: PartCanvasItem;
  
  /** 3D position in scene [x, y, z] */
  position: [number, number, number];
  
  /** T-0507: Enable LOD system (default: true). Set false for backward compat with T-0505 tests */
  enableLod?: boolean;
}

/**
 * T-0507-FRONT: BBoxProxy Component Props
 * Wireframe box geometry for LOD Level 2 (camera distance >50 units)
 */
export interface BBoxProxyProps {
  /** Bounding box coordinates from backend */
  bbox: BoundingBox;
  
  /** Color from STATUS_COLORS mapping (e.g., '#3B82F6' for validated) */
  color: string;
  
  /** Opacity value (default: 0.3 for distant wireframes) */
  opacity?: number;
  
  /** Render as wireframe (default: true) */
  wireframe?: boolean;
}

/**
 * 3D Position tuple (x, y, z) in scene units
 */
export type Position3D = [number, number, number];
