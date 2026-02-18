# T-0508-FRONT: Part Selection & Modal Integration

**Ticket ID:** T-0508-FRONT  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 2 Story Points (~4 horas)  
**Responsable:** Frontend Developer  
**Prioridad:** P2

---

## 📋 CONTEXT

### Problem Statement
Users need to:
1. Click a 3D part to select it
2. Visual feedback (emissive glow)
3. Open PartDetailModal with metadata (integrates US-010)
4. Maintain selection when modal closes

### POC Validation
✅ Emissive glow functional (POC tested `emissiveIntensity: 0.4`)  
✅ onClick events work in React Three Fiber  
🎯 Integrate with PartDetailModal from US-010

### Current State
```tsx
// T-0507 renders parts without interaction
<PartMesh part={part} />
```

### Target State
```tsx
// Interactive parts with selection
<PartMesh 
  part={part} 
  onClick={() => selectPart(part.id)}
  isSelected={selectedId === part.id}
/>
```

---

## 🎯 REQUIREMENTS

### FR-1: Click Handler
```tsx
// src/components/Dashboard3D/PartMesh.tsx (extend from T-0507)
import { usePartsStore } from '@/stores/partsStore';
import { ThreeEvent } from '@react-three/fiber';

export default function PartMesh({ part }: PartMeshProps) {
  const { selectedId, selectPart } = usePartsStore();
  const isSelected = selectedId === part.id;
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); // Prevent canvas background click
    selectPart(part.id);
  };
  
  return (
    <Lod distances={[0, 20, 50]}>
      {/* Apply onClick to all LOD levels */}
      <mesh onClick={handleClick} {...props}>
        <meshStandardMaterial
          color={STATUS_COLORS[part.status]}
          emissive={isSelected ? STATUS_COLORS[part.status] : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>
    </Lod>
  );
}
```

### FR-2: Emissive Glow (Visual Feedback)
**Status-based colors:**
```tsx
// src/constants/parts.constants.ts
export const STATUS_COLORS = {
  uploaded: '#6b7280',      // Gray
  validated: '#10b981',     // Green
  invalidated: '#ef4444',   // Red
  processing: '#f59e0b',    // Orange
};
```

**Material configuration:**
```tsx
<meshStandardMaterial
  color={STATUS_COLORS[part.status]}  // Base color
  emissive={isSelected ? STATUS_COLORS[part.status] : '#000000'}  // Glow color
  emissiveIntensity={isSelected ? 0.4 : 0}  // Glow intensity (0.4 from POC)
  metalness={0.3}
  roughness={0.7}
/>
```

**Visual effect:**
- Not selected: Normal color, no glow
- Selected: Same color + emissive glow (40% intensity)
- Smooth transition: CSS-like (Three.js auto-lerps material properties)

### FR-3: Modal Integration (US-010)
```tsx
// src/components/Dashboard3D/Dashboard3D.tsx
import { usePartsStore } from '@/stores/partsStore';
import PartDetailModal from '@/components/PartDetailModal';

export default function Dashboard3D() {
  const { selectedId, selectPart, parts } = usePartsStore();
  const selectedPart = parts.find(p => p.id === selectedId);
  
  return (
    <div className="dashboard-3d">
      <Canvas3D />
      <FiltersSidebar />
      
      {/* Modal opens when part selected */}
      {selectedPart && (
        <PartDetailModal
          partId={selectedPart.id}
          isOpen={true}
          onClose={() => selectPart(null)}  // Deselect
        />
      )}
    </div>
  );
}
```

**Modal behavior:**
- Opens on part click
- Shows part details (ISO code, status, dimensions, etc.)
- Close button → deselects part (glow disappears)
- Click outside → deselects part (optional UX decision)

### FR-4: Deselection Logic
**Deselect on:**
1. Close modal button
2. Click canvas background
3. Press ESC key

**Implementation:**
```tsx
// Canvas background click
function Canvas3D() {
  const { selectPart } = usePartsStore();
  
  return (
    <Canvas
      onClick={() => selectPart(null)}  // Click empty space → deselect
    >
      {/* Scene... */}
    </Canvas>
  );
}

// ESC key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      selectPart(null);
    }
  };
  
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [selectPart]);
```

### FR-5: Single Selection (No Multi-Select)
**Rule:** Only ONE part selected at a time.

**Store behavior:**
```tsx
// src/stores/partsStore.ts
selectPart: (id) => set({ selectedId: id }),  // Replaces previous selection
```

If multi-select needed in future (Sprint 2+), extend to:
```tsx
selectedIds: string[];  // Array instead of single ID
toggleSelection: (id) => { /* Add/remove from array */ }
```

### FR-6: Hover Effect (Optional Enhancement)
**Stretch goal:** Show tooltip on hover (not blocking)

```tsx
const [hovered, setHovered] = useState(false);

<mesh
  onClick={handleClick}
  onPointerOver={() => setHovered(true)}
  onPointerOut={() => setHovered(false)}
>
  <meshStandardMaterial
    emissive={hovered ? '#ffffff' : (isSelected ? statusColor : '#000000')}
    emissiveIntensity={hovered ? 0.2 : (isSelected ? 0.4 : 0)}
  />
</mesh>

{hovered && (
  <Html position={[0, 2, 0]}>
    <div className="tooltip">{part.iso_code}</div>
  </Html>
)}
```

---

## 🔨 IMPLEMENTATION

### Step 1: Extend PartMesh with Click Handler (45 min)
1. Add `onClick` prop to `<mesh>` in PartMesh.tsx
2. Call `selectPart(part.id)` on click
3. Add `event.stopPropagation()` to prevent bubbling
4. Test with console.log to verify clicks work

### Step 2: Implement Emissive Glow (30 min)
1. Read `isSelected` from store
2. Apply conditional `emissive` and `emissiveIntensity`
3. Use `STATUS_COLORS[part.status]` for glow color
4. Test visual effect (should see glow on click)

### Step 3: Integrate PartDetailModal (60 min)
1. Import `PartDetailModal` from US-010 (if exists, else create placeholder)
2. Render conditionally when `selectedId !== null`
3. Pass `partId`, `isOpen`, `onClose` props
4. Test modal opens/closes correctly

### Step 4: Add Deselection Logic (45 min)
1. Canvas background click → `selectPart(null)`
2. ESC key listener → `selectPart(null)`
3. Modal close button → calls `onClose` prop
4. Test all deselection methods

### Step 5: Add Hover Effect (Optional, 30 min)
If time permits, implement hover tooltip with `Html` from drei.

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** Click on part → Calls `selectPart(id)`
- [ ] **AC-2:** Selected part shows emissive glow (visible change)
- [ ] **AC-3:** Modal opens on selection
- [ ] **AC-4:** Modal shows correct part data (ISO code, status)
- [ ] **AC-5:** Close modal → Glow disappears
- [ ] **AC-6:** Click another part → Selection changes (only one active)
- [ ] **AC-7:** Click canvas background → Deselects
- [ ] **AC-8:** Press ESC → Deselects
- [ ] **AC-9:** Glow uses status color (green for validated, etc.)
- [ ] **AC-10:** No FPS drop on selection/deselection

### Quality Gates
```bash
# Functional test
npm run dev
# 1. Click part → Should glow + modal opens
# 2. Verify modal shows ISO code
# 3. Close modal → Glow disappears
# 4. Click different part → First ungrows, second glows
# 5. Press ESC → All effects clear
# 6. Click empty space → Deselects

# Performance test
# DevTools Performance → Select/deselect 10 times
# Verify no memory leaks (heap size stable)
```

---

## 🧪 TESTING

### Unit Tests
```tsx
// PartMesh.selection.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import PartMesh from './PartMesh';
import { usePartsStore } from '@/stores/partsStore';

describe('PartMesh Selection', () => {
  const mockPart = {
    id: 'part-1',
    iso_code: 'CAP-001',
    status: 'validated',
    low_poly_url: 'https://example.com/part.glb',
  };
  
  it('calls selectPart on click', () => {
    const selectPartMock = vi.fn();
    usePartsStore.setState({ selectPart: selectPartMock });
    
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    const mesh = container.querySelector('mesh');
    fireEvent.click(mesh);
    
    expect(selectPartMock).toHaveBeenCalledWith('part-1');
  });
  
  it('applies emissive glow when selected', () => {
    usePartsStore.setState({ selectedId: 'part-1' });
    
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    const material = container.querySelector('meshStandardMaterial');
    expect(material.emissiveIntensity).toBe(0.4);
  });
  
  it('removes glow when not selected', () => {
    usePartsStore.setState({ selectedId: 'other-part' });
    
    const { container } = render(
      <Canvas>
        <PartMesh part={mockPart} />
      </Canvas>
    );
    
    const material = container.querySelector('meshStandardMaterial');
    expect(material.emissiveIntensity).toBe(0);
  });
});\n```

### Integration Tests
```tsx
// Dashboard3D.selection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/partsStore';

describe('Dashboard3D Selection Integration', () => {
  beforeEach(() => {
    usePartsStore.setState({ 
      parts: [mockPart],
      selectedId: null,
    });
  });
  
  it('opens modal when part selected', () => {
    render(<Dashboard3D />);
    
    // Click part (simulate)
    act(() => {
      usePartsStore.setState({ selectedId: 'part-1' });
    });
    
    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('CAP-001')).toBeInTheDocument();
  });
  
  it('closes modal on ESC key', () => {
    usePartsStore.setState({ selectedId: 'part-1' });
    render(<Dashboard3D />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(usePartsStore.getState().selectedId).toBeNull();
  });
  
  it('deselects on canvas background click', () => {
    usePartsStore.setState({ selectedId: 'part-1' });
    const { container } = render(<Dashboard3D />);
    
    const canvas = container.querySelector('canvas');
    fireEvent.click(canvas);
    
    expect(usePartsStore.getState().selectedId).toBeNull();
  });
});\n```

### Manual Test Checklist
```markdown
## Selection UX Test
1. Load Dashboard with 10+ parts
2. Click part #1 → Should glow green (validated)
3. Verify modal opens with ISO code
4. Click part #2 → Part #1 ungrows, Part #2 glows
5. Close modal with X button → Glow disappears
6. Click part #3 → Modal reopens
7. Press ESC → Modal closes + ungrows
8. Click empty grid → Nothing glows
9. Repeat 10 times → Verify no lag
```

---

## 📦 DELIVERABLES

1. ✅ Updated `src/components/Dashboard3D/PartMesh.tsx` (click handler + glow)
2. ✅ Updated `src/components/Dashboard3D/Dashboard3D.tsx` (modal integration)
3. ✅ Updated `src/stores/partsStore.ts` (selectPart action)
4. ✅ ESC key handler in Dashboard3D
5. ✅ Unit tests: `PartMesh.selection.test.tsx` (3 tests)
6. ✅ Integration tests: `Dashboard3D.selection.test.tsx` (3 tests)

---

## 🔗 DEPENDENCIES

### Upstream
- `T-0507-FRONT`: PartMesh component exists
- `T-0504-FRONT`: Dashboard layout
- `US-010`: PartDetailModal component (or create placeholder)

### Downstream
- None (last feature ticket in US-005)

### External
- `@react-three/fiber` (onClick events)
- `@react-three/drei` (Html component for tooltip, optional)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **PartDetailModal not ready** | High | Medium | Create placeholder modal component, integrate real one later |\n| **Click events not firing** | Critical | Low | Test with console.log first, verify raycasting works |\n| **Glow not visible** | Medium | Low | Increase `emissiveIntensity` to 0.6, add ambient light |\n| **Multiple parts selected** | Low | Low | Store uses single `selectedId`, not array |\n\n---\n\n## 📚 REFERENCES\n\n- React Three Fiber Events: https://docs.pmnd.rs/react-three-fiber/api/events\n- Three.js Emissive Material: https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.emissive\n- POC Validation: Emissive glow tested at intensity 0.4\n- US-010: PartDetailModal spec (integration point)\n\n---\n\n**Status:** ✅ Ready for Implementation  \n**Last Updated:** 2026-02-18  \n**Integration Point:** US-010 PartDetailModal component\n