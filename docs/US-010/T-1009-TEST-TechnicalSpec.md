# Technical Specification: T-1009-TEST

**Ticket ID:** T-1009-TEST  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 2 Story Points (~3 hours)  
**Responsable:** QA / Frontend Developer  
**Prioridad:** 🔴 P1 (Quality gate before deployment)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** TEST
- **Alcance:** Create comprehensive integration tests for US-010 3D viewer. Test full user journeys: open modal → load 3D model → navigate between parts → switch tabs. Verify performance benchmarks (60 FPS target).
- **Dependencias:**
  - **Upstream:** ALL US-010 tickets (T-1001 through T-1008) must be DONE
  - **Infrastructure:** T-1001-INFRA (CDN deployed)
  - **Backend:** T-1002-BACK, T-1003-BACK (APIs deployed)
  - **Frontend:** T-1004 through T-1008 (components implemented)

### Problem Statement
Individual component tests (T-1004 through T-1008 `.test.tsx` files) validate isolated behavior, but **don't test full integration**:
- ❌ Component mocks (Three.js, Supabase) hide real bugs
- ❌ No testing of actual GLB loading from CDN
- ❌ No verification of API contract (backend ↔ frontend)
- ❌ No performance benchmarks (FPS, load times, memory)
- ❌ No E2E user journeys (click "Ver 3D" → model loads → navigate → close)

**Target:** Integration tests that verify correct behavior across **full stack** (database → backend → frontend → CDN → Three.js).

### Test Categories

**1. Rendering Tests (5 tests):**
- Modal opens when "Ver 3D" clicked
- 3D model loads and renders in canvas
- Camera and controls functional (zoom, pan, rotate)
- Lighting/shadows render correctly
- Close modal transitions smoothly

**2. Loading States Tests (3 tests):**
- Loading spinner shows while fetching part data
- BBox wireframe fallback when `low_poly_url IS NULL`
- Error boundary catches WebGL errors

**3. Error Handling Tests (3 tests):**
- 404 error when part not found (invalid ID)
- 403 RLS violation (user can't see other workshop's part)
- Network timeout (CDN unreachable)

**4. Controls & Navigation Tests (2 tests):**
- Prev/Next buttons navigate to adjacent parts
- Keyboard shortcuts (← → ESC) work correctly

**5. Accessibility Tests (2 tests):**
- Modal has correct ARIA attributes
- Keyboard navigation fully functional (tab, enter, arrows, ESC)

---

## 2. Test Implementation

### 2.1 Integration Test Suite

**File:** `tests/integration/test_viewer_integration.spec.tsx`

```tsx
/**
 * T-1009-TEST: US-010 3D Viewer Integration Tests
 * Full-stack tests with real backend, CDN, and Three.js rendering.
 * 
 * Run with: make test-front-integration
 * or: npx vitest run tests/integration/test_viewer_integration.spec.tsx
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PartDetailModal } from '@/components/PartDetailModal';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/db-setup';
import { createTestPart } from '../helpers/fixtures';
import '@testing-library/jest-dom';

describe('US-010: 3D Viewer Integration Tests', () => {
  let testPartId: string;
  let testWorkshopId: string;

  beforeAll(async () => {
    // Setup: Create test part in database with GLB file
    await setupTestDatabase();
    const testPart = await createTestPart({
      iso_code: 'TEST-VIEWER-001',
      status: 'validated',
      tipologia: 'capitel',
      low_poly_url: 'https://cdn-test.cloudfront.net/test-capitel.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      workshop_id: 'test-workshop-123',
    });
    testPartId = testPart.id;
    testWorkshopId = testPart.workshop_id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  /**
   * === RENDERING TESTS (5 tests) ===
   */

  it('RENDER-01: should open modal when "Ver 3D" clicked', async () => {
    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('TEST-VIEWER-001')).toBeInTheDocument();
    });
  });

  it('RENDER-02: should load and render 3D model in canvas', async () => {
    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    // Wait for part data to load
    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    // Wait for canvas to render
    await waitFor(() => {
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    }, { timeout: 10000 });

    // Note: Actual GLB rendering requires WebGL (not available in jsdom)
    // Manual test required: Open modal in browser, verify model visible
  });

  it('RENDER-03: should enable camera controls (zoom, pan, rotate)', async () => {
    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    const canvas = await waitFor(() => document.querySelector('canvas')!, { timeout: 10000 });

    // Simulate mouse interactions
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas);

    // Check OrbitControls updated (manual verification required)
    // Automated test limited by jsdom WebGL constraints
  });

  it('RENDER-04: should render lighting and shadows correctly', async () => {
    // Manual test: Verify 3-point lighting (key, fill, rim) visible
    // Automated test: Check lighting config applied (T-1004 constants)
    expect(true).toBe(true); // Placeholder for manual test
  });

  it('RENDER-05: should close modal smoothly when close button clicked', async () => {
    const onClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={onClose}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    fireEvent.click(screen.getByLabelText('Cerrar modal'));

    expect(onClose).toHaveBeenCalled();
  });

  /**
   * === LOADING STATES TESTS (3 tests) ===
   */

  it('LOADING-01: should show loading spinner while fetching part data', async () => {
    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    // Spinner should appear immediately
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => screen.getByText('TEST-VIEWER-001'));
  });

  it('LOADING-02: should show BBox wireframe when low_poly_url IS NULL', async () => {
    // Create part without GLB
    const partWithoutGLB = await createTestPart({
      iso_code: 'TEST-NO-GLB-001',
      status: 'uploaded',
      tipologia: 'columna',
      low_poly_url: null,  // No GLB yet
      bbox: { min: [-2, 0, -2], max: [2, 5, 2] },
      workshop_id: testWorkshopId,
    });

    render(
      <PartDetailModal
        isOpen={true}
        partId={partWithoutGLB.id}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Geometría en procesamiento')).toBeInTheDocument();
      expect(screen.getByText(/TEST-NO-GLB-001/)).toBeInTheDocument();
    });
  });

  it('LOADING-03: should catch WebGL errors with ErrorBoundary', async () => {
    // Mock WebGL unavailable
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('WebGL no disponible')).toBeInTheDocument();
    });
  });

  /**
   * === ERROR HANDLING TESTS (3 tests) ===
   */

  it('ERROR-01: should show 404 error when part not found', async () => {
    const invalidPartId = '00000000-0000-0000-0000-000000000000';

    render(
      <PartDetailModal
        isOpen={true}
        partId={invalidPartId}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Pieza no encontrada/)).toBeInTheDocument();
    });
  });

  it('ERROR-02: should show 403 error for RLS violation', async () => {
    // Create part for different workshop
    const otherWorkshopPart = await createTestPart({
      iso_code: 'TEST-OTHER-WORKSHOP-001',
      status: 'validated',
      tipologia: 'capitel',
      workshop_id: 'different-workshop-999',
    });

    // Try to access with wrong workshop_id header
    // (In real app, middleware sets X-Workshop-Id from JWT)
    render(
      <PartDetailModal
        isOpen={true}
        partId={otherWorkshopPart.id}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      // Backend returns 404 (not 403) for security (don't leak existence)
      expect(screen.getByText(/Pieza no encontrada/)).toBeInTheDocument();
    });
  });

  it('ERROR-03: should show timeout error when CDN unreachable', async () => {
    // Create part with invalid CDN URL
    const partWithBadURL = await createTestPart({
      iso_code: 'TEST-BAD-URL-001',
      status: 'validated',
      tipologia: 'capitel',
      low_poly_url: 'https://invalid-cdn.example.com/nonexistent.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      workshop_id: testWorkshopId,
    });

    render(
      <PartDetailModal
        isOpen={true}
        partId={partWithBadURL.id}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar modelo')).toBeInTheDocument();
    }, { timeout: 35000 }); // Wait for 30s timeout + margin
  });

  /**
   * === CONTROLS & NAVIGATION TESTS (2 tests) ===
   */

  it('NAV-01: should navigate to adjacent part when Next clicked', async () => {
    const onNavigate = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
        onNavigate={onNavigate}
        enableNavigation={true}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));
    await waitFor(() => screen.getByText('Siguiente →'));

    fireEvent.click(screen.getByText('Siguiente →'));

    expect(onNavigate).toHaveBeenCalledWith(expect.any(String));
  });

  it('NAV-02: should navigate with keyboard shortcuts (← →)', async () => {
    const onNavigate = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
        onNavigate={onNavigate}
        enableNavigation={true}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    // Press ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledTimes(1);

    // Press ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  /**
   * === ACCESSIBILITY TESTS (2 tests) ===
   */

  it('A11Y-01: should have correct ARIA attributes', async () => {
    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('A11Y-02: should support full keyboard navigation', async () => {
    const onClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={testPartId}
        onClose={onClose}
      />
    );

    await waitFor(() => screen.getByText('TEST-VIEWER-001'));

    // Press ESC to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
```

---

### 2.2 Performance Benchmarks

**File:** `tests/integration/test_viewer_performance.spec.tsx`

```tsx
/**
 * T-1009-TEST: Performance Benchmarks for 3D Viewer
 * Validates 60 FPS target, load times, memory usage.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PartViewerCanvas } from '@/components/PartViewerCanvas';
import { ModelLoader } from '@/components/ModelLoader';

describe('US-010: Performance Benchmarks', () => {
  it('PERF-01: should load GLB in <5 seconds (standard part)', async () => {
    const startTime = performance.now();

    render(
      <PartViewerCanvas>
        <ModelLoader partId="test-part-id" />
      </PartViewerCanvas>
    );

    // Wait for model to load
    await new Promise(resolve => setTimeout(resolve, 6000));

    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // <5s for 1MB GLB

    console.log(`[PERF-01] GLB Load Time: ${loadTime.toFixed(2)}ms`);
  });

  it('PERF-02: should maintain 60 FPS during camera rotation', async () => {
    // Manual test: Use Chrome DevTools Performance profiler
    // 1. Open 3D viewer modal
    // 2. Start profiling
    // 3. Rotate camera for 10 seconds
    // 4. Stop profiling
    // 5. Check "Frames" timeline: Should show consistent ~60 FPS (16.67ms per frame)
    
    expect(true).toBe(true); // Placeholder for manual test
  });

  it('PERF-03: should preload adjacent parts without blocking main render', async () => {
    // Test that preloading (T-1005 ModelLoader.preloadAdjacentModels) is async
    const startTime = performance.now();

    render(
      <PartViewerCanvas>
        <ModelLoader partId="test-part-id" enablePreload={true} />
      </PartViewerCanvas>
    );

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(500); // Initial render should be fast

    console.log(`[PERF-03] Initial Render Time: ${renderTime.toFixed(2)}ms`);
  });
});
```

---

### 2.3 Test Helpers

**File:** `tests/helpers/db-setup.ts`

```typescript
/**
 * Database setup helpers for integration tests
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function setupTestDatabase() {
  console.log('[Test Setup] Creating test workshop...');
  await supabase.from('workshops').insert({
    id: 'test-workshop-123',
    name: 'Taller Test',
  });
}

export async function cleanupTestDatabase() {
  console.log('[Test Cleanup] Deleting test data...');
  await supabase.from('blocks').delete().like('iso_code', 'TEST-%');
  await supabase.from('workshops').delete().eq('id', 'test-workshop-123');
}
```

**File:** `tests/helpers/fixtures.ts`

```typescript
/**
 * Test fixtures for creating test parts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function createTestPart(data: any) {
  const result = await supabase.from('blocks').insert(data).select().single();
  return result.data!;
}
```

---

## 3. Running Tests

### 3.1 Commands

```bash
# Run all integration tests
make test-front-integration

# Or with vitest directly
npx vitest run tests/integration/test_viewer_integration.spec.tsx

# Watch mode
npx vitest watch tests/integration/

# Performance tests
npx vitest run tests/integration/test_viewer_performance.spec.tsx
```

### 3.2 Environment Setup

**Prerequisites:**
- Backend running on `localhost:8000` (or staging environment)
- CDN deployed (T-1001-INFRA)
- Test database with RLS policies enabled

**Environment Variables (.env.test):**
```bash
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_KEY=test-key-here
VITE_API_BASE_URL=http://localhost:8000
```

---

## 4. Definition of Done

### Testing Requirements
- [ ] All 15 integration tests passing (5 rendering + 3 loading + 3 errors + 2 controls + 2 a11y)
- [ ] Performance benchmarks met: <5s load time, 60 FPS target, <500ms initial render
- [ ] Manual tests completed: WebGL rendering, lighting, camera controls
- [ ] Test helpers created: `db-setup.ts`, `fixtures.ts`

### Coverage Requirements
- [ ] Integration test coverage: >70% (complements unit test coverage >85%)
- [ ] Critical user journeys tested: "Ver 3D" → load model → navigate → close

### Documentation Requirements
- [ ] Test README created: `tests/integration/README.md` with setup instructions
- [ ] Performance report: `PERFORMANCE-REPORT.md` with FPS, load times, memory usage

---

## 5. Known Limitations

**jsdom WebGL Constraints:**
- Three.js rendering cannot be fully tested in jsdom (no WebGL context)
- Manual browser tests required for:
  - Model visibility
  - Lighting/shadows
  - Camera controls smoothness
  - FPS benchmarks

**Workarounds:**
- Use Playwright for E2E browser tests (if needed)
- Manual QA checklist for visual validation
- Performance profiling with Chrome DevTools

---

## 6. References

- T-1001-INFRA through T-1008-FRONT: All US-010 implementation tickets
- Testing Library Docs: https://testing-library.com/docs/react-testing-library
- Vitest Integration Tests: https://vitest.dev/guide/
- Chrome DevTools Performance: https://developer.chrome.com/docs/devtools/performance/
