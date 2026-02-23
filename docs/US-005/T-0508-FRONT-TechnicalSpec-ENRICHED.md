# Technical Specification: T-0508-FRONT

**Status:** Enrichment Complete — Ready for TDD-RED Phase  
**Ticket:** T-0508-FRONT — Part Selection & Modal  
**User Story:** US-005 (Dashboard 3D Interactivo de Piezas)  
**Complexity:** 2 Story Points  
**Author:** AI Assistant (Claude Sonnet 4.5)  
**Date:** 2026-02-22  

---

## 1. Ticket Summary

- **Tipo:** FRONT (React + TypeScript + Three.js)
- **Alcance:** Sistema de selección de piezas en canvas 3D con feedback visual (emissive glow) y apertura de modal de detalle
- **Dependencias:**
  - ✅ **T-0505-FRONT** (PartsScene + PartMesh rendering) — DONE
  - ✅ **T-0506-FRONT** (Filters Sidebar + Zustand store) — DONE
  - ✅ **T-0507-FRONT** (LOD System) — DONE
  - ⚠️ **US-010** (PartDetailModal full implementation) — FUTURE (placeholder only)

---

## 2. Data Structures & Contracts

### Frontend Types (TypeScript)

**File:** `src/frontend/src/types/modal.ts` (NEW)
```typescript
import { PartCanvasItem } from './parts';

/**
 * Props for PartDetailModal component
 * 
 * @remarks
 * This is a FUTURE-PROOF contract for US-010 integration.
 * T-0508-FRONT implements a placeholder modal with basic info.
 * US-010 will extend this with full detail view (3D viewer, metadata tabs, history timeline).
 * 
 * @example
 * ```tsx
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   part={parts.find(p => p.id === selectedId) || null}
 *   onClose={() => selectPart(null)}
 * />
 * ```
 */
export interface PartDetailModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  
  /** Selected part data (null when no selection) */
  part: PartCanvasItem | null;
  
  /** Close modal callback (triggers clearSelection in store) */
  onClose: () => void;
}
```

### Store Contract Extension (Zustand)

**File:** `src/frontend/src/stores/parts.store.ts` (MODIFY — clearSelection already exists)
```typescript
/**
 * Parts store state interface
 * 
 * T-0505-FRONT: Base implementation with selectPart/clearSelection
 * T-0508-FRONT: Leverages existing selection state for modal integration
 */
interface PartsState {
  // ... existing properties ...
  
  /** Currently selected part ID */
  selectedId: string | null;  // ✅ Already exists
  
  /** Select a part by ID */
  selectPart: (id: string) => void;  // ✅ Already exists
  
  /** Clear selection */
  clearSelection: () => void;  // ✅ Already exists
}
```

**NO NEW STORE CHANGES REQUIRED** — All selection logic already implemented in T-0505-FRONT.

### Constants Extension

**File:** `src/frontend/src/constants/selection.constants.ts` (NEW)
```typescript
/**
 * Selection behavior constants
 * T-0508-FRONT: Part selection and modal interaction
 * 
 * @module selection.constants
 */

/**
 * Emissive glow intensity for selected parts
 * From POC validation: 0.4 provides clear visual feedback without oversaturation
 */
export const SELECTION_EMISSIVE_INTENSITY = 0.4;

/**
 * Keyboard keys for deselection
 */
export const DESELECTION_KEYS = {
  ESCAPE: 'Escape',
  ESC: 'Esc',  // Legacy browsers
} as const;

/**
 * Aria labels for accessibility
 */
export const SELECTION_ARIA_LABELS = {
  MODAL_CLOSE_BUTTON: 'Cerrar detalle de pieza',
  PART_MESH_SELECTABLE: 'Pieza seleccionable. Clic para ver detalles',
} as const;
```

---

## 3. API Interface

**N/A** — This ticket is frontend-only. No backend endpoints required.

The modal displays data already fetched by `GET /api/parts` (T-0501-BACK).

---

## 4. Component Contracts

### A. PartMesh Component (MODIFY)

**File:** `src/frontend/src/components/Dashboard/PartMesh.tsx`

**Current State (T-0507-FRONT):**
- ✅ Click handler implemented: `handleClick()` calls `selectPart(part.id)`
- ✅ Emissive glow implemented: `emissive`, `emissiveIntensity` based on `isSelected`
- ✅ Color from `STATUS_COLORS` mapping applied

**Changes Required:**
- **ZERO IMPLEMENTATION CHANGES** — Current behavior already matches T-0508-FRONT requirements
- Selection triggers `selectPart(part.id)` → store updates `selectedId` → modal opens
- Emissive glow intensity already set to `0.4` when `isSelected` (matches POC spec)

**Validation Only:**
- Verify `emissiveIntensity === 0.4` (not hardcoded, should use constant)
- Verify `emissive` uses `STATUS_COLORS[part.status]` (green for validated, red for rejected)

### B. PartDetailModal Component (CREATE)

**File:** `src/frontend/src/components/Dashboard/PartDetailModal.tsx` (NEW)

**Behavior:**
- **Placeholder implementation for T-0508-FRONT** — Basic modal with part info
- **US-010 will extend** with full 3D viewer, metadata tabs, validation report, history timeline
- **Keyboard handler:** ESC key closes modal
- **Click outside:** Backdrop click closes modal
- **Close button:** X button closes modal

**Props:**
```typescript
interface PartDetailModalProps {
  isOpen: boolean;
  part: PartCanvasItem | null;
  onClose: () => void;
}
```

**Render Logic:**
```tsx
// Placeholder content for T-0508-FRONT
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>{part?.iso_code}</h2>
    <button onClick={onClose} aria-label="Cerrar">✕</button>
  </ModalHeader>
  <ModalBody>
    <p><strong>Estado:</strong> {part?.status}</p>
    <p><strong>Tipología:</strong> {part?.tipologia}</p>
    <p><strong>Taller:</strong> {part?.workshop_name || 'Sin asignar'}</p>
    <p className="text-gray-500">
      Detalles completos disponibles en US-010
    </p>
  </ModalBody>
</Modal>
```

### C. Canvas3D Component (MODIFY)

**File:** `src/frontend/src/components/Dashboard/Canvas3D.tsx`

**Changes Required:**
1. **Add Canvas background click handler** for deselection
2. **Add keyboard listener** for ESC key deselection

**Implementation Pattern:**
```tsx
// Inside Canvas3D component
const { clearSelection } = usePartsStore();

// Canvas background click (deselect when clicking empty space)
const handleCanvasClick = (event: ThreeEvent<MouseEvent>) => {
  // Only deselect if clicked directly on canvas (not on a part mesh)
  if (event.eventObject === event.object) {
    clearSelection();
  }
};

// Keyboard ESC handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      clearSelection();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [clearSelection]);

return (
  <Canvas onPointerMissed={handleCanvasClick}>
    {/* existing canvas content */}
  </Canvas>
);
```

### D. Dashboard3D Component (MODIFY)

**File:** `src/frontend/src/components/Dashboard/Dashboard3D.tsx`

**Changes Required:**
1. **Import and render PartDetailModal**
2. **Pass selectedId and clearSelection to modal**

**Integration Pattern:**
```tsx
import { PartDetailModal } from './PartDetailModal';

function Dashboard3D() {
  const { parts, selectedId, clearSelection } = usePartsStore();
  
  const selectedPart = parts.find(p => p.id === selectedId) || null;
  
  return (
    <>
      <div className="dashboard-layout">
        <Canvas3D />
        <FiltersSidebar />
      </div>
      
      <PartDetailModal
        isOpen={!!selectedId}
        part={selectedPart}
        onClose={clearSelection}
      />
    </>
  );
}
```

---

## 5. Test Cases Checklist

### Happy Path (7 tests)
- [ ] **HP-SEL-1:** Click part → `selectPart(id)` called with correct ID
- [ ] **HP-SEL-2:** Selected part shows emissive glow (intensity 0.4, color from STATUS_COLORS)
- [ ] **HP-SEL-3:** Modal opens when part selected (`isOpen={true}`)
- [ ] **HP-SEL-4:** Modal displays correct part data (iso_code, status, tipologia, workshop_name)
- [ ] **HP-SEL-5:** Close button in modal → calls `clearSelection()`
- [ ] **HP-SEL-6:** Only ONE part selected at a time (single selection pattern)
- [ ] **HP-SEL-7:** Clicking another part changes selection (previous deselected, new selected)

### Edge Cases (4 tests)
- [ ] **EC-SEL-1:** ESC key → `clearSelection()` called, modal closes
- [ ] **EC-SEL-2:** Click canvas background → `clearSelection()` called, modal closes
- [ ] **EC-SEL-3:** Modal backdrop click → `clearSelection()` called
- [ ] **EC-SEL-4:** Part with `workshop_name=null` → displays "Sin asignar"

### Security/Errors (3 tests)
- [ ] **SE-SEL-1:** Invalid `part.id` (not in store) → modal shows null state gracefully
- [ ] **SE-SEL-2:** Multiple rapid clicks on same part → no duplicate state updates
- [ ] **SE-SEL-3:** ESC key when no selection → no errors thrown

### Integration (2 tests)
- [ ] **INT-SEL-1:** Selection + filters → filtered-out parts cannot be selected (opacity 0.2)
- [ ] **INT-SEL-2:** Selection + LOD → emissive glow visible at all LOD levels (Level 0, 1, 2)

---

## 6. Files to Create/Modify

### Create (3 files)
- `src/frontend/src/types/modal.ts` — TypeScript interface for `PartDetailModalProps`
- `src/frontend/src/constants/selection.constants.ts` — Selection behavior constants
- `src/frontend/src/components/Dashboard/PartDetailModal.tsx` — Placeholder modal component
- `src/frontend/src/components/Dashboard/PartDetailModal.test.tsx` — Vitest tests for modal

### Modify (3 files)
- `src/frontend/src/components/Dashboard/Canvas3D.tsx` — Add keyboard/background click handlers
- `src/frontend/src/components/Dashboard/Dashboard3D.tsx` — Integrate modal
- `src/frontend/src/components/Dashboard/index.ts` — Export `PartDetailModal`

**NO MODIFICATION REQUIRED:**
- `src/frontend/src/stores/parts.store.ts` — Already has `selectPart`, `clearSelection`, `selectedId` ✅
- `src/frontend/src/components/Dashboard/PartMesh.tsx` — Already has click handler and emissive glow ✅

---

## 7. Reusable Components/Patterns

### From T-0505-FRONT (PartsScene)
- ✅ **`usePartsStore()`** → `selectPart(id)`, `clearSelection()`, `selectedId`
- ✅ **`STATUS_COLORS`** mapping → Used for emissive glow color
- ✅ **Click handler pattern** → `handleClick()` in PartMesh already implemented

### From T-0504-FRONT (Dashboard layout)
- ✅ **Modal pattern** → Can reference `ValidationReportModal` (T-032-FRONT) for structure
  - Backdrop with `onClick` → calls `onClose`
  - ESC key listener with `useEffect`
  - Focus trap for accessibility

### From T-0506-FRONT (Filters)
- ✅ **Constants extraction pattern** → `SELECTION_CONSTANTS` follows same approach as `FILTER_VISUAL_FEEDBACK`

### New Pattern: Future-Proof Design
- **PartDetailModalProps interface** documented as placeholder for US-010
- **No breaking changes** when US-010 extends modal with 3D viewer
- **Backward compatibility** guaranteed (placeholder content replaced by full UI)

---

## 8. Architecture Decisions

### Decision 1: Single Selection Only
**Rationale:** MVP scope focuses on individual part detail view. Multi-selection (bulk operations) deferred to post-MVP.

**Implementation:** 
- `selectedId: string | null` (not `string[]`)
- Clicking another part replaces current selection
- No Ctrl+Click or Shift+Click handling in T-0508-FRONT

### Decision 2: Placeholder Modal (Not Full US-010)
**Rationale:** US-010 requires significant effort (3D viewer integration, validation report tabs, history timeline). T-0508-FRONT establishes the **contract and interaction pattern** only.

**Benefits:**
- Unblocks US-005 completion (modal opens/closes as expected)
- US-010 can replace modal content without changing parent components
- Testing validates interaction flow, not content depth

### Decision 3: Keyboard/Background Click Deselection
**Rationale:** Standard UX pattern — ESC closes modals, clicking outside dismisses overlays.

**Implementation:**
- **ESC key:** Listens on `window` (global listener)
- **Background click:** Uses Three.js `onPointerMissed` event (cleaner than DOM event bubbling)
- **Both trigger:** `clearSelection()` → closes modal

### Decision 4: No New Zustand Store Actions
**Rationale:** T-0505-FRONT already implemented all required selection logic. Reuse existing contracts.

**Validation:**
- `selectPart(id)` exists ✅
- `clearSelection()` exists ✅
- `selectedId` state exists ✅

---

## 9. Performance Considerations

### Emissive Glow Impact
- **Material property change:** Negligible performance cost (<0.1ms per frame)
- **Three.js optimization:** Material updates don't trigger geometry rebuild
- **Target:** FPS remains >30 with 150 parts (validated in T-0507-FRONT POC: 60 FPS)

### Modal Rendering
- **Conditional rendering:** Modal only renders when `isOpen={true}` (not hidden with CSS)
- **Event listeners:** Single ESC listener on `window` (not per-part)
- **Memory:** Modal unmounts when closed (React cleanup)

---

## 10. Accessibility (A11Y)

### Keyboard Navigation
- ✅ **ESC key:** Closes modal (standard pattern)
- ⚠️ **Tab key:** Focus trap NOT implemented in T-0508 (defer to US-010 full modal)
- ✅ **Enter key:** Can reference `ValidationReportModal` pattern for focus management

### ARIA Labels
- `aria-label="Cerrar detalle de pieza"` on close button
- `role="dialog"` on modal container
- `aria-modal="true"` to indicate modal state

### Screen Reader Support
- Modal announces part name when opened
- Close button clearly labeled
- Part mesh clickable elements have descriptive labels

---

## 11. Next Steps

This specification is **READY FOR TDD-RED PHASE**. Use snippet `:tdd-red` with the following handoff data:

---

### 📋 HANDOFF FOR TDD-RED PHASE

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0508-FRONT
Feature name:    Part Selection & Modal Integration
Story Points:    2 SP

Key test cases (4 priority tests to write first):
  1. HP-SEL-3: Modal opens when part selected
  2. HP-SEL-5: Close button calls clearSelection()
  3. EC-SEL-1: ESC key closes modal
  4. INT-SEL-2: Emissive glow visible at all LOD levels

Files to create:
  - src/frontend/src/types/modal.ts
  - src/frontend/src/constants/selection.constants.ts
  - src/frontend/src/components/Dashboard/PartDetailModal.tsx
  - src/frontend/src/components/Dashboard/PartDetailModal.test.tsx

Files to modify:
  - src/frontend/src/components/Dashboard/Canvas3D.tsx (ESC listener + background click)
  - src/frontend/src/components/Dashboard/Dashboard3D.tsx (integrate modal)
  - src/frontend/src/components/Dashboard/index.ts (export modal)

Zero modifications required:
  ✅ src/frontend/src/stores/parts.store.ts (selectPart/clearSelection exist)
  ✅ src/frontend/src/components/Dashboard/PartMesh.tsx (click handler exists)

Dependencies verified:
  ✅ T-0505-FRONT: PartsScene + PartMesh (selectPart integration)
  ✅ T-0506-FRONT: Filters (optional - selection works with/without filters)
  ✅ T-0507-FRONT: LOD System (emissive glow must work at all LOD levels)

Architecture patterns to follow:
  - Constants extraction (SELECTION_CONSTANTS)
  - Separation of Concerns (PartMesh rendering ≠ modal logic)
  - Future-Proof Design (PartDetailModalProps for US-010 extension)
  - Clean Architecture (event handlers → store actions → UI updates)

Testing strategy:
  - Write tests FIRST (TDD-RED)
  - 16 tests total: 7 Happy Path + 4 Edge + 3 Security + 2 Integration
  - Mock usePartsStore with selectPart/clearSelection/selectedId
  - Mock keyboard events (KeyboardEvent)
  - Mock Three.js Canvas (onPointerMissed event)

Performance targets:
  - Modal open/close: <16ms (60 FPS maintained)
  - ESC key response: <50ms (perceived as instant)
  - No FPS drop during selection (emissive change <0.1ms)

Acceptance criteria (from backlog):
  ✓ Click opens modal
  ✓ Glow visible (intensity 0.4, STATUS_COLORS)
  ✓ Close ungrows (clearSelection removes glow)
  ✓ ESC deselects
  ✓ Click another changes selection
  ✓ FPS no drop (>30 FPS target, 60 FPS expected)

=============================================
Next command: :tdd-red
=============================================
```

---

## 12. Validation Checklist

Before proceeding to TDD-RED, verify:

- [x] Read `docs/09-mvp-backlog.md` and located T-0508-FRONT ✅
- [x] Read `memory-bank/systemPatterns.md` for API contracts ✅
- [x] Read `memory-bank/techContext.md` for stack ✅
- [x] Verified `parts.store.ts` has `selectPart()`, `clearSelection()` ✅
- [x] Verified `PartMesh.tsx` has click handler and emissive glow ✅
- [x] Verified `STATUS_COLORS` constant exists ✅
- [x] Defined TypeScript interfaces (PartDetailModalProps) ✅
- [x] Defined test cases (16 tests: 7 HP + 4 EC + 3 SE + 2 INT) ✅
- [x] Identified reusable patterns (ValidationReportModal reference) ✅
- [x] No breaking changes to existing components (T-0505/T-0506/T-0507) ✅
- [x] Future-proof contract documented for US-010 ✅

**Status:** ✅ **SPECIFICATION COMPLETE — READY FOR TDD-RED**

---

## 13. References

- **Ticket:** [docs/09-mvp-backlog.md](../09-mvp-backlog.md#t-0508-front) (Line 269)
- **Dependencies:** T-0505-FRONT (PartsScene), T-0506-FRONT (Filters), T-0507-FRONT (LOD)
- **Related US:** US-010 (PartDetailModal full implementation — FUTURE)
- **POC Results:** [poc/formats-comparison/results/benchmark-results-2026-02-18.json](../../poc/formats-comparison/results/benchmark-results-2026-02-18.json) (Emissive glow intensity 0.4 validated)
- **Similar Pattern:** T-032-FRONT (ValidationReportModal) — Modal structure reference

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-22  
**Next Phase:** TDD-RED (Write failing tests for 16 test cases)
