# T-0506-FRONT: Filters Sidebar & Zustand Store

**Ticket ID:** T-0506-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 3 Story Points (~6 horas)  
**Responsable:** Frontend Developer  
**Prioridad:** P2

---

## 📋 CONTEXT

### Problem Statement
El Dashboard necesita:
1. Filtros interactivos (Tipología, Estado, Taller)
2. Estado global compartido entre Canvas y Sidebar
3. Persistencia en URL para shareable links
4. Feedback visual (fade-out piezas no-match)

### Current State
```tsx
// T-0504 creó placeholder sidebar
function FiltersSidebar() {
  return <p>Próximamente...</p>;
}
```

### Target State
```tsx
// Filtros funcionales con Zustand + URL sync
function FiltersSidebar() {
  const { filters, setFilters } = usePartsStore();
  return (
    <div>
      <CheckboxGroup options={TIPOLOGIAS} />
      <Select options={WORKSHOPS} />
    </div>
  );
}
```

---

## 🎯 REQUIREMENTS

### FR-1: Zustand Store (Complete Implementation)
```tsx
// src/stores/partsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PartCanvasItem } from '@/types/parts';

interface Filters {
  status: string[];  // ['validated', 'uploaded']
  tipologia: string[];  // ['capitel', 'columna']
  workshop_id: string | null;  // UUID or null (all)
}

interface PartsState {
  parts: PartCanvasItem[];
  isLoading: boolean;
  error: string | null;
  filters: Filters;
  selectedId: string | null;
  
  // Actions
  setParts: (parts: PartCanvasItem[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<Filters>) => void;
  selectPart: (id: string | null) => void;
  clearFilters: () => void;
  
  // Computed (derived state)
  filteredParts: () => PartCanvasItem[];
}

export const usePartsStore = create<PartsState>()(devtools((set, get) => ({
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
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  selectPart: (id) => set({ selectedId: id }),
  
  clearFilters: () => set({
    filters: { status: [], tipologia: [], workshop_id: null },
  }),
  
  filteredParts: () => {
    const { parts, filters } = get();
    
    return parts.filter((part) => {
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(part.status)) {
        return false;
      }
      
      // Filter by tipologia
      if (filters.tipologia.length > 0 && !filters.tipologia.includes(part.tipologia)) {
        return false;
      }
      
      // Filter by workshop
      if (filters.workshop_id && part.workshop_id !== filters.workshop_id) {
        return false;
      }
      
      return true;
    });
  },
}), { name: 'PartsStore' }));
```

### FR-2: URL Params Sync
```tsx
// src/hooks/useURLFilters.ts
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePartsStore } from '@/stores/partsStore';

export function useURLFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = usePartsStore();
  
  // Read URL params on mount
  useEffect(() => {
    const status = searchParams.get('status')?.split(',') || [];
    const tipologia = searchParams.get('tipologia')?.split(',') || [];
    const workshop_id = searchParams.get('workshop_id') || null;
    
    setFilters({ status, tipologia, workshop_id });
  }, []);
  
  // Update URL when filters change
  useEffect(() => {
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
    
    setSearchParams(params, { replace: true }); // No history push
  }, [filters]);
}
```

**URL Examples:**
```
# All validated capitals
/?status=validated&tipologia=capitel

# Workshop 123
/?workshop_id=123-abc-456

# Multiple filters
/?status=validated,uploaded&tipologia=capitel,columna&workshop_id=123
```

### FR-3: FiltersSidebar Component
```tsx
// src/components/Dashboard3D/FiltersSidebar.tsx
import { usePartsStore } from '@/stores/partsStore';
import { TIPOLOGIAS, STATUS_OPTIONS } from '@/constants';
import CheckboxGroup from '@/components/ui/CheckboxGroup';
import Select from '@/components/ui/Select';

export default function FiltersSidebar() {
  const { parts, filters, setFilters, clearFilters, filteredParts } = usePartsStore();
  const filtered = filteredParts();
  
  return (
    <div className="filters-sidebar">
      {/* Header */}
      <div className="filters-sidebar__header">
        <h2>Filtros</h2>
        <button onClick={clearFilters} className="btn-link">
          Limpiar
        </button>
      </div>
      
      {/* Tipología filter */}
      <section className="filters-sidebar__section">
        <h3>Tipología</h3>
        <CheckboxGroup
          options={TIPOLOGIAS.map(t => ({ label: t, value: t }))}
          value={filters.tipologia}
          onChange={(values) => setFilters({ tipologia: values })}
        />
      </section>
      
      {/* Status filter */}
      <section className="filters-sidebar__section">
        <h3>Estado</h3>
        <CheckboxGroup
          options={STATUS_OPTIONS.map(s => ({ 
            label: s.label, 
            value: s.value,
            color: s.color // Visual indicator
          }))}
          value={filters.status}
          onChange={(values) => setFilters({ status: values })}
        />
      </section>
      
      {/* Workshop filter */}
      <section className="filters-sidebar__section">
        <h3>Taller</h3>
        <Select
          options={workshops} // Fetched from API
          value={filters.workshop_id}
          onChange={(value) => setFilters({ workshop_id: value })}
          placeholder="Todos los talleres"
        />
      </section>
      
      {/* Results counter */}
      <footer className="filters-sidebar__footer">
        <p>
          Mostrando <strong>{filtered.length}</strong> de <strong>{parts.length}</strong> piezas
        </p>
      </footer>
    </div>
  );
}
```

### FR-4: Fade-Out Non-Matching Parts
```tsx
// src/components/Dashboard3D/PartsScene.tsx
import { usePartsStore } from '@/stores/partsStore';

function PartMesh({ part }: { part: PartCanvasItem }) {
  const { filteredParts } = usePartsStore();
  const filtered = filteredParts();
  const isVisible = filtered.some(p => p.id === part.id);
  
  return (
    <mesh {...props}>
      <meshStandardMaterial
        opacity={isVisible ? 1.0 : 0.2} // Fade out non-matches
        transparent
        depthWrite={isVisible} // Fix z-fighting on faded meshes
      />
    </mesh>
  );
}
```

**Visual Feedback:**
- Matching parts: Opacity 1.0 (fully visible)
- Non-matching: Opacity 0.2 (faded, not hidden)
- Smooth transition: CSS `transition: opacity 0.3s ease`

### FR-5: Constants File
```tsx
// src/constants/parts.constants.ts
export const TIPOLOGIAS = [
  'capitel',
  'columna',
  'arco',
  'bóveda',
  'decorativo',
] as const;

export const STATUS_OPTIONS = [
  { value: 'uploaded', label: 'Cargado', color: '#6b7280' },
  { value: 'validated', label: 'Validado', color: '#10b981' },
  { value: 'invalidated', label: 'Invalidado', color: '#ef4444' },
  { value: 'processing', label: 'Procesando', color: '#f59e0b' },
] as const;

export type Tipologia = typeof TIPOLOGIAS[number];
export type BlockStatus = typeof STATUS_OPTIONS[number]['value'];
```

---

## 🔨 IMPLEMENTATION

### Step 1: Complete Zustand Store (60 min)
1. Extend `partsStore.ts` with filtering logic
2. Add `devtools` middleware for debugging
3. Implement `filteredParts` computed property
4. Add unit tests for filter logic

### Step 2: Create URL Sync Hook (30 min)
1. Create `useURLFilters.ts` hook
2. Parse URL params on mount
3. Update URL when filters change (no history pollution)
4. Test shareable links

### Step 3: Build FiltersSidebar UI (90 min)
1. Create reusable `CheckboxGroup` component
2. Create `Select` component (dropdown)
3. Implement `FiltersSidebar` with 3 sections
4. Add "Limpiar filtros" button
5. Add results counter "Mostrando X de Y"

### Step 4: Integrate Fade-Out in Canvas (45 min)
1. Update `PartMesh` component with opacity logic
2. Add smooth transition (0.3s ease)
3. Fix z-fighting with `depthWrite` conditional
4. Test performance (FPS should stay >30)

### Step 5: Add Constants File (15 min)
Create `parts.constants.ts` with typed constants.

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** Sidebar shows 3 filter sections (Tipología, Estado, Taller)
- [ ] **AC-2:** Checkboxes update Zustand store on click
- [ ] **AC-3:** Canvas re-renders on filter change (fade-out non-matches)
- [ ] **AC-4:** URL params synced (e.g., `?status=validated`)
- [ ] **AC-5:** Page reload maintains filters (read from URL)
- [ ] **AC-6:** "Limpiar filtros" button resets all filters
- [ ] **AC-7:** Counter shows "Mostrando X de Y piezas"
- [ ] **AC-8:** Fade-out smooth (<300ms transition)
- [ ] **AC-9:** No FPS drop when filtering (>30 FPS maintained)
- [ ] **AC-10:** Devtools middleware shows state changes

### Quality Gates
```bash
# Functional test
npm run dev
# 1. Click "Capitel" checkbox → Canvas fades out non-capitals
# 2. Check URL → Should include ?tipologia=capitel
# 3. Reload page → Filter still active
# 4. Click "Limpiar" → All parts visible, URL clean

# Performance test
# Open DevTools → Performance
# Filter 150 parts → Verify FPS stays >30
```

---

## 🧪 TESTING

### Unit Tests
```tsx
// partsStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePartsStore } from './partsStore';

const mockParts = [
  { id: '1', tipologia: 'capitel', status: 'validated' },
  { id: '2', tipologia: 'columna', status: 'uploaded' },
  { id: '3', tipologia: 'capitel', status: 'uploaded' },
];

describe('partsStore', () => {
  it('filters by tipologia', () => {
    const { result } = renderHook(() => usePartsStore());
    
    act(() => {
      result.current.setParts(mockParts);
      result.current.setFilters({ tipologia: ['capitel'] });
    });
    
    const filtered = result.current.filteredParts();
    expect(filtered).toHaveLength(2); // id 1 and 3
  });
  
  it('filters by status', () => {
    const { result } = renderHook(() => usePartsStore());
    
    act(() => {
      result.current.setParts(mockParts);
      result.current.setFilters({ status: ['validated'] });
    });
    
    const filtered = result.current.filteredParts();
    expect(filtered).toHaveLength(1); // id 1 only
  });
  
  it('combines multiple filters (AND logic)', () => {
    const { result } = renderHook(() => usePartsStore());
    
    act(() => {
      result.current.setParts(mockParts);
      result.current.setFilters({ 
        tipologia: ['capitel'], 
        status: ['validated'] 
      });
    });
    
    const filtered = result.current.filteredParts();
    expect(filtered).toHaveLength(1); // id 1 only (capitel AND validated)
  });
  
  it('clearFilters resets to empty', () => {
    const { result } = renderHook(() => usePartsStore());
    
    act(() => {
      result.current.setFilters({ tipologia: ['capitel'] });
      result.current.clearFilters();
    });
    
    expect(result.current.filters.tipologia).toEqual([]);
  });
});
```

### Integration Test
```tsx
// FiltersSidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FiltersSidebar from './FiltersSidebar';
import { usePartsStore } from '@/stores/partsStore';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('FiltersSidebar', () => {
  beforeEach(() => {
    usePartsStore.setState({ 
      parts: mockParts, 
      filters: { status: [], tipologia: [], workshop_id: null } 
    });
  });
  
  it('updates store when checkbox clicked', () => {
    renderWithRouter(<FiltersSidebar />);
    
    const checkbox = screen.getByLabelText('capitel');
    fireEvent.click(checkbox);
    
    const { filters } = usePartsStore.getState();
    expect(filters.tipologia).toContain('capitel');
  });
  
  it('updates URL when filter changes', () => {
    renderWithRouter(<FiltersSidebar />);
    
    const checkbox = screen.getByLabelText('capitel');
    fireEvent.click(checkbox);
    
    expect(window.location.search).toContain('tipologia=capitel');
  });
  
  it('shows correct counter', () => {
    renderWithRouter(<FiltersSidebar />);
    
    // Initially 3 parts
    expect(screen.getByText(/3 de 3/i)).toBeInTheDocument();
    
    // Filter to 2 parts
    fireEvent.click(screen.getByLabelText('capitel'));
    expect(screen.getByText(/2 de 3/i)).toBeInTheDocument();
  });
  
  it('clears all filters on button click', () => {
    usePartsStore.setState({ filters: { tipologia: ['capitel'] } });
    renderWithRouter(<FiltersSidebar />);
    
    fireEvent.click(screen.getByText('Limpiar'));
    
    const { filters } = usePartsStore.getState();
    expect(filters.tipologia).toEqual([]);
  });
});
```

---

## 📦 DELIVERABLES

1. ✅ `src/stores/partsStore.ts` (complete with filters)
2. ✅ `src/hooks/useURLFilters.ts` (URL sync hook)
3. ✅ `src/components/Dashboard3D/FiltersSidebar.tsx` (full UI)
4. ✅ `src/components/ui/CheckboxGroup.tsx` (reusable)
5. ✅ `src/components/ui/Select.tsx` (dropdown)
6. ✅ `src/constants/parts.constants.ts` (typed constants)
7. ✅ Unit tests: `partsStore.test.ts` (5 tests)
8. ✅ Integration tests: `FiltersSidebar.test.tsx` (4 tests)

---

## 🔗 DEPENDENCIES

### Upstream
- `T-0504-FRONT`: Needs FiltersSidebar placeholder
- `T-0501-BACK`: API provides parts data

### Downstream
- `T-0505-FRONT`: PartsScene uses filteredParts
- `T-0507-FRONT`: LOD needs filter state

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Performance drop with 150 parts** | Medium | Low | Use React.memo, debounce filter changes 100ms |
| **URL too long (>2000 chars)** | Low | Low | Limit multi-select to 10 items, encode IDs |
| **Browser back button breaks state** | Medium | Medium | Listen to `popstate` event, re-sync filters |
| **Fade-out z-fighting** | Low | Medium | Set `depthWrite={false}` on faded meshes |

---

## 📚 REFERENCES

- Zustand Docs: https://github.com/pmndrs/zustand
- Devtools Middleware: https://github.com/pmndrs/zustand#devtools
- URL Search Params: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
- React Router `useSearchParams`: https://reactrouter.com/en/main/hooks/use-search-params

---

**Status:** ✅ Ready for Implementation  
**Last Updated:** 2026-02-18