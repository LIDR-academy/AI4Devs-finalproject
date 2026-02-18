# T-0509-TEST-FRONT: 3D Dashboard Integration Tests

**Ticket ID:** T-0509-TEST-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 3 Story Points (~6 horas)  
**Responsable:** Frontend QA / Developer  
**Prioridad:** P3 (Quality Gate)

---

## 📋 CONTEXT

### Purpose
Ensure 3D Dashboard components work together correctly:
- Canvas renders when parts available
- Empty state shown when no parts
- Filters update canvas in real-time
- Selection opens modal
- LOD switches at correct distances
- Performance targets met (>30 FPS, <500 MB)

### Testing Stack
- **Vitest**: Test runner (fast, ESM-native)
- **@testing-library/react**: Component testing
- **@testing-library/user-event**: User interactions
- **Mock Three.js**: Heavy to test, use fixtures

---

## 🎯 REQUIREMENTS

### FR-1: Test Coverage Target
**Minimum coverage:**
- Dashboard3D: >80%
- Canvas3D: >70% (Three.js mocked)
- PartsScene: >80%
- PartMesh: >85%
- FiltersSidebar: >90%

**Priority areas:**
- User interactions (clicks, filters)
- State management (Zustand store)
- Conditional rendering (empty state, modal)
- Performance (FPS, memory)

### FR-2: Test Categories
**5 required test suites:**
1. **Rendering Tests**: Components mount without errors
2. **Interaction Tests**: Click events, filters, selection
3. **State Tests**: Zustand store updates correctly
4. **Empty State Tests**: No parts scenario
5. **Performance Tests**: FPS >30, memory <500 MB

### FR-3: Mock Strategy
```tsx
// vitest.setup.ts
import { vi } from 'vitest';

// Mock Three.js Canvas (heavy, don't render in tests)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { distanceTo: vi.fn(() => 10) } },
    gl: { info: { render: { calls: 0 } } },
  }),
}));

// Mock useGLTF (don't load real GLB files)
vi.mock('@react-three/drei', () => ({
  useGLTF: (url: string) => ({
    scene: { 
      clone: () => ({ type: 'Object3D', url }),
    },
  }),
  OrbitControls: () => null,
  Grid: () => null,
  Stats: () => null,
  Lod: ({ children }: any) => <group data-testid="lod">{children}</group>,
}));
```

---

## 🧪 TEST SUITES

### Test Suite 1: Rendering Tests (90 min)
```tsx
// Dashboard3D.render.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/partsStore';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard3D />
    </BrowserRouter>
  );
};

describe('Dashboard3D Rendering', () => {
  beforeEach(() => {
    usePartsStore.setState({ parts: [], selectedId: null });
  });
  
  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
  
  it('renders canvas and sidebar', () => {
    renderDashboard();
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByText(/Filtros/i)).toBeInTheDocument();
  });
  
  it('shows empty state when no parts', () => {
    usePartsStore.setState({ parts: [] });
    renderDashboard();
    
    expect(screen.getByText(/No hay piezas cargadas/i)).toBeInTheDocument();
  });
  
  it('hides empty state when parts exist', () => {
    usePartsStore.setState({ 
      parts: [{ id: '1', iso_code: 'CAP-001', status: 'validated', low_poly_url: 'test.glb' }] 
    });
    renderDashboard();
    
    expect(screen.queryByText(/No hay piezas cargadas/i)).not.toBeInTheDocument();
  });
  
  it('shows loading overlay when isLoading true', () => {
    usePartsStore.setState({ isLoading: true });
    renderDashboard();
    
    expect(screen.getByText(/Cargando piezas/i)).toBeInTheDocument();
  });
  
  it('hides Stats in production mode', () => {
    import.meta.env.MODE = 'production';
    renderDashboard();
    
    // Stats component should not be rendered
    expect(screen.queryByText(/FPS/i)).not.toBeInTheDocument();
  });
});\n```

### Test Suite 2: Interaction Tests (120 min)
```tsx
// Dashboard3D.interaction.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/partsStore';

describe('Dashboard3D Interactions', () => {
  const mockParts = [\n    { id: '1', iso_code: 'CAP-001', status: 'validated', tipologia: 'capitel', low_poly_url: 'test1.glb' },\n    { id: '2', iso_code: 'COL-001', status: 'uploaded', tipologia: 'columna', low_poly_url: 'test2.glb' },\n  ];\n  \n  beforeEach(() => {\n    usePartsStore.setState({ parts: mockParts, selectedId: null });\n  });\n  \n  it('selects part on click', async () => {\n    // Simulate part click through store\n    const { container } = render(<Dashboard3D />);\n    \n    act(() => {\n      usePartsStore.getState().selectPart('1');\n    });\n    \n    await waitFor(() => {\n      expect(usePartsStore.getState().selectedId).toBe('1');\n    });\n  });\n  \n  it('opens modal when part selected', async () => {\n    render(<Dashboard3D />);\n    \n    act(() => {\n      usePartsStore.getState().selectPart('1');\n    });\n    \n    await waitFor(() => {\n      expect(screen.getByRole('dialog')).toBeInTheDocument();\n    });\n  });\n  \n  it('closes modal on ESC key', async () => {\n    usePartsStore.setState({ selectedId: '1' });\n    render(<Dashboard3D />);\n    \n    fireEvent.keyDown(window, { key: 'Escape' });\n    \n    await waitFor(() => {\n      expect(usePartsStore.getState().selectedId).toBeNull();\n    });\n  });\n  \n  it('filters parts by tipologia', async () => {\n    const user = userEvent.setup();\n    render(<Dashboard3D />);\n    \n    const checkbox = screen.getByLabelText('capitel');\n    await user.click(checkbox);\n    \n    const filtered = usePartsStore.getState().filteredParts();\n    expect(filtered).toHaveLength(1);\n    expect(filtered[0].tipologia).toBe('capitel');\n  });\n  \n  it('updates URL when filter changes', async () => {\n    const user = userEvent.setup();\n    render(<Dashboard3D />);\n    \n    const checkbox = screen.getByLabelText('capitel');\n    await user.click(checkbox);\n    \n    await waitFor(() => {\n      expect(window.location.search).toContain('tipologia=capitel');\n    });\n  });\n  \n  it('clears all filters on button click', async () => {\n    const user = userEvent.setup();\n    usePartsStore.setState({ filters: { tipologia: ['capitel'] } });\n    render(<Dashboard3D />);\n    \n    const clearButton = screen.getByText('Limpiar');\n    await user.click(clearButton);\n    \n    expect(usePartsStore.getState().filters.tipologia).toEqual([]);\n  });\n});\n```

### Test Suite 3: State Management Tests (60 min)
```tsx
// partsStore.test.ts
import { renderHook, act } from '@testing-library/react';\nimport { usePartsStore } from './partsStore';\n\nconst mockParts = [\n  { id: '1', tipologia: 'capitel', status: 'validated' },\n  { id: '2', tipologia: 'columna', status: 'uploaded' },\n  { id: '3', tipologia: 'capitel', status: 'uploaded' },\n];\n\ndescribe('partsStore', () => {\n  beforeEach(() => {\n    usePartsStore.setState({ \n      parts: [], \n      filters: { status: [], tipologia: [], workshop_id: null },\n      selectedId: null,\n    });\n  });\n  \n  it('setParts updates parts array', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.setParts(mockParts);\n    });\n    \n    expect(result.current.parts).toHaveLength(3);\n  });\n  \n  it('filteredParts returns all when no filters', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.setParts(mockParts);\n    });\n    \n    expect(result.current.filteredParts()).toHaveLength(3);\n  });\n  \n  it('filteredParts filters by tipologia', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.setParts(mockParts);\n      result.current.setFilters({ tipologia: ['capitel'] });\n    });\n    \n    expect(result.current.filteredParts()).toHaveLength(2);\n  });\n  \n  it('filteredParts combines multiple filters (AND logic)', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.setParts(mockParts);\n      result.current.setFilters({ \n        tipologia: ['capitel'], \n        status: ['validated'] \n      });\n    });\n    \n    expect(result.current.filteredParts()).toHaveLength(1);\n    expect(result.current.filteredParts()[0].id).toBe('1');\n  });\n  \n  it('selectPart updates selectedId', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.selectPart('1');\n    });\n    \n    expect(result.current.selectedId).toBe('1');\n  });\n  \n  it('clearFilters resets all filters', () => {\n    const { result } = renderHook(() => usePartsStore());\n    \n    act(() => {\n      result.current.setFilters({ \n        tipologia: ['capitel'], \n        status: ['validated'],\n        workshop_id: '123'\n      });\n      result.current.clearFilters();\n    });\n    \n    expect(result.current.filters).toEqual({\n      status: [],\n      tipologia: [],\n      workshop_id: null,\n    });\n  });\n});\n```

### Test Suite 4: Empty State Tests (45 min)
```tsx
// EmptyState.test.tsx
import { render, screen } from '@testing-library/react';\nimport EmptyState from './EmptyState';\n\ndescribe('EmptyState', () => {\n  it('renders default message', () => {\n    render(<EmptyState />);\n    \n    expect(screen.getByText(/No hay piezas cargadas/i)).toBeInTheDocument();\n  });\n  \n  it('renders custom message', () => {\n    render(<EmptyState message=\"Sin resultados\" />);\n    \n    expect(screen.getByText('Sin resultados')).toBeInTheDocument();\n  });\n  \n  it('shows icon', () => {\n    const { container } = render(<EmptyState />);\n    \n    const icon = container.querySelector('svg');\n    expect(icon).toBeInTheDocument();\n  });\n});\n```

### Test Suite 5: Performance Tests (Manual) (90 min)
```markdown
## Performance Test Protocol\n\n### Test 1: FPS with 150 Parts\n1. Seed database with 150 parts (seed script)\n2. Start dev server: `npm run dev`\n3. Open Dashboard, wait for load complete\n4. Open DevTools → Performance tab\n5. Record 30 seconds:\n   - 10s at rest (no interaction)\n   - 10s rotating camera\n   - 10s zooming in/out\n6. Verify:\n   - Average FPS >30 (target: 60 from POC)\n   - No long tasks >50ms\n   - No dropped frames >10%\n\n### Test 2: Memory Usage\n1. Open Dashboard with 150 parts\n2. DevTools → Memory → Take Heap Snapshot\n3. Interact for 2 minutes (rotate, zoom, filter, select)\n4. Take second Heap Snapshot\n5. Verify:\n   - Initial memory <200 MB\n   - After 2 min <500 MB\n   - Delta <100 MB (no major leaks)\n\n### Test 3: LOD Switching\n1. Position camera close to part (<20 units)\n2. Open DevTools Console\n3. Add LOD level logging (if not already present)\n4. Zoom out slowly to 100 units\n5. Verify:\n   - Level switch at ~20 units (mid → low)\n   - Level switch at ~50 units (low → bbox)\n   - No flickering or pop-in effects\n\n### Test 4: Filter Performance\n1. Load 150 parts\n2. DevTools → Performance\n3. Record while clicking 5 filter checkboxes rapidly\n4. Verify:\n   - Each filter update <50ms\n   - No janky scrolling or input lag\n   - FPS stays >30 during filtering\n\n### Test 5: Rendering 150 Mocks (Automated)\n```tsx\n// Dashboard3D.performance.test.tsx\nimport { render } from '@testing-library/react';\nimport Dashboard3D from './Dashboard3D';\nimport { usePartsStore } from '@/stores/partsStore';\n\ntest('renders 150 mocks in <2s', () => {\n  const parts = Array.from({ length: 150 }, (_, i) => ({\n    id: `part-${i}`,\n    iso_code: `CAP-${String(i).padStart(3, '0')}`,\n    status: 'validated',\n    tipologia: 'capitel',\n    low_poly_url: `https://example.com/part-${i}.glb`,\n  }));\n  \n  usePartsStore.setState({ parts });\n  \n  const start = performance.now();\n  const { container } = render(<Dashboard3D />);\n  const elapsed = performance.now() - start;\n  \n  expect(container).toBeInTheDocument();\n  expect(elapsed).toBeLessThan(2000); // <2s\n});\n```\n\n---\n\n## ✅ DEFINITION OF DONE\n\n### Acceptance Criteria\n- [ ] **AC-1:** Rendering tests pass (6 tests)\n- [ ] **AC-2:** Interaction tests pass (6 tests)\n- [ ] **AC-3:** State management tests pass (6 tests)\n- [ ] **AC-4:** Empty state tests pass (3 tests)\n- [ ] **AC-5:** Coverage >80% on Dashboard3D\n- [ ] **AC-6:** Coverage >80% on PartsScene\n- [ ] **AC-7:** Coverage >85% on PartMesh\n- [ ] **AC-8:** Coverage >90% on FiltersSidebar\n- [ ] **AC-9:** Performance tests documented (manual protocol)\n- [ ] **AC-10:** All tests run in <30s (`vitest run`)\n\n### Quality Gates\n```bash\n# Run all tests\nnpm run test\n\n# Verify coverage\nnpm run test:coverage\n# Should show:\n# Dashboard3D: >80%\n# PartsScene: >80%\n# PartMesh: >85%\n# FiltersSidebar: >90%\n\n# Run in watch mode (dev)\nnpm run test:watch\n```\n\n---\n\n## 📦 DELIVERABLES\n\n1. ✅ Test suite: `Dashboard3D.render.test.tsx` (6 tests)\n2. ✅ Test suite: `Dashboard3D.interaction.test.tsx` (6 tests)\n3. ✅ Test suite: `partsStore.test.ts` (6 tests)\n4. ✅ Test suite: `EmptyState.test.tsx` (3 tests)\n5. ✅ Performance test protocol: `PERFORMANCE-TESTING.md` (manual)\n6. ✅ Coverage report: `coverage/index.html`\n7. ✅ CI config: `.github/workflows/test.yml` (runs tests on PR)\n\n---\n\n## 🔗 DEPENDENCIES\n\n### Upstream\n- All US-005 implementation tickets (T-0504 to T-0508)\n- Vitest configured (T-0500-INFRA)\n\n### Downstream\n- None (last ticket in US-005)\n\n---\n\n## ⚠️ RISKS & MITIGATION\n\n| Risk | Impact | Probability | Mitigation |\n|------|--------|-------------|------------|\n| **Three.js mocks incomplete** | High | Medium | Test core logic only, skip visual rendering tests |\n| **Tests too slow (>30s)** | Medium | Low | Mock heavy components, use `vi.mock` aggressively |\n| **Coverage <80%** | Medium | Low | Add shallow tests for missed branches |\n| **Performance tests fail on CI** | Low | High | Run manual tests locally, automate only FPS-independent checks |\n\n---\n\n## 📚 REFERENCES\n\n- Vitest Docs: https://vitest.dev/\n- Testing Library: https://testing-library.com/docs/react-testing-library/intro\n- React Three Fiber Testing: https://docs.pmnd.rs/react-three-fiber/advanced/testing\n- Coverage Target: 80% (industry standard for feature code)\n\n---\n\n**Status:** ✅ Ready for Implementation  \n**Last Updated:** 2026-02-18  \n**Coverage Target:** >80% Dashboard3D, >85% PartMesh, >90% FiltersSidebar\n