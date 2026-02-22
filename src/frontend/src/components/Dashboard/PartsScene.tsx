/**
 * PartsScene Component
 * 
 * T-0505-FRONT: Orchestrator component for 3D parts rendering
 * T-0507-FRONT: Added LOD system with preload strategy
 * 
 * Renders N parts with useGLTF(part.low_poly_url), skipping parts without geometry.
 * Preloads all geometry URLs to prevent pop-in during LOD transitions.
 * 
 * @module PartsScene
 */

import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { PartMesh } from './PartMesh';
import { usePartsSpatialLayout } from '@/hooks/usePartsSpatialLayout';
import type { PartsSceneProps } from './PartsScene.types';

/**
 * PartsScene: Renders N parts in 3D space with LOD
 * 
 * @param props.parts - Array of parts to render
 * 
 * @example
 * ```tsx
 * <Canvas>
 *   <PartsScene parts={parts} />
 * </Canvas>
 * ```
 */
export function PartsScene({ parts }: PartsSceneProps) {
  // Filter parts with valid geometry
  const partsWithGeometry = useMemo(() => {
    return parts.filter((part) => part.low_poly_url !== null);
  }, [parts]);

  // Calculate positions for all parts with geometry
  const positions = usePartsSpatialLayout(partsWithGeometry);

  // Preload all geometry URLs to prevent pop-in during LOD transitions (T-0507)
  useEffect(() => {
    partsWithGeometry.forEach((part) => {
      // Preload mid-poly if available
      if (part.mid_poly_url) {
        useGLTF.preload(part.mid_poly_url);
      }
      // Always preload low-poly
      if (part.low_poly_url) {
        useGLTF.preload(part.low_poly_url);
      }
    });
  }, [partsWithGeometry]);

  // Performance monitoring: Intentional logging for metrics tracking
  // NOTE: This console.info is NOT debug code - it's used for performance monitoring
  // in production. See T-0505-FRONT spec for requirements.
  useMemo(() => {
    console.info('Rendering PartsScene', {
      total: parts.length,
      withGeometry: partsWithGeometry.length,
      layoutType: 'grid_10x10',
    });
  }, [parts.length, partsWithGeometry.length]);

  return (
    <group name="parts-scene">
      {partsWithGeometry.map((part, index) => (
        <PartMesh
          key={part.id}
          part={part}
          position={positions[index]}
          enableLod={true}
        />
      ))}
    </group>
  );
}
