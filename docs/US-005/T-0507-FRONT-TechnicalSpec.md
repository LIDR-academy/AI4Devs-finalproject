# T-0507-FRONT: LOD System Implementation

**Ticket ID:** T-0507-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 5 Story Points (~10 horas)  
**Responsable:** Frontend 3D Specialist  
**Prioridad:** P2 (Optimization)

---

## 📋 CONTEXT

### Problem Statement
Con 150+ piezas simultáneas, el Canvas puede caer <30 FPS:
- Rendering 150 meshes × 1000 triangles = 150K triangles
- Sin LOD, GPU overdraw alto en zoom out
- Need Level of Detail system para optimizar

### POC Validation
✅ 60 FPS con 1197 meshes (single file 39K triangles)  
⚠️ Multiple GLB loads need LOD for performance  
🎯 Target: >30 FPS con 150 piezas

### Current State
```tsx
// T-0505 renders all parts at full detail
{parts.map(part => (
  <PartMesh key={part.id} part={part} />
))}
```

### Target State
```tsx
// LOD system with 3 levels
<Lod distances={[0, 20, 50]}>
  <MidPolyMesh />  {/* <20 units */}
  <LowPolyMesh />  {/* 20-50 units */}
  <BboxProxy />    {/* >50 units */}
</Lod>
```

---

## 🎯 REQUIREMENTS

### FR-1: 3-Level LOD System
```tsx
// Types
type LODLevel = 'high' | 'mid' | 'low' | 'bbox';

interface LODConfig {
  distances: [number, number, number];  // [0, 20, 50]
  geometries: {
    mid_poly_url?: string;   // 1000 triangles
    low_poly_url: string;    // 500 triangles (from T-0502-AGENT)
    bbox?: BoundingBox;      // Proxy geometry
  };
}
```

**LOD Levels:**
- **Level 0 (Mid-Poly):** <20 units, 1000 triangles, full detail
- **Level 1 (Low-Poly):** 20-50 units, 500 triangles, simplified
- **Level 2 (Bbox Proxy):** >50 units, 12 triangles (cube), extreme zoom out

**Distance Calculation:**
```tsx
// Camera distance to part center
const distance = camera.position.distanceTo(partPosition);

if (distance < 20) return 'mid';
if (distance < 50) return 'low';
return 'bbox';
```

### FR-2: Lod Component Integration
```tsx
// src/components/Dashboard3D/PartMesh.tsx
import { Lod } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

interface PartMeshProps {
  part: PartCanvasItem;
}

export default function PartMesh({ part }: PartMeshProps) {
  // Load geometries (cached by useGLTF)
  const lowPoly = useGLTF(part.low_poly_url);
  const midPoly = part.mid_poly_url ? useGLTF(part.mid_poly_url) : null;
  
  // Create bbox proxy geometry
  const bboxGeometry = useMemo(() => {
    if (!part.bbox) return null;
    const { min, max } = part.bbox;
    const size = [
      max[0] - min[0],
      max[1] - min[1],
      max[2] - min[2],
    ];
    return { size, center: [(min[0]+max[0])/2, (min[1]+max[1])/2, (min[2]+max[2])/2] };
  }, [part.bbox]);
  
  return (
    <Lod distances={[0, 20, 50]}>
      {/* Level 0: Mid-poly (optional, use low-poly if missing) */}
      {midPoly ? (
        <primitive object={midPoly.scene.clone()} />
      ) : (
        <primitive object={lowPoly.scene.clone()} />
      )}
      
      {/* Level 1: Low-poly (always available) */}
      <primitive object={lowPoly.scene.clone()} />
      
      {/* Level 2: Bbox proxy */}
      {bboxGeometry ? (
        <mesh position={bboxGeometry.center}>
          <boxGeometry args={bboxGeometry.size} />
          <meshStandardMaterial 
            color={STATUS_COLORS[part.status]} 
            wireframe 
            opacity={0.3}
            transparent
          />
        </mesh>
      ) : (
        // Fallback: low-poly if no bbox
        <primitive object={lowPoly.scene.clone()} />
      )}
    </Lod>
  );
}
```

### FR-3: Geometry Caching Strategy
```tsx
// Preload all GLB files on Dashboard mount
// src/hooks/usePreloadGeometries.ts
import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

export function usePreloadGeometries(parts: PartCanvasItem[]) {
  useEffect(() => {
    const urls = parts
      .map(p => p.low_poly_url)
      .filter((url): url is string => url !== null);
    
    // Preload all geometries (useGLTF caches internally)
    urls.forEach(url => {
      useGLTF.preload(url);
    });
    
    return () => {
      // Optional: cleanup on unmount
      urls.forEach(url => {
        useGLTF.clear(url);
      });
    };
  }, [parts]);
}

// Usage in Dashboard3D.tsx
function Dashboard3D() {
  const { parts } = usePartsStore();
  usePreloadGeometries(parts);
  
  return <Canvas3D />;
}
```

**Cache Benefits:**
- First load: Download + parse GLB
- Subsequent renders: Instant retrieval from cache
- Memory: ~778 KB × 150 parts = 117 MB (acceptable)

### FR-4: Smooth LOD Transitions
**Problem:** LOD switches cause visible "pop-in" effect.

**Solution:** Use `renderOrder` and `onUpdate` callback:
```tsx
<Lod 
  distances={[0, 20, 50]}
  onUpdate={(level) => {
    // Callback when LOD level changes
    console.log(`Part ${part.id} switched to level ${level}`);
  }}
>
  {/* Levels... */}
</Lod>
```

**Visual smoothing** (future enhancement):
- Fade-in new level with opacity transition
- Hysteresis: Add 5-unit buffer before switching back (prevent flickering)

### FR-5: Performance Monitoring
```tsx
// src/hooks/useLODStats.ts
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';

export function useLODStats() {
  const [stats, setStats] = useState({
    level0: 0,  // Mid-poly count
    level1: 0,  // Low-poly count
    level2: 0,  // Bbox count
    totalDrawCalls: 0,
  });
  
  useFrame(() => {
    // Update stats every frame (can debounce to every 60 frames)
  });
  
  return stats;
}

// Display in DevTools overlay
function StatsOverlay() {
  const stats = useLODStats();
  
  return (
    <div className="stats-overlay">
      <p>LOD Distribution:</p>
      <p>Mid: {stats.level0} | Low: {stats.level1} | Bbox: {stats.level2}</p>
    </div>
  );
}
```

---

## 🔨 IMPLEMENTATION

### Step 1: Install Dependencies (10 min)
```bash
# Already installed in T-0500-INFRA
npm install @react-three/drei@^9.92.0
```

### Step 2: Create PartMesh with LOD (90 min)
1. Create `src/components/Dashboard3D/PartMesh.tsx`
2. Implement `<Lod>` with 3 levels
3. Load geometries with `useGLTF`
4. Create bbox proxy geometry from `part.bbox`
5. Apply material with status color

### Step 3: Create Preload Hook (45 min)
1. Create `src/hooks/usePreloadGeometries.ts`
2. Preload all `low_poly_url` on mount
3. Implement cleanup on unmount
4. Test with 150 parts (verify memory <500 MB)

### Step 4: Add LOD Stats Hook (60 min)
1. Create `src/hooks/useLODStats.ts`
2. Count parts per LOD level each frame
3. Create `StatsOverlay` component (dev mode only)
4. Display in corner of Canvas

### Step 5: Performance Testing (90 min)
1. Test with 150 parts (seed database)
2. Measure FPS at different zoom levels
3. Verify LOD switching at 20/50 unit distances
4. Profile memory usage (should stay <500 MB)

### Step 6: Z-up Rotation Integration (30 min)
Ensure Rhino Z-up → Three.js Y-up conversion works with LOD:
```tsx
// Apply rotation to each LOD level
const rotationFix = [-Math.PI / 2, 0, 0]; // From POC

<Lod distances={[0, 20, 50]}>
  <primitive object={midPoly.scene.clone()} rotation={rotationFix} />
  <primitive object={lowPoly.scene.clone()} rotation={rotationFix} />
  <mesh position={center} rotation={rotationFix}> {/* bbox */}
</Lod>
```

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** LOD levels switch at 20 and 50 unit distances
- [ ] **AC-2:** Mid-poly visible <20 units (or low-poly if no mid)
- [ ] **AC-3:** Low-poly visible 20-50 units
- [ ] **AC-4:** Bbox proxy visible >50 units
- [ ] **AC-5:** Transitions smooth (no stuttering)
- [ ] **AC-6:** FPS >30 with 150 parts at all zoom levels
- [ ] **AC-7:** Memory <500 MB after loading 150 parts
- [ ] **AC-8:** Preload completes in <10s for 150 parts
- [ ] **AC-9:** DevTools overlay shows LOD distribution
- [ ] **AC-10:** Z-up rotation applied to all LOD levels

### Quality Gates
```bash
# FPS Test
npm run dev
# 1. Load Dashboard with 150 parts
# 2. Open Stats (top-left FPS counter)
# 3. Zoom out slowly → Verify FPS stays >30
# 4. At max zoom → Parts should be bbox proxies

# Memory Test
# Open DevTools → Memory → Take Heap Snapshot
# Verify total memory <500 MB
```

---

## 🧪 TESTING

### Unit Test
```tsx
// PartMesh.test.tsx
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import PartMesh from './PartMesh';

// Mock useGLTF
vi.mock('@react-three/drei', () => ({
  useGLTF: (url) => ({
    scene: { clone: () => ({ type: 'Object3D' }) }
  }),
  Lod: ({ children }) => <group>{children}</group>,
}));

describe('PartMesh LOD', () => {
  const mockPart = {
    id: '1',
    low_poly_url: 'https://example.com/low.glb',
    bbox: { min: [0, 0, 0], max: [5, 5, 5] },
    status: 'validated',
  };
  
  it('renders 3 LOD levels', () => {
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    // Should have 3 children in Lod component
    const lodGroup = container.querySelector('group');
    expect(lodGroup.children).toHaveLength(3);
  });
  
  it('uses low-poly as mid-poly if mid_poly_url missing', () => {
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    // Level 0 and Level 1 should both use low_poly_url
    // (since mid_poly_url is undefined)
  });
  
  it('creates bbox proxy from bbox data', () => {
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    // Should have mesh with boxGeometry in level 2
    const boxes = container.querySelectorAll('boxgeometry');
    expect(boxes.length).toBeGreaterThan(0);
  });
});\n```

### Integration Test (Manual)
```markdown
## LOD System Test Checklist
1. Start dev server with 150 seeded parts
2. Open Dashboard → Verify initial FPS >30
3. Zoom in close to a part (<20 units) → Verify detailed geometry
4. Zoom out to 30 units → Verify geometry simplifies (should see transition)
5. Zoom out to 100 units → Verify bbox proxies (wireframe cubes)
6. DevTools overlay → Verify counts (e.g., "Mid: 5 | Low: 30 | Bbox: 115")
7. Profile with Performance tab → No long tasks >50ms
8. Memory snapshot → Verify <500 MB
```

### Performance Benchmark
```tsx
// lodPerformance.test.ts
import { renderWithContext } from '@/test-utils';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/partsStore';

test('FPS >30 with 150 parts', async () => {
  // Seed 150 parts
  const parts = Array.from({ length: 150 }, (_, i) => ({
    id: `part-${i}`,
    low_poly_url: `https://example.com/part-${i}.glb`,
    bbox: { min: [i*10, 0, 0], max: [i*10+5, 5, 5] },
    status: 'validated',
  }));
  
  usePartsStore.setState({ parts });
  
  const { container } = renderWithContext(<Dashboard3D />);
  
  // Measure FPS (need to run in real browser, not jsdom)
  // This is a manual test, automated version would use Playwright
  
  expect(container).toBeInTheDocument();
});
```

---

## 📦 DELIVERABLES

1. ✅ `src/components/Dashboard3D/PartMesh.tsx` (LOD implementation)
2. ✅ `src/hooks/usePreloadGeometries.ts` (cache optimization)
3. ✅ `src/hooks/useLODStats.ts` (performance monitoring)
4. ✅ `src/components/Dashboard3D/StatsOverlay.tsx` (dev UI)
5. ✅ Unit tests: `PartMesh.test.tsx` (3 tests)
6. ✅ Performance benchmark results (FPS/Memory report)

---

## 🔗 DEPENDENCIES

### Upstream
- `T-0504-FRONT`: Canvas3D component
- `T-0501-BACK`: API provides `low_poly_url`
- `T-0502-AGENT`: Generates low-poly GLB files

### Downstream
- `T-0508-FRONT`: Selection needs to work with LOD

### External
- `@react-three/drei@^9.92.0` (Lod component)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **FPS <30 with 150 parts** | Critical | Medium | Reduce mid-poly to 500 tris, increase LOD distance to 15/40 |
| **Memory >500 MB** | High | Low | Implement unload for off-screen parts, reduce texture sizes |
| **LOD flickering** | Medium | Medium | Add hysteresis buffer (5 units), debounce transitions |
| **Bbox proxy incorrect size** | Low | Medium | Validate bbox in backend, fallback to default size [5,5,5] |

---

## 📚 REFERENCES

- Three.js LOD: https://threejs.org/docs/#api/en/objects/LOD
- Drei Lod Component: https://github.com/pmndrs/drei#lod
- useGLTF Caching: https://github.com/pmndrs/drei#usegltf
- POC Results: 60 FPS with 1197 meshes (benchmark-results-2026-02-18.json)

---

**Status:** ✅ Ready for Implementation  
**Last Updated:** 2026-02-18  
**Performance Target:** >30 FPS with 150 parts, <500 MB memory
