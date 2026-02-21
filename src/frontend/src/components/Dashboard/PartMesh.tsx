/**
 * PartMesh Component
 * 
 * T-0505-FRONT: Individual part mesh rendering
 * 
 * Loads GLB geometry with useGLTF, applies status colors, tooltip, selection state
 * 
 * @module PartMesh
 */

import { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';
import { usePartsStore } from '@/stores/parts.store';
import type { PartMeshProps } from './PartsScene.types';

/**
 * Tooltip styles for part information display
 * Extracted as constant for consistency and maintainability
 */
const TOOLTIP_STYLES: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  whiteSpace: 'nowrap',
};

/**
 * PartMesh: Renders individual part with GLB geometry
 * 
 * @param props.part - Part data (iso_code, status, low_poly_url, etc.)
 * @param props.position - 3D position [x, y, z]
 * 
 * @example
 * ```tsx
 * <PartMesh part={part} position={[10, 0, 5]} />
 * ```
 */
export function PartMesh({ part, position }: PartMeshProps) {
  const [hovered, setHovered] = useState(false);
  const { selectPart, selectedId } = usePartsStore();
  
  const isSelected = selectedId === part.id;
  
  // Load GLB geometry
  const { scene } = useGLTF(part.low_poly_url!);

  // Handle cursor change on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  // Handle click
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPart(part.id);
  };

  // Color values
  const color = STATUS_COLORS[part.status];
  const emissive = isSelected ? color : '#000000';
  const emissiveIntensity = isSelected ? 0.4 : 0;
  const opacity = isSelected ? '1.0' : '0.8';

  return (
    <group name={`part-${part.iso_code}`} position={position}>
      <primitive
        object={scene}
        data-rotation-x={-Math.PI / 2}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          attach="material"
          data-testid="part-material"
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          opacity={opacity}
          transparent
        />
      </primitive>

      {/* Tooltip on hover or selection */}
      {(hovered || isSelected) && (
        <Html>
          <div style={TOOLTIP_STYLES}>
            <div>{part.iso_code}</div>
            <div>{part.tipologia}</div>
            {part.workshop_name && <div>{part.workshop_name}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}
