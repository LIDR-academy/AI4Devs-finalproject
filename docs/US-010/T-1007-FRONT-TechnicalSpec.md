# Technical Specification: T-1007-FRONT

## 1. Ticket Summary

- **Tipo:** FRONT (Frontend Component Integration)
- **Sprint:** US-010 - Visor 3D Web (Wave 3)
- **Alcance:** Transformar el modal placeholder (T-0508-FRONT) en un modal completo con visor 3D integrado, sistema de tabs, navegación prev/next, y keyboard navigation.
- **Dependencias:**
  - ✅ **T-1004-FRONT:** PartViewerCanvas component (3D canvas base) - DONE
  - ✅ **T-1005-FRONT:** ModelLoader component (GLB loading con  fallbacks) - DONE
  - ✅ **T-1002-BACK:** GET /api/parts/{id} endpoint (Part detail API) - DONE
  - ✅ **T-1003-BACK:** GET /api/parts/{id}/navigation endpoint (Adjacent parts) - DONE
  - ✅ **T-0508-FRONT:** PartDetailModal placeholder (base modal structure) - DONE
  - ⏸️ **T-1006-FRONT:** PartViewerErrorBoundary (error boundary wrapper) - TODO (parallel track)
  - ⏸️ **T-1008-FRONT:** PartMetadataPanel component (metadata tab content) - TODO (future)
- **Reusar de proyecto existente:**
  - ModelLoader (T-1005-FRONT) - Componente de carga 3D con fallbacks
  - PartViewerCanvas (T-1004-FRONT) - Canvas base Three.js
  - PartDetailModal actual (T-0508-FRONT) - Estructura base de modal
  - Navigation API (T-1003-BACK) - Endpoints prev/next con Redis caching
  - Part Detail API (T-1002-BACK) - Endpoint de detalles de parte
  - BBoxProxy (T-0507-FRONT) - Wireframe de bounding box para fallback

---

## 2. Data Structures & Contracts

### A. Frontend Types (TypeScript)

**File:** `src/frontend/src/types/modal.ts` (MODIFY)

```typescript
/**
 * Modal Types - T-1007-FRONT Extension
 * Extends T-0508-FRONT placeholder with full 3D viewer integration
 */

import { PartDetail } from './parts';

/**
 * Tab identifiers for PartDetailModal
 */
export type TabId = 'viewer' | 'metadata' | 'validation';

/**
 * Navigation direction for prev/next buttons
 */
export type NavigationDirection = 'prev' | 'next';

/**
 * Adjacent part IDs from T-1003-BACK /api/parts/{id}/navigation
 */
export interface AdjacentPartsInfo {
  prev_id: string | null;       // Previous part UUID (null if first)
  next_id: string | null;        // Next part UUID (null if last)
  current_index: number;         // 1-based position (e.g., 5)
  total_count: number;           // Total parts in filtered set (e.g., 20)
}

/**
 * Props for PartDetailModal component
 * 
 * @remarks
 * T-1007-FRONT CHANGES from T-0508:
 * - BREAKING: Changed from `part: PartCanvasItem | null` to `partId: string`
 *   Rationale: Modal now fetches its own data via GET /api/parts/{id}
 * - Added: `initialTab` for deep linking support
 * - Added: `enableNavigation` to toggle prev/next buttons
 * - Added: `filters` to pass to navigation API (respects user's current filters)
 * 
 * @example
 * ```tsx
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   partId={selectedId}
 *   onClose={() => clearSelection()}
 *   initialTab="viewer"
 *   enableNavigation={true}
 *   filters={{ status: ['validated'], tipologia: ['capitel'] }}
 * />
 * ```
 */
export interface PartDetailModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  
  /** Part UUID to display (CHANGED from `part: PartCanvasItem | null`) */
  partId: string;
  
  /** Close modal callback (triggers clearSelection in store) */
  onClose: () => void;
  
  /** Initial tab to display (default: 'viewer') */
  initialTab?: TabId;
  
  /** Enable prev/next navigation buttons (default: true) */
  enableNavigation?: boolean;
  
  /** Current filter state to pass to navigation API (default: null) */
  filters?: {
    status?: string[];
    tipologia?: string[];
    workshop_id?: string;
  } | null;
}

/**
 * State management for tab system
 */
export interface ModalTabState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

/**
 * State management for navigation
 */
export interface ModalNavigationState {
  adjacentParts: AdjacentPartsInfo | null;
  loading: boolean;
  error: Error | null;
  navigateTo: (direction: NavigationDirection) => void;
}
```

**CRITICAL CONTRACT ALIGNMENT:**
- `partId` matches `PartDetail.id` (string UUID) from T-1002-BACK
- `AdjacentPartsInfo` matches `NavigationResponse` from T-1003-BACK exactly
- `filters` object matches `PartsQueryParams` from T-0501-BACK

---

### B. Backend Schema (No changes required)

**Existing APIs already implemented:**

1. **GET /api/parts/{id}** (T-1002-BACK)
   - Returns: `PartDetailResponse` with 12 fields
   - Used by: ModelLoader component (T-1005-FRONT)

2. **GET /api/parts/{id}/navigation** (T-1003-BACK)
   - Query params: `status[]`, `tipologia[]`, `workshop_id`
   - Returns: `NavigationResponse` with prev_id, next_id, current_index, total_count
   - Redis caching: 300s TTL, <50ms cache hit

---

## 3. Component Architecture

### A. Component Hierarchy (Target State)

```
PartDetailModal.tsx (T-1007, REFACTOR)
  ├─ Portal (ReactDOM.createPortal to document.body)
  │   └─ Backdrop (ESC + click outside to close)
  │       └─ Modal Container
  │           ├─ Header
  │           │   ├─ ISO Code + Status Badge
  │           │   ├─ Position Indicator ("Part 5 of 20")
  │           │   ├─ Prev/Next Navigation Buttons (← →)
  │           │   └─ Close Button (×)
  │           ├─ Tab Bar
  │           │   ├─ Tab Button: "3D Viewer" (default active)
  │           │   ├─ Tab Button: "Metadata"
  │           │   └─ Tab Button: "Validation"
  │           └─ Tab Content Area
  │               ├─ [Tab=viewer]:
  │               │   └─ PartViewerErrorBoundary (T-1006, optional)
  │               │       └─ Suspense (fallback: LoadingSpinner)
  │               │           └─ ModelLoader (T-1005)
  │               │               └─ PartViewerCanvas (T-1004)
  │               ├─ [Tab=metadata]:
  │               │   └─ PartMetadataPanel (T-1008, placeholder)
  │               └─ [Tab=validation]:
  │                   └─ ValidationReportView (T-032, reused)
```

### B. Key Behaviors

1. **Data Fetching on Mount:**
   ```typescript
   useEffect(() => {
     if (!isOpen || !partId) return;
     
     const fetchData = async () => {
       setLoading(true);
       try {
         const [partDetail, navigation] = await Promise.all([
           getPartDetail(partId),
           getPartNavigation(partId, filters),
         ]);
         setPartData(partDetail);
         setAdjacentParts(navigation);
       } catch (err) {
         setError(err);
       } finally {
         setLoading(false);
       }
     };
     
     fetchData();
   }, [isOpen, partId, filters]);
   ```

2. **Tab Switching:**
   ```typescript
   const [activeTab, setActiveTab] = useState<TabId>('viewer');
   ```

3. **Navigation Handler:**
```typescript
   const handleNavigate = async (direction: NavigationDirection) => {
     const targetId = direction === 'prev' ? adjacentParts.prev_id : adjacentParts.next_id;
     if (!targetId) return;
     
     // Update partId prop via parent component (Dashboard3D)
     // This triggers re-fetch of data in useEffect
     onNavigate?.(targetId);
   };
   ```

4. **Keyboard Shortcuts:**
   ```typescript
   useEffect(() => {
     if (!isOpen) return;
     
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Escape') onClose();
       if (e.key === 'ArrowLeft' && adjacentParts?.prev_id) handleNavigate('prev');
       if (e.key === 'ArrowRight' && adjacentParts?.next_id) handleNavigate('next');
     };
     
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, adjacentParts, onClose]);
   ```

---

## 4. API Integration

### A. Part Detail Fetching

**Service Layer:** `src/frontend/src/services/upload.service.ts` (existing, implemented in T-1005-FRONT)

```typescript
/**
 * Fetch part details for modal display
 * T-1002-BACK contract
 */
export async function getPartDetail(partId: string): Promise<PartDetail> {
  const response = await fetch(`${API_BASE_URL}/api/parts/${partId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Workshop-Id': getCurrentWorkshopId() || '',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) throw new Error('Part not found');
    if (response.status === 403) throw new Error('Access denied');
    throw new Error('Failed to fetch part details');
  }
  
  return response.json();
}
```

**Already implemented in T-1005-FRONT** ✅

---

### B. Navigation Data Fetching

**Service Layer:** `src/frontend/src/services/navigation.service.ts` (NEW)

```typescript
/**
 * Fetch adjacent parts for prev/next navigation
 * T-1003-BACK contract
 */
export async function getPartNavigation(
  partId: string,
  filters?: {
    status?: string[];
    tipologia?: string[];
    workshop_id?: string;
  } | null
): Promise<AdjacentPartsInfo> {
  const params = new URLSearchParams();
  
  if (filters?.status) {
    filters.status.forEach(s => params.append('status', s));
  }
  if (filters?.tipologia) {
    filters.tipologia.forEach(t => params.append('tipologia', t));
  }
  if (filters?.workshop_id) {
    params.append('workshop_id', filters.workshop_id);
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/parts/${partId}/navigation?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Workshop-Id': getCurrentWorkshopId() || '',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch navigation data');
  }
  
  return response.json();
}
```

---

## 5. State Management

### A. Local State (useState)

**Modal Component State:**
```typescript
const [partData, setPartData] = useState<PartDetail | null>(null);
const [adjacentParts, setAdjacentParts] = useState<AdjacentPartsInfo | null>(null);
const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'viewer');
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<Error | null>(null);
const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
```

**Why local state?**
- Modal data is ephemeral (cleared on close)
- No need to persist in Zustand store
- Simpler testing with local state

---

### B. Global State (Zustand partsStore)

**NO CHANGES REQUIRED**

Modal consumes `selectedId` from store but doesn't mutate it directly:
```typescript
const { selectedId, clearSelection } = usePartsStore();

<PartDetailModal
  isOpen={!!selectedId}
  partId={selectedId}
  onClose={clearSelection}
/>
```

**Navigation updates selectedId via store:**
```typescript
const handleNavigate = (targetId: string) => {
  selectPart(targetId);  // Updates Zustand store
  // Modal re-renders with new partId prop
};
```

---

## 6. Test Cases Checklist

### Happy Path (6 tests)

- [ ] **HP-MOD-01:** Modal opens with partId, displays ISO code in header
  - **Given:** `partId='uuid-123'`, `isOpen={true}`
  - **When:** Modal renders
  - **Then:** Header shows fetched `iso_code` (e.g., "SF-C12-D-001")

- [ ] **HP-MOD-02:** 3D Viewer tab loads ModelLoader component by default
  - **Given:** Modal open, `initialTab='viewer'`
  - **When:** Tab content renders
  - **Then:** ModelLoader component visible with correct `partId` prop

- [ ] **HP-MOD-03:** Switching to Metadata tab shows placeholder content
  - **Given:** Modal open, activeTab='viewer'
  - **When:** User clicks "Metadata" tab button
  - **Then:** Tab content changes to metadata placeholder (JSON dump)

- [ ] **HP-MOD-04:** Position indicator displays correct "Part X of Y"
  - **Given:** `adjacentParts={ current_index: 5, total_count: 20 }`
  - **When:** Header renders
  - **Then:** Shows "Pieza 5 de 20"

- [ ] **HP-MOD-05:** Prev button navigates to previous part
  - **Given:** `adjacentParts={ prev_id: 'uuid-prev' }`
  - **When:** User clicks "←" button
  - **Then:** `onNavigate('uuid-prev')` called, modal re-fetches data

- [ ] **HP-MOD-06:** Next button navigates to next part
  - **Given:** `adjacentParts={ next_id: 'uuid-next' }`
  - **When:** User clicks "→" button
  - **Then:** `onNavigate('uuid-next')` called, modal re-fetches data

---

### Edge Cases (8 tests)

- [ ] **EC-MOD-01:** Modal gracefully handles 404 part not found
  - **Given:** `partId='invalid-uuid'`, API returns 404
  - **When:** Modal tries to fetch data
  - **Then:** Error state displayed: "Pieza no encontrada", close modal after 3s

- [ ] **EC-MOD-02:** Prev button disabled when prev_id is null (first part)
  - **Given:** `adjacentParts={ prev_id: null }`
  - **When:** Header renders
  - **Then:** "←" button has `disabled={true}` attribute

- [ ] **EC-MOD-03:** Next button disabled when next_id is null (last part)
  - **Given:** `adjacentParts={ next_id: null }`
  - **When:** Header renders
  - **Then:** "→" button has `disabled={true}` attribute

- [ ] **EC-MOD-04:** Navigation buttons show loading state during fetch
  - **Given:** User clicks next, API takes 2s to respond
  - **When:** Navigation in progress
  - **Then:** Button shows spinner, disabled={true}

- [ ] **EC-MOD-05:** Tab content preserves state when switching tabs temporarily
  - **Given:** User scrolls down in Metadata tab
  - **When:** User switches to Viewer tab, then back to Metadata
  - **Then:** Scroll position restored (if component keeps state)

- [ ] **EC-MOD-06:** Modal handles partData with null low_poly_url (processing state)
  - **Given:** `partData.low_poly_url === null`
  - **When:** Viewer tab renders ModelLoader
  - **Then:** ProcessingFallback shows BBoxProxy + "Geometría en procesamiento"

- [ ] **EC-MOD-07:** Validation tab shows empty state when validation_report is null
  - **Given:** `partData.validation_report === null`
  - **When:** User switches to Validation tab
  - **Then:** Shows "Sin reporte de validación disponible"

- [ ] **EC-MOD-08:** Modal re-fetches data when partId changes (navigation)
  - **Given:** Modal open with `partId='uuid-1'`
  - **When:** partId prop changes to `'uuid-2'`
  - **Then:** useEffect triggers new fetch, loading state shown

---

### Security/Errors (6 tests)

- [ ] **SE-MOD-01:** ESC key closes modal and triggers onClose callback
  - **Given:** Modal open
  - **When:** User presses ESC key
  - **Then:** Modal unmounts, `onClose()` called once

- [ ] **SE-MOD-02:** Backdrop click closes modal
  - **Given:** Modal open
  - **When:** User clicks outside modal container (on backdrop)
  - **Then:** Modal unmounts, `onClose()` called once

- [ ] **SE-MOD-03:** Arrow left key navigates to prev part
  - **Given:** Modal open, `adjacentParts.prev_id` exists
  - **When:** User presses ← key
  - **Then:** `onNavigate('prev')` called

- [ ] **SE-MOD-04:** Arrow right key navigates to next part
  - **Given:** Modal open, `adjacentParts.next_id` exists
  - **When:** User presses → key
  - **Then:** `onNavigate('next')` called

- [ ] **SE-MOD-05:** Multiple rapid nav clicks debounced (only 1 request)
  - **Given:** User clicks next button 5 times in 100ms
  - **When:** Requests fire
  - **Then:** Only 1 API call made (debounced or disabled during loading)

- [ ] **SE-MOD-06:** Modal prevents body scroll when open
  - **Given:** Modal opens
  - **When:** Modal mounts
  - **Then:** `document.body.style.overflow = 'hidden'`
  - **And:** Cleanup restores original overflow value

---

### Integration (5 tests)

- [ ] **INT-MOD-01:** Modal integrates with Dashboard3D selectedId state
  - **Given:** Dashboard3D renders with `selectedId='uuid-123'`
  - **When:** PartDetailModal receives `partId={selectedId}`
  - **Then:** Modal fetches data for uuid-123 and displays it

- [ ] **INT-MOD-02:** Navigation updates Dashboard3D selectedId via store
  - **Given:** Modal open, user clicks next (uuid-next)
  - **When:** `usePartsStore.selectPart('uuid-next')` called
  - **Then:** Dashboard3D re-renders with new selectedId, modal updates

- [ ] **INT-MOD-03:** Filters from Dashboard propagate to navigation API
  - **Given:** Dashboard has filters `{ status: ['validated'], tipologia: ['capitel'] }`
  - **When:** Modal fetches navigation data
  - **Then:** API called with query params `?status=validated&tipologia=capitel`

- [ ] **INT-MOD-04:** ModelLoader onLoadSuccess callback updates modal state
  - **Given:** ModelLoader successfully loads GLB
  - **When:** `onLoadSuccess(partData)` fires
  - **Then:** Modal updates internal state (e.g., enables preloading)

- [ ] **INT-MOD-05:** Portal rendering doesn't conflict with Dashboard z-index
  - **Given:** Dashboard has filters sidebar (z-index: 100), canvas (z-index: 1)
  - **When:** Modal renders via Portal (z-index: 9999)
  - **Then:** Modal appears on top of all Dashboard elements

---

### Accessibility (4 tests)

- [ ] **A11Y-MOD-01:** Modal has role="dialog" and aria-modal="true"
  - **Given:** Modal renders
  - **When:** Screen reader parses DOM
  - **Then:** Announces "Dialog" with modal behavior

- [ ] **A11Y-MOD-02:** Tab list has role="tablist" and tabs have role="tab"
  - **Given:** Tab bar renders with 3 tabs
  - **When:** Screen reader navigates tabs
  - **Then:** Each tab announced with "Tab 1 of 3", selected state

- [ ] **A11Y-MOD-03:** Focus trapped inside modal (Tab cycles through elements)
  - **Given:** Modal open, focus on close button (last focusable)
  - **When:** User presses Tab
  - **Then:** Focus moves to first focusable element (first tab button)

- [ ] **A11Y-MOD-04:** Focus restored to trigger element on close
  - **Given:** User clicked part mesh (focus on canvas)
  - **When:** Modal closes
  - **Then:** Focus returns to original element (or Dashboard container)

---

## 7. Files to Create/Modify

### Create (5 new files)

1. **`src/frontend/src/components/Dashboard/PartDetailModal.types.ts`** (80 lines)
   - Local interfaces: `ModalHeaderProps`, `TabBarProps`, `TabContentProps`
   - Re-export types from `@/types/modal`

2. **`src/frontend/src/components/Dashboard/PartDetailModal.constants.ts`** (120 lines)
   - `MODAL_STYLES`: Inline styles object
   - `TAB_CONFIG`: Tab metadata (id, label, icon)
   - `KEYBOARD_SHORTCUTS`: Key codes mapping
   - `ERROR_MESSAGES`: User-facing error messages
   - `ARIA_LABELS`: Accessibility labels

3. **`src/frontend/src/components/Dashboard/PartDetailModal.test.tsx`** (400 lines)
   - 29 test cases covering all scenarios
   - Mock `getPartDetail()` and `getPartNavigation()` APIs
   - Mock `ModelLoader` component
   - Test keyboard navigation, tab switching, error states

4. **`src/frontend/src/services/navigation.service.ts`** (60 lines)
   - `getPartNavigation(partId, filters)`: Fetch adjacent parts
   - Error handling for 404/403/500/network errors
   - TypeScript return type: `AdjacentPartsInfo`

5. **`src/frontend/src/services/navigation.service.test.ts`** (80 lines)
   - Unit tests for `getPartNavigation()`
   - Mock fetch API responses
   - Test query param construction with filters

---

### Modify (3 existing files)

1. **`src/frontend/src/components/Dashboard/PartDetailModal.tsx`** (REFACTOR)
   - **Before:** ~190 lines, placeholder modal
   - **After:** ~350 lines, full integration
   - **Changes:**
     - Props: Change from `part: PartCanvasItem | null` to `partId: string`
     - Add: Portal rendering with `ReactDOM.createPortal()`
     - Add: Tab system (useState for activeTab)
     - Add: Navigation buttons (useEffect for keyboard shortcuts)
     - Add: Data fetching (useEffect for partId changes)

2. **`src/frontend/src/types/modal.ts`** (EXTEND)
   - **Before:** 40 lines, T-0508 placeholder contract
   - **After:** 120 lines, T-1007 full contract
   - **Changes:**
     - Add: `TabId` type ('viewer' | 'metadata' | 'validation')
     - Add: `NavigationDirection` type ('prev' | 'next')
     - Add: `AdjacentPartsInfo` interface (matches T-1003-BACK)
     - Update: `PartDetailModalProps` with new props

3. **`src/frontend/src/components/Dashboard/Dashboard3D.tsx`** (MINOR UPDATE)
   - **Before:** Passes `part={selectedPart}` to modal
   - **After:** Passes `partId={selectedId}` to modal
   - **Changes:**
     ```tsx
     // Before (T-0508)
     const selectedPart = parts.find(p => p.id === selectedId) || null;
     <PartDetailModal isOpen={!!selectedId} part={selectedPart} onClose={clearSelection} />
     
     // After (T-1007)
     <PartDetailModal
       isOpen={!!selectedId}
       partId={selectedId}
       onClose={clearSelection}
       filters={{
         status: filters.status,
         tipologia: filters.tipologia,
         workshop_id: filters.workshop_id,
       }}
     />
     ```

---

## 8. Reusable Components/Patterns

### From Existing Codebase

1. **ModelLoader (T-1005-FRONT)** ✅
   - **Reuse for:** 3D Viewer tab content
   - **Integration:** Pass `partId` prop, handle `onLoadSuccess`/`onLoadError`
   - **Location:** `src/frontend/src/components/ModelLoader.tsx`

2. **PartViewerCanvas (T-1004-FRONT)** ✅
   - **Reuse for:** Wrapped by ModelLoader internally
   - **Integration:** No direct usage in modal (ModelLoader handles it)
   - **Location:** `src/frontend/src/components/PartViewerCanvas.tsx`

3. **BBoxProxy (T-0507-FRONT)** ✅
   - **Reuse for:** Fallback when low_poly_url is null (via ModelLoader)
   - **Integration:** Automatic via ModelLoader's ProcessingFallback
   - **Location:** `src/frontend/src/components/Dashboard/BBoxProxy.tsx`

4. **ValidationReportView (T-032-FRONT)** ⚠️
   - **Reuse for:** Validation tab content
   - **Integration:** Pass `report={partData.validation_report}`
   - **Location:** `src/frontend/src/components/ValidationReportView.tsx`
   - **Status:** Check if component exists; if not, placeholder for T-1007

5. **STATUS_COLORS constant (T-0508-FRONT)** ✅
   - **Reuse for:** Status badge color coding
   - **Location:** `src/frontend/src/constants/dashboard3d.constants.ts`

6. **usePartsStore (T-0506-FRONT)** ✅
   - **Reuse for:** selectedId, clearSelection, selectPart
   - **Integration:** No changes needed, modal consumes via props
   - **Location:** `src/frontend/src/stores/partsStore.ts`

7. **getPartDetail() service (T-1005-FRONT)** ✅
   - **Reuse for:** Fetching part data in modal
   - **Location:** `src/frontend/src/services/upload.service.ts`

---

## 9. Next Steps

### Ready for TDD-Red Phase ✅

This specification provides all contracts and test cases needed to start test-first development.

**Handoff Checklist:**
- [x] Component interfaces defined (TypeScript)
- [x] API contracts verified (matches T-1002-BACK, T-1003-BACK)
- [x] Test cases written (29 total)
- [x] File structure planned (5 new, 3 modified)
- [x] Dependencies identified (all completed ✅)
- [x] Reusable components listed
- [x] Error handling strategy defined
- [x] Accessibility requirements specified

---

## HANDOFF FOR TDD-RED PHASE

```
=============================================
READY FOR TDD-RED PHASE - T-1007-FRONT
=============================================

Ticket ID:       T-1007-FRONT
Feature name:    Modal Integration - 3D Viewer with Tabs & Navigation
Sprint:          US-010 (Wave 3)

Key test suites (29 tests total):
  ✅ Happy Path: 6 tests (modal open, tabs, navigation)
  ✅ Edge Cases: 8 tests (404, disabled buttons, null states)
  ✅ Security/Errors: 6 tests (keyboard, debouncing, scroll lock)
  ✅ Integration: 5 tests (Dashboard, store, filters, portal)
  ✅ Accessibility: 4 tests (ARIA, focus trap, screen reader)

Files to create:
  1. src/frontend/src/components/Dashboard/PartDetailModal.types.ts (80 lines)
  2. src/frontend/src/components/Dashboard/PartDetailModal.constants.ts (120 lines)
  3. src/frontend/src/components/Dashboard/PartDetailModal.test.tsx (400 lines)
  4. src/frontend/src/services/navigation.service.ts (60 lines)
  5. src/frontend/src/services/navigation.service.test.ts (80 lines)

Files to modify:
  1. src/frontend/src/components/Dashboard/PartDetailModal.tsx
     → REFACTOR: Change props from `part` to `partId`, add tabs system, add Portal
  2. src/frontend/src/types/modal.ts
     → EXTEND: Add TabId, AdjacentPartsInfo, update PartDetailModalProps
  3. src/frontend/src/components/Dashboard/Dashboard3D.tsx
     → UPDATE: Pass `partId={selectedId}` instead of `part={selectedPart}`

Dependencies (all completed):
  ✅ T-1004-FRONT: PartViewerCanvas
  ✅ T-1005-FRONT: ModelLoader
  ✅ T-1002-BACK: GET /api/parts/{id}
  ✅ T-1003-BACK: GET /api/parts/{id}/navigation

Breaking changes:
  ⚠️ PartDetailModal props interface changed (part → partId)
  ⚠️ Dashboard3D.tsx requires update to pass partId

Estimated complexity: 8 Story Points
Estimated duration: 6-8 hours (TDD full cycle)

Next command:
  Use `:tdd-red` macro with this ticket ID to start test writing phase.
=============================================
```

---

**END OF TECHNICAL SPECIFICATION**

*Document generated: 2026-02-25 22:05*  
*Ticket: T-1007-FRONT*  
*Version: 1.0 (ENRICHED)*  
*Status: READY FOR TDD-RED*
