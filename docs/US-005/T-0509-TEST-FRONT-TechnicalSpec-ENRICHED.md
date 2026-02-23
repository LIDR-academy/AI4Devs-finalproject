# Technical Specification: T-0509-TEST-FRONT (ENRICHED)

**Ticket ID:** T-0509-TEST-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Phase:** Testing & Integration Validation  
**Estimation:** 3 Story Points (~6 hours)  
**Priority:** P3 (Quality Gate)  
**Status:** 🔵 ENRICHMENT (Step 1/5 - Pre-TDD)  
**Date Updated:** 2026-02-23  

---

## 1. Ticket Summary

### Type
**FRONT (Testing Focus)** — Integration tests for 3D Dashboard components

### Scope
Create comprehensive integration test suites to validate that all Dashboard 3D components (T-0504 through T-0508) work together correctly as a complete system. This is NOT about unit testing individual components (those already exist), but verifying the **integration points** and **end-to-end workflows**.

### Dependencies
**Upstream (REQUIRED - All DONE ✅):**
- ✅ T-0504-FRONT: Dashboard3D layout component (64 tests passing)
- ✅ T-0505-FRONT: PartsScene & PartMesh rendering (16 tests passing)
- ✅ T-0506-FRONT: FiltersSidebar & Zustand store (49 tests passing)
- ✅ T-0507-FRONT: LOD System implementation (43 tests passing)
- ✅ T-0508-FRONT: Part Selection & Modal (32 tests passing)
- ✅ T-0500-INFRA: React Three Fiber stack setup

**Current Test Status:**
- **Frontend Total:** 215 tests passing
- **Dashboard Unit Tests:** 204 tests (individual components)
- **Integration Tests:** 0 (this ticket creates them)

**Downstream:**
- T-0510-TEST-BACK: Canvas API Integration Tests (can run in parallel)

---

## 2. Data Structures & Contracts

### No New Types Required

This ticket tests **existing** contracts. All type definitions already exist from T-0504 to T-0508. Key interfaces to test:

#### Zustand Store Interface (Existing)
```typescript
// src/frontend/src/stores/partsStore.ts
interface PartsStoreState {
  parts: PartCanvasItem[];
  isLoading: boolean;
  error: string | null;
  filters: PartsFilters;
  selectedId: string | null;
  
  // Actions
  setParts: (parts: PartCanvasItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PartsFilters>) => void;
  selectPart: (id: string | null) => void;
  getFilteredParts: () => PartCanvasItem[];
}
```

#### Part Canvas Item (Existing)
```typescript
// src/frontend/src/types/parts.ts
interface PartCanvasItem {
  id: string;
  iso_code: string;
  status: BlockStatus;
  tipologia: Tipologia;
  low_poly_url?: string;
  bbox?: BoundingBox;
  workshop_id?: string;
  workshop_name?: string;
}
```

#### Filters Interface (Existing)
```typescript
// src/frontend/src/stores/partsStore.ts
interface PartsFilters {
  status: string[];
  tipologia: string[];
  workshop_id: string | null;
}
```

---

## 3. API Interface

**N/A** — This ticket tests frontend integration only. No API changes required.

The integration tests will **mock** the existing `GET /api/parts` endpoint (implemented in T-0501-BACK).

---

## 4. Component Integration Map

### Components Under Test (Existing)

```
Dashboard3D (Orchestrator)
├── EmptyState (when parts.length === 0)
├── LoadingOverlay (when isLoading === true)
├── Canvas3D
│   ├── PartsScene
│   │   └── PartMesh (N instances with LOD)
│   │       ├── BBoxProxy (LOD level 2)
│   │       └── Mesh (LOD level 0-1)
│   ├── OrbitControls
│   ├── Grid
│   └── GizmoViewcube
├── DraggableFiltersSidebar
│   └── FiltersSidebar
│       ├── CheckboxGroup (tipologia)
│       ├── CheckboxGroup (status)
│       └── WorkshopSelect
└── PartDetailModal (when selectedId !== null)
```

### Integration Points to Validate

| Integration Point | Components Involved | Expected Behavior |
|-------------------|---------------------|-------------------|
| **Store → Rendering** | partsStore → Dashboard3D → PartsScene | When `setParts([...])`, canvas re-renders with new meshes |
| **Filters → Canvas** | FiltersSidebar → partsStore.setFilters → PartMesh | Opacity changes (1.0 match, 0.2 non-match) |
| **Selection → Modal** | PartMesh.onClick → partsStore.selectPart → PartDetailModal | Modal opens with correct part data |
| **ESC Key → Deselection** | Window.keydown → partsStore.clearSelection → PartDetailModal | Modal closes, glow disappears |
| **URL → Filters** | useURLFilters → partsStore.setFilters → FiltersSidebar | Filters applied on mount from URL params |
| **Empty State → Canvas** | partsStore.parts.length → Dashboard3D | Canvas hidden, EmptyState visible |
| **Loading → Overlay** | partsStore.isLoading → Dashboard3D → LoadingOverlay | Spinner shown, canvas blurred |

---

## 5. Test Cases Checklist

### Suite 1: Integration - Rendering (5 tests)

- [ ] **Test 1:** Dashboard renders Canvas + Sidebar when parts exist
  - **Given:** `partsStore.setParts([mockPart1, mockPart2])`
  - **When:** Render `<Dashboard3D />`
  - **Then:** Both Canvas (testid='canvas') and Sidebar (role='complementary') present

- [ ] **Test 2:** Empty state replaces canvas when no parts
  - **Given:** `partsStore.setParts([])`
  - **When:** Render `<Dashboard3D />`
  - **Then:** Canvas NOT visible, EmptyState visible with "No hay piezas" message

- [ ] **Test 3:** Loading overlay shows during fetch
  - **Given:** `partsStore.setLoading(true)`
  - **When:** Render `<Dashboard3D />`
  - **Then:** LoadingOverlay visible with "Cargando piezas" message

- [ ] **Test 4:** Parts with low_poly_url render, null URLs skip
  - **Given:** `partsStore.setParts([{...part1, low_poly_url: 'test.glb'}, {...part2, low_poly_url: null}])`
  - **When:** PartsScene renders
  - **Then:** Only 1 PartMesh rendered (part1), part2 skipped

- [ ] **Test 5:** Canvas maintains 60 FPS with 150 mocked parts (performance)
  - **Given:** `partsStore.setParts(generate150MockParts())`
  - **When:** Render `<Dashboard3D />`
  - **Then:** Render completes in <2000ms (automated timing test)

---

### Suite 2: Integration - Filters & State (5 tests)

- [ ] **Test 6:** Filtering by tipologia updates canvas opacity
  - **Given:** 3 parts (2 capitel, 1 columna) in store
  - **When:** User clicks CheckboxGroup "capitel"
  - **Then:** getFilteredParts() returns 2, PartMesh opacity logic applied (1.0 for capitel, 0.2 for columna)

- [ ] **Test 7:** URL params sync with filters on mount
  - **Given:** URL = `/dashboard?tipologia=capitel&status=validated`
  - **When:** Dashboard3D mounts
  - **Then:** partsStore.filters = { tipologia: ['capitel'], status: ['validated'] }

- [ ] **Test 8:** Filters update URL without page reload
  - **Given:** Dashboard3D mounted at `/dashboard`
  - **When:** User clicks CheckboxGroup "capitel"
  - **Then:** URL updates to `/dashboard?tipologia=capitel` (React Router navigation)

- [ ] **Test 9:** Clear filters button resets all filters and URL
  - **Given:** Active filters { tipologia: ['capitel'], status: ['validated'] }
  - **When:** User clicks "Limpiar filtros"
  - **Then:** partsStore.filters reset to empty, URL = `/dashboard` (no params)

- [ ] **Test 10:** Multiple filter types combine with AND logic
  - **Given:** 5 parts (various status/tipologia combinations)
  - **When:** Set filters { tipologia: ['capitel'], status: ['validated'] }
  - **Then:** getFilteredParts() returns only parts matching BOTH conditions

---

### Suite 3: Integration - Selection & Modal (5 tests)

- [ ] **Test 11:** Clicking part opens modal with correct data
  - **Given:** Part with id='123', iso_code='SF-C12-D-001'
  - **When:** User clicks PartMesh (simulate partsStore.selectPart('123'))
  - **Then:** PartDetailModal visible with iso_code in heading

- [ ] **Test 12:** ESC key closes modal and deselects part
  - **Given:** Modal open (selectedId='123')
  - **When:** User presses ESC key (fireEvent.keyDown(window, { key: 'Escape' }))
  - **Then:** Modal closes, partsStore.selectedId = null

- [ ] **Test 13:** Backdrop click closes modal
  - **Given:** Modal open
  - **When:** User clicks modal backdrop (outside dialog)
  - **Then:** Modal closes via partsStore.clearSelection()

- [ ] **Test 14:** Selected part shows emissive glow
  - **Given:** Part with id='123' selected
  - **When:** PartMesh renders
  - **Then:** Material has emissive color matching STATUS_COLORS[status]

- [ ] **Test 15:** Selecting another part closes first modal, opens new one
  - **Given:** Part '123' selected (modal open)
  - **When:** User clicks Part '456'
  - **Then:** selectedId changes from '123' → '456', modal updates content

---

### Suite 4: Integration - Empty & Error States (3 tests)

- [ ] **Test 16:** Error message displays when store.error set
  - **Given:** `partsStore.setError('Failed to load parts')`
  - **When:** Render Dashboard3D
  - **Then:** Error banner visible with message

- [ ] **Test 17:** "Upload First Part" button visible in empty state
  - **Given:** Empty parts array, EmptyState visible
  - **When:** User sees EmptyState
  - **Then:** Button with text "Subir Primera Pieza" present, href='/upload'

- [ ] **Test 18:** Empty state disappears immediately when parts load
  - **Given:** EmptyState visible (0 parts)
  - **When:** `partsStore.setParts([mockPart1])` called
  - **Then:** EmptyState unmounts, Canvas3D mounts

---

### Suite 5: Integration - Performance (3 tests - Manual + Automated)

- [ ] **Test 19:** Rendering 150 parts completes in <2s (automated)
  - **Implementation:** Jest/Vitest `performance.now()` timing
  - **Threshold:** <2000ms
  - **Mock:** 150 minimal PartCanvasItem fixtures

- [ ] **Test 20:** FPS >30 during camera rotation (manual protocol)
  - **Steps:** 
    1. Load 150 real parts in dev environment
    2. Open Chrome DevTools → Performance
    3. Record 30s: 10s rest, 10s rotation, 10s zoom
    4. Verify average FPS >30, no long tasks >50ms
  - **Documentation:** Results logged in `PERFORMANCE-TESTING.md`

- [ ] **Test 21:** Memory <500 MB after 2 minutes interaction (manual protocol)
  - **Steps:**
    1. Load 150 parts
    2. Chrome DevTools → Memory → Take Heap Snapshot (baseline)
    3. Interact for 2 min (rotate, zoom, filter, select)
    4. Take second Heap Snapshot
    5. Verify: initial <200 MB, after 2 min <500 MB, delta <100 MB
  - **Documentation:** Snapshot comparison screenshots in audit report

---

## 6. Files to Create/Modify

### Create (5 new test files)

1. **`src/frontend/src/components/Dashboard/__integration__/Dashboard3D.rendering.test.tsx`**
   - Suite 1: Rendering integration (5 tests)
   - 120 lines estimated

2. **`src/frontend/src/components/Dashboard/__integration__/Dashboard3D.filters.test.tsx`**
   - Suite 2: Filters & State integration (5 tests)
   - 150 lines estimated

3. **`src/frontend/src/components/Dashboard/__integration__/Dashboard3D.selection.test.tsx`**
   - Suite 3: Selection & Modal integration (5 tests)
   - 130 lines estimated

4. **`src/frontend/src/components/Dashboard/__integration__/Dashboard3D.empty-state.test.tsx`**
   - Suite 4: Empty & Error States integration (3 tests)
   - 80 lines estimated

5. **`src/frontend/src/components/Dashboard/__integration__/Dashboard3D.performance.test.tsx`**
   - Suite 5: Performance automated test (1 test)
   - 60 lines estimated

6. **`docs/US-005/PERFORMANCE-TESTING.md`**
   - Manual performance test protocol documentation
   - Includes steps for Tests 20-21
   - 200 lines estimated

### Modify (1 file)

1. **`src/frontend/vitest.config.ts`**
   - **Add:** `include: ['**/__integration__/**/*.test.tsx']` to test configuration
   - **Update:** Coverage paths to include integration tests

---

## 7. Reusable Components/Patterns

### Testing Patterns (From Existing Tests)

1. **Mock Zustand Store Pattern** (from T-0504)
   ```typescript
   // Dashboard3D.test.tsx uses this pattern
   vi.mock('@/stores/partsStore');
   vi.mocked(usePartsStore).mockReturnValue({
     parts: mockParts,
     isLoading: false,
     // ... other methods
   });
   ```

2. **Three.js Mock Strategy** (from setup.ts)
   ```typescript
   // Already configured in src/frontend/src/test/setup.ts
   vi.mock('@react-three/fiber', () => ({
     Canvas: ({ children, onPointerMissed }: any) => 
       <div data-testid="three-canvas" onClick={onPointerMissed}>{children}</div>,
     useFrame: vi.fn(),
     useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
   }));
   ```

3. **Performance Timing Wrapper**
   ```typescript
   // New pattern for Test 19
   const measureRenderTime = (component: React.ReactElement) => {
     const start = performance.now();
     render(component);
     return performance.now() - start;
   };
   ```

4. **Store State Reset Pattern** (standard for all tests)
   ```typescript
   beforeEach(() => {
     usePartsStore.setState({ 
       parts: [], 
       filters: { status: [], tipologia: [], workshop_id: null },
       selectedId: null,
       isLoading: false,
       error: null,
     });
   });
   ```

### Fixtures to Create

```typescript
// src/frontend/src/test/fixtures/parts.fixtures.ts
export const mockPartCapitel: PartCanvasItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  iso_code: 'SF-C12-CAP-001',
  status: 'validated',
  tipologia: 'capitel',
  low_poly_url: 'https://storage.example.com/low-poly/capitel-001.glb',
  bbox: { min: [0, 0, 0], max: [1, 1, 1] },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
};

export const generate150MockParts = (): PartCanvasItem[] => {
  return Array.from({ length: 150 }, (_, i) => ({
    id: `part-${i}`,
    iso_code: `SF-TEST-${String(i).padStart(3, '0')}`,
    status: ['validated', 'in_fabrication', 'completed'][i % 3] as BlockStatus,
    tipologia: ['capitel', 'columna', 'dovela'][i % 3] as Tipologia,
    low_poly_url: `https://storage.example.com/part-${i}.glb`,
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
  }));
};
```

---

## 8. Coverage Targets & Verification

### Coverage Thresholds (DoD Requirements)

| Component/File | Current Coverage | Target | New Tests Impact |
|----------------|------------------|--------|------------------|
| Dashboard3D.tsx | ~70% (unit tests) | >80% | +10% from integration tests |
| PartsScene.tsx | ~75% (unit tests) | >80% | +5% from filter integration |
| PartMesh.tsx | ~80% (unit tests) | >85% | +5% from selection integration |
| FiltersSidebar.tsx | ~85% (unit tests) | >90% | +5% from URL sync tests |
| partsStore.ts | ~60% (basic unit) | >80% | +20% from state integration tests |

### Verification Command
```bash
# Run integration tests only
npm run test -- --run src/components/Dashboard/__integration__/

# Generate coverage report
npm run test:coverage

# Expected output:
# Dashboard3D.tsx: 82% (✅ >80%)
# PartsScene.tsx: 83% (✅ >80%)
# PartMesh.tsx: 87% (✅ >85%)
# FiltersSidebar.tsx: 92% (✅ >90%)
# partsStore.ts: 81% (✅ >80%)
```

---

## 9. TDD Development Strategy

### Phase 1: RED (Failing Tests)
```bash
# Create 5 test suite files with ALL 21 tests
# Each test must FAIL with clear assertion errors
# Example expected failure:
# ❌ Dashboard renders Canvas + Sidebar when parts exist
#    Expected element with testid='canvas' to be in document
#    Received: null (Canvas3D integration not verified)
```

**Exit Criteria:** 21/21 tests FAILING, grouped by suite, clear failure messages

---

### Phase 2: GREEN (Minimal Integration Fixes)
Most components already work individually. This phase focuses on:
1. **Verify store integration** (setState calls propagate correctly)
2. **Fix missing handlers** (e.g., ESC key listener might need DOM attachment)
3. **Debug mock issues** (Three.js mocks might need tweaks for integration scenarios)
4. **URL sync verification** (useURLFilters hook behavior under test conditions)

**Exit Criteria:** 21/21 tests PASSING

---

### Phase 3: REFACTOR (Extract Patterns)
- Extract common test utilities (e.g., `renderDashboardWithParts()` helper)
- Consolidate fixture data into `parts.fixtures.ts`
- Document performance test protocol in detail
- Update Memory Bank with integration testing patterns

**Exit Criteria:** Code clean, no duplication, tests <30s total runtime

---

## 10. Performance Test Protocol (Manual)

### Test 20: FPS During Interaction

**Prerequisites:**
- Dev environment running (`make front-dev`)
- Database seeded with 150 real parts (`npm run seed:parts -- --count=150`)
- Chrome browser (for consistent DevTools)

**Steps:**
1. Navigate to `http://localhost:5173/dashboard`
2. Wait for all parts to load (LoadingOverlay disappears)
3. Open Chrome DevTools → Performance tab
4. Click "Record" (red circle button)
5. Execute interaction sequence:
   - **0-10s:** No interaction (rest state)
   - **10-20s:** Rotate camera with mouse drag (orbit controls)
   - **20-30s:** Zoom in/out with scroll wheel
6. Stop recording
7. Analyze results:
   - Expand "Main" track → verify FPS graph
   - Check for long tasks (yellow/red bars >50ms)
   - Calculate average FPS from timeline

**Success Criteria:**
- ✅ Average FPS >30 (target: 60 from POC)
- ✅ No long tasks >50ms
- ✅ No dropped frames >10%
- ✅ Smooth camera transitions (no jank)

**Documentation:**
Screenshot of DevTools Performance tab with:
- FPS graph highlighted
- Long tasks section (should be empty)
- Summary statistics (avg FPS, total time)

Save as: `docs/US-005/performance-results/test-20-fps-recording.png`

---

### Test 21: Memory Usage After 2 Minutes

**Prerequisites:**
- Same as Test 20
- Close all other browser tabs (isolate memory usage)

**Steps:**
1. Navigate to `http://localhost:5173/dashboard`
2. Wait for parts to load
3. Open Chrome DevTools → Memory tab
4. Click "Take heap snapshot" → label as "Baseline"
5. Interact for 2 minutes:
   - Rotate camera (30s)
   - Filter by tipologia (20s)
   - Select 5 different parts (30s)
   - Clear filters (10s)
   - Zoom in/out (30s)
6. Click "Take heap snapshot" → label as "After 2 min"
7. Click "Comparison" in top dropdown
8. Analyze delta:
   - Sort by "Size Delta" descending
   - Check for large allocations (>10 MB)
   - Verify no detached DOM nodes accumulating

**Success Criteria:**
- ✅ Baseline snapshot: <200 MB
- ✅ After 2 min snapshot: <500 MB
- ✅ Size delta: <100 MB (no major leaks)
- ✅ Detached DOM nodes: <50 (acceptable for React reconciliation)

**Documentation:**
Screenshot of DevTools Memory tab with:
- Both snapshots visible
- Comparison view showing delta
- Summary statistics (baseline, after, delta)

Save as: `docs/US-005/performance-results/test-21-memory-snapshot.png`

---

## 11. Definition of Done

### Implementation DoD (TDD Phases)

- [ ] **RED Phase:** 21/21 tests written and FAILING with clear assertions
- [ ] **GREEN Phase:** 21/21 tests PASSING with minimal implementation changes
- [ ] **REFACTOR Phase:** Common patterns extracted, code clean, tests <30s runtime

### Testing DoD

- [ ] All integration test suites pass (5 suites, 21 tests total)
- [ ] Coverage targets met:
  - [ ] Dashboard3D.tsx >80%
  - [ ] PartsScene.tsx >80%
  - [ ] PartMesh.tsx >85%
  - [ ] FiltersSidebar.tsx >90%
  - [ ] partsStore.ts >80%
- [ ] Manual performance tests completed and documented:
  - [ ] Test 20 (FPS) results recorded with screenshots
  - [ ] Test 21 (Memory) results recorded with comparison view

### Documentation DoD

- [ ] `PERFORMANCE-TESTING.md` created with detailed protocols
- [ ] `memory-bank/systemPatterns.md` updated with integration testing patterns
- [ ] `memory-bank/activeContext.md` updated (T-0509 moved to Recently Completed)
- [ ] `memory-bank/progress.md` updated with test metrics
- [ ] `docs/09-mvp-backlog.md` ticket marked [DONE] with test counts
- [ ] `prompts.md` updated with TDD phase prompts (#143 RED, #144 GREEN, #145 REFACTOR)

### Quality Gates

- [ ] Zero regressions: All existing 215 frontend tests still pass
- [ ] CI pipeline green: `npm run test` passes in CI environment
- [ ] Code review approved: Integration test patterns peer reviewed
- [ ] Accessibility: No new accessibility violations in tested components

---

## 12. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Three.js mocks incomplete** | High | Medium | Focus tests on state/logic, not visual rendering. Mock only necessary Three.js APIs. |
| **Tests too slow (>30s total)** | Medium | Medium | Use `vi.mock` aggressively, avoid real file I/O, minimize DOM operations. |
| **Coverage <80% due to Three.js branches** | Medium | Low | Add shallow tests for visual branches that can't be mocked (e.g., LOD distance calculations). |
| **Manual performance tests fail on CI** | Low | High | **Expected behavior** — CI doesn't have WebGL. Run manual tests locally only, document results. |
| **Flaky tests due to async store updates** | Medium | Medium | Use `waitFor` with explicit predicates, increase timeout if needed (max 5000ms). |

---

## 13. Next Steps (Handoff to TDD-RED)

This specification is **COMPLETE** and ready for TDD-RED phase.

### Handoff Checklist

✅ **Documentation Read:**
- systemPatterns.md (contract alignment)
- techContext.md (testing stack)
- productContext.md (existing components)
- Existing test files (patterns learned)

✅ **Context Validated:**
- All upstream tickets (T-0504 to T-0508) verified DONE
- 215 existing frontend tests passing (no regressions expected)
- Components integration map defined (7 integration points)

✅ **Test Strategy Defined:**
- 21 test cases specified across 5 suites
- Coverage targets calculated (80-90%)
- Performance protocol documented (manual)
- TDD phases planned (RED → GREEN → REFACTOR)

### Ready for TDD-RED Command

```bash
# Use this snippet to start TDD-RED phase
:tdd-red
```

---

## READY FOR TDD-RED PHASE

**Copy these values for TDD-RED prompt:**

```
=============================================
READY FOR TDD-RED PHASE
=============================================
Ticket ID:       T-0509-TEST-FRONT
Feature name:    3D Dashboard Integration Tests
Component scope: Dashboard3D, PartsScene, PartMesh, FiltersSidebar, partsStore
Test count:      21 tests (5 suites)
Key test cases:
  1. Canvas + Sidebar render when parts exist
  2. Empty state when no parts
  3. Filter updates canvas opacity
  4. URL params sync with filters
  5. Click part opens modal
  6. ESC key closes modal
  7. 150 parts render in <2s

Files to create:
  - src/frontend/src/components/Dashboard/__integration__/Dashboard3D.rendering.test.tsx  (5 tests)
  - src/frontend/src/components/Dashboard/__integration__/Dashboard3D.filters.test.tsx   (5 tests)
  - src/frontend/src/components/Dashboard/__integration__/Dashboard3D.selection.test.tsx (5 tests)
  - src/frontend/src/components/Dashboard/__integration__/Dashboard3D.empty-state.test.tsx (3 tests)
  - src/frontend/src/components/Dashboard/__integration__/Dashboard3D.performance.test.tsx (1 test)
  - src/frontend/src/test/fixtures/parts.fixtures.ts (mock data)
  - docs/US-005/PERFORMANCE-TESTING.md (manual protocol)

Files to modify:
  - src/frontend/vitest.config.ts (add __integration__ paths)

Coverage targets:
  - Dashboard3D: >80%
  - PartMesh: >85%
  - FiltersSidebar: >90%

Expected outcome:
  - 21/21 tests FAILING (RED phase)
  - Clear assertion errors guiding implementation
  - Zero impact on existing 215 tests
=============================================
```

---

**Status:** ✅ ENRICHED SPEC COMPLETE — Ready for TDD-RED Phase  
**Last Updated:** 2026-02-23 10:15  
**Validated By:** AI Assistant (Claude Sonnet 4.5)  
**Next Action:** Team Lead approval → Start TDD-RED with `:tdd-red` command
