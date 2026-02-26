# Technical Specification: T-1009-TEST-FRONT

**Ticket ID:** T-1009-TEST-FRONT  
**User Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 5 (2026-02-25)  
**Estimación:** 2 Story Points  
**Status:** 🟢 **ENRICHED - READY FOR TDD-RED**  
**Last Updated:** 2026-02-25 23:59

---

## 1. Ticket Summary

- **Tipo:** TEST-FRONT (Integration Testing)
- **Alcance:** Create comprehensive integration tests for US-010 3D Viewer. Verify full user journeys: Dashboard3D → click part → PartDetailModal opens → ModelLoader fetches data → 3D viewer renders → navigate between parts → switch tabs (3D Viewer/Metadata) → ESC close. Validate performance benchmarks (FPS, memory, load times). **No implementation code**, only integration test suites.
- **Dependencias:**
  - **🚨 CRITICAL UPSTREAM:** ALL US-010 tickets (T-1001 through T-1008) must be ✅ DONE
  - **Infrastructure:** T-1001-INFRA (CDN presigned URLs)
  - **Backend:** T-1002-BACK (GET /api/parts/{id}), T-1003-BACK (GET /api/parts/{id}/navigation)
  - **Frontend Components:** T-1004-FRONT (PartViewerCanvas), T-1005-FRONT (ModelLoader), T-1006-FRONT (ViewerErrorBoundary), T-1007-FRONT (PartDetailModal tabs/navigation), T-1008-FRONT (PartMetadataPanel)

### Problem Statement

Individual component tests (T-1004 through T-1008 `.test.tsx` files with 109/109 passing) validate isolated behavior with mocks, but **don't test full integration across the stack**:

❌ **Gaps in Current Testing:**
- Component mocks (Three.js, @react-three/drei, Supabase) hide real integration bugs
- No testing of actual API calls to backend (T-1002/T-1003)
- No verification of API contract alignment (12-field PartDetail interface)
- No testing of tab switching flow (3D Viewer ↔ Metadata ↔ Navigation)
- No verification of keyboard shortcuts (ESC, ←, →) across components
- No performance benchmarks (FPS, load times, memory usage)
- No E2E user journeys (click "Ver 3D" → model loads → navigate → close)

✅ **Target:** Integration test suites that verify correct behavior across **component boundaries** (Dashboard3D → PartDetailModal → ModelLoader → PartViewerCanvas → PartMetadataPanel → Navigation hooks).

---

## 2. Data Structures & Contracts

### Backend Schema (Already Implemented)

**No new backend code required.** This ticket consumes existing APIs:

```python
# src/backend/schemas.py (already exists - T-1002-BACK)
class PartDetail(BaseModel):
    """12-field response schema for part detail endpoint"""
    id: str
    iso_code: str
    status: BlockStatus
    tipologia: Tipologia
    created_at: datetime
    low_poly_url: Optional[HttpUrl]
    bbox: Optional[BoundingBox]
    workshop_id: Optional[str]
    workshop_name: Optional[str]
    validation_report: Optional[ValidationReport]
    glb_size_bytes: Optional[int]
    triangle_count: Optional[int]

class NavigationResponse(BaseModel):
    """Response schema for part navigation endpoint (T-1003-BACK)"""
    prev_id: Optional[str]
    next_id: Optional[str]
    current_index: int
    total_count: int
```

### Frontend Types (Already Implemented)

**No new types required.** Tests will import existing interfaces:

```typescript
// src/frontend/src/types/parts.ts (already exists - T-1002-BACK, T-1007-FRONT)
export interface PartDetail {
  id: string;
  iso_code: string;
  status: BlockStatus;
  tipologia: Tipologia;
  created_at: string;
  low_poly_url?: string;
  bbox?: BoundingBox;
  workshop_id?: string;
  workshop_name?: string;
  validation_report?: ValidationReport | null;
  glb_size_bytes?: number;
  triangle_count?: number;
}

export interface NavigationResponse {
  prev_id?: string;
  next_id?: string;
  current_index: number;
  total_count: number;
}
```

### Test Fixtures (NEW - To Create)

```typescript
// tests/integration/fixtures/viewer.fixtures.ts
export const MOCK_PART_DETAIL: PartDetail = {
  id: 'test-part-001',
  iso_code: 'SF-C12-D-001',
  status: 'validated',
  tipologia: 'capitel',
  created_at: '2026-02-15T10:00:00Z',
  low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
  bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
  validation_report: null,
  glb_size_bytes: 1024,
  triangle_count: 500,
};

export const MOCK_NAVIGATION: NavigationResponse = {
  prev_id: 'test-part-000',
  next_id: 'test-part-002',
  current_index: 1,
  total_count: 50,
};

export const MOCK_PART_PROCESSING: PartDetail = {
  ...MOCK_PART_DETAIL,
  id: 'test-part-processing',
  iso_code: 'SF-C12-D-002',
  low_poly_url: undefined, // Simulates processing state
  status: 'uploaded',
};

export const MOCK_PART_ERROR: PartDetail = {
  ...MOCK_PART_DETAIL,
  id: 'test-part-error',
  iso_code: 'SF-C12-D-003',
  low_poly_url: 'https://cdn.cloudfront.net/invalid.glb', // 404 URL
};
```

### Database Changes

**No database changes required.** Tests will use existing `blocks` table schema from T-020-DB.

---

## 3. API Interface

### Existing Endpoints (Integration Points)

**Endpoint 1: Get Part Detail** (T-1002-BACK)
- **Method:** `GET /api/parts/{id}`
- **Auth:** Required (JWT - future US-013, currently service role)
- **Response 200:**
  ```json
  {
    "id": "test-part-001",
    "iso_code": "SF-C12-D-001",
    "status": "validated",
    "tipologia": "capitel",
    "created_at": "2026-02-15T10:00:00Z",
    "low_poly_url": "https://cdn.cloudfront.net/low-poly/test.glb",
    "bbox": { "min": [-1, 0, -1], "max": [1, 2, 1] },
    "workshop_id": "workshop-123",
    "workshop_name": "Taller Granollers",
    "validation_report": null,
    "glb_size_bytes": 1024,
    "triangle_count": 500
  }
  ```
- **Response 404:**
  ```json
  { "detail": "Part not found" }
  ```

**Endpoint 2: Get Part Navigation** (T-1003-BACK)
- **Method:** `GET /api/parts/{id}/navigation`
- **Auth:** Required
- **Response 200:**
  ```json
  {
    "prev_id": "test-part-000",
    "next_id": "test-part-002",
    "current_index": 1,
    "total_count": 50
  }
  ```

---

## 4. Component Integration Contracts

### Components Under Test (Already Implemented)

**No new components created.** Tests verify integration between:

1. **Dashboard3D** → **PartDetailModal**
   - Props: `isOpen`, `partId`, `onClose`
   - Contract: Dashboard passes valid `partId` from parts list

2. **PartDetailModal** → **usePartDetail** hook
   - Contract: Modal fetches part data via `getPartDetail(partId)`
   - Loading states: Shows spinner, handles errors

3. **PartDetailModal** → **ModelLoader** (Tab 1)
   - Props: `partId`
   - Contract: Passes same `partId`, ModelLoader fetches own data

4. **ModelLoader** → **PartViewerCanvas**
   - Props: `children` (3D model scene)
   - Contract: ModelLoader wraps model in PartViewerCanvas

5. **ModelLoader** → **ViewerErrorBoundary**
   - Contract: ViewerErrorBoundary wraps entire viewer, catches Three.js/WebGL errors

6. **PartDetailModal** → **PartMetadataPanel** (Tab 2)
   - Props: `partDetail` (12-field PartDetail object)
   - Contract: Modal passes fetched data to metadata panel

7. **PartDetailModal** → **usePartNavigation** hook
   - Contract: Navigation controls (Prev/Next) fetch adjacent part IDs via T-1003-BACK API

### Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard3D (US-005)                                    │
│  • User clicks part in 3D scene                         │
│  • Calls selectPart(id) → opens PartDetailModal         │
└──────────────────┬──────────────────────────────────────┘
                   │ partId
                   ▼
┌─────────────────────────────────────────────────────────┐
│ PartDetailModal (T-1007-FRONT)                          │
│  • usePartDetail(partId) → GET /api/parts/{id}          │
│  • usePartNavigation(partId) → GET /api/parts/{id}/nav  │
│  • Tab system (3D Viewer | Metadata | Navigation)       │
└─────┬──────────────────────────────────────────────┬────┘
      │ Tab 1: 3D Viewer                             │ Tab 2: Metadata
      ▼                                              ▼
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│ ModelLoader (T-1005-FRONT)      │  │ PartMetadataPanel            │
│  • Fetches PartDetail           │  │  (T-1008-FRONT)              │
│  • Loads GLB via useGLTF        │  │  • Displays 12 fields        │
│  • Fallback: BBoxProxy/Error    │  │  • 4 collapsible sections    │
└──────┬──────────────────────────┘  └──────────────────────────────┘
       │ Wraps with:
       ▼
┌─────────────────────────────────┐
│ ViewerErrorBoundary              │
│  (T-1006-FRONT)                  │
│  • Catches WebGL errors          │
│  • Fallback UI + retry           │
└──────┬──────────────────────────┘
       │ Renders in:
       ▼
┌─────────────────────────────────┐
│ PartViewerCanvas                 │
│  (T-1004-FRONT)                  │
│  • Three.js <Canvas>             │
│  • OrbitControls + Camera        │
│  • 3-point lighting              │
└─────────────────────────────────┘
```

---

## 5. Test Cases Checklist

### 5.1 Happy Path - Core User Journeys (8 tests)

- [ ] **HP-INT-01:** Click part in Dashboard3D → PartDetailModal opens with correct partId → ModelLoader fetches data → 3D model renders in PartViewerCanvas
- [ ] **HP-INT-02:** Modal loads with "3D Viewer" tab active by default → GLB loads successfully → OrbitControls functional (simulated mouse drag)
- [ ] **HP-INT-03:** Click "Metadata" tab → PartMetadataPanel displays 12 fields correctly → All sections collapsible → status badge correct color
- [ ] **HP-INT-04:** Click "Prev" button → Modal fetches prev_id from navigation API → ModelLoader reloads with new partId → 3D viewer updates
- [ ] **HP-INT-05:** Click "Next" button → Modal fetches next_id from navigation API → ModelLoader reloads → 3D viewer updates
- [ ] **HP-INT-06:** Press ESC key → Modal closes → useBodyScrollLock releases body → Dashboard3D deselects part
- [ ] **HP-INT-07:** Click backdrop (outside modal) → Modal closes → parts list visible again
- [ ] **HP-INT-08:** Close button (×) → Modal closes → Animation smooth (Portal unmounts)

### 5.2 Edge Cases - Loading & Fallbacks (5 tests)

- [ ] **EC-INT-01:** Part with `low_poly_url = NULL` (processing state) → ModelLoader shows ProcessingFallback → BBoxProxy wireframe renders → "Geometría en procesamiento" message visible
- [ ] **EC-INT-02:** Part with missing bbox (null) → BBoxProxy uses default FALLBACK_BBOX → Proportions correct (2:5:2 x:y:z)
- [ ] **EC-INT-03:** Part with validation_report errors → Metadata tab displays errors correctly → Red badge "invalidated" shown
- [ ] **EC-INT-04:** Navigation at first part (current_index = 0) → "Prev" button disabled → "Next" button enabled
- [ ] **EC-INT-05:** Navigation at last part (current_index = total_count - 1) → "Next" button disabled → "Prev" button enabled

### 5.3 Error Handling - API & WebGL Failures (5 tests)

- [ ] **ERR-INT-01:** Invalid partId (404 from backend) → ModelLoader shows ErrorFallback → "No se pudo cargar la pieza" message → Retry button visible
- [ ] **ERR-INT-02:** Network timeout (API unreachable) → Loading spinner shows for 5 seconds → Error fallback displays → Retry button functional
- [ ] **ERR-INT-03:** WebGL unavailable (simulated with getContext mock) → ViewerErrorBoundary catches error → "WebGL no disponible" message → Close button visible
- [ ] **ERR-INT-04:** GLB load error (404 from CDN) → useGLTF throws → ViewerErrorBoundary catches → Technical error details collapsible
- [ ] **ERR-INT-05:** Corrupted GLB file (invalid Three.js scene) → Error boundary catches → ErrorFallback with BBoxProxy shown

### 5.4 Performance & Accessibility (4 tests)

- [ ] **PERF-INT-01:** Initial modal open → Part data fetched in <500ms → 3D model visible in <2s → No memory leaks (cleanup verified)
- [ ] **PERF-INT-02:** Switch between tabs 10 times → No performance degradation → Frame rate stable (no drops)
- [ ] **A11Y-INT-01:** Modal has ARIA attributes (role="dialog", aria-labelledby, aria-describedby) → Screen reader announces modal title
- [ ] **A11Y-INT-02:** Tab key navigation → Focus moves through tabs → Next/Prev buttons → Close button → Focus trap active (cannot tab outside modal)

### 5.5 Integration with Existing Tests (2 tests)

- [ ] **REG-INT-01:** Run all existing unit tests (368/368 from T-0509) → All PASS → Zero regressions from integration test setup
- [ ] **REG-INT-02:** Run all backend tests (23/23 from T-1002 + 22/22 from T-1003) → All PASS → Backend unchanged by frontend tests

---

## 6. Files to Create/Modify

### Create (4 new test files)

- `tests/integration/viewer-integration.test.tsx` (300 lines, 8 happy path tests)
- `tests/integration/viewer-edge-cases.test.tsx` (250 lines, 5 edge case tests)
- `tests/integration/viewer-error-handling.test.tsx` (280 lines, 5 error tests)
- `tests/integration/viewer-performance.test.tsx` (200 lines, 2 perf + 2 a11y tests)
- `tests/integration/fixtures/viewer.fixtures.ts` (150 lines, mock data + helper functions)
- `tests/integration/helpers/setupMockServer.ts` (120 lines, MSW server configuration)
- `tests/integration/helpers/test-helpers.ts` (80 lines, shared utilities - extend existing from T-0509)

### Modify (3 existing files)

- `vitest.config.ts` → Add integration test path (`tests/integration/**/*.test.tsx`)
- `package.json` → Add script `"test:integration": "vitest run tests/integration"`
- `tests/integration/README.md` → Create documentation for running integration tests

---

## 7. Reusable Components/Patterns

### From T-0509-TEST-FRONT (Dashboard3D integration tests)
- **Pattern:** `setupStoreMock(storeState)` helper for Zustand stores
- **Reuse:** Use same pattern for mocking `usePartsStore` in integration tests
- **Location:** `tests/integration/helpers/test-helpers.ts` (already exists, extend)

### From T-1005/T-1006/T-1007 Tests (Component unit tests)
- **Pattern:** Mock `@react-three/fiber` and `@react-three/drei` with DOM elements
- **Reuse:** Same mocks needed for integration tests (avoid WebGL dependency)
- **Location:** `tests/setup.ts` (already configured globally)

### From T-1002/T-1003 Backend Tests
- **Pattern:** `cleanup_test_blocks_by_pattern()` helper for database cleanup
- **Reuse:** Use same pattern for cleaning up fixtures after integration tests
- **Location:** `tests/helpers.py` (backend - not needed in frontend tests, but good reference)

### New Pattern: MSW (Mock Service Worker)
- **Purpose:** Mock backend API responses (`GET /api/parts/{id}`, `GET /api/parts/{id}/navigation`) without real backend
- **Library:** `msw` (already installed? Check `package.json`)
- **Implementation:**
  ```typescript
  // tests/integration/helpers/setupMockServer.ts
  import { setupServer } from 'msw/node';
  import { http, HttpResponse } from 'msw';
  import { MOCK_PART_DETAIL } from '../fixtures/viewer.fixtures';

  export const handlers = [
    http.get('/api/parts/:id', ({ params }) => {
      const { id } = params;
      if (id === 'test-part-001') {
        return HttpResponse.json(MOCK_PART_DETAIL);
      }
      return HttpResponse.json({ detail: 'Part not found' }, { status: 404 });
    }),

    http.get('/api/parts/:id/navigation', ({ params }) => {
      return HttpResponse.json({
        prev_id: 'test-part-000',
        next_id: 'test-part-002',
        current_index: 1,
        total_count: 50,
      });
    }),
  ];

  export const server = setupServer(...handlers);
  ```

---

## 8. Next Steps

This spec is ready for **TDD-Red Phase**. Use the workflow prompt `:tdd-red` with the following handoff data:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-1009-TEST-FRONT
Feature name:    3D Viewer Integration Tests
Type:            Integration Testing (no implementation)
Key test cases:  
  1. HP-INT-01: Dashboard → Modal → ModelLoader → 3D renders
  2. EC-INT-01: Processing state → BBoxProxy fallback
  3. ERR-INT-01: 404 error → ErrorFallback
  4. PERF-INT-01: <2s load time, no memory leaks

Files to create:
  - tests/integration/viewer-integration.test.tsx (8 happy path tests)
  - tests/integration/viewer-edge-cases.test.tsx (5 edge case tests)
  - tests/integration/viewer-error-handling.test.tsx (5 error tests)
  - tests/integration/viewer-performance.test.tsx (4 perf/a11y tests)
  - tests/integration/fixtures/viewer.fixtures.ts (mock data)
  - tests/integration/helpers/setupMockServer.ts (MSW config)

Dependencies verified:
  ✅ T-1001-INFRA (CDN deployed)
  ✅ T-1002-BACK (GET /api/parts/{id} - 23/23 tests PASS)
  ✅ T-1003-BACK (GET /api/parts/{id}/navigation - 22/22 tests PASS)
  ✅ T-1004-FRONT (PartViewerCanvas - 8/8 tests PASS)
  ✅ T-1005-FRONT (ModelLoader - 10/10 tests PASS)
  ✅ T-1006-FRONT (ViewerErrorBoundary - 10/10 tests PASS)
  ✅ T-1007-FRONT (PartDetailModal - 31/31 tests PASS)
  ✅ T-1008-FRONT (PartMetadataPanel - 15/15 tests PASS)

Total tests to write: 22 integration tests
Expected duration: ~3 hours (TDD-Red + TDD-Green + Refactor)
=============================================
```

---

## 9. Manual Performance Testing Protocol

**Note:** Some tests cannot be automated in jsdom (WebGL/Three.js limitations). Manual testing protocol required:

### 9.1 Performance Benchmarks

**Test Environment:**
- Browser: Chrome 120+ (GPU acceleration enabled)
- Device: Laptop with decent GPU (MacBook Pro / equivalent)
- Network: Throttled to "Fast 3G" (Chrome DevTools)

**Metrics to Measure:**

1. **Initial Load Time** (<2s target)
   - Open DevTools → Performance tab → Record
   - Click "Ver 3D" button
   - Stop recording when 3D model visible
   - Measure: Time from click → First Contentful Paint of 3D model

2. **Frame Rate** (>30 FPS target, 60 FPS ideal)
   - Open DevTools → Performance tab → Check "Screenshots"
   - Record while rotating model (10 seconds)
   - Verify: Avg FPS ≥ 30, no dropped frames

3. **Memory Usage** (<300MB target)
   - Open DevTools → Memory tab → Take heap snapshot
   - Open modal → Load model → Close modal
   - Take second snapshot → Compare
   - Verify: Memory released after modal close (no leaks)

### 9.2 Visual Validation Checklist

- [ ] **Lighting:** 3-point lighting visible (key light top-left, fill light right, rim light back)
- [ ] **Shadows:** Soft shadows on ground plane
- [ ] **Camera:** Smooth camera rotation (no jitter)
- [ ] **Model:** Geometry recognizable (capitel/columna structure clear)
- [ ] **Colors:** Status colors match spec (validated = blue, invalidated = red)

### 9.3 Recording Results

Results will be documented in:
- `docs/US-010/PERFORMANCE-TESTING.md` (already exists from T-0509)
- Update with US-010 integration test results
- Add screenshots of DevTools Performance panel
- Record actual FPS, load times, memory usage

---

## 10. Known Limitations & Workarounds

### 10.1 jsdom WebGL Constraints

**Limitation:** Three.js rendering cannot be fully tested in jsdom (no WebGL context).

**Impact:**
- ❌ Cannot verify actual 3D model visibility
- ❌ Cannot test lighting/shadows rendering
- ❌ Cannot measure real FPS
- ❌ Cannot test OrbitControls mouse interactions

**Workaround:**
- ✅ Mock `@react-three/fiber` and `@react-three/drei` with DOM elements (already done in `tests/setup.ts`)
- ✅ Test component structure (Canvas exists, correct props passed)
- ✅ Test API integration (data fetching, state updates)
- ✅ Manual browser tests for visual validation (Section 9)
- ✅ Consider Playwright E2E tests in future (beyond MVP scope)

### 10.2 MSW Library Dependency

**Check:** Verify `msw` is installed:
```bash
cd src/frontend
npm list msw
```

**If not installed:**
```bash
npm install --save-dev msw
```

**Version:** `msw@2.0.0` or higher (supports http.get syntax)

### 10.3 Test Isolation

**Challenge:** Integration tests modify global state (Zustand store, modal open state).

**Mitigation:**
- Use `beforeEach()` to reset Zustand stores (call `usePartsStore.getState().reset()`)
- Use `afterEach()` to cleanup (call `cleanup()` from Testing Library)
- Run integration tests in separate file (avoid conflicts with unit tests)

---

## 11. References & Documentation

### Implementation References
- **T-1001-INFRA:** CDN presigned URL implementation
- **T-1002-BACK:** GET /api/parts/{id} endpoint (23/23 tests ✅)
- **T-1003-BACK:** GET /api/parts/{id}/navigation endpoint (22/22 tests ✅)
- **T-1004-FRONT:** PartViewerCanvas component (8/8 tests ✅)
- **T-1005-FRONT:** ModelLoader component (10/10 tests ✅)
- **T-1006-FRONT:** ViewerErrorBoundary component (10/10 tests ✅)
- **T-1007-FRONT:** PartDetailModal integration (31/31 tests ✅)
- **T-1008-FRONT:** PartMetadataPanel component (15/15 tests ✅)

### Testing Documentation
- **Vitest Integration Tests:** https://vitest.dev/guide/
- **Testing Library React:** https://testing-library.com/docs/react-testing-library/intro/
- **MSW (Mock Service Worker):** https://mswjs.io/docs/
- **Testing Library User Event:** https://testing-library.com/docs/user-event/intro/

### Performance Testing
- **Chrome DevTools Performance:** https://developer.chrome.com/docs/devtools/performance/
- **Web.dev Performance:** https://web.dev/performance/
- **Three.js Performance Tips:** https://threejs.org/manual/#en/optimize-lots-of-objects

---

## 12. Success Criteria (Definition of Done)

### Testing Requirements ✅
- [ ] All 22 integration tests passing (8 HP + 5 EC + 5 ERR + 4 PERF/A11Y)
- [ ] MSW server configured and mocking 2 backend endpoints
- [ ] Test fixtures created (5 mock PartDetail objects)
- [ ] Test helpers extended (setupStoreMock, setupMockServer)
- [ ] Zero regressions: 368/368 existing frontend tests still PASS

### Coverage Requirements ✅
- [ ] Integration test coverage: >70% code paths (complements unit test >85%)
- [ ] Critical user journeys tested:
  - Dashboard → Modal → 3D Viewer (full flow)
  - Tab switching (3D ↔ Metadata ↔ Navigation)
  - Error handling (404, WebGL, GLB load fail)
  - Performance (load time, memory, FPS)

### Documentation Requirements ✅
- [ ] Test README updated: `tests/integration/README.md` with setup instructions
- [ ] Performance report updated: `docs/US-010/PERFORMANCE-TESTING.md` with integration test results
- [ ] Backlog updated: T-1009-TEST-FRONT marked [DONE] in `docs/09-mvp-backlog.md`
- [ ] Memory Bank updated: `memory-bank/activeContext.md` reflects ticket completion

### Manual Testing Requirements ✅
- [ ] Performance protocol executed (Section 9)
- [ ] Visual validation checklist completed (Section 9.2)
- [ ] Results documented in PERFORMANCE-TESTING.md
- [ ] Screenshots attached (DevTools Performance panel)

---

## 13. Risk Assessment

### 🟢 Low Risk
- **Unit test coverage:** All components already have 100% passing unit tests
- **API stability:** T-1002/T-1003 backends tested and stable
- **Component interfaces:** Props/types already defined and verified

### 🟡 Medium Risk
- **MSW library:** May need to install `msw` dependency (verify first)
- **Test isolation:** Zustand store state may persist between tests (mitigation: reset in beforeEach)
- **Performance targets:** <2s load time depends on GLB file size (use small test fixture)

### 🔴 High Risk (Mitigated)
- **WebGL testing:** ❌ Cannot fully test in jsdom
  - ✅ **Mitigation:** Manual testing protocol (Section 9) + Playwright E2E in future
- **Three.js mocking:** Complex library with many APIs to mock
  - ✅ **Mitigation:** Already mocked in `tests/setup.ts` (reuse existing patterns)

---

**Last Updated:** 2026-02-25 23:59  
**Next Phase:** TDD-RED (Workflow Step 2/5)  
**Estimated Completion:** 2026-02-26 02:00 (3 hours total for TDD cycle)

---

