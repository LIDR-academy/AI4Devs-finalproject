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
import { useGLTF, Html, Detailed } from '@react-three/drei';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';
import { FILTER_VISUAL_FEEDBACK } from '@/constants/parts.constants';
import { LOD_DISTANCES } from '@/constants/lod.constants';
import { usePartsStore } from '@/stores/parts.store';
import { BBoxProxy } from './BBoxProxy';
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
  // When enableLod=false: only load low_poly (backward compatibility)
  // When enableLod=true: load both mid_poly (or fallback to low_poly) and low_poly
  const lowPolyUrl = part.low_poly_url!;
  const midPolyUrl = enableLod ? (part.mid_poly_url ?? lowPolyUrl) : lowPolyUrl;
  
  const { scene: lowPolyScene } = useGLTF(lowPolyUrl);
  const { scene: midPolyScene } = useGLTF(midPolyUrl);

  // Preload LOD assets on mount for smoother transitions
  useEffect(() => {
    if (enableLod) {
      if (part.mid_poly_url) {
        useGLTF.preload(part.mid_poly_url);
      }
      useGLTF.preload(lowPolyUrl);
    }
  }, [part.mid_poly_url, lowPolyUrl, enableLod]);

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
    opacity: opacity,
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
  // NOTE: Lod component from @react-three/drei
  // Level 0 (<20u): mid_poly_url → Level 1 (20-50u): low_poly_url → Level 2 (>50u): BBoxProxy
  return (
    <group name={`part-${part.iso_code}`} position={position}>
      {/* Tooltip on hover or selection (shared across all LOD levels) */}
      {(hovered || isSelected) && (
        <Html>
          <div style={TOOLTIP_STYLES}>
            <div>{part.iso_code}</div>
            <div>{part.tipologia}</div>
            {part.workshop_name && <div>{part.workshop_name}</div>}
          </div>
        </Html>
      )}

      <Detailed distances={[...LOD_DISTANCES]}>
        {/* Level 0: Mid-poly geometry (0-20 units) */}
        <group data-lod-level="0" data-geometry-url={midPolyUrl}>
          <primitive
            name={`part-${part.iso_code}`}
            object={midPolyScene}
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
        </group>

        {/* Level 1: Low-poly geometry (20-50 units) */}
        <group data-lod-level="1" data-geometry-url={part.low_poly_url}>
          <primitive
            name={`part-${part.iso_code}`}
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
        </group>

        {/* Level 2: BBox proxy (>50 units) or low-poly fallback */}
        <group 
          name={`part-${part.iso_code}`}
          data-lod-level="2"
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {part.bbox ? (
            <BBoxProxy
              bbox={part.bbox}
              color={color}
              opacity={opacity}
              wireframe={true}
            />
          ) : (
            <primitive
              object={lowPolyScene}
              rotation-x={-Math.PI / 2}
              data-rotation-x={-Math.PI / 2}
            >
              <meshStandardMaterial
                attach="material"
                {...materialProps}
              />
            </primitive>
          )}
        </group>
      </Detailed>
    </group>
  );
}
