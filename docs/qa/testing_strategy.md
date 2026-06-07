# SplitEat: Testing & Quality Assurance Strategy

This document establishes the testing strategy, tools, and validation rules for SplitEat, covering unit testing, offline/online integration testing, E2E verification, and accessibility (a11y) audits.

---

## 1. Testing Pyramid

```
       / \
      /   \      E2E (Playwright) — 10%
     / E2E \     Validates flow from photo capture to waiter dictation.
    /-------\
   /  INTEG  \   Integration (Vitest + Fake-IndexedDB) — 30%
  /-----------\  Tests OCR parser regex, DexieDB transactions & Cloud Sync.
 /    UNIT     \ Unit (Vitest) — 60%
/_______________\ Math rounding, Penny adjustment logic, UI state helpers.
```

---

## 2. Unit Testing Strategy

All unit tests are executed with **Vitest**.

### 2.1 Testing the Penny Adjustment Algorithm
The mathematical rounding resolver must guarantee that divided amounts add up exactly to the total.

- **Test Suite**: `src/utils/pennyAdjustment.test.ts`
- **Key Test Cases**:
  1. *Simple division with decimals*: Split 10.00€ among 3 people. Assert that:
     - Person A receives 3.33€
     - Person B receives 3.33€
     - Person C receives 3.34€
     - Sum of allocations matches exactly 10.00€.
  2. *Rounding edge cases*: Split 0.01€ among 3 people. Verify that Person A receives 0.01€ and others receive 0.00€.
  3. *Redistributing shares*: Validate that if an item is divided into percentages (e.g., 50% and 50% of 15.15€), both parts add up correctly.

### 2.2 Mocking IndexedDB (Dexie.js)
To test local storage queries without a browser environment, we mock IndexedDB using `fake-indexeddb`.

```typescript
import { expect, test, beforeEach } from 'vitest';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import Dexie from 'dexie';

beforeEach(() => {
  // Replace the global indexedDB factory before each test
  global.indexedDB = new FDBFactory();
});
```

---

## 3. Integration Testing Strategy

### 3.1 OCR Parser Regression Engine
To guarantee OCR accuracy, the regex parser is validated against a set of 10 text fixtures representing raw text outputs from different Spanish restaurant receipt styles.

- **Test Path**: `src/services/ocr/parser.test.ts`
- **Fixtures Directory**: `tests/fixtures/receipts/`
- **Requirements**:
  - The parser must correctly isolate the `subtotal`, `IVA/tax` (typically 10% in Spain), and `totalAmount`.
  - Item lines matching patterns like `2 TARTA DE QUESO 11.00` must resolve to 2 items at 5.50€ each.

### 3.2 Network Sync & Conflict Resolution
- **Simulating Offline State**: Stubbing `navigator.onLine` to return `false` during item additions.
- **Verification**:
  - Assert that items are stored in Dexie with `syncStatus: 'pending-update'`.
  - Stub `navigator.onLine` back to `true`, fire the online event, and verify that the sync manager pushes records to Firestore and changes status to `'synced'`.

---

## 4. End-to-End (E2E) Testing (Playwright)

Playwright is utilized to test the application under realistic mobile configurations (Safari iOS/Chrome Android emulation).

- **Critical Test Flows**:
  1. **User Flow (Core Offline)**:
     - Open SplitEat in offline mode.
     - Type a raw receipt block.
     - Add 3 participants (including 1 Family group).
     - Drag & drop 2 items onto the family.
     - Go to the "Dictación al Camarero" view and check that individual payments are shown correctly.
  2. **D&D Support Validation**:
     - Emulate mobile touch events (`touchstart`, `touchmove`, `touchend`) to verify items snap to participant bubbles.

---

## 5. Accessibility (A11y) Audit & Rules

SplitEat targets a broad audience, including elderly users or people in low-light environments (dimly lit restaurants). The application must comply with **WCAG 2.1 Level AA** standards.

### 5.1 WCAG 2.1 AA Checklist for SplitEat
- **Color Contrast**: All text and interactive components must maintain a contrast ratio of at least `4.5:1` (or `3:1` for large text). Verified during CI with `@axe-core/playwright`.
- **Keyboard & Focus States**:
  - Drag-and-drop must offer a keyboard fallback (e.g., clicking on a dish opens a modal list of participants to assign it to).
  - Clear focus indicator rings (`:focus-visible`) on all clickable buttons and input fields.
- **Semantic HTML & ARIA Attributes**:
  - Participant bubbles must have `aria-label="Participante {Nombre}, total asignado: {Precio} euros"`.
  - Live alerts (such as "Unassigned items remaining") must use `role="alert"` or `aria-live="polite"` so screen readers speak them instantly.
- **Tap Targets**: Mobile tap targets (buttons, checkmarks, avatares) must be at least `48x48px` to prevent misclicks in mobile environments.
