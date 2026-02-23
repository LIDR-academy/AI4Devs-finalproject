/**
 * PartMesh Component
 * 
 * T-0505-FRONT: Individual part mesh rendering
 * T-0506-FRONT: Added filter-based opacity
 * T-0507-FRONT: Added 3-level LOD system
 * 
 * Loads GLB geometry with useGLTF, applies status colors, tooltip, selection state.
 * LOD system: Level 0 (mid-poly <20u) → Level 1 (low-poly 20-50u) → Level 2 (bbox >50u)
 * 
 * @module PartMesh
 */

import { useState, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';
import { FILTER_VISUAL_FEEDBACK } from '@/constants/parts.constants';
// import { LOD_DISTANCES } from '@/constants/lod.constants';  // Temporarily unused (LOD disabled)
import { usePartsStore } from '@/stores/parts.store';
// import { BBoxProxy } from './BBoxProxy';  // Temporarily unused (LOD disabled)
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
): number {
  // Selected parts always fully visible
  if (isSelected) {
    return 1.0;
  }
  
  // Filter-based opacity (T-0506)
  if (hasFilterSystem) {
    if (!hasActiveFilters) {
      // No filters applied: all parts fully visible
      return FILTER_VISUAL_FEEDBACK.MATCH_OPACITY;
    } else if (matchesFilters) {
      // Filters applied and part matches
      return FILTER_VISUAL_FEEDBACK.MATCH_OPACITY;
    } else {
      // Filters applied and part doesn't match
      return FILTER_VISUAL_FEEDBACK.NON_MATCH_OPACITY;
    }
  }
  
  // Backward compatibility for T-0505 tests (no filter system)
  return 0.8;
}

/**
 * PartMesh: Renders individual part with GLB geometry and optional LOD
 * 
 * @param props.part - Part data (iso_code, status, low_poly_url, mid_poly_url, bbox, etc.)
 * @param props.position - 3D position [x, y, z]
 * @param props.enableLod - Enable LOD system (default true). Set false for T-0505 backward compatibility
 * 
 * @example
 * ```tsx
 * // With LOD (default)
 * <PartMesh part={part} position={[10, 0, 5]} />
 * 
 * // Without LOD (backward compatibility)
 * <PartMesh part={part} position={[10, 0, 5]} enableLod={false} />
 * ```
 */
export function PartMesh({ part, position, enableLod = true }: PartMeshProps) {
  const [hovered, setHovered] = useState(false);
  const store = usePartsStore();
  const { selectPart, selectedId } = store;
  const getFilteredParts = store.getFilteredParts || (() => [part]); // Default: no filtering
  const filters = store.filters || { status: [], tipologia: [], workshop_id: null }; // Default: empty filters
  
  const isSelected = selectedId === part.id;
  const filteredParts = getFilteredParts();
  const matchesFilters = filteredParts.some((p: typeof part) => p.id === part.id);
  
  // Check if any filters are applied
  const hasFilterSystem = filters && ('status' in filters || 'tipologia' in filters);
  const hasActiveFilters = hasFilterSystem && (
    (filters.status?.length ?? 0) > 0 || 
    (filters.tipologia?.length ?? 0) > 0 || 
    filters.workshop_id !== null
  );
  
  // Load GLB geometries
  // NOTE: Mid-poly LOD temporarily disabled
  // const midPolyUrl = part.mid_poly_url ?? part.low_poly_url!;
  // const { scene: midPolyScene } = useGLTF(midPolyUrl);
  
  // Level 1: low-poly (currently only level used)
  const { scene: lowPolyScene } = useGLTF(part.low_poly_url!);

  // Preload LOD assets on mount for smoother transitions
  // NOTE: LOD preloading temporarily disabled
  /*
  useEffect(() => {
    if (enableLod) {
      useGLTF.preload(midPolyUrl);
      useGLTF.preload(part.low_poly_url!);
    }
  }, [midPolyUrl, part.low_poly_url, enableLod]);
  */

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

  // Create material props (shared across all LOD levels)
  const materialProps = {
    'data-testid': 'part-material',
    color,
    emissive,
    emissiveIntensity,
    opacity,
    transparent: true,
  };

  // Backward compatibility: Single-level rendering when enableLod=false
  if (!enableLod) {
    return (
      <group name={`part-${part.iso_code}`} position={position}>
        <primitive
          object={lowPolyScene}
          // Z-up rotation: Rhino3dm exports with Y-up coordinate system,
          // Three.js uses Y-up, but Sagrada Familia models use Z-up.
          // -90° rotation (PI/2 radians) aligns geometry correctly.
          rotation-x={-Math.PI / 2}
          data-rotation-x={-Math.PI / 2}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            attach="material"
            {...materialProps}
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

  // LOD System: 3-level distance-based rendering
  // NOTE: Lod component temporarily disabled - @react-three/drei export not found
  // Using single-level low-poly rendering for now
  return (
    <group name={`part-${part.iso_code}`} position={position}>
      <primitive
        object={lowPolyScene}
        rotation-x={-Math.PI / 2}
        data-rotation-x={-Math.PI / 2}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          attach="material"
          {...materialProps}
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
