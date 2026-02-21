/**
 * Type definitions for PartsScene components
 * 
 * T-0505-FRONT: 3D Parts Scene - Low-Poly Meshes
 * 
 * @module PartsScene.types
 */

import { PartCanvasItem } from '@/types/parts';

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
}

/**
 * 3D Position tuple (x, y, z) in scene units
 */
export type Position3D = [number, number, number];
