# T-0505-FRONT: 3D Parts Scene with Low-Poly Meshes

## Objetivo
Implementar componente React que renderiza todas las piezas del sistema como geometrías 3D Low-Poly en un Canvas Three.js, con interacción (click, hover), layout espacial automatizado, y coloreado por estado.

## Contexto
- **Parent Component:** `Dashboard3D.tsx` (T-0504)
- **Input:** Array `parts: PartCanvasItem[]` (fetch desde `/api/parts`)
- **Output:** Escena 3D con N geometrías renderizadas, cada una clickeable y con tooltip
- **Dependencies:** `@react-three/fiber`, `@react-three/drei`, Zustand store

## Arquitectura del Componente

```
PartsScene.tsx (Orchestrator)
  ├─> usePartsSpatialLayout() hook
  │    └─> Calcula posiciones [x,y,z] para cada pieza
  │
  └─> PartMesh.tsx (x N piezas)
       ├─> useGLTF(low_poly_url)
       ├─> <Lod> (LOD System, T-0507)
       ├─> onClick → selectPart(id)
       └─> <Html> tooltip
```

## Implementación

### 1. PartsScene Component (Orchestrator)

```typescript
// src/frontend/src/components/Dashboard/PartsScene.tsx
import { useMemo } from 'react';
import { PartCanvasItem } from '@/types/parts';
import { PartMesh } from './PartMesh';
import { usePartsSpatialLayout } from '@/hooks/usePartsSpatialLayout';
import structlog from 'structlog';

const logger = structlog.getLogger();

interface PartsSceneProps {
  parts: PartCanvasItem[];
}

export function PartsScene({ parts }: PartsSceneProps) {
  // Hook personalizado para calcular posiciones espaciales
  const positions = usePartsSpatialLayout(parts);
  
  // Log performance metrics
  useMemo(() => {
    const validParts = parts.filter(p => p.low_poly_url);
    logger.info('Rendering PartsScene', {
      total: parts.length,
      withGeometry: validParts.length,
      layoutType: 'grid_10x10'
    });
  }, [parts.length]);
  
  return (
    <group name="parts-scene">
      {parts.map((part, index) => {
        // Skip piezas sin geometría procesada
        if (!part.low_poly_url) {
          logger.warn('Part missing low_poly_url', { 
            partId: part.id, 
            isoCode: part.iso_code 
          });
          return null;
        }
        
        return (
          <PartMesh
            key={part.id}
            part={part}
            position={positions[index]}
          />
        );
      })}
    </group>
  );
}
```

### 2. Spatial Layout Hook

```typescript
// src/frontend/src/hooks/usePartsSpatialLayout.ts
import { useMemo } from 'react';
import { PartCanvasItem, BoundingBox } from '@/types/parts';
import { GRID_SPACING, GRID_COLUMNS } from '@/constants/dashboard3d.constants';

type Position3D = [number, number, number];

/**
 * Calcula posiciones espaciales para cada pieza.
 * 
 * Estrategia:
 * 1. Si pieza tiene `bbox` en metadata → Usar posición real (BIM coordinates)
 * 2. Si NO tiene bbox → Fallback a grid layout automático 10x10
 */
export function usePartsSpatialLayout(parts: PartCanvasItem[]): Position3D[] {
  return useMemo(() => {
    return parts.map((part, index) => {
      // Strategy 1: Real BIM coordinates (if available)
      if (part.bbox) {
        return calculateBBoxCenter(part.bbox);
      }
      
      // Strategy 2: Automatic grid layout
      return calculateGridPosition(index);
    });
  }, [parts]);
}

function calculateBBoxCenter(bbox: BoundingBox): Position3D {
  return [
    (bbox.max[0] + bbox.min[0]) / 2,
    (bbox.max[1] + bbox.min[1]) / 2,
    (bbox.max[2] + bbox.min[2]) / 2
  ];
}

function calculateGridPosition(index: number): Position3D {
  const row = Math.floor(index / GRID_COLUMNS);
  const col = index % GRID_COLUMNS;
  
  return [
    col * GRID_SPACING,      // X axis
    0,                       // Y axis (ground level)
    row * GRID_SPACING       // Z axis
  ];
}
```

### 3. PartMesh Component (Individual Piece)

```typescript
// src/frontend/src/components/Dashboard/PartMesh.tsx
import { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { PartCanvasItem } from '@/types/parts';
import { usePartsStore } from '@/stores/parts.store';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';

interface PartMeshProps {
  part: PartCanvasItem;
  position: [number, number, number];
}

export function PartMesh({ part, position }: PartMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { selectPart, selectedId } = usePartsStore();
  const isSelected = selectedId === part.id;
  
  // Load GLB geometry (cached by drei)
  const { scene } = useGLTF(part.low_poly_url!);
  
  // Material properties
  const color = STATUS_COLORS[part.status];
  const emissiveColor = isSelected ? color : '#000000';
  const emissiveIntensity = isSelected ? 0.4 : 0;
  const opacity = isSelected ? 1.0 : 0.8;
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPart(part.id);
  };
  
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  return (
    <group position={position} name={`part-${part.iso_code}`}>
      {/* 3D Geometry */}
      <primitive
        ref={meshRef}
        object={scene.clone()}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={1}
      >
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          roughness={0.7}
          metalness={0.3}
        />
      </primitive>
      
      {/* Tooltip (HTML Overlay) */}
      {(hovered || isSelected) && (
        <Html
          distanceFactor={10}
          position={[0, 1, 0]}  // Above the mesh
          center
        >
          <div className="part-tooltip">
            <span className="iso-code">{part.iso_code}</span>
            <span className="tipologia">{part.tipologia}</span>
            {part.workshop_name && (
              <span className="workshop">{part.workshop_name}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Preload GLB assets for faster initial load
useGLTF.preload('/models/fallback.glb');
```

### 4. Constants Definition

```typescript
// src/frontend/src/constants/dashboard3d.constants.ts
import { BlockStatus } from '@/types/parts';

export const STATUS_COLORS: Record<BlockStatus, string> = {
  uploaded: '#94A3B8',       // Slate 400
  validated: '#3B82F6',      // Blue 500
  in_fabrication: '#F59E0B', // Amber 500
  completed: '#10B981',      // Emerald 500
  archived: '#6B7280'        // Gray 500
};

export const GRID_SPACING = 5;  // Units between parts in grid layout
export const GRID_COLUMNS = 10; // 10x10 grid

export const LOD_DISTANCES = {
  NEAR: 0,    // <20 units: Full detail
  MID: 20,    // 20-50 units: Mid detail
  FAR: 50     // >50 units: Bounding box
};

export const CAMERA_DEFAULTS = {
  POSITION: [50, 50, 50] as [number, number, number],
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000
};
```

### 5. Zustand Store (Part Selection)

```typescript
// src/frontend/src/stores/parts.store.ts
import { create } from 'zustand';
import { PartCanvasItem, CanvasFilters } from '@/types/parts';
import { partsService } from '@/services/parts.service';

interface PartsState {
  parts: PartCanvasItem[];
  filters: CanvasFilters;
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchParts: () => Promise<void>;
  setFilters: (filters: CanvasFilters) => void;
  selectPart: (id: string | null) => void;
  clearSelection: () => void;
}

export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  filters: {},
  selectedId: null,
  isLoading: false,
  error: null,
  
  fetchParts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await partsService.listParts(filters);
      set({ parts: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  setFilters: (filters) => {
    set({ filters });
    get().fetchParts(); // Re-fetch with new filters
  },
  
  selectPart: (id) => {
    set({ selectedId: id });
    
    // Open detail modal (US-010 integration)
    if (id) {
      const event = new CustomEvent('openPartDetailModal', { detail: { partId: id } });
      window.dispatchEvent(event);
    }
  },
  
  clearSelection: () => set({ selectedId: null })
}));
```

### 6. Styling (Tooltip)

```css
/* src/frontend/src/components/Dashboard/PartMesh.css */
.part-tooltip {
  background: rgba(17, 24, 39, 0.95); /* gray-900 */
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.part-tooltip .iso-code {
  font-weight: 600;
  font-size: 16px;
}

.part-tooltip .tipologia {
  font-size: 12px;
  color: #D1D5DB; /* gray-300 */
  text-transform: capitalize;
}

.part-tooltip .workshop {
  font-size: 11px;
  color: #9CA3AF; /* gray-400 */
  font-style: italic;
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/components/Dashboard/PartMesh.test.tsx
import { render, screen } from '@testing-library/react';
import { PartMesh } from './PartMesh';
import { vi } from 'vitest';

// Mock useGLTF
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: {
      clone: () => ({
        children: [],
        traverse: vi.fn()
      })
    }
  })),
  Html: ({ children }: any) => <div data-testid="html-overlay">{children}</div>
}));

describe('PartMesh', () => {
  const mockPart: PartCanvasItem = {
    id: 'test-123',
    iso_code: 'SF-C12-D-001',
    status: 'validated',
    tipologia: 'capitel',
    low_poly_url: 'https://s3.../test.glb',
    workshop_name: 'Taller Granollers'
  };
  
  it('renders GLB geometry at correct position', () => {
    const position: [number, number, number] = [10, 0, 5];
    const { container } = render(
      <PartMesh part={mockPart} position={position} />
    );
    
    const group = container.querySelector('group[name="part-SF-C12-D-001"]');
    expect(group).toHaveAttribute('position', '10,0,5');
  });
  
  it('applies correct color based on status', () => {
    render(<PartMesh part={mockPart} position={[0, 0, 0]} />);
    const material = screen.getByRole('material'); // Custom test role
    expect(material).toHaveStyle({ color: '#3B82F6' }); // validated = blue
  });
  
  it('shows tooltip on hover', async () => {
    const { user } = render(<PartMesh part={mockPart} position={[0, 0, 0]} />);
    const mesh = screen.getByRole('mesh');
    
    await user.hover(mesh);
    expect(screen.getByText('SF-C12-D-001')).toBeInTheDocument();
    expect(screen.getByText('capitel')).toBeInTheDocument();
  });
});
```

### Integration Test

```typescript
// src/components/Dashboard/PartsScene.test.tsx
import { render, waitFor } from '@testing-library/react';
import { PartsScene } from './PartsScene';
import { Canvas } from '@react-three/fiber';

describe('PartsScene Integration', () => {
  const mockParts: PartCanvasItem[] = [
    { id: '1', iso_code: 'SF-C12-D-001', status: 'validated', low_poly_url: 'test1.glb', tipologia: 'capitel' },
    { id: '2', iso_code: 'SF-C12-D-002', status: 'in_fabrication', low_poly_url: 'test2.glb', tipologia: 'columna' }
  ];
  
  it('renders all parts with valid low_poly_url', async () => {
    const { container } = render(
      <Canvas>
        <PartsScene parts={mockParts} />
      </Canvas>
    );
    
    await waitFor(() => {
      expect(container.querySelectorAll('[name^="part-"]')).toHaveLength(2);
    });
  });
  
  it('skips parts without low_poly_url', () => {
    const partsWithMissing = [
      ...mockParts,
      { id: '3', iso_code: 'SF-C12-D-003', status: 'uploaded', low_poly_url: null, tipologia: 'dovela' }
    ];
    
    const { container } = render(
      <Canvas>
        <PartsScene parts={partsWithMissing} />
      </Canvas>
    );
    
    // Should only render 2 meshes (skipping the one without URL)
    expect(container.querySelectorAll('[name^="part-"]')).toHaveLength(2);
  });
});
```

## Performance Optimization

### 1. GLB Caching
```typescript
// useGLTF automáticamente cachea assets por URL
// Para preload de assets críticos:
useGLTF.preload('/models/common-capitel.glb');
```

### 2. Memoization
```typescript
// Positions memoizadas en usePartsSpatialLayout
// Evita recalcular en cada render si parts no cambian
```

### 3. Frustum Culling
Three.js automáticamente descarta geometrías fuera del viewport (frustum culling). No renderizar manualmente.

### 4. Instance Optimization (Futuro)
Si hay muchas piezas idénticas (ej: 50 capiteles iguales), considerar `<Instances>` de drei.

## DoD Checklist
- [ ] Componente `PartsScene` renderiza N piezas desde array `parts`
- [ ] Hook `usePartsSpatialLayout` calcula posiciones correctamente (grid 10x10 o BIM coords)
- [ ] Componente `PartMesh` carga GLB con `useGLTF` sin errores
- [ ] Colores por status correctos según `STATUS_COLORS`
- [ ] Click en mesh ejecuta `selectPart(id)` y abre modal (verificar con DevTools)
- [ ] Tooltip aparece en hover con `iso_code`, `tipologia`, `workshop_name`
- [ ] Performance: >30 FPS con 50 piezas renderizadas (Chrome DevTools Performance tab)
- [ ] Unit tests: 5 tests passing (render, position, color, hover, click)
- [ ] Integration tests: 2 tests passing (render all, skip invalid)
- [ ] No errores Three.js en consola (geometry disposal, texture leaks)

## Riesgos & Mitigaciones

### Riesgo 1: Memory leaks con geometrías no disposed
**Mitigación:** `useGLTF` de drei maneja disposal automáticamente. Verificar con Chrome Memory Profiler que no crezca indefinidamente.

### Riesgo 2: Layout grid sobrepone piezas si hay >100
**Mitigación:** Ajustar `GRID_SPACING` dinámicamente basado en `parts.length` (ej: si >100, usar spacing 7 en vez de 5).

### Riesgo 3: Tooltips Html degradan performance
**Mitigación:** Solo renderizar tooltip si `hovered || isSelected` (conditional rendering).

## Estimación
**Tiempo:** 6 horas  
**Complejidad:** Alta (React Three Fiber + state management + performance tuning)  
**Bloqueadores:** T-0500-INFRA (setup Three.js)

## Referencias
- drei useGLTF: https://github.com/pmndrs/drei#usegltf
- Three.js Performance Tips: https://discoverthreejs.com/tips-and-tricks/
- React Three Fiber Best Practices: https://docs.pmnd.rs/react-three-fiber/tutorials/performance-pitfalls
