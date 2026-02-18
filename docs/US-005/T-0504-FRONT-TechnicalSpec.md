# T-0504-FRONT: Dashboard 3D Canvas Layout

**Ticket ID:** T-0504-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 1)  
**Estimación:** 3 Story Points (~6 horas)  
**Responsable:** Frontend Lead  
**Prioridad:** P1 (Blocks T-0505, T-0506, T-0507)

---

## 📋 CONTEXT

### Problem Statement
No existe un componente Dashboard 3D que integre:
1. Canvas Three.js para visualización 3D (80% ancho)
2. Sidebar para filtros y controles (20% ancho)
3. Layout responsive (mobile collapsa sidebar)
4. Estado vacío cuando no hay piezas

### Current State
```tsx
// Estado actual: viewer POC sin layout estructurado
function App() {
  return <GltfDracoViewer />; // Solo canvas, sin sidebar
}
```

### Target State
```tsx
// Dashboard completo con layout y estado
function Dashboard3D() {
  return (
    <div className="dashboard-layout">
      <Canvas3D /> {/* 80% ancho */}
      <FiltersSidebar /> {/* 20% ancho */}
    </div>
  );
}
```

### POC Validation
✅ React Three Fiber funciona con 1197 meshes (60 FPS)  
✅ OrbitControls fluidos  
✅ Suspense con Loader funcional  
⏳ Necesita integración en layout con sidebar

---

## 🎯 REQUIREMENTS

### FR-1: Dashboard Layout (80/20 Split)
```tsx
// src/components/Dashboard3D/Dashboard3D.tsx
import { usePartsStore } from '@/stores/partsStore';
import Canvas3D from './Canvas3D';
import FiltersSidebar from './FiltersSidebar';
import './Dashboard3D.css';

export default function Dashboard3D() {
  const { isLoading } = usePartsStore();
  
  return (
    <div className="dashboard-3d">
      {/* Canvas: 80% width, full height */}
      <div className="dashboard-3d__canvas">
        <Canvas3D />
      </div>
      
      {/* Sidebar: 20% width, full height */}
      <aside className="dashboard-3d__sidebar">
        <FiltersSidebar />
      </aside>
      
      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
```

**CSS Grid Layout:**
```css
/* Dashboard3D.css */
.dashboard-3d {
  display: grid;
  grid-template-columns: 1fr 300px; /* 80% canvas + 300px sidebar */
  height: 100vh;
  overflow: hidden;
}

.dashboard-3d__canvas {
  position: relative;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
}

.dashboard-3d__sidebar {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  background: #1e1e1e;
  overflow-y: auto;
  padding: 1rem;
}

/* Responsive: <768px collapsa sidebar */
@media (max-width: 768px) {
  .dashboard-3d {
    grid-template-columns: 1fr; /* Canvas full width */
  }
  
  .dashboard-3d__sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  .dashboard-3d__sidebar--open {
    transform: translateY(0); /* Slide up */
  }
}
```

### FR-2: Canvas3D Component
```tsx
// src/components/Dashboard3D/Canvas3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import PartsScene from './PartsScene';
import { Suspense } from 'react';

export default function Canvas3D() {
  return (
    <Canvas
      camera={{
        fov: 50,
        position: [50, 50, 50],
        near: 0.1,
        far: 10000,
      }}
      shadows
      dpr={[1, 2]} // Pixel ratio 1-2x for performance
      gl={{
        antialias: true,
        alpha: false,
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Scene with parts */}
      <Suspense fallback={<Loader />}>
        <PartsScene />
      </Suspense>
      
      {/* Ground grid */}
      <Grid
        args={[200, 200]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={25}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={400}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      
      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2} // No girar debajo del suelo
      />
      
      {/* Gizmo (orientation helper) */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
      
      {/* Performance stats (dev only) */}
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  );
}

// Loader component (shown during Suspense)
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" wireframe />
    </mesh>
  );
}
```

### FR-3: Empty State Component
```tsx
// src/components/Dashboard3D/EmptyState.tsx
interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No hay piezas cargadas" }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <svg className="empty-state__icon" width="120" height="120" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
        <h2 className="empty-state__title">{message}</h2>
        <p className="empty-state__subtitle">
          Las piezas validadas aparecerán aquí automáticamente
        </p>
      </div>
    </div>
  );
}
```

**CSS:**
```css
/* EmptyState.css */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.empty-state__content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-state__icon {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.empty-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.empty-state__subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
}
```

### FR-4: FiltersSidebar Component (Placeholder)
```tsx
// src/components/Dashboard3D/FiltersSidebar.tsx
import { usePartsStore } from '@/stores/partsStore';

export default function FiltersSidebar() {
  const { parts, filters } = usePartsStore();
  
  return (
    <div className="filters-sidebar">
      <h2 className="filters-sidebar__title">Filtros</h2>
      
      {/* Placeholder filters (T-0506-FRONT implements real ones) */}
      <div className="filters-sidebar__section">
        <h3>Tipología</h3>
        <p className="text-muted">Próximamente...</p>
      </div>
      
      <div className="filters-sidebar__section">
        <h3>Estado</h3>
        <p className="text-muted">Próximamente...</p>
      </div>
      
      {/* Parts counter */}
      <div className="filters-sidebar__footer">
        <p>Total: <strong>{parts.length}</strong> piezas</p>
      </div>
    </div>
  );
}
```

### FR-5: Responsive Behavior
**Mobile (<768px):**
- Canvas: Full width
- Sidebar: Fixed bottom panel (slide up on toggle)
- Floating button: Open/close sidebar
- Touch controls: Pan with 1 finger, rotate with 2 fingers

**Desktop (≥768px):**
- Canvas: 80% width (left)
- Sidebar: 20% width 300px (right, persistent)
- Mouse controls: Drag to rotate, wheel to zoom

**Implementation:**
```tsx
// Dashboard3D.tsx with mobile toggle
export default function Dashboard3D() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="dashboard-3d">
      <div className="dashboard-3d__canvas">
        <Canvas3D />
        
        {/* Mobile: Floating toggle button */}
        {isMobile && (
          <button
            className="dashboard-3d__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle filters"
          >
            <FilterIcon />
          </button>
        )}
      </div>
      
      <aside className={cn(
        "dashboard-3d__sidebar",
        sidebarOpen && "dashboard-3d__sidebar--open"
      )}>
        <FiltersSidebar />
      </aside>
    </div>
  );
}
```

### FR-6: Performance Optimizations
**Canvas optimizations:**
```tsx
// Memoize Canvas3D to prevent unnecessary re-renders
export default memo(Canvas3D);

// Debounce resize events
useEffect(() => {
  const handleResize = debounce(() => {
    // Canvas auto-resizes, but can trigger other updates here
  }, 100);
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Target metrics (from POC):**
- FPS: >30 constant (POC achieved 60)
- Memory: <500 MB (POC achieved 41 MB)
- Initial render: <2s

---

## 🔨 IMPLEMENTATION

### Step 1: Create Dashboard Layout (60 min)
1. Create `src/components/Dashboard3D/` folder
2. Create `Dashboard3D.tsx` with grid layout
3. Create `Dashboard3D.css` with responsive breakpoints
4. Create `Canvas3D.tsx` with Three.js Canvas setup
5. Create `EmptyState.tsx` for zero-parts state

### Step 2: Setup Zustand Store (Placeholder) (30 min)
```tsx
// src/stores/partsStore.ts
import { create } from 'zustand';
import { PartCanvasItem } from '@/types/parts';

interface PartsState {
  parts: PartCanvasItem[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string[];
    tipologia: string[];
    workshop_id: string | null;
  };
  selectedId: string | null;
  
  // Actions
  setParts: (parts: PartCanvasItem[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<PartsState['filters']>) => void;
  selectPart: (id: string | null) => void;
}

export const usePartsStore = create<PartsState>((set) => ({
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
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  selectPart: (id) => set({ selectedId: id }),
}));
```

### Step 3: Integrate into App Router (20 min)
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard3D from './components/Dashboard3D/Dashboard3D';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard3D />} />
        {/* Other routes... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 4: Add FiltersSidebar Placeholder (30 min)
Create basic sidebar structure that will be populated in T-0506-FRONT.

### Step 5: Add Responsive Behavior (45 min)
1. Install `@mantine/hooks` for `useMediaQuery`
2. Implement mobile toggle button
3. Test responsive breakpoints
4. Verify touch controls on mobile (2-finger rotate)

### Step 6: Add Loading States (30 min)
```tsx
// LoadingOverlay.tsx
export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay__spinner">
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <p>Cargando piezas...</p>
      </div>
    </div>
  );
}
```

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** Dashboard renders with 80/20 layout (canvas + sidebar)
- [ ] **AC-2:** Canvas displays grid and axes (empty state)
- [ ] **AC-3:** OrbitControls functional (drag to rotate, wheel to zoom)
- [ ] **AC-4:** Empty state visible when `parts.length === 0`
- [ ] **AC-5:** FiltersSidebar renders with placeholder content
- [ ] **AC-6:** Mobile (<768px) collapses sidebar to bottom panel
- [ ] **AC-7:** Mobile toggle button shows/hides sidebar
- [ ] **AC-8:** Suspense loader shows during canvas initialization
- [ ] **AC-9:** Stats panel visible in dev mode only
- [ ] **AC-10:** No console errors on mount

### Quality Gates
```bash
# Visual test
npm run dev
# Navigate to http://localhost:5173
# Verify:
# - Grid visible
# - Sidebar on right
# - Rotate canvas with mouse
# - Resize window < 768px → sidebar collapses

# Performance test
# Open DevTools → Performance
# Record 10 seconds of interaction (rotate, zoom)
# Verify:
# - FPS >30 (target from POC: 60)
# - No long tasks >50ms
# - Memory stable (no leaks)
```

---

## 🧪 TESTING

### Unit Tests
```tsx
// Dashboard3D.test.tsx
import { render, screen } from '@testing-library/react';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/partsStore';

// Mock Three.js Canvas (heavy to test)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

describe('Dashboard3D', () => {
  it('renders canvas and sidebar', () => {
    render(<Dashboard3D />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByText(/Filtros/i)).toBeInTheDocument();
  });
  
  it('shows empty state when no parts', () => {
    usePartsStore.setState({ parts: [] });
    render(<Dashboard3D />);
    
    expect(screen.getByText(/No hay piezas cargadas/i)).toBeInTheDocument();
  });
  
  it('shows loading overlay when isLoading true', () => {
    usePartsStore.setState({ isLoading: true });
    render(<Dashboard3D />);
    
    expect(screen.getByText(/Cargando piezas/i)).toBeInTheDocument();
  });
  
  it('hides Stats in production mode', () => {
    import.meta.env.MODE = 'production';
    render(<Dashboard3D />);
    
    // Stats component should not be rendered
    expect(screen.queryByText(/FPS/i)).not.toBeInTheDocument();
  });
});
```

### Responsive Test
```tsx
// Dashboard3D.responsive.test.tsx
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('Dashboard3D Responsive', () => {
  it('shows sidebar on desktop (≥768px)', () => {
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = render(<Dashboard3D />);
    const sidebar = container.querySelector('.dashboard-3d__sidebar');
    
    expect(sidebar).toHaveClass('dashboard-3d__sidebar'); // Persistent
  });
  
  it('collapses sidebar on mobile (<768px)', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = render(<Dashboard3D />);
    const sidebar = container.querySelector('.dashboard-3d__sidebar');
    
    expect(sidebar).toHaveStyle({ transform: 'translateY(100%)' }); // Hidden
  });
});
```

### Integration Test (Manual)
```markdown
## Manual Test Checklist
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Verify grid renders (red sections every 25 units)
4. Drag with mouse → Canvas rotates
5. Scroll wheel → Canvas zooms in/out
6. Resize window < 768px → Sidebar collapses to bottom
7. Click filter toggle button (mobile) → Sidebar slides up
8. Open DevTools Performance → Record 10s → Verify FPS >30
```

---

## 📦 DELIVERABLES

1. ✅ `src/components/Dashboard3D/Dashboard3D.tsx` (main layout)
2. ✅ `src/components/Dashboard3D/Canvas3D.tsx` (Three.js canvas)
3. ✅ `src/components/Dashboard3D/EmptyState.tsx` (zero-parts state)
4. ✅ `src/components/Dashboard3D/FiltersSidebar.tsx` (placeholder)
5. ✅ `src/components/Dashboard3D/LoadingOverlay.tsx` (loading state)
6. ✅ `src/stores/partsStore.ts` (Zustand state placeholder)
7. ✅ `src/components/Dashboard3D/Dashboard3D.css` (responsive styles)
8. ✅ Unit tests: `Dashboard3D.test.tsx` (4 tests)

---

## 🔗 DEPENDENCIES

### Upstream (Must Complete First)
- `T-0500-INFRA`: React Three Fiber stack installed

### Downstream (Blocked by This)
- `T-0505-FRONT`: PartsScene needs Canvas3D setup
- `T-0506-FRONT`: Filters need FiltersSidebar structure
- `T-0507-FRONT`: LOD needs Canvas3D Camera
- `T-0508-FRONT`: Selection needs Canvas3D events

### External
- `@react-three/fiber@^8.15.0`
- `@react-three/drei@^9.92.0`
- `zustand@^4.4.7`

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Canvas not rendering** | Critical | Low | Test with simple cube mesh first, verify WebGL support |
| **Mobile performance <30 FPS** | High | Medium | Use `dpr={[1, 1]}` on mobile, reduce shadow quality |
| **Sidebar covers canvas on mobile** | Medium | Low | Use `pointer-events: none` on backdrop, test on real devices |
| **Suspense infinite loader** | High | Low | Add error boundary, fallback timeout 10s |

---

## 📚 REFERENCES

- React Three Fiber Docs: https://docs.pmnd.rs/react-three-fiber/
- Drei Components: https://github.com/pmndrs/drei
- Zustand Store: https://github.com/pmndrs/zustand
- Responsive Three.js: https://threejs.org/manual/#en/responsive
- POC Results: `benchmark-results-2026-02-18.json` (60 FPS, 41 MB memory)

---

**Status:** ✅ Ready for Implementation  
**Last Updated:** 2026-02-18  
**Component Path:** `src/components/Dashboard3D/`
