# Technical Specification: T-032-FRONT

**Created:** 2026-02-16  
**Author:** AI Agent (Enrichment Phase)  
**Status:** READY FOR TDD-RED  
**Ticket:** T-032-FRONT - Validation Report Visualizer

---

## 1. Ticket Summary

- **Tipo:** FRONT (React Component)
- **Alcance:** Modal component para visualizar ValidationReport con tabs organizadas por categoría de validación
- **Dependencias:**
  - ✅ **T-020-DB** (validation_report JSONB column)
  - ✅ **T-023-TEST** (ValidationReport schemas Pydantic + TypeScript)
  - ✅ **T-030-BACK** (GET /api/parts/{id}/validation endpoint)
  - ⚠️ **T-031-FRONT** (notification patterns reutilizables, no bloqueante)

---

## 2. Data Structures & Contracts

### Frontend Types (TypeScript)

**Existing Types (Already Defined)** - src/frontend/src/types/validation.ts:
```typescript
// ✅ ALREADY DEFINED - DO NOT RECREATE
export interface ValidationErrorItem {
  category: string;
  target?: string;
  message: string;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: ValidationErrorItem[];
  metadata: Record<string, any>;
  validated_at?: string;  // ISO datetime string
  validated_by?: string;
}
```

**New Types to Create** - src/frontend/src/types/validation-modal.ts:
```typescript
/**
 * Props for ValidationReportModal component.
 */
export interface ValidationReportModalProps {
  /**
   * The validation report to visualize.
   * If null, shows a "no validation data" placeholder.
   */
  report: ValidationReport | null;

  /**
   * Controls modal visibility.
   */
  isOpen: boolean;

  /**
   * Callback when user closes the modal.
   */
  onClose: () => void;

  /**
   * Optional block ID for context display.
   * Used to show which part is being validated.
   */
  blockId?: string;

  /**
   * Optional ISO code for header display.
   */
  isoCode?: string;
}

/**
 * Tab names for the modal navigation.
 */
export type TabName = 'nomenclature' | 'geometry' | 'metadata';

/**
 * Grouped errors by category for tab organization.
 */
export interface GroupedErrors {
  nomenclature: ValidationErrorItem[];
  geometry: ValidationErrorItem[];
  other: ValidationErrorItem[];
}
```

**NO Backend Changes Required** - ValidationReport contract is already synchronized between Pydantic and TypeScript (verified in T-023-TEST).

---

## 3. API Interface

**NOT APPLICABLE** - This ticket is purely frontend UI component. The data fetching will be handled by a future custom hook (e.g., `useValidationReport(blockId)`) which will consume:

- **Endpoint:** `GET /api/parts/{id}/validation` (already implemented in T-030-BACK)
- **Response:** ValidationStatusResponse (contains ValidationReport)

**For this ticket:** The component receives `report` as a prop (controlled component pattern).

---

## 4. Component Contract

### Component Name
`ValidationReportModal`

### File Location
`src/frontend/src/components/ValidationReportModal.tsx`

### Props Interface
```typescript
interface ValidationReportModalProps {
  report: ValidationReport | null;
  isOpen: boolean;
  onClose: () => void;
  blockId?: string;
  isoCode?: string;
}
```

### Component Structure

```
ValidationReportModal (Portal/Modal Container)
├── Modal Overlay (backdrop with onClick → onClose)
├── Modal Content Card
│   ├── Header
│   │   ├── Title: "Validation Report"
│   │   ├── ISO Code Badge (if provided)
│   │   ├── Validation Status Badge (✅ Valid / ❌ Invalid)
│   │   └── Close Button (X icon)
│   ├── Summary Section
│   │   ├── Validated At: ISO datetime formatted
│   │   ├── Validated By: Agent identifier
│   │   ├── Total Errors: Count badge
│   │   └── Overall Status: Pass/Fail indicator
│   ├── Tabs Navigation
│   │   ├── Tab: Nomenclature (with error count badge)
│   │   ├── Tab: Geometry (with error count badge)
│   │   └── Tab: Metadata (extracted data badge)
│   └── Tab Content Panel
│       ├── [Nomenclature Tab]
│       │   ├── No errors: ✅ "All nomenclature checks passed"
│       │   └── Errors list: ❌ Error cards with target + message
│       ├── [Geometry Tab]
│       │   ├── No errors: ✅ "All geometry checks passed"
│       │   └── Errors list: ❌ Error cards with target + message
│       └── [Metadata Tab]
│           ├── Metadata Table (key-value pairs)
│           ├── Expandible sections (if nested objects)
│           └── "No metadata extracted" placeholder (if empty)
```

### Visual Design Patterns

**Color Scheme:**
- ✅ **Success Green:** `#4caf50` (passed checks)
- ❌ **Error Red:** `#f44336` (validation errors)
- 📊 **Info Blue:** `#2196f3` (metadata sections)
- ⚠️ **Warning Amber:** `#ff9800` (if error_processing status)
- **Neutral Gray:** `#9e9e9e` (disabled tabs, borders)

**Typography Hierarchy:**
- **Modal Title:** `font-size: 20px`, `font-weight: 600`
- **Section Headers:** `font-size: 16px`, `font-weight: 500`
- **Error Messages:** `font-size: 14px`, `font-weight: 400`
- **Metadata Keys:** `font-size: 13px`, `font-weight: 500`, `text-transform: uppercase`

**Spacing:**
- **Modal Padding:** `24px`
- **Tab Spacing:** `16px` horizontal gap
- **Error Card Margin:** `8px` vertical gap
- **Section Margin:** `16px` bottom

### Behaviors

1. **Modal Visibility:**
   - When `isOpen === true`, render modal with fade-in animation (200ms)
   - When `isOpen === false`, unmount modal component
   - Mount modal using React Portal (to escape z-index stacking)

2. **Tab Navigation:**
   - Default active tab: `nomenclature`
   - Click tab button → switch active content panel
   - Keyboard navigation: Arrow keys (Left/Right) to switch tabs
   - Tab count badges update dynamically based on errors array

3. **Error Display:**
   - Group errors by `category` field (nomenclature / geometry / other)
   - Each error card shows:
     - **Icon:** ❌ (error red)
     - **Target:** `<code>` tag if present (layer name, object ID)
     - **Message:** Plain text, word-wrap enabled
   - If no errors in a category → show ✅ "All checks passed" message

4. **Metadata Display:**
   - Render key-value pairs as table rows
   - If value is object/array → render as expandible JSON tree (nice-to-have)
   - If metadata is empty object → show "No metadata extracted" placeholder

5. **Close Interactions:**
   - Click backdrop → call `onClose()`
   - Click X button in header → call `onClose()`
   - Press ESC key → call `onClose()`
   - Document body overflow: hidden when modal is open (prevent scroll)

6. **Accessibility:**
   - Modal has `role="dialog"`, `aria-labelledby="modal-title"`, `aria-modal="true"`
   - Close button has `aria-label="Close validation report"`
   - Tabs have `role="tablist"`, each tab has `role="tab"` and `aria-selected`
   - Tab panels have `role="tabpanel"`, `aria-labelledby="[tab-id]"`
   - Focus trap: When modal opens, focus moves to close button; Tab key cycles within modal
   - Color-blind safe: Use icons + text, not color alone

---

## 5. Test Cases Checklist

### Happy Path
- [ ] **Test 1:** Modal renders when `isOpen={true}` with valid `report` prop
- [ ] **Test 2:** Display validation summary (validated_at, validated_by, total errors count)
- [ ] **Test 3:** Render 3 tabs (Nomenclature, Geometry, Metadata) with correct labels
- [ ] **Test 4:** Default active tab is Nomenclature
- [ ] **Test 5:** Click Geometry tab → switches active content panel
- [ ] **Test 6:** Show ✅ "All checks passed" when errors array is empty for a category
- [ ] **Test 7:** Display error list with target + message when errors exist
- [ ] **Test 8:** Group errors by category correctly (nomenclature vs geometry vs other)
- [ ] **Test 9:** Render metadata table with key-value pairs
- [ ] **Test 10:** Tab count badges show correct error counts (e.g., "Nomenclature (3)")

### Edge Cases
- [ ] **Test 11:** Handle `report === null` → show "No validation data available" placeholder
- [ ] **Test 12:** Handle empty `errors: []` array → show ✅ success message in all tabs
- [ ] **Test 13:** Handle empty `metadata: {}` object → show "No metadata extracted" placeholder
- [ ] **Test 14:** Handle missing `target` field in error → display without target (no crash)
- [ ] **Test 15:** Handle missing optional fields (`validated_at`, `validated_by`) → omit from summary

### User Interactions
- [ ] **Test 16:** Click backdrop → calls `onClose()` callback
- [ ] **Test 17:** Click close button (X) → calls `onClose()` callback
- [ ] **Test 18:** Press ESC key → calls `onClose()` callback
- [ ] **Test 19:** Keyboard navigation: ArrowRight → switches to next tab
- [ ] **Test 20:** Keyboard navigation: ArrowLeft → switches to previous tab
- [ ] **Test 21:** Modal does NOT render when `isOpen={false}`

### Accessibility
- [ ] **Test 22:** Modal has correct ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- [ ] **Test 23:** Close button has `aria-label="Close validation report"`
- [ ] **Test 24:** Tabs have correct ARIA attributes (`role="tablist"`, `aria-selected`)
- [ ] **Test 25:** Tab panels have `role="tabpanel"` and `aria-labelledby`
- [ ] **Test 26:** Focus trap: Tab key cycles within modal when open
- [ ] **Test 27:** Focus moves to close button when modal opens (accessibility best practice)

### Responsive Design (Optional for MVP)
- [ ] **Test 28:** Modal is scrollable on small screens (max-height + overflow-y)
- [ ] **Test 29:** Tab buttons stack vertically on mobile (<640px)

---

## 6. Files to Create/Modify

### Create

1. **`src/frontend/src/types/validation-modal.ts`**
   - ValidationReportModalProps interface
   - TabName type
   - GroupedErrors interface

2. **`src/frontend/src/components/ValidationReportModal.tsx`**
   - Main component implementation
   - Modal structure (Portal + Overlay + Card)
   - Tab navigation logic
   - Error grouping and rendering
   - Metadata table rendering
   - ARIA accessibility attributes

3. **`src/frontend/src/components/ValidationReportModal.test.tsx`**
   - 27+ test cases (Happy Path + Edge Cases + Accessibility)
   - Mock ValidationReport objects (valid/invalid scenarios)
   - User interaction tests (click, keyboard)

4. **`src/frontend/src/components/validation-report-modal.constants.ts`**
   - Tab labels: `TAB_LABELS: Record<TabName, string>`
   - Icon mappings: `ICON_MAP: { success: '✅', error: '❌', info: '📊' }`
   - Color scheme: `COLOR_SCHEME: { success: '#4caf50', error: '#f44336', ... }`
   - ARIA labels: `ARIA_LABELS: { closeButton: 'Close validation report', ... }`

5. **`src/frontend/src/utils/validation-report.utils.ts`**
   - `groupErrorsByCategory(errors: ValidationErrorItem[]): GroupedErrors`
   - `formatValidatedAt(isoDate: string): string` (e.g., "Feb 16, 2026 10:30 AM")
   - `getErrorCountForCategory(errors: ValidationErrorItem[], category: string): number`

### Modify

6. **`docs/09-mvp-backlog.md`**
   - Update T-032-FRONT section with status: **[IN PROGRESS]** (ENRICHMENT PHASE)
   - Add reference to this technical spec: `[T-032-FRONT-TechnicalSpec.md](US-002/T-032-FRONT-TechnicalSpec.md)`

7. **`memory-bank/activeContext.md`**
   - Update Active Ticket: T-032-FRONT → ENRICHMENT PHASE
   - Update Recently Completed: Move T-031-FRONT to completed list

8. **`src/frontend/package.json` (if Portal dependency needed)**
   - Check if React Portal is already available (it's built-in, no install needed)
   - Confirm no additional dependencies required for basic modal

---

## 7. Reusable Components/Patterns

### From Existing Codebase

1. **Constants Extraction Pattern** (T-031-FRONT, T-001-FRONT)
   - Extract all magic strings, colors, numbers to `validation-report-modal.constants.ts`
   - Example: `TAB_LABELS`, `COLOR_SCHEME`, `ARIA_LABELS`
   - Benefit: Easy to update visual design without touching component logic

2. **TypeScript Strict Mode** (Project-wide)
   - All props must have explicit types (no `any`)
   - Optional props use `?:` syntax
   - Enum-like types for restricted values (e.g., `TabName`)

3. **Testing Library Patterns** (T-001-FRONT, T-031-FRONT)
   - Use `@testing-library/react` for component tests
   - `screen.getByRole()`, `screen.getByLabelText()` for accessibility-first queries
   - `userEvent` for keyboard/mouse interactions
   - Mock data factories for ValidationReport objects

4. **Service Layer Separation** (T-003-FRONT)
   - **NOT APPLICABLE** for this ticket (pure UI component)
   - Future enhancement: Create `useValidationReport(blockId)` hook to fetch data

### New Patterns Introduced

5. **Portal Pattern for Modals**
   - Render modal outside root DOM tree using `ReactDOM.createPortal()`
   - Target: `document.body` (or create new `<div id="modal-root">`)
   - Benefit: Avoid z-index conflicts with parent components

6. **Grouped Data Rendering**
   - Utility function `groupErrorsByCategory()` to transform flat array into categorized structure
   - Benefit: Clean separation of data transformation logic from view logic

7. **Tab Navigation State Management**
   - Use `useState<TabName>('nomenclature')` for active tab
   - Keyboard event handlers for ArrowLeft/ArrowRight
   - ARIA attributes sync with state (`aria-selected`, `aria-controls`)

### CSS-in-JS Consideration (Out of Scope for TDD Spec)

For MVP, use inline styles or a `ValidationReportModal.css` file. Future enhancement could use:
- Tailwind CSS (if already in project)
- Styled-components (requires new dependency)
- CSS Modules (Vite supports by default)

**Decision:** Start with inline styles for speed. Refactor to CSS file in REFACTOR phase if tests show duplication.

---

## 8. Next Steps

This technical specification is **READY FOR TDD-RED PHASE**.

Use the `:tdd-red` snippet with the following data:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-032-FRONT
Feature name:    Validation Report Modal UI
Key test cases:  
  1. Modal renders when isOpen={true}
  2. Render 3 tabs with error count badges
  3. Group errors by category (nomenclature/geometry/metadata)
  4. Close on backdrop/ESC/button click
  5. Tab navigation with keyboard arrows
  6. ARIA accessibility attributes
  7. Handle null report gracefully

Files to create:
  - src/frontend/src/types/validation-modal.ts
  - src/frontend/src/components/ValidationReportModal.tsx
  - src/frontend/src/components/ValidationReportModal.test.tsx
  - src/frontend/src/components/validation-report-modal.constants.ts
  - src/frontend/src/utils/validation-report.utils.ts
=============================================
```

---

## Appendix A: Example Mock Data

### Valid Validation Report (For Tests)
```typescript
const MOCK_VALID_REPORT: ValidationReport = {
  is_valid: true,
  errors: [],
  metadata: {
    total_objects: 42,
    valid_objects: 42,
    invalid_objects: 0,
    layer_count: 5,
    file_size_mb: 125.3,
    bounding_box: {
      min: [-10, -5, 0],
      max: [10, 5, 20]
    }
  },
  validated_at: "2026-02-16T10:30:00Z",
  validated_by: "librarian-v1.0.0"
};
```

### Invalid Validation Report (For Tests)
```typescript
const MOCK_INVALID_REPORT: ValidationReport = {
  is_valid: false,
  errors: [
    {
      category: "nomenclature",
      target: "Layer::bloque_test",
      message: "Invalid layer name format. Expected pattern: ^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\\d{3}$"
    },
    {
      category: "nomenclature",
      target: "Layer::temp_layer",
      message: "Layer name does not comply with ISO-19650 standard"
    },
    {
      category: "geometry",
      target: "Object::a3f9b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
      message: "Geometry is invalid (IsValid check failed)"
    },
    {
      category: "geometry",
      message: "3 objects have degenerate bounding boxes"
    }
  ],
  metadata: {
    total_objects: 45,
    valid_objects: 39,
    invalid_objects: 6,
    layer_count: 8,
    file_size_mb: 215.7
  },
  validated_at: "2026-02-16T10:35:00Z",
  validated_by: "librarian-v1.0.0"
};
```

### Null Report (For Tests)
```typescript
const MOCK_NULL_REPORT: ValidationReport | null = null;
```

---

## Appendix B: Accessibility Checklist

This component MUST comply with WCAG 2.1 Level AA:

- ✅ **Keyboard Navigation:** All interactive elements accessible via Tab/Shift+Tab
- ✅ **Focus Management:** Focus moves to close button on open, returns to trigger on close
- ✅ **ARIA Roles:** `role="dialog"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`
- ✅ **Screen Reader Support:** All buttons have `aria-label`, tabs have `aria-selected`
- ✅ **Color Contrast:** Error red (#f44336) on white background = 4.5:1 (AAA rated)
- ✅ **Focus Visible:** Outline visible on keyboard focus (browser default or custom)
- ✅ **Escape Key:** Closes modal (standard behavior)

---

## Appendix C: Design Mockup (Textual Description)

**Modal Layout (Desktop):**

```
┌──────────────────────────────────────────────────────┐
│  Validation Report              SF-C12-M-001  ✅     │ ← Header
│                                                   X   │
├──────────────────────────────────────────────────────┤
│  Validated: Feb 16, 2026 10:30 AM                    │ ← Summary
│  By: librarian-v1.0.0                                │
│  Total Errors: 4                                     │
├──────────────────────────────────────────────────────┤
│  [ Nomenclature (2) ]  [ Geometry (2) ]  [Metadata]  │ ← Tabs
├──────────────────────────────────────────────────────┤
│                                                       │
│  ❌ Layer::bloque_test                               │ ← Error Cards
│     Invalid layer name format                        │
│                                                       │
│  ❌ Layer::temp_layer                                │
│     Does not comply with ISO-19650                   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

**End of Technical Specification**

This document will be used as the source of truth for TDD-RED, TDD-GREEN, and TDD-REFACTOR phases. Any changes to requirements must update this spec first.