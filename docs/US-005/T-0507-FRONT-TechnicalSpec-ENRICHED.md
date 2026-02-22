# Technical Specification: T-0507-FRONT

**Ticket ID:** T-0507-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 5 Story Points (~10 horas)  
**Responsable:** Frontend Developer  
**Prioridad:** P3  
**Status:** ENRICHED (Ready for TDD-RED)  
**Fecha Spec:** 2026-02-22

---

## 1. Ticket Summary

- **Tipo:** FRONT (React Component Extension)
- **Alcance:** Implementar sistema de 3 niveles LOD (Level of Detail) para optimizar rendering de geometrías según distancia de cámara
- **Dependencias:** 
  - ✅ T-0505-FRONT (PartsScene.tsx, PartMesh.tsx existentes)
  - ✅ T-0506-FRONT (parts.store con filters)
  - ✅ @react-three/drei@^9.92 (Lod component disponible)
  - ✅ POC validado (60 FPS, 41 MB memory con 1197 meshes)

---

## 2. Data Structures & Contracts

### Frontend Types (TypeScript)

```typescript
// src/frontend/src/types/parts.ts (EXTEND existing file)

/**
 * LOD configuration for distance-based rendering
 * Based on POC performance targets (docs/US-005/PERFORMANCE-ANALYSIS-3D-FORMATS.md)
 */
export interface LodConfig {
  /** Level 0: Mid-poly geometry (<20 units) - 1000 triangles */
  midPolyUrl?: string;
  
  /** Level 1: Low-poly geometry (20-50 units) - 500 triangles (already in PartCanvasItem) */
  lowPolyUrl?: string;
  
  /** Level 2: BBox proxy (>50 units) - 12 triangles (8 vertices box) */
  bbox?: BoundingBox;
}

/**
 * Extended PartCanvasItem with LOD support
 * NOTE: This extends existing interface, does NOT replace it
 */
export interface PartCanvasItem {
  // ... existing fields (id, iso_code, status, tipologia, etc.)
  
  // NEW: Mid-poly URL for close-up detail (optional until T-0502-AGENT generates it)
  mid_poly_url?: string;
  
  // EXISTING: low_poly_url (already present from T-0501-BACK)
  // EXISTING: bbox (already present from T-0501-BACK)
}

/**
 * LOD level distances (in world units)
 * Based on POC optimal values for 150 parts scene
 */
export const LOD_DISTANCES = [0, 20, 50] as const;
export const LOD_LEVELS = {
  MID_POLY: 0,   // <20 units: Mid-poly (1000 tris)
  LOW_POLY: 1,   // 20-50 units: Low-poly (500 tris)
  BBOX_PROXY: 2, // >50 units: BBox wireframe (12 tris)
} as const;
```

```typescript
// src/frontend/src/components/Dashboard/PartsScene.types.ts (EXTEND)

import type { PartCanvasItem } from '@/types/parts';

export interface PartMeshProps {
  part: PartCanvasItem;
  position: [number, number, number];
  
  // NEW: LOD configuration flag
  enableLod?: boolean; // Default: true (can disable for tests)
}

export interface BBoxProxyProps {
  bbox: BoundingBox;
  color: string;
  opacity?: number; // Default: 0.3
}
```

### Backend Schema (NO CHANGES)

**CRITICAL**: Backend schema (`src/backend/schemas.py`) **does NOT change**. The `PartCanvasItem` Pydantic model already includes:
- ✅ `low_poly_url: Optional[HttpUrl]` (T-0501-BACK)
- ✅ `bbox: Optional[BoundingBox]` (T-0503-DB)
- ⚠️ `mid_poly_url: Optional[HttpUrl]` (requires new field in T-0502-AGENT + migration)

**DECISION**: T-0507 will work with **low_poly_url + bbox only** for LOD levels 1-2. Level 0 (mid-poly) will **degrade gracefully** to low_poly if `mid_poly_url` is null. This allows frontend implementation without blocking on agent/backend changes.

### Database Changes

**NO MIGRATION REQUIRED** for MVP. Existing schema supports LOD:
- ✅ `blocks.low_poly_url` (TEXT NULL) - Level 1
- ✅ `blocks.bbox` (JSONB NULL) - Level 2

**FUTURE** (post-MVP, T-0502-AGENT extension):
```sql
-- supabase/migrations/20260223000000_add_mid_poly_url.sql
ALTER TABLE blocks ADD COLUMN mid_poly_url TEXT NULL;
COMMENT ON COLUMN blocks.mid_poly_url IS 'Supabase Storage URL to mid-poly GLB (~1000 triangles) for LOD level 0';

-- Index for processing queue (agent worker)
CREATE INDEX idx_blocks_mid_poly_processing 
  ON blocks(status) 
  WHERE mid_poly_url IS NULL 
    AND low_poly_url IS NOT NULL 
    AND is_archived = false;
```

---

## 3. API Interface

**NO NEW ENDPOINTS**. Existing `GET /api/parts` (T-0501-BACK) returns:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "iso_code": "SF-C12-D-001",
      "status": "validated",
      "tipologia": "capitel",
      "low_poly_url": "https://ebqapsoyjmdkhdxnkikz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400-e29b-41d4-a716-446655440000.glb",
      "mid_poly_url": null,
      "bbox": {
        "min": [-1.5, -1.2, 0.0],
        "max": [1.5, 1.2, 3.4]
      }
    }
  ]
}
```

**DEGRADATION STRATEGY**: If `mid_poly_url` is null → LOD Level 0 uses `low_poly_url` (graceful fallback).

---

## 4. Component Contract

### A. Modified Component: `PartMesh.tsx`

**File:** `src/frontend/src/components/Dashboard/PartMesh.tsx`

**Changes:**
1. Wrap primitive with `<Lod distances={LOD_DISTANCES}>`
2. Render 3 LOD levels:
   - **Level 0** (<20 units): Mid-poly GLB (or low-poly if null)
   - **Level 1** (20-50): Low-poly GLB
   - **Level 2** (>50): BBoxProxy component
3. Preload both mid/low-poly URLs with `useGLTF.preload()`

**Props (Extended):**
```typescript
interface PartMeshProps {
  part: PartCanvasItem;
  position: [number, number, number];
  enableLod?: boolean; // NEW: Default true, disable for legacy tests
}
```

**Behaviors:**
- If `enableLod=false` → render current single-level geometry (backward compatibility)
- If `part.bbox` is null → skip Level 2, show Level 1 always
- If `part.mid_poly_url` is null → Level 0 uses `low_poly_url`
- Camera distance calculation uses Three.js camera.position.distanceTo(mesh.position)
- Smooth transitions via drei `<Lod>` automatic blending

### B. New Component: `BBoxProxy.tsx`

**File:** `src/frontend/src/components/Dashboard/BBoxProxy.tsx`

**Purpose:** Wireframe box geometry for LOD Level 2 (>50 units away)

**Props:**
```typescript
interface BBoxProxyProps {
  bbox: BoundingBox;        // From backend { min: [x,y,z], max: [x,y,z] }
  color: string;            // Status color (STATUS_COLORS[part.status])
  opacity?: number;         // Default: 0.3
  wireframe?: boolean;      // Default: true
}
```

**Rendering:**
```tsx
// Pseudocode (DO NOT IMPLEMENT YET)
<mesh>
  <boxGeometry args={[width, height, depth]} />
  <meshBasicMaterial 
    color={color} 
    opacity={opacity} 
    transparent 
    wireframe={wireframe}
  />
</mesh>
```

**Performance:** 12 triangles per bbox (vs 500-1000 for GLB) = 96% triangle reduction at distance.

### C. Modified Component: `PartsScene.tsx`

**File:** `src/frontend/src/components/Dashboard/PartsScene.tsx`

**Changes:**
1. Add `useGLTF.preload()` calls for all geometry URLs on mount
2. Pass `enableLod={true}` to PartMesh (opt-in for new behavior)

**Preload Strategy:**
```typescript
// Pseudocode
useEffect(() => {
  partsWithGeometry.forEach(part => {
    if (part.low_poly_url) useGLTF.preload(part.low_poly_url);
    if (part.mid_poly_url) useGLTF.preload(part.mid_poly_url);
  });
}, [partsWithGeometry]);
```

**Why preload?** Avoids "pop-in" when camera moves between LOD levels (geometry already in GPU memory).

---

## 5. Test Cases Checklist

### Happy Path

- [ ] **HP-1: LOD Level 0 (Mid-Poly) Renders Close-Up**
  - **Given:** Camera distance to part <20 units, part has mid_poly_url
  - **When:** Render PartMesh with enableLod=true
  - **Then:** drei `<Lod>` shows level 0 (mid-poly geometry visible)
  - **Validation:** useGLTF called with part.mid_poly_url

- [ ] **HP-2: LOD Level 1 (Low-Poly) Renders Medium Distance**
  - **Given:** Camera distance 20-50 units, part has low_poly_url
  - **When:** Camera moves away from part
  - **Then:** drei `<Lod>` smoothly transitions to level 1 (low-poly visible)
  - **Validation:** useGLTF called with part.low_poly_url

- [ ] **HP-3: LOD Level 2 (BBox Proxy) Renders Far Distance**
  - **Given:** Camera distance >50 units, part has bbox
  - **When:** Camera moves far from part
  - **Then:** drei `<Lod>` shows level 2 (BBoxProxy component renders wireframe)
  - **Validation:** boxGeometry visible with 12 triangles

- [ ] **HP-4: Preload All Geometry URLs**
  - **Given:** PartsScene receives 10 parts with low_poly_url and mid_poly_url
  - **When:** Component mounts
  - **Then:** useGLTF.preload called 20 times (10 low + 10 mid)
  - **Validation:** No network delay when camera moves between LOD levels

### Edge Cases

- [ ] **EC-1: Graceful Fallback When mid_poly_url is Null**
  - **Given:** part.mid_poly_url = null, part.low_poly_url exists
  - **When:** Camera distance <20 units (Level 0 zone)
  - **Then:** LOD Level 0 renders low_poly_url (fallback without error)
  - **Validation:** Console has NO errors, useGLTF called with low_poly_url

- [ ] **EC-2: Skip BBox Level When bbox is Null**
  - **Given:** part.bbox = null, part.low_poly_url exists
  - **When:** Camera distance >50 units
  - **Then:** LOD stays at Level 1 (low-poly, skip bbox wireframe)
  - **Validation:** No BBoxProxy rendered, no null reference errors

- [ ] **EC-3: Backward Compatibility (enableLod=false)**
  - **Given:** PartMesh receives enableLod=false prop
  - **When:** Any camera distance
  - **Then:** Renders single-level geometry (T-0505 behavior, no `<Lod>` wrapper)
  - **Validation:** Zero regression on existing 16/16 PartMesh tests

- [ ] **EC-4: Empty Scene (No Parts with Geometry)**
  - **Given:** parts = [] or all parts have low_poly_url = null
  - **When:** PartsScene renders
  - **Then:** Empty group, preload skipped, no errors
  - **Validation:** Console clean, no useGLTF calls

### Performance Tests

- [ ] **PERF-1: FPS Target Met (>30 FPS with 150 Parts)**
  - **Given:** Dashboard loaded with 150 parts, LOD enabled
  - **When:** Measure FPS during 10s continuous camera orbit
  - **Then:** DevTools Performance shows FPS >30 avg, no frame drops <16ms
  - **Validation:** Manual test with Chrome Performance Profiler

- [ ] **PERF-2: Memory Target Met (<500 MB Heap)**
  - **Given:** 150 parts rendered with LOD
  - **When:** Take Memory Heap Snapshot after 2min idle
  - **Then:** DevTools Memory shows Heap Size <500 MB
  - **Validation:** Manual test with Chrome Memory Profiler

- [ ] **PERF-3: Triangle Count Reduction at Distance**
  - **Given:** Camera >50 units from all parts
  - **When:** Check renderer stats
  - **Then:** Total triangles ≈ 150 parts × 12 tris/bbox = 1,800 triangles (vs 150,000 without LOD)
  - **Validation:** drei `<Stats>` panel shows triangle count

- [ ] **PERF-4: Smooth LOD Transitions (No Pop-In)**
  - **Given:** Camera moving continuously from distance 5 → 60 units
  - **When:** Observe part geometry during movement
  - **Then:** Transitions Level 0→1→2 are gradual (no visible "pop")
  - **Validation:** Manual visual inspection + screen recording

### Integration Tests

- [ ] **INT-1: LOD Works with Filters (T-0506 Integration)**
  - **Given:** Filters applied (status='validated'), LOD enabled
  - **When:** Non-matching parts have opacity=0.2
  - **Then:** LOD system works on faded parts (all 3 levels render correctly)
  - **Validation:** No z-fighting, opacity applied to all LOD levels

- [ ] **INT-2: LOD Works with Selection (T-0508 Integration)**
  - **Given:** Part selected (emissive glow), camera distance changes
  - **When:** LOD level switches
  - **Then:** Emissive material persists across LOD levels (glow visible always)
  - **Validation:** Selected part glows at all distances

- [ ] **INT-3: useGLTF Caching Works Correctly**
  - **Given:** Same part rendered twice (grid layout symmetry)
  - **When:** PartsScene mounts
  - **Then:** useGLTF returns cached geometry (no duplicate fetch)
  - **Validation:** Network tab shows 1 request per unique URL, not 2

---

## 6. Files to Create/Modify

### Create

- `src/frontend/src/components/Dashboard/BBoxProxy.tsx` (50 lines)
  - Wireframe box geometry for LOD Level 2
  - Props: bbox, color, opacity, wireframe
  - Pure presentational component
  
- `src/frontend/src/components/Dashboard/BBoxProxy.test.tsx` (60 lines)
  - Test: renders boxGeometry with correct dimensions
  - Test: applies color and opacity props
  - Test: wireframe=true by default
  - Test: handles null bbox gracefully

- `src/frontend/src/constants/lod.constants.ts` (20 lines)
  - Export LOD_DISTANCES = [0, 20, 50]
  - Export LOD_LEVELS = { MID_POLY: 0, LOW_POLY: 1, BBOX_PROXY: 2 }
  - Export LOD_CONFIG with performance targets

### Modify

- `src/frontend/src/components/Dashboard/PartMesh.tsx` (~220 lines, +70 lines)
  - **Add:** Import `Lod` from `@react-three/drei`
  - **Add:** `enableLod` prop (default true)
  - **Add:** `<Lod distances={LOD_DISTANCES}>` wrapper with 3 children
  - **Add:** Level 0: mid_poly_url OR low_poly_url fallback
  - **Add:** Level 1: low_poly_url
  - **Add:** Level 2: `<BBoxProxy bbox={part.bbox} color={color} />`
  - **Add:** Conditional rendering (if enableLod=false, render old single-level)
  - **Keep:** Existing hover, click, selection, filter logic (zero breaking changes)

- `src/frontend/src/components/Dashboard/PartMesh.test.tsx` (~230 lines, +80 lines)
  - **Add:** Test suite "LOD System" (8 new tests)
  - **Add:** Mock camera position for distance calculations
  - **Add:** HP-1, HP-2, HP-3, EC-1, EC-2, EC-3 tests
  - **Keep:** Existing 16 tests unchanged (backward compatibility with enableLod=false)

- `src/frontend/src/components/Dashboard/PartsScene.tsx` (~70 lines, +15 lines)
  - **Add:** useEffect with useGLTF.preload for all URLs
  - **Add:** Pass `enableLod={true}` to PartMesh
  - **Keep:** Existing spatial layout, filtering, performance logging

- `src/frontend/src/components/Dashboard/PartsScene.test.tsx` (~80 lines, +20 lines)
  - **Add:** Test: preload called for all geometry URLs
  - **Add:** Test: enableLod prop passed to PartMesh
  - **Keep:** Existing 5 tests unchanged

- `src/frontend/src/types/parts.ts` (~100 lines, +25 lines)
  - **Add:** `mid_poly_url?: string` to PartCanvasItem interface
  - **Add:** LodConfig interface (mid_poly_url, low_poly_url, bbox)
  - **Add:** LOD_DISTANCES, LOD_LEVELS constants
  - **Keep:** Existing PartCanvasItem fields, BoundingBox interface

- `src/frontend/src/components/Dashboard/index.ts` (~5 lines, +1 line)
  - **Add:** Export BBoxProxy

---

## 7. Reusable Components/Patterns

### From Existing Codebase

1. **STATUS_COLORS** (`src/constants/dashboard3d.constants.ts`)
   - **Reuse:** BBoxProxy color prop (same status-to-color mapping)
   - **Context:** T-0505 established color standards

2. **useGLTF Hook** (`@react-three/drei`)
   - **Reuse:** LOD Level 0/1 geometry loading + caching
   - **Pattern:** `useGLTF.preload()` in PartsScene for performance

3. **calculatePartOpacity Helper** (PartMesh.tsx, T-0506)
   - **Reuse:** Apply opacity to all 3 LOD levels (filter fade-out)
   - **Integration:** Opacity logic works across LOD transitions

4. **EmptyState Pattern** (Dashboard3D.tsx, T-0504)
   - **Reuse:** If all parts have low_poly_url=null → show EmptyState
   - **Context:** Consistent UX for "no geometry" scenario

5. **drei Mocking Pattern** (`src/frontend/setup.ts`)
   - **Extend:** Mock `Lod` component in tests
   - **Pattern:** `vi.mock('@react-three/drei', () => ({ ..., Lod: ({ children }) => <group>{children}</group> }))`

### New Patterns Introduced

1. **LOD Configuration Constants** (`lod.constants.ts`)
   - **Pattern:** Centralized LOD distances for easy tuning
   - **Benefit:** Change LOD thresholds without touching component code
   - **Example:** `export const LOD_DISTANCES = [0, 20, 50]`

2. **Graceful Degradation Pattern** (PartMesh LOD fallback)
   - **Pattern:** If higher-quality asset missing → fallback to next level
   - **Example:** `mid_poly_url ?? low_poly_url` for Level 0
   - **Benefit:** Frontend works before agent/backend generates mid-poly

3. **Geometry Preloading Pattern** (PartsScene useEffect)
   - **Pattern:** Preload all geometry URLs on mount to avoid pop-in
   - **Example:** `useGLTF.preload(part.low_poly_url)` in loop
   - **Benefit:** Smooth user experience during camera navigation

---

## 8. Next Steps

### This Spec is Ready for TDD-RED Phase

Use `:tdd-red` with the following data:

---

## HANDOFF FOR TDD-RED PHASE

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0507-FRONT
Feature name:    LOD System (Level of Detail 3-level rendering)

Key test cases:
  1. HP-1: LOD Level 0 renders mid-poly at <20 units
  2. HP-2: LOD Level 1 renders low-poly at 20-50 units
  3. HP-3: LOD Level 2 renders bbox proxy at >50 units
  4. EC-1: Graceful fallback when mid_poly_url is null
  5. EC-3: Backward compatibility with enableLod=false
  6. PERF-1: FPS >30 with 150 parts
  7. INT-1: LOD works with filters (T-0506 integration)

Files to create:
  - src/frontend/src/components/Dashboard/BBoxProxy.tsx
  - src/frontend/src/components/Dashboard/BBoxProxy.test.tsx
  - src/frontend/src/constants/lod.constants.ts

Files to modify:
  - src/frontend/src/components/Dashboard/PartMesh.tsx (+70 lines)
  - src/frontend/src/components/Dashboard/PartMesh.test.tsx (+80 lines)
  - src/frontend/src/components/Dashboard/PartsScene.tsx (+15 lines)
  - src/frontend/src/components/Dashboard/PartsScene.test.tsx (+20 lines)
  - src/frontend/src/types/parts.ts (+25 lines)
  - src/frontend/src/components/Dashboard/index.ts (+1 line)

Performance targets:
  - FPS: >30 avg (150 parts scene)
  - Memory: <500 MB heap
  - Triangles: 1,800 at distance (vs 150,000 without LOD)
  - TTFR: <1s (preload strategy)

Backend dependencies:
  - NONE (works with existing GET /api/parts response)
  - Future: mid_poly_url field (T-0502-AGENT extension)

Architecture notes:
  - Graceful degradation: mid_poly_url ?? low_poly_url for Level 0
  - Backward compat: enableLod=false preserves T-0505 behavior
  - Zero breaking changes: 16/16 existing tests must pass
  - drei Lod component: automatic distance-based switching
  - Preload strategy: avoid pop-in on LOD transitions

Clean Architecture:
  - BBoxProxy: Pure presentational component (no state)
  - LOD logic: Isolated in PartMesh (single responsibility)
  - Constants extraction: LOD_DISTANCES, LOD_LEVELS in separate file
  - Type safety: enableLod?: boolean with default value
  - Error handling: null-safe bbox/mid_poly_url checks

Quality gates:
  - New tests: 28+ tests (8 HP, 4 EC, 4 PERF, 3 INT + BBoxProxy 9)
  - Regression: 0/96 existing Dashboard tests broken
  - Coverage: >85% PartMesh, >90% BBoxProxy
  - Manual: FPS/Memory DevTools validation protocol
=============================================
```

---

## 📚 APPENDIX: Technical References

### A. POC Validation (2026-02-18)

From `docs/US-005/PERFORMANCE-ANALYSIS-3D-FORMATS.md` and `poc/formats-comparison/results/benchmark-results-2026-02-18.json`:

**Proven Performance:**
- ✅ 60 FPS constant with 1197 meshes (39,360 triangles)
- ✅ 41 MB heap memory (vs 500 MB target)
- ✅ 778 KB glTF payload (0.74 MB, <1s download)
- ✅ TTFR 1002 ms (parse time acceptable)

**Extrapolation to T-0507:**
- 150 parts × 12 tris/bbox at distance = **1,800 triangles** (96% reduction)
- Expected FPS: **>50 FPS** (current 60 FPS with 22x more triangles)
- Expected memory: **<100 MB** (geometry culling via LOD)

### B. drei Lod Component API

```tsx
import { Lod } from '@react-three/drei';

<Lod distances={[0, 20, 50]}>
  {/* Level 0: <20 units */}
  <mesh geometry={midPolyGeometry} />
  
  {/* Level 1: 20-50 units */}
  <mesh geometry={lowPolyGeometry} />
  
  {/* Level 2: >50 units */}
  <BBoxProxy bbox={part.bbox} />
</Lod>
```

**How it works:**
- drei automatically calculates camera distance to mesh center
- Renders only 1 child at a time based on distance brackets
- Smooth transitions via Three.js LODLoader (Continuous LOD)
- No manual distance calculation needed in component code

### C. Geometry Triangle Counts (from T-0502-AGENT spec)

| LOD Level | Triangles | Source | Usage |
|-----------|-----------|--------|-------|
| Level 0: Mid-Poly | ~1000 | Agent decimation 50% | Close-up detail (<20 units) |
| Level 1: Low-Poly | ~500 | Agent decimation 90% | Medium distance (20-50 units) |
| Level 2: BBox | 12 | Computed from bbox | Far distance (>50 units) |

**Rationale:** 
- At 150 parts, LOD reduces total triangles from **150,000** (all mid-poly) → **1,800** (all bbox) = **98.8% reduction** when zoomed out
- Maintains visual fidelity at close range (1000 tris sufficient for 1m² architectural pieces)

### D. Color Consistency (STATUS_COLORS)

```typescript
// src/constants/dashboard3d.constants.ts
export const STATUS_COLORS = {
  uploaded: '#94A3B8',
  validated: '#3B82F6',
  in_fabrication: '#F59E0B',
  completed: '#10B981',
  archived: '#6B7280'
};
```

**Apply to all LOD levels:**
- Level 0/1: meshStandardMaterial.color
- Level 2: meshBasicMaterial.color (wireframe box)
- Ensures visual continuity during LOD transitions

### E. Backward Compatibility Strategy

**Problem:** Existing 16/16 PartMesh tests assume single-level geometry

**Solution:** `enableLod` prop with default `true`

```typescript
// Legacy tests (T-0505) - still pass
test('renders geometry with status color', () => {
  render(<PartMesh part={mockPart} position={[0,0,0]} enableLod={false} />);
  // Skips <Lod> wrapper, renders old single-level behavior
});

// New LOD tests (T-0507)
test('switches to bbox at >50 units', () => {
  render(<PartMesh part={mockPart} position={[0,0,0]} enableLod={true} />);
  // Uses <Lod> with 3 levels
});
```

**Guarantee:** Zero regressions on T-0505/T-0506 test suites.

---

## 🏁 CHECKLIST: Spec Completeness

- [x] **Context analyzed:** Read backlog, systemPatterns, techContext, productContext
- [x] **Ticket type identified:** FRONT (React component extension)
- [x] **Dependencies verified:** T-0505/T-0506 complete, @react-three/drei available
- [x] **Contracts defined:** TypeScript interfaces (PartCanvasItem extended, LodConfig, BBoxProxyProps)
- [x] **Backend alignment:** NO changes needed (works with existing schemas)
- [x] **Database changes:** NONE required for MVP
- [x] **API changes:** NONE (uses existing GET /api/parts)
- [x] **Component contract:** PartMesh props extended, BBoxProxy new component
- [x] **Test cases:** 28+ tests (8 HP, 4 EC, 4 PERF, 3 INT, 9 BBoxProxy)
- [x] **Files inventory:** 3 create, 6 modify
- [x] **Reusable patterns:** 5 existing, 3 new patterns documented
- [x] **Performance targets:** >30 FPS, <500 MB, <1s TTFR documented
- [x] **Backward compatibility:** enableLod=false flag, zero regressions guaranteed
- [x] **Graceful degradation:** mid_poly_url ?? low_poly_url fallback
- [x] **POC validation:** 60 FPS, 41 MB from benchmark-results-2026-02-18.json
- [x] **TDD handoff:** Ready for `:tdd-red` prompt with key test cases

---

**Status:** ✅ SPEC COMPLETE - Ready for TDD-RED Phase  
**Next Command:** `:tdd-red` (copy handoff data from Section 8)  
**Estimated Time:** 10 hours (5 SP) - 4h implementation, 4h tests, 2h integration/manual testing
