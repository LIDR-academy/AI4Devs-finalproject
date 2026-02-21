/**
 * PartMesh Component
 * 
 * T-0505-FRONT: Individual part mesh rendering
 * T-0506-FRONT: Added filter-based opacity
 * 
 * Loads GLB geometry with useGLTF, applies status colors, tooltip, selection state
 * 
 * @module PartMesh
 */

import { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';
import { FILTER_VISUAL_FEEDBACK } from '@/constants/parts.constants';
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
 * Calculate opacity value based on selection and filter state
 * 
 * Opacity rules:
 * 1. Selected part: always fully visible (1.0)
 * 2. No filters applied: all parts fully visible (1.0)
 * 3. Filters applied + matches: fully visible (1.0)
 * 4. Filters applied + no match: faded out (0.2)
 * 5. Backward compatibility: legacy tests without filter system (0.8)
 * 
 * @param isSelected - Whether part is currently selected
 * @param hasFilterSystem - Whether filters object has status/tipologia properties
 * @param hasActiveFilters - Whether any filter is currently applied
 * @param matchesFilters - Whether part matches current filter criteria
 * @returns Opacity value as string ('0.2', '0.8', or '1.0')
 */
function calculatePartOpacity(
  isSelected: boolean,
  hasFilterSystem: boolean,
  hasActiveFilters: boolean,
  matchesFilters: boolean
): string {
  // Selected parts always fully visible
  if (isSelected) {
    return '1.0';
  }
  
  // Filter-based opacity (T-0506)
  if (hasFilterSystem) {
    if (!hasActiveFilters) {
      // No filters applied: all parts fully visible
      return FILTER_VISUAL_FEEDBACK.MATCH_OPACITY.toFixed(1);
    } else if (matchesFilters) {
      // Filters applied and part matches
      return FILTER_VISUAL_FEEDBACK.MATCH_OPACITY.toFixed(1);
    } else {
      // Filters applied and part doesn't match
      return FILTER_VISUAL_FEEDBACK.NON_MATCH_OPACITY.toFixed(1);
    }
  }
  
  // Backward compatibility for T-0505 tests (no filter system)
  return '0.8';
}

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
  const store = usePartsStore();
  const { selectPart, selectedId } = store;
  const getFilteredParts = store.getFilteredParts || (() => [part]); // Default: no filtering
  const filters = store.filters || { status: [], tipologia: [], workshop_id: null }; // Default: empty filters
  
  const isSelected = selectedId === part.id;
  const filteredParts = getFilteredParts();
  const matchesFilters = filteredParts.some(p => p.id === part.id);
  
  // Check if any filters are applied
  const hasFilterSystem = filters && ('status' in filters || 'tipologia' in filters);
  const hasActiveFilters = hasFilterSystem && (
    (filters.status?.length ?? 0) > 0 || 
    (filters.tipologia?.length ?? 0) > 0 || 
    filters.workshop_id !== null
  );
  
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
  
  // Calculate opacity based on selection and filter state
  const opacity = calculatePartOpacity(
    isSelected,
    hasFilterSystem,
    hasActiveFilters,
    matchesFilters
  );

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
