# Technical Specification: T-0504-FRONT (ENRICHED)

**Ticket:** T-0504-FRONT | **Sprint:** US-005 | **Story Points:** 3  
**Fecha enrichment:** 2026-02-20 | **Estado:** Enrichment Complete ✅ → Ready for TDD-Red

---

## 1. Ticket Summary

- **Tipo:** FRONT (React Component + Layout)
- **Alcance:** Crear el componente principal `Dashboard3D.tsx` que implementa el layout base con Canvas 3D + Sidebar **dockable y draggable**. El sidebar puede arrastrarse libremente por la pantalla y anclarse (dock) a la izquierda o derecha según preferencia del usuario. Incluye soporte responsive, EmptyState para cero piezas, LoadingOverlay durante fetch, y setup completo de Three.js Canvas con OrbitControls, Grid, y Stats panel (dev-only).
- **Dependencias:** 
  - ✅ `T-0500-INFRA` (DONE) — React Three Fiber stack instalado
  - ✅ `T-0501-BACK` (DONE) — API `/api/parts` disponible para futuro fetch
  - ✅ `T-0503-DB` (DONE) — Columnas `low_poly_url`, `bbox` existen en DB

**Bloquea a:**
- `T-0505-FRONT` — PartsScene necesita Canvas3D montado
- `T-0506-FRONT` — Filters necesitan Sidebar structure
- `T-0507-FRONT` — LOD necesita Camera de Canvas3D
- `T-0508-FRONT` — Selection necesita eventos de Canvas3D

---

## 2. Data Structures & Contracts

### Frontend Types (TypeScript)

**No se modifican tipos existentes** — Este ticket consume interfaces ya definidas:

```typescript
// EXISTING: src/frontend/src/types/parts.ts (T-0501-BACK)
export interface PartCanvasItem {
  id: string;
  iso_code: string;
  status: BlockStatus;
  tipologia: string;
  low_poly_url: string | null;
  bbox: BoundingBox | null;
  workshop_id: string | null;
}

export interface PartsListResponse {
  parts: PartCanvasItem[];
  count: number;
  filters_applied: Record<string, string | null>;
}

// EXISTING: src/frontend/src/types/parts.ts
export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
}

export enum BlockStatus {
  Uploaded = "uploaded",
  Processing = "processing",
  Validated = "validated",
  Rejected = "rejected",
  InFabrication = "in_fabrication",
  Completed = "completed",
  ErrorProcessing = "error_processing",
  Archived = "archived",
}
```

**NEW: Component-specific types**

```typescript
// src/components/Dashboard/Dashboard3D.types.ts
export interface Dashboard3DProps {
  /** Initial camera position (optional override) */
  initialCameraPosition?: [number, number, number];
  
  /** Show Stats panel (default: import.meta.env.DEV) */
  showStats?: boolean;
  
  /** Custom empty state message */
  emptyMessage?: string;
  
  /** Initial sidebar dock position (default: 'right') */
  initialSidebarDock?: 'left' | 'right' | 'floating';
}

export type DockPosition = 'left' | 'right' | 'floating';

export interface DraggableSidebarProps {
  /** Current dock position */
  dockPosition: DockPosition;
  
  /** Callback when dock position changes */
  onDockChange: (position: DockPosition) => void;
  
  /** Floating position (x, y) when dockPosition === 'floating' */
  floatingPosition?: { x: number; y: number };
  
  /** Callback when floating position changes */
  onPositionChange?: (position: { x: number; y: number }) => void;
  
  /** Children content (FiltersSidebar) */
  children: React.ReactNode;
}

export interface Canvas3DProps {
  /** Show Stats panel for performance monitoring */
  showStats?: boolean;
  
  /** Camera initial configuration */
  cameraConfig?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
  };
}

export interface EmptyStateProps {
  /** Custom message (default: "No hay piezas cargadas") */
  message?: string;
  
  /** Optional action button text */
  actionLabel?: string;
  
  /** Optional action callback */
  onAction?: () => void;
}

export interface LoadingOverlayProps {
  /** Loading message (default: "Cargando piezas...") */
  message?: string;
}
```

**NEW: Zustand Store Interface**

```typescript
// src/stores/partsStore.ts (placeholder for T-0506-FRONT full implementation)
import { create } from 'zustand';
import { PartCanvasItem } from '@/types/parts';

export interface PartsStoreState {
  // Data
  parts: PartCanvasItem[];
  isLoading: boolean;
  error: string | null;
  
  // Filters (T-0506 implements actual filtering logic)
  filters: {
    status: string[];
    tipologia: string[];
    workshop_id: string | null;
  };
  
  // Selection (T-0508 implements selection behavior)
  selectedId: string | null;
  
  // Actions
  setParts: (parts: PartCanvasItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PartsStoreState['filters']>) => void;
  selectPart: (id: string | null) => void;
  
  // Computed (T-0506 implements filtering)
  getFilteredParts: () => PartCanvasItem[];
}

export const usePartsStore = create<PartsStoreState>((set, get) => ({
  parts: [],
  isLoading: false,
  error: null,
  filters: {
    status: [],
    tipologia: [],
    workshop_id: null,
  },
  selectedId: null,
  
  setParts: (parts) => set({ parts }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  selectPart: (id) => set({ selectedId: id }),
  
  // Placeholder — T-0506 implements real filtering
  getFilteredParts: () => get().parts,
}));
```

### Backend Schema (Already Exists — No Changes)

```python
# src/backend/schemas.py (T-0501-BACK contract)
class PartCanvasItem(BaseModel):
    id: UUID
    iso_code: str
    status: BlockStatus
    tipologia: str
    low_poly_url: Optional[str] = None
    bbox: Optional[BoundingBox] = None
    workshop_id: Optional[UUID] = None

class PartsListResponse(BaseModel):
    parts: List[PartCanvasItem]
    count: int
    filters_applied: Dict[str, Any]
```

**Contract Alignment:**  
✅ TypeScript `PartCanvasItem` matches Pydantic `PartCanvasItem` field-by-field  
✅ `low_poly_url: string | null` ↔ `Optional[str]`  
✅ `bbox: BoundingBox | null` ↔ `Optional[BoundingBox]`  
✅ `id: string` ↔ `UUID` (serialized as string)

---

## 3. API Interface

**Este ticket NO consume API directamente** — El fetch de datos lo hará `T-0506-FRONT` (Filters) o un hook dedicado `useParts()` en iteraciones futuras.

Para referencia (usado en T-0506):

- **Endpoint:** `GET /api/parts`
- **Auth:** Required (Supabase JWT)
- **Query Params:** `?status=validated&tipologia=capitel&workshop_id=<uuid>`
- **Response 200:**
  ```json
  {
    "parts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "iso_code": "SF-C12-D-001",
        "status": "validated",
        "tipologia": "capitel",
        "low_poly_url": "https://xyz.supabase.co/storage/.../550e8400.glb",
        "bbox": {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]},
        "workshop_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    ],
    "count": 1,
    "filters_applied": {"status": "validated", "tipologia": "capitel", "workshop_id": null}
  }
  ```

---

## 4. Component Contract

### Component Hierarchy

```
Dashboard3D (Main Layout)
├── Canvas3D (Three.js Scene Container)
│   ├── Lights (ambientLight + directionalLight)
│   ├── PartsScene (T-0505 placeholder, stub en este ticket)
│   ├── Grid (100x100, cell size 5)
│   ├── OrbitControls
│   ├── GizmoHelper + GizmoViewcube
│   └── Stats (Dev only)
│
├── DraggableFiltersSidebar (Dockable panel con drag handle)
│   ├── DragHandle (Visual grip para arrastrar)
│   ├── DockPositionToggle (Iconos: pin-left, pin-right, float)
│   ├── FiltersSidebar Content (Placeholder, populated in T-0506)
│   └── PartCounter (Shows parts.length)
│
├── EmptyState (Conditional: when parts.length === 0)
└── LoadingOverlay (Conditional: when isLoading === true)
```

### Dashboard3D (Main Container)

**File:** `src/components/Dashboard/Dashboard3D.tsx`

**Props:**
```typescript
interface Dashboard3DProps {
  initialCameraPosition?: [number, number, number];
  showStats?: boolean;
  emptyMessage?: string;
}
```

**Behaviors:**
- Renders CSS Grid layout: `grid-template-columns: 1fr 300px`
- Mounts `<Canvas3D />` in left section (80%)
- Mounts `<FiltersSidebar />` in right section (20%)
- Shows `<EmptyState />` when `usePartsStore().parts.length === 0`
- Shows `<LoadingOverlay />` when `usePartsStore().isLoading === true`
- Responsive: `@media (max-width: 768px)` collapses sidebar to fixed bottom panel
- Mobile: Adds floating toggle button to show/hide sidebar

**State Management:**
- Uses `usePartsStore()` from Zustand (read-only in this ticket)
- Uses `useState` for mobile sidebar toggle (`sidebarOpen`)
- Uses custom hook `useMediaQuery('(max-width: 768px)')` for responsive detection

### Canvas3D (Three.js Wrapper)

**File:** `src/components/Dashboard/Canvas3D.tsx`

**Props:**
```typescript
interface Canvas3DProps {
  showStats?: boolean;
  cameraConfig?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
  };
}
```

**Behaviors:**
- Wraps `<Canvas>` from `@react-three/fiber` with optimized settings
- Camera defaults: `fov: 50, position: [50, 50, 50], near: 0.1, far: 10000`
- Shadows enabled: `shadows` prop
- DPR adaptive: `dpr={[1, 2]}` (1x mobile, 2x desktop)
- Lighting: Ambient (0.4 intensity) + Directional (1.0 intensity, castShadow)
- Grid: `<Grid args={[200, 200]} cellSize={5} infiniteGrid />` (red sections every 25 units)
- Controls: `<OrbitControls enableDamping maxPolarAngle={Math.PI/2} />`
- Gizmo: Bottom-right orientation cube via `<GizmoHelper>`
- Stats: Conditional `{showStats && <Stats />}` (dev-only by default)
- Suspense boundary: `<Suspense fallback={<Loader />}>` wraps `<PartsScene />`

**Performance:**
- Memoized with `React.memo()` to prevent re-renders
- FPS target: >30 (POC achieved 60)
- Memory target: <500 MB (POC achieved 41 MB)

### EmptyState (Zero Parts UI)

**File:** `src/components/Dashboard/EmptyState.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Behaviors:**
- Displays centered overlay with icon + message
- Default message: "No hay piezas cargadas"
- Optional action button (e.g., "Subir Primera Pieza" → navigate to `/upload`)
- Uses `position: absolute; inset: 0; pointer-events: none` to overlay canvas
- Aria-live region for accessibility

### DraggableFiltersSidebar (Wrapper)

**File:** `src/components/Dashboard/DraggableFiltersSidebar.tsx`

**Props:**
```typescript
interface DraggableSidebarProps {
  dockPosition: DockPosition;
  onDockChange: (position: DockPosition) => void;
  floatingPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  children: React.ReactNode;
}
```

**Behaviors:**
- **Docked left:** `position: fixed; left: 0; top: 0; height: 100vh; width: 300px`
- **Docked right:** `position: fixed; right: 0; top: 0; height: 100vh; width: 300px`
- **Floating:** `position: fixed; left: ${x}px; top: ${y}px; width: 300px; height: auto; border-radius: 8px; box-shadow`
- Drag handle at top: 40px height with grip icon (6 horizontal dots)
- Click drag handle + mouse move → Update floatingPosition
- Double-click drag handle → Cycle dock position (left → right → floating → left)
- Dock position icons: Pin-left, Pin-right, Float (top-right corner buttons)
- Persists dock preference in localStorage: `dashboard-sidebar-dock`
- Smooth transitions: `transition: left 0.3s ease, right 0.3s ease`
- Prevents dragging outside viewport bounds (clamps x: 0 to window.innerWidth - 300, y: 0 to window.innerHeight - 100)

### FiltersSidebar (Content)

**File:** `src/components/Dashboard/FiltersSidebar.tsx`

**Props:** None (populated in T-0506-FRONT)

**Behaviors:**
- Displays placeholder sections: "Tipología", "Estado", "Workshop"
- Shows "Próximamente..." text in each section
- Footer counter: "Total: X piezas" (reads `usePartsStore().parts.length`)
- Scrollable: `overflow-y: auto` with padding

### LoadingOverlay (Fetch Indicator)

**File:** `src/components/Dashboard/LoadingOverlay.tsx`

**Props:**
```typescript
interface LoadingOverlayProps {
  message?: string;
}
```

**Behaviors:**
- Semi-transparent backdrop: `background: rgba(0, 0, 0, 0.7)`
- Centered spinner + text: "Cargando piezas..."
- Animation: CSS `@keyframes spin` on SVG circle
- Positioned absolute over canvas: `position: absolute; inset: 0; z-index: 100`

---

## 5. Test Cases Checklist

### Happy Path
- [ ] **Test 1:** Dashboard renders with Canvas + Sidebar visible
- [ ] **Test 2:** Canvas displays Grid with 100x100 cells, red sections every 25 units
- [ ] **Test 3:** OrbitControls allow rotation (dragstart/dragend events fire)
- [ ] **Test 4:** Camera positioned at [50, 50, 50] on mount
- [ ] **Test 5:** Lights render (ambientLight + directionalLight exist in scene)
- [ ] **Test 6:** GizmoViewcube visible in bottom-right corner

### Edge Cases
- [ ] **Test 7:** EmptyState shows when `parts.length === 0`
- [ ] **Test 8:** EmptyState hides when `parts.length > 0`
- [ ] **Test 9:** LoadingOverlay shows when `isLoading === true  `
- [ ] **Test 10:** LoadingOverlay hides when `isLoading === false`
- [ ] **Test 11:** Suspense Loader shows while PartsScene loads
- [ ] **Test 12:** Sidebar shows part count "Total: 0 piezas" when empty

### Responsive Behavior
- [ ] **Test 13:** Desktop (≥768px): Sidebar dockable with default position 'right'
- [ ] **Test 14:** Mobile (<768px): Sidebar collapses to bottom sheet (no drag functionality)
- [ ] **Test 15:** Mobile toggle button visible only on <768px
- [ ] **Test 16:** Click toggle button → Sidebar slides up (translateY 0)
- [ ] **Test 17:** Click toggle again → Sidebar slides down (translateY 100%)

### Draggable Sidebar Behavior (NEW)
- [ ] **Test 18:** Drag handle visible at top of sidebar (40px height, 6-dot icon)
- [ ] **Test 19:** Click + drag handle → Sidebar moves with cursor in floating mode
- [ ] **Test 20:** Release drag → Sidebar position persisted in state
- [ ] **Test 21:** Drag beyond left edge → Snaps to docked-left position
- [ ] **Test 22:** Drag beyond right edge → Snaps to docked-right position
- [ ] **Test 23:** Double-click drag handle → Cycles dock positions (left → right → floating)
- [ ] **Test 24:** Click pin-left icon → Sidebar docks to left edge
- [ ] **Test 25:** Click pin-right icon → Sidebar docks to right edge
- [ ] **Test 26:** Click float icon → Sidebar enters floating mode at last dragged position
- [ ] **Test 27:** Reload page → Sidebar dock position restored from localStorage
- [ ] **Test 28:** Drag outside viewport bounds → Position clamped to visible area

### Performance
- [ ] **Test 29:** Canvas rerenders <2 times on mount (React.memo prevents extra renders)
- [ ] **Test 30:** Resize window → Canvas adjusts size without error
- [ ] **Test 31:** DevTools Performance shows FPS >30 during 10s rotation
- [ ] **Test 32:** Drag sidebar 50 times continuously → FPS remains >30, no memory leak

### Security/Errors
- [ ] **Test 33:** Stats panel visible ONLY when `import.meta.env.DEV === true`
- [ ] **Test 34:** Stats panel NOT visible in production build
- [ ] **Test 35:** No WebGL errors in console on mount
- [ ] **Test 36:** OrbitControls maxPolarAngle prevents rotating below ground (Math.PI/2)
- [ ] **Test 37:** localStorage dock position sanitized (only 'left'|'right'|'floating' allowed)

### Integration (Manual)
- [ ] **Test 38:** Start dev server, navigate to `/dashboard`, verify grid visible
- [ ] **Test 39:** Drag sidebar handle → Sidebar follows cursor smoothly
- [ ] **Test 40:** Drag sidebar to left edge → Snaps to docked-left with animation
- [ ] **Test 41:** Double-click drag handle → Sidebar cycles through dock positions
- [ ] **Test 42:** Reload page → Sidebar position persisted from previous session
- [ ] **Test 43:** Canvas mouse rotation → Works independently of sidebar drag
- [ ] **Test 44:** Scroll wheel → Canvas zooms in/out (sidebar doesn't interfere)
- [ ] **Test 45:** Resize DevTools → Canvas adjusts, sidebar maintains dock position
- [ ] **Test 46:** Open on mobile viewport (375px) → Sidebar collapsed to bottom (drag disabled)

---

## 6. Files to Create/Modify

### Create (New Files)

**Components:**
- `src/components/Dashboard/Dashboard3D.tsx` (~150 lines, includes dock state management)
- `src/components/Dashboard/Dashboard3D.css` (~120 lines, responsive + dock animations)
- `src/components/Dashboard/Dashboard3D.types.ts` (~60 lines, includes DockPosition, DraggableSidebarProps)
- `src/components/Dashboard/Canvas3D.tsx` (~90 lines)
- `src/components/Dashboard/DraggableFiltersSidebar.tsx` (~180 lines, drag logic + dock snapping)
- `src/components/Dashboard/DraggableFiltersSidebar.css` (~100 lines, dock positions + transitions)
- `src/components/Dashboard/EmptyState.tsx` (~40 lines)
- `src/components/Dashboard/EmptyState.css` (~50 lines)
- `src/components/Dashboard/FiltersSidebar.tsx` (placeholder content, ~40 lines)
- `src/components/Dashboard/LoadingOverlay.tsx` (~30 lines)
- `src/components/Dashboard/LoadingOverlay.css` (~40 lines)
- `src/components/Dashboard/PartsScene.tsx` (stub: `export default function PartsScene() { return null; }`, ~5 lines)

**Stores:**
- `src/stores/partsStore.ts` (~60 lines, Zustand store placeholder)

**Hooks:**
- `src/hooks/useMediaQuery.ts` (~25 lines, responsive detection helper)
- `src/hooks/useDraggable.ts` (~80 lines, generic drag handler with bounds clamping)
- `src/hooks/useLocalStorage.ts` (~30 lines, persist dock position across sessions)

**Constants:**
- `src/components/Dashboard/Dashboard3D.constants.ts` (~40 lines: CAMERA_CONFIG, GRID_CONFIG, BREAKPOINTS, DOCK_POSITIONS, SIDEBAR_WIDTH, DRAG_SNAP_THRESHOLD)

**Tests:**
- `src/components/Dashboard/Dashboard3D.test.tsx` (~180 lines, 12 tests)
- `src/components/Dashboard/Canvas3D.test.tsx` (~100 lines, 8 tests)
- `src/components/Dashboard/DraggableFiltersSidebar.test.tsx` (~200 lines, 15 tests: drag, snap, double-click, localStorage)
- `src/components/Dashboard/EmptyState.test.tsx` (~60 lines, 4 tests)
- `src/components/Dashboard/LoadingOverlay.test.tsx` (~40 lines, 3 tests)
- `src/components/Dashboard/FiltersSidebar.test.tsx` (~50 lines, 4 tests)
- `src/hooks/useDraggable.test.tsx` (~120 lines, 8 tests)
- `src/hooks/useLocalStorage.test.tsx` (~80 lines, 5 tests)

### Modify (Existing Files)

- `src/components/Dashboard/index.ts` → Export `Dashboard3D` + DraggableFiltersSidebar (change from empty stub)
  ```typescript
  // BEFORE
  export {};
  
  // AFTER
  export { default as Dashboard3D } from './Dashboard3D';
  export { default as Canvas3D } from './Canvas3D';
  export { default as DraggableFiltersSidebar } from './DraggableFiltersSidebar';
  export { default as EmptyState } from './EmptyState';
  export { default as FiltersSidebar } from './FiltersSidebar';
  export { default as LoadingOverlay } from './LoadingOverlay';
  export type { DockPosition, DraggableSidebarProps } from './Dashboard3D.types';
  ```

- `src/App.tsx` → Add route for Dashboard
  ```typescript
  // Add import
  import { Dashboard3D } from '@/components/Dashboard';
  
  // Add route
  <Route path="/dashboard" element={<Dashboard3D />} />
  ```

- `src/test/setup.ts` → Already has mocks for `@react-three/fiber` + `@react-three/drei` (T-0500-INFRA), no changes needed

- `vite.config.ts` → Already configured with `@` alias and GLB support (T-0500-INFRA), no changes needed

---

## 7. Reusable Components/Patterns

### Existing Patterns to Reuse

**From US-001 (FileUploader):**
- ✅ **Constants extraction pattern:** `Component.constants.ts` with `ERROR_MESSAGES`, `DEFAULT_MAX_FILE_SIZE`
- ✅ **Service layer separation:** API calls in `src/services/upload.service.ts`, not in component
- ✅ **Props interface pattern:** Dedicated `.types.ts` file for complex components

**From US-002 (ValidationReportModal):**
- ✅ **Modal overlay pattern:** `position: fixed; inset: 0; z-index: 1000` with backdrop blur
- ✅ **Keyboard navigation:** ESC to close, ArrowLeft/Right for tabs
- ✅ **ARIA accessibility:** `role="dialog"`, `aria-modal="true"`, focus trap

**From T-0500-INFRA:**
- ✅ **Vitest mocks:** `vi.mock('@react-three/fiber')` and `vi.mock('@react-three/drei')` already in `setup.ts`
- ✅ **GLB asset support:** Vite configured with `assetsInclude: ['**/*.glb', '**/*.gltf']`
- ✅ **TypeScript declarations:** `declare module '*.glb'` in `vite-env.d.ts`

### Patterns to Apply in T-0504-FRONT

**CSS Grid Layout (Dashboard):**
- Responsive grid: `grid-template-columns: 1fr 300px` desktop, `1fr` mobile
- Use CSS `@media (max-width: 768px)` for breakpoint
- Fixed sidebar on mobile: `position: fixed; bottom: 0; transform: translateY(100%)`

**Conditional Rendering (EmptyState, LoadingOverlay):**
- Use Zustand store values: `const { parts, isLoading } = usePartsStore()`
- Show/hide with `{parts.length === 0 && <EmptyState />}`
- Avoid flicker: Use CSS transitions (`transition: opacity 0.3s ease`)

**React.memo() for Performance:**
- Memoize Canvas3D to prevent re-renders when parent state changes
- Memoize EmptyState and LoadingOverlay (pure components)

**Custom Hooks:**
- `useMediaQuery(query: string)` for responsive detection
- `useDraggable({ bounds, onDragEnd })` for sidebar drag behavior
  - Returns: `{ isDragging, position, handleMouseDown, handleMouseMove, handleMouseUp }`
  - Clamps position to viewport bounds
  - Prevents text selection during drag
- `useLocalStorage(key, defaultValue)` for dock position persistence
  - Auto-saves on change, recovers on mount
  - Validates stored value against allowed enum
- Follow pattern: `useState` + `useEffect` with cleanup in return
- Example from ValidationReportModal: Clean up event listeners in `useEffect` return

**Zustand Store Design:**
- Single store for all parts state: `usePartsStore`
- Computed selectors: `getFilteredParts()` (implemented in T-0506)
- Actions follow naming: `setX()` for setters, `selectX()` for selection

---

## 8. Next Steps

### Handoff para FASE TDD-RED

Esta especificación está **lista para iniciar TDD-Red**. Usar el snippet `:tdd-red` (o equivalente) con los siguientes datos:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0504-FRONT
Feature name:    Dashboard 3D Canvas Layout with Dockable Sidebar
Branch:          feature/T-0504-FRONT

Key test cases (Top 7):
  1. Dashboard renders with Canvas + Sidebar visible
  2. Canvas displays Grid with 100x100 cells
  3. Sidebar can be dragged by handle and follows cursor
  4. Sidebar snaps to left/right when dragged to edges
  5. Double-click drag handle cycles dock positions
  6. Dock position persisted in localStorage across reloads
  7. EmptyState shows when parts.length === 0

Files to create:
  - src/components/Dashboard/Dashboard3D.tsx
  - src/components/Dashboard/Canvas3D.tsx
  - src/components/Dashboard/DraggableFiltersSidebar.tsx (NEW: drag logic)
  - src/components/Dashboard/EmptyState.tsx
  - src/components/Dashboard/FiltersSidebar.tsx (content placeholder)
  - src/components/Dashboard/LoadingOverlay.tsx
  - src/stores/partsStore.ts (Zustand)
  - src/hooks/useMediaQuery.ts
  - src/hooks/useDraggable.ts (NEW: generic drag handler)
  - src/hooks/useLocalStorage.ts (NEW: persistence)
  - Tests: Dashboard3D.test.tsx, DraggableFiltersSidebar.test.tsx (+ 6 more)

Test command:
  docker compose run --rm frontend npx vitest run src/components/Dashboard --reporter=verbose

DoD criteria count: 10 acceptance criteria, 46 test cases (29 original + 17 draggable sidebar)
=============================================
```

### Post-TDD Green: Refactor Checklist

After all tests pass (GREEN phase), refactor:

1. **Extract constants:** Move magic numbers to `Dashboard3D.constants.ts`
   - Grid size: 200x200
   - Cell size: 5
   - Section size: 25
   - Camera defaults: fov=50, position=[50,50,50]
   - Mobile breakpoint: 768px
   - Sidebar width: 300px

2. **Extract CSS:** Move inline styles to `.css` files
   - Dashboard layout grid
   - Responsive media queries
   - Loading overlay backdrop blur

3. **Add docstrings:** JSDoc comments for all exported components
   - `@param` for props
   - `@returns` for hooks
   - `@example` for complex components

4. **Accessibility audit:**
   - Add `aria-label` to mobile toggle button
   - Add `role="status"` to LoadingOverlay
   - Verify keyboard navigation (Tab, Esc)

5. **Performance audit:**
   - Run Lighthouse on `/dashboard`
   - Verify FPS >30 in DevTools Performance
   - Check memory usage with Chrome Task Manager (<500 MB)

---

## Appendix: POC Validation Data

**POC Results (2026-02-18):** `poc/formats-comparison/results/benchmark-results-2026-02-18.json`

- **FPS:** 60 constant (target: >30) ✅
- **Memory:** 41 MB heap (target: <500 MB) ✅
- **Payload:** 778 KB GLB without Draco (expected with Draco: 300-400 KB) ✅
- **Meshes:** 1197 instances (39,360 triangles total) ✅
- **Stack Validated:** React Three Fiber 8.15 + drei 9.92 + three.js 0.160 ✅

**Key Learnings from POC:**
- Z-up rotation fix required: `scene.rotation.x = -Math.PI / 2` (Rhino models exported in Y-up)
- OrbitControls `maxPolarAngle={Math.PI/2}` prevents camera going below ground
- Grid `infiniteGrid` prop provides better spatial reference than fixed grid
- Stats panel essential for performance debugging in dev mode

**Decision:** glTF+Draco format adopted (ADR-001 in `docs/US-005/`), ThatOpen Fragments rejected for MVP complexity.

---

**Document Status:** ✅ **ENRICHMENT COMPLETE**  
**Ready for:** TDD-RED Phase (Test writing)  
**Blocks:** T-0505, T-0506, T-0507, T-0508 (all downstream frontend tickets)  
**Memory Bank Update Required:** Update `activeContext.md` with "T-0504-FRONT — Enrichment phase"

---

**Next prompt to use:** `:tdd-red` or manual TDD-RED workflow with test file creation following the 29 test cases above.
