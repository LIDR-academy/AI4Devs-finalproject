# Technical Specification: T-1007-FRONT

**Ticket ID:** T-1007-FRONT  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 3 Story Points (~5 hours)  
**Responsable:** Frontend Developer  
**Prioridad:** 🔴 P1 (Main integration ticket)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** FRONT
- **Alcance:** Refactor `PartDetailModal` (T-0508) to integrate 3D viewer. Add tabbed interface: **3D Viewer** (default) | **Metadata** | **Validation**. Add prev/next navigation buttons with keyboard shortcuts (←/→).
- **Dependencias:**
  - **Upstream:** T-0508-FRONT (✅ DONE 2026-02-20) - Existing PartDetailModal component
  - **Upstream:** T-1004-FRONT (✅ MUST BE DONE) - PartViewerCanvas component
  - **Upstream:** T-1005-FRONT (✅ MUST BE DONE) - ModelLoader component
  - **Upstream:** T-1006-FRONT (✅ MUST BE DONE) - ViewerErrorBoundary component
  - **Upstream:** T-1003-BACK (✅ MUST BE DONE) - GET /api/parts/{id}/adjacent endpoint
  - **Related:** T-032-FRONT (✅ DONE Sprint 3) - ValidationReportView component (reused)

### Problem Statement
**Current PartDetailModal (T-0508):**
- Shows only basic metadata (ISO code, status, workshop name)
- Placeholder text: "Aquí se mostrará el visor 3D..."
- No navigation between parts (must close modal → select next row → reopen)
- No validation report display

**US-010 Requirements:**
1. **3D Viewer Tab:** Show GLB model inside PartViewerCanvas (T-1004 + T-1005)
2. **Metadata Tab:** Show detailed part info (dimensions, tipología, workshop, created_at)
3. **Validation Tab:** Show ValidationReportView (T-032) with agent validation results
4. **Navigation:** Prev/Next buttons with ← → keyboard shortcuts
5. **State Management:** Update modal content without closing (URL sync optional)

### Current State (Before Implementation)
```
PartDetailModal.tsx (T-0508, 194 lines)
  ├─ Modal overlay + ESC close
  ├─ Status badge (validated, uploaded, etc.)
  ├─ Workshop name
  └─ Placeholder: "Aquí se mostrará el visor 3D..."
```

### Target State (After Implementation)
```
PartDetailModal.tsx (T-1007, ~350 lines)
  ├─ Modal overlay + ESC close
  ├─ Header:
  │   ├─ ISO code + Status badge
  │   ├─ "Part 5 of 20" indicator
  │   └─ Prev/Next buttons (← →)
  ├─ Tabs: [3D Viewer | Metadata | Validation]
  ├─ Tab Content:
  │   ├─ 3D Viewer Tab (default):
  │   │   └─ ViewerErrorBoundary > PartViewerCanvas > ModelLoader
  │   ├─ Metadata Tab:
  │   │   └─ MetadataSidebar (T-1008)
  │   └─ Validation Tab:
  │       └─ ValidationReportView (T-032, reused)
  └─ Keyboard Shortcuts: ← → ESC
```

---

## 2. Component Interface

### Props Changes

**File:** `src/frontend/src/components/PartDetailModal.tsx`

**Before (T-0508):**
```typescript
export interface PartDetailModalProps {
  isOpen: boolean;
  partId: string;
  onClose: () => void;
}
```

**After (T-1007):**
```typescript
export interface PartDetailModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean;
  
  /**
   * Part UUID to display
   */
  partId: string;
  
  /**
   * Callback when modal closes
   */
  onClose: () => void;
  
  /**
   * Initial tab to show (viewer, metadata, validation)
   * @default 'viewer'
   */
  initialTab?: TabId;
  
  /**
   * Enable prev/next navigation
   * @default true
   */
  enableNavigation?: boolean;
  
  /**
   * Current filters (passed to adjacent API for correct prev/next calculation)
   */
  filters?: {
    status?: string;
    tipologia?: string;
    workshop_id?: string;
  };
  
  /**
   * Callback when navigating to different part
   * @param newPartId - UUID of new part
   */
  onNavigate?: (newPartId: string) => void;
}

export type TabId = 'viewer' | 'metadata' | 'validation';
```

---

## 3. Implementation

(Implementation code truncated for brevity - full spec includes refactored PartDetailModal with tabs, navigation, keyboard shortcuts, API service for T-1003 endpoint integration, CSS styles, and comprehensive testing)

---

## 4. Definition of Done

### Functional Requirements
- [ ] Modal refactored with 3 tabs: Viewer, Metadata, Validation
- [ ] 3D viewer tab shows PartViewerCanvas + ModelLoader wrapped in ErrorBoundary
- [ ] Metadata tab shows MetadataSidebar (T-1008)
- [ ] Validation tab shows ValidationReportView (T-032, reused)
- [ ] Prev/Next navigation buttons integrated with T-1003-BACK endpoint
- [ ] Keyboard shortcuts: ← → ESC working
- [ ] "Part X of Y" indicator shown when navigation enabled

### Testing Requirements
- [ ] Component tests: 10/10 passing
- [ ] Coverage: >85%
- [ ] Manual test: Open modal, switch tabs, navigate with buttons and keyboard

### Accessibility Requirements
- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Tabs use correct ARIA attributes (role="tab", aria-selected, aria-controls)
- [ ] Navigation buttons have aria-label and title attributes
- [ ] Keyboard navigation fully functional

---

## 5. References

- T-0508-FRONT: Original PartDetailModal (194 lines, placeholder content)
- T-1004-FRONT: PartViewerCanvas component
- T-1005-FRONT: ModelLoader component
- T-1006-FRONT: ViewerErrorBoundary component
- T-1008-FRONT: MetadataSidebar component
- T-032-FRONT: ValidationReportView component (reused)
- T-1003-BACK: GET /api/parts/{id}/adjacent endpoint
