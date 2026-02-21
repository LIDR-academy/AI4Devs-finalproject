/**
 * PartsScene Component
 * 
 * T-0505-FRONT: Orchestrator component for 3D parts rendering
 * 
 * Renders N parts with useGLTF(part.low_poly_url), skipping parts without geometry
 * 
 * @module PartsScene
 */

import { useMemo } from 'react';
import { PartMesh } from './PartMesh';
import { usePartsSpatialLayout } from '@/hooks/usePartsSpatialLayout';
import type { PartsSceneProps } from './PartsScene.types';

/**
 * PartsScene: Renders multiple parts in 3D scene
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
        />
      ))}
    </group>
  );
}
