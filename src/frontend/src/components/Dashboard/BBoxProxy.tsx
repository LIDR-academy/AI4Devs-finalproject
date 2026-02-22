/**
 * BBoxProxy Component
 * 
 * T-0507-FRONT: LOD System - Simplified wireframe bounding box proxy
 * 
 * Renders a low-cost wireframe box (12 triangles) to represent distant parts (>50 units).
 * Part of 3-level LOD system: Level 0 (mid-poly <20u) → Level 1 (low-poly 20-50u) → Level 2 (bbox >50u)
 * 
 * @module BBoxProxy
 */

import type { BBoxProxyProps } from './PartsScene.types';

/**
 * BBoxProxy: Wireframe bounding box for distant parts (LOD Level 2)
 * 
 * Performance: 12 triangles vs 500-1000 triangles for full geometry
 * 
 * @param props.bbox - Bounding box with min/max coordinates
 * @param props.color - Box edge color (typically status color)
 * @param props.opacity - Box transparency (default 0.3)
 * @param props.wireframe - Render as wireframe (default true)
 * 
 * @example
 * ```tsx
 * <BBoxProxy 
 *   bbox={{ min: [-1, -1, 0], max: [1, 1, 2] }}
 *   color="#3B82F6"
 *   opacity={0.3}
 *   wireframe={true}
 * />
 * ```
 */
export function BBoxProxy({ 
  bbox, 
  color, 
  opacity = 0.3, 
  wireframe = true 
}: BBoxProxyProps) {
  // Calculate box dimensions from bounding box
  const width = bbox.max[0] - bbox.min[0];
  const height = bbox.max[1] - bbox.min[1];
  const depth = bbox.max[2] - bbox.min[2];
  
  // Calculate center position
  const centerX = (bbox.min[0] + bbox.max[0]) / 2;
  const centerY = (bbox.min[1] + bbox.max[1]) / 2;
  const centerZ = (bbox.min[2] + bbox.max[2]) / 2;
  
  return (
    <mesh 
      position={[centerX, centerY, centerZ]}
      data-testid="bbox-mesh"
      data-lod-level="2"
      data-component="BBoxProxy"
      data-bbox={JSON.stringify(bbox)}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshBasicMaterial 
        color={color}
        opacity={opacity}
        transparent={true}
        wireframe={wireframe}
        data-testid="bbox-material"
        // Add explicit attributes for testing (jsdom doesn't render Three.js boolean props)
        {...({
          transparent: 'true',
          wireframe: wireframe ? 'true' : 'false',
        } as any)}
      />
    </mesh>
  );
}
