# Technical Specification: T-0506-FRONT (ENRICHED)

## 1. Ticket Summary
- **Tipo:** FRONT (with URL integration)
- **Alcance:** Implements interactive filters sidebar with Zustand global state management + URL sync for shareable links. Includes real-time canvas update with fade-out visual feedback and results counter.
- **Dependencias:** 
  - ✅ T-0504-FRONT: Dashboard3D layout with DraggableFiltersSidebar placeholder (DONE)
  - ✅ T-0505-FRONT: PartsScene rendering parts from store (DONE)
  - ✅ T-0501-BACK: GET /api/parts endpoint (DONE)

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)
**NO CHANGES REQUIRED** - Backend already exposes all necessary fields via `GET /api/parts`:

```python
# src/backend/schemas.py (EXISTING - Reference Only)

class BlockStatus(str, Enum):
    """Enum synchronized with TypeScript BlockStatus"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    VALIDATED = "validated"
    REJECTED = "rejected"
    ERROR_PROCESSING = "error_processing"
    IN_FABRICATION = "in_fabrication"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class PartCanvasItem(BaseModel):
    """
    Already includes all necessary filter fields:
    - status: BlockStatus (for status filter)
    - tipologia: str (for tipologia filter)
    - workshop_id: Optional[UUID] (for workshop filter)
    """
    id: UUID
    iso_code: str
    status: BlockStatus
    tipologia: str
    low_poly_url: Optional[str]
    bbox: Optional[BoundingBox]
    workshop_id: Optional[UUID]
```

### Frontend Types (TypeScript)
```typescript
// src/frontend/src/stores/parts.store.ts (MODIFY EXISTING)

/**
 * Filter state structure for dashboard
 * 
 * Multi-select for status/tipologia (array), single-select for workshop (string|null)
 */
export interface PartsFilters {
  /** Selected statuses (multi-select) - e.g., ['validated', 'uploaded'] */
  status: string[];
  
  /** Selected tipologías (multi-select) - e.g., ['capitel', 'columna'] */
  tipologia: string[];
  
  /** Selected workshop UUID (single-select) - null = "Todos los talleres" */
  workshop_id: string | null;
}

/**
 * Extended PartsState with filtering capabilities
 */
interface PartsState {
  // Existing state (from T-0505)
  parts: PartCanvasItem[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // NEW: Filter state
  filters: PartsFilters;
  
  // Existing actions (from T-0505)
  fetchParts: () => Promise<void>;
  selectPart: (id: string) => void;
  clearSelection: () => void;
  
  // NEW: Filter actions
  setFilters: (filters: Partial<PartsFilters>) => void;
  clearFilters: () => void;
  
  // NEW: Computed property (derived state)
  /** Returns filtered parts based on current filters (client-side filtering) */
  getFilteredParts: () => PartCanvasItem[];
}
```

```typescript
// src/frontend/src/constants/parts.constants.ts (NEW FILE)

/**
 * T-0506-FRONT: Centralized constants for parts filtering
 */

/**
 * Tipología options for filter UI
 * Source: Product brief (docs/productContext.md)
 */
export const TIPOLOGIA_OPTIONS = [
  { value: 'capitel', label: 'Capitel' },
  { value: 'columna', label: 'Columna' },
  { value: 'dovela', label: 'Dovela' },
  { value: 'clave', label: 'Clave' },
  { value: 'imposta', label: 'Imposta' },
  { value: 'arco', label: 'Arco' },
  { value: 'bóveda', label: 'Bóveda' },
  { value: 'decorativo', label: 'Decorativo' },
] as const;

/**
 * BlockStatus options for filter UI
 * Includes color coding for visual feedback
 */
export const STATUS_OPTIONS = [
  { value: 'uploaded', label: 'Cargado', color: '#9ca3af' },       // gray-400
  { value: 'processing', label: 'Procesando', color: '#f59e0b' },  // amber-500
  { value: 'validated', label: 'Validado', color: '#10b981' },     // green-500
  { value: 'rejected', label: 'Rechazado', color: '#ef4444' },     // red-500
  { value: 'in_fabrication', label: 'En Fabricación', color: '#3b82f6' }, // blue-500
  { value: 'completed', label: 'Completado', color: '#8b5cf6' },   // violet-500
] as const;

/**
 * Visual feedback constants for non-matching parts
 */
export const FILTER_VISUAL_FEEDBACK = {
  /** Opacity for matching parts (fully visible) */
  MATCH_OPACITY: 1.0,
  
  /** Opacity for non-matching parts (faded out) */
  NON_MATCH_OPACITY: 0.2,
  
  /** CSS transition duration for smooth fade (milliseconds) */
  TRANSITION_DURATION: 300,
} as const;

/**
 * URL param keys for filter persistence
 */
export const FILTER_URL_PARAMS = {
  STATUS: 'status',
  TIPOLOGIA: 'tipologia',
  WORKSHOP: 'workshop_id',
  SEPARATOR: ',', // For multi-select arrays: status=validated,uploaded
} as const;
```

### Database Changes (SQL)
**N/A** - No database migrations required. All filter fields (`status`, `tipologia`, `workshop_id`) already exist in `blocks` table (T-0503-DB).

## 3. API Interface

**N/A** - This ticket is frontend-only. Uses existing `GET /api/parts` endpoint (T-0501-BACK).

**API Contract Verification:**
```json
// GET /api/parts response (EXISTING)
{
  "parts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "iso_code": "SF-C12-D-001",
      "status": "validated",          // ✅ Used for status filter
      "tipologia": "capitel",          // ✅ Used for tipologia filter
      "low_poly_url": "https://...",
      "bbox": { "min": [...], "max": [...] },
      "workshop_id": "123e4567-..."   // ✅ Used for workshop filter
    }
  ],
  "count": 150,
  "filters_applied": {}
}
```

## 4. Component Contracts

### Component 1: FiltersSidebar (NEW)

- **Component Name:** `FiltersSidebar`
- **File:** `src/frontend/src/components/Dashboard/FiltersSidebar.tsx`
- **Props:**
  ```typescript
  interface FiltersSidebarProps {
    /** Optional CSS class for styling */
    className?: string;
  }
  ```

- **Behaviors:**
  1. **Render 3 filter sections:**
     - **Tipología:** CheckboxGroup with `TIPOLOGIA_OPTIONS` (multi-select)
     - **Estado:** CheckboxGroup with `STATUS_OPTIONS` (multi-select, color-coded)
     - **Taller:** Select dropdown with workshop list (single-select)
  
  2. **Connect to Zustand store:**
     - Read `filters` from `usePartsStore()`
     - Call `setFilters()` on checkbox/select change
  
  3. **Show results counter:**
     - Display `"Mostrando {filtered.length} de {parts.length} piezas"`
     - Updates in real-time as filters change
  
  4. **"Limpiar filtros" button:**
     - Resets all filters to initial state
     - Clears URL params
  
  5. **Accessibility:**
     - `<section>` with `aria-labelledby` for each filter group
     - Checkboxes with proper `id`/`htmlFor` associations
     - Results counter with `aria-live="polite"`

### Component 2: CheckboxGroup (NEW - Reusable UI)

- **Component Name:** `CheckboxGroup`
- **File:** `src/frontend/src/components/ui/CheckboxGroup.tsx`
- **Props:**
  ```typescript
  interface CheckboxGroupOption {
    value: string;
    label: string;
    color?: string; // Optional color indicator (for status)
  }

  interface CheckboxGroupProps {
    /** Array of checkbox options */
    options: CheckboxGroupOption[];
    
    /** Currently selected values */
    value: string[];
    
    /** Callback when selection changes */
    onChange: (newValue: string[]) => void;
    
    /** Optional ARIA label */
    ariaLabel?: string;
  }
  ```

- **Behaviors:**
  - Renders checkbox inputs with labels
  - Calls `onChange([...value, clickedValue])` on check
  - Calls `onChange(value.filter(v => v !== clickedValue))` on uncheck
  - If `color` provided, shows color badge next to label

### Component 3: WorkshopSelect (NEW)

- **Component Name:** `WorkshopSelect`
- **File:** `src/frontend/src/components/Dashboard/WorkshopSelect.tsx`
- **Props:**
  ```typescript
  interface WorkshopSelectProps {
    /** Currently selected workshop UUID */
    value: string | null;
    
    /** Callback when selection changes */
    onChange: (workshopId: string | null) => void;
  }
  ```

- **Behaviors:**
  - Fetches workshop list from backend on mount (future endpoint: `GET /api/workshops`)
  - **For MVP:** Use hardcoded mock workshops: `[{ id: null, name: 'Todos los talleres' }, ...]`
  - Renders HTML `<select>` dropdown
  - `null` value represents "All workshops"

### Hook: useURLFilters (NEW)

- **Hook Name:** `useURLFilters`
- **File:** `src/frontend/src/hooks/useURLFilters.ts`
- **Signature:**
  ```typescript
  function useURLFilters(): void
  ```

- **Behaviors:**
  1. **On mount (once):**
     - Read URL search params via `window.location.search`
     - Parse `?status=validated,uploaded&tipologia=capitel&workshop_id=123`
     - Call `setFilters()` to populate Zustand store
  
  2. **On filters change (reactive):**
     - Subscribe to `usePartsStore()` filters
     - Build URLSearchParams object
     - Call `window.history.replaceState()` to update URL (no history pollution)
  
  3. **Array encoding:**
     - Multi-select: `status=validated,uploaded` (comma-separated)
     - Single-select: `workshop_id=123-abc-456`
  
  4. **Empty state:**
     - If all filters empty, URL becomes `/dashboard` (no query string)

## 5. Test Cases Checklist

### Happy Path
- [ ] **Test 1:** Click "Capitel" checkbox → Store updates with `tipologia: ['capitel']` → Canvas fades out non-capitels → Counter updates
- [ ] **Test 2:** Click multiple statuses (Validated + Uploaded) → Store updates with `status: ['validated', 'uploaded']` → Canvas shows both
- [ ] **Test 3:** Select "Taller Granollers" dropdown → Store updates with `workshop_id: '123-abc'` → Canvas shows only assigned parts
- [ ] **Test 4:** Click "Limpiar filtros" → All filters reset → All parts visible → URL becomes `/dashboard`

### Edge Cases
- [ ] **Test 5:** No parts match filters → Canvas shows all parts faded (opacity 0.2) → Counter shows "Mostrando 0 de 150"
- [ ] **Test 6:** All parts match filters → Canvas shows all fully visible → Counter shows "Mostrando 150 de 150"
- [ ] **Test 7:** Uncheck last checkbox in group → Filter array becomes empty → Acts as "show all"
- [ ] **Test 8:** Parts array empty (`parts.length === 0`) → Counter shows "Mostrando 0 de 0" → No crash

### URL Sync (Critical)
- [ ] **Test 9:** Load URL `/dashboard?status=validated` → Store initializes with `status: ['validated']` filter
- [ ] **Test 10:** Change filter → URL updates to `/dashboard?tipologia=capitel` (replaceState, no history push)
- [ ] **Test 11:** Page reload after filtering → Filters persist (read from URL params)
- [ ] **Test 12:** Browser back button → URL changes → Store re-syncs (listen to `popstate` event)

### Performance
- [ ] **Test 13:** Filter 150 parts → Fade transition completes in <300ms → FPS stays >30 (DevTools Performance panel)
- [ ] **Test 14:** Rapidly toggle filters (stress test) → No UI lag or state race conditions

### Integration
- [ ] **Test 15:** PartsScene component reads `getFilteredParts()` → Meshes apply correct opacity based on filter match
- [ ] **Test 16:** Select part → Selection state independent of filters (selected part can be faded but still highlighted)

## 6. Files to Create/Modify

### Create:
- `src/frontend/src/components/Dashboard/FiltersSidebar.tsx` (~120 lines)
- `src/frontend/src/components/Dashboard/FiltersSidebar.test.tsx` (~180 lines)
- `src/frontend/src/components/ui/CheckboxGroup.tsx` (~80 lines)
- `src/frontend/src/components/ui/CheckboxGroup.test.tsx` (~100 lines)
- `src/frontend/src/components/Dashboard/WorkshopSelect.tsx` (~60 lines, MVP mock version)
- `src/frontend/src/hooks/useURLFilters.ts` (~90 lines)
- `src/frontend/src/hooks/useURLFilters.test.tsx` (~120 lines)
- `src/frontend/src/constants/parts.constants.ts` (~70 lines)

### Modify:
- `src/frontend/src/stores/parts.store.ts` → Add `filters` state, `setFilters()`, `clearFilters()`, `getFilteredParts()` (~+80 lines)
- `src/frontend/src/stores/parts.store.test.ts` → Add filter tests (~+120 lines)
- `src/frontend/src/components/Dashboard/PartsScene.tsx` → Use `getFilteredParts()` instead of raw `parts` array (~5 lines change)
- `src/frontend/src/components/Dashboard/PartMesh.tsx` → Add opacity logic based on filter match (~15 lines)
- `src/frontend/src/components/Dashboard/Dashboard3D.tsx` → Replace `<DraggableFiltersSidebar>` children with `<FiltersSidebar />`, add `useURLFilters()` hook (~10 lines)

## 7. Reusable Components/Patterns

### From Project (Can Reuse):
- **`usePartsStore()`** (T-0505-FRONT) → Extend with filter methods
- **`DraggableFiltersSidebar`** (T-0504-FRONT) → Container for `<FiltersSidebar />` content
- **Constants extraction pattern** (systemPatterns.md) → Apply to `parts.constants.ts`
- **Service layer pattern** (parts.service.ts) → Workshop dropdown will use `listWorkshops()` (post-MVP)

### From This Ticket (For Future Reuse):
- **`CheckboxGroup`** → Reusable for any multi-select UI (e.g., material types, fabrication methods)
- **`useURLFilters` pattern** → Template for URL state sync in other views (e.g., events log filters)
- **Client-side filtering logic** → Can be extracted to `useFilteredData<T>(data, filters)` generic hook

## 8. Implementation Strategy

### Phase 1: Zustand Store Extension (TDD-RED)
1. Write tests for `setFilters()`, `clearFilters()`, `getFilteredParts()` in `parts.store.test.ts`
2. Verify tests FAIL (RED state)

### Phase 2: Store Implementation (TDD-GREEN)
1. Implement filter methods in `parts.store.ts`
2. Verify all tests PASS (GREEN state)

### Phase 3: UI Components (TDD-RED → GREEN)
1. Write tests for `CheckboxGroup` → Implement → GREEN
2. Write tests for `FiltersSidebar` → Implement → GREEN
3. Write tests for `WorkshopSelect` (mock version) → Implement → GREEN

### Phase 4: URL Sync (TDD-RED → GREEN)
1. Write tests for `useURLFilters` hook → Implement → GREEN
2. Test shareable links (manual QA)

### Phase 5: Canvas Integration (TDD-RED → GREEN)
1. Update `PartMesh.test.tsx` with opacity tests → Implement opacity logic → GREEN
2. Performance test with DevTools (manual QA)

### Phase 6: Refactor (TDD-REFACTOR)
1. Extract magic strings to `parts.constants.ts`
2. Add JSDoc to all public APIs
3. Cleanup: Remove console.logs, unused imports

## 9. Next Steps

**This spec is ready for TDD-RED phase.**

Use the next workflow step with these values:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0506-FRONT
Feature name:    Filters Sidebar with Zustand + URL Sync
Key test cases:  
  1. setFilters() updates store and triggers getFilteredParts() recalculation
  2. CheckboxGroup calls onChange with updated array on click
  3. URL params sync bidirectionally (URL → Store, Store → URL)
  4. PartMesh applies correct opacity (1.0 for match, 0.2 for non-match)
  
Files to create (TDD order):
  1. src/frontend/src/stores/parts.store.test.ts (extend existing)
  2. src/frontend/src/components/ui/CheckboxGroup.test.tsx
  3. src/frontend/src/components/Dashboard/FiltersSidebar.test.tsx
  4. src/frontend/src/hooks/useURLFilters.test.tsx
  5. src/frontend/src/components/Dashboard/PartMesh.test.tsx (extend existing)

Test files: 5 (3 new + 2 extended)
Total tests: ~28 tests (8 store + 6 CheckboxGroup + 8 FiltersSidebar + 6 useURLFilters)
=============================================
```

---

## Appendix A: Contract Validation

### Backend ↔ Frontend Field Mapping (100% Match ✅)

| Backend (Pydantic) | Frontend (TypeScript) | Filter Usage |
|--------------------|-----------------------|--------------|
| `status: BlockStatus` | `status: BlockStatus` | ✅ Multi-select checkbox filter |
| `tipologia: str` | `tipologia: string` | ✅ Multi-select checkbox filter |
| `workshop_id: Optional[UUID]` | `workshop_id: string \| null` | ✅ Single-select dropdown filter |

**Verification:** All three filter fields exist in `PartCanvasItem` schema on both sides with exact type compatibility.

---

## Appendix B: URL Encoding Examples

### Example URLs (Deep Linking)
```
# Single filter
/dashboard?status=validated

# Multiple statuses (comma-separated)
/dashboard?status=validated,uploaded

# Combined filters
/dashboard?status=validated&tipologia=capitel&workshop_id=123-abc-456

# All filters empty (clean URL)
/dashboard
```

### URLSearchParams Logic
```typescript
// Encoding (Store → URL)
const params = new URLSearchParams();
if (filters.status.length > 0) {
  params.set('status', filters.status.join(','));
}
if (filters.tipologia.length > 0) {
  params.set('tipologia', filters.tipologia.join(','));
}
if (filters.workshop_id) {
  params.set('workshop_id', filters.workshop_id);
}
window.history.replaceState({}, '', `?${params.toString()}`);

// Decoding (URL → Store)
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get('status')?.split(',').filter(Boolean) || [];
const tipologia = urlParams.get('tipologia')?.split(',').filter(Boolean) || [];
const workshop_id = urlParams.get('workshop_id') || null;
setFilters({ status, tipologia, workshop_id });
```

---

## Appendix C: Performance Considerations

### Client-Side Filtering (MVP Approach)
- **Why:** 150 parts = <200KB response size → Fast to filter in JS
- **When to switch to server-side:** If parts > 1000 (response >1MB)

### Optimization Techniques
1. **React.memo on PartMesh:** Prevents re-render if part props unchanged
2. **Debounce filter changes:** 100ms delay before triggering URL update
3. **CSS transition for fade-out:** GPU-accelerated, buttery smooth

### Benchmarks (Target)
- Filter application: <50ms (JS execution)
- Fade transition: 300ms (CSS)
- FPS during transition: >30 FPS

---

**Status:** ✅ ENRICHED - Ready for TDD-RED  
**Enrichment Date:** 2026-02-21  
**Reviewer:** AI Assistant (Claude Sonnet 4.5)  
**Approval:** Pending user confirmation before proceeding to TDD-RED phase
