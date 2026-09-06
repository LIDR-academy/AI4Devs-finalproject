# Frontend Implementation Plan: US-D7 Optional Work Order Mileage

## Overview

Make mileage **optional on create**, **editable from work order detail**, **null-safe everywhere** (*Sin registrar* instead of `0 km`), and add an **optional mileage capture** in the delivery confirmation dialog without blocking deliver. Wire new **`PATCH /work-orders/:id/mileage`** and optional body on **`PATCH /delivery/ready/:id/deliver`**.

**Architecture principles:** extend `work-orders`, `delivery-panel`, `history` features; React Query mutations; Zod optional mileage; Spanish UI; Playwright e2e.

**User story reference:** [`us/Deseables/US-D7-kilometraje-opcional-orden-trabajo.md`](../../us/Deseables/US-D7-kilometraje-opcional-orden-trabajo.md)

**Backend plan:** [`docs/plans/US-D7_backend.md`](./US-D7_backend.md)

**Prerequisites:** US-D7 backend + migration on `feature-entrega2-RFM`.

**Out of scope:** Mileage history audit UI, blocking validation on decreasing km.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Forms | react-hook-form + zod |
| Server state | React Query |
| E2E | Playwright |

### Files to add/modify

```
apps/web/src/features/work-orders/
├── types/work-order.types.ts              # mileage: number | null; assignedMechanic if D8
├── utils/createWorkOrderSchema.ts         # optional mileage
├── utils/formatMileage.ts                 # NEW — null-safe display
├── components/WorkOrderCreateForm.tsx     # empty default + help text
├── components/WorkOrderDetailHeader.tsx   # Sin registrar + edit CTA
├── components/UpdateMileageDialog.tsx     # NEW
├── hooks/useUpdateMileage.ts              # NEW
└── services/workOrdersApi.ts              # updateMileage()

apps/web/src/features/delivery-panel/
├── types/delivery.types.ts                # mileage nullable; deliver body
├── services/deliveryApi.ts                # markDelivered optional body
├── components/MarkDeliveredDialog.tsx     # reminder + optional input
└── components/DeliveryReadyDetail.tsx     # null-safe display

apps/web/src/features/history/
├── types/history.types.ts                 # mileage: number | null
├── utils/normalizeHistoryVisit.ts         # remove ?? 0
└── components/VisitCard.tsx                 # formatMileage helper

apps/web/e2e/work-orders.spec.ts
apps/web/e2e/delivery-panel.spec.ts
apps/web/README.md
```

### State management

| Concern | Approach |
|---------|----------|
| Create | Form empty mileage → `null` in POST body |
| Detail mileage | `useUpdateMileage` → invalidate `['work-orders', id]` |
| Deliver | `useMarkDelivered` accepts optional `{ mileage?: number }` |
| Display | `formatMileage(mileage)` → *Sin registrar* or `{n} km` |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`

---

### Step 1: Types — Nullable Mileage

- **Files:** `work-order.types.ts`, `delivery.types.ts`, `history.types.ts`
- **Action:** `mileage: number | null` on all WO/visit shapes.
- **Implementation Steps:**
  1. Update create request: `mileage?: number | null`.
  2. Update deliver response to include nullable mileage.
  3. Add `UpdateMileageResponse` if backend returns partial WO fields.

---

### Step 2: `formatMileage` Helper

- **File:** `utils/formatMileage.ts` (new, under work-orders or shared)
- **Function Signature:**

```typescript
export function formatMileage(mileage: number | null | undefined): string
```

- **Implementation Steps:**
  1. `null` / `undefined` → *Sin registrar*.
  2. `0` → *0 km* (valid persisted zero).
  3. Else → `{toLocaleString('es-CR')} km`.
- **Dependencies:** None.

---

### Step 3: Create Form — Optional Mileage

- **Files:** `createWorkOrderSchema.ts`, `WorkOrderCreateForm.tsx`
- **Implementation Steps:**
  1. Zod: `mileage: z.union([z.number().int().min(0), z.null()]).optional()` or preprocess empty string → null.
  2. Remove default `mileage: 0` → use `undefined` / empty.
  3. Help text: *“Puede completarse más adelante (p. ej. vehículo varado)”*.
  4. Input: allow empty; on submit map empty → `mileage: null` in API payload (not `0`).
  5. `register('mileage', { valueAsNumber: true })` — handle `NaN` as null.
- **Dependencies:** Step 1.

---

### Step 4: API + Hook — `updateMileage`

- **Files:** `workOrdersApi.ts`, `hooks/useUpdateMileage.ts`
- **Function Signatures:**

```typescript
updateMileage(workOrderId: string, mileage: number | null): Promise<UpdateMileageResponse>
export function useUpdateMileage()
```

- **Implementation Steps:**
  1. `PATCH /work-orders/${id}/mileage` body `{ mileage }`.
  2. Mutation invalidates `['work-orders', id]` and delivery keys if applicable.
- **Dependencies:** Backend Step 3.

---

### Step 5: `UpdateMileageDialog` + Detail Header

- **Files:** `UpdateMileageDialog.tsx`, `WorkOrderDetailHeader.tsx`
- **Implementation Steps:**
  1. Header shows `formatMileage(workOrder.mileage)`.
  2. Button **Registrar / editar kilometraje** when OT not read-only OR admin on delivered (match backend rules: hide for mechanic on ENTREGADA).
  3. Dialog: numeric input optional; allow clear → submit `null`.
  4. Validation: int ≥ 0; Spanish errors.
  5. Optional soft warning if new km < previous visit km (client-side fetch history or skip in V2).
  6. Success toast *Kilometraje actualizado*.
- **Dependencies:** Steps 2, 4.

---

### Step 6: Delivery — Extend `markDelivered` + Dialog

- **Files:** `deliveryApi.ts`, `MarkDeliveredDialog.tsx`, `DeliveryReadyDetail.tsx`, `useMarkDelivered.ts`
- **Implementation Steps:**
  1. `markDelivered(workOrderId, body?: { mileage?: number })` — send JSON only when mileage provided.
  2. Pass `target.mileage` into dialog (extend target type).
  3. If `mileage == null`: show amber notice *Kilometraje no registrado* + optional number input.
  4. Primary confirm still delivers; secondary copy *Entregar sin kilometraje* when field empty.
  5. If user fills mileage → include in PATCH body.
  6. `DeliveryReadyDetail`: use `formatMileage`.
- **Dependencies:** Backend Step 5.

---

### Step 7: History Null-Safe

- **Files:** `normalizeHistoryVisit.ts`, `VisitCard.tsx`
- **Implementation Steps:**
  1. Remove `mileage: visit.mileage ?? 0`.
  2. Use `formatMileage(visit.mileage)` in card.
- **Dependencies:** Step 2.

---

### Step 8: Playwright E2E

- **Files:** `work-orders.spec.ts`, `delivery-panel.spec.ts`
- **Scenarios:**
  1. Create OT with empty mileage → success; detail shows *Sin registrar*.
  2. Edit mileage from detail → value appears.
  3. Delivery flow: ready WO without mileage → dialog shows reminder → deliver without filling → success; still *Sin registrar* in history if checked.
  4. Optional: deliver with mileage filled in dialog.
- **Dependencies:** Admin auth for delivery tests.

---

### Step 9: Update Technical Documentation

- **File:** `apps/web/README.md`
- **Action:** Document optional mileage on create, detail edit, delivery reminder.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — formatMileage
4. Step 3 — Create form
5. Step 4 — updateMileage API/hook
6. Step 5 — Detail dialog + header
7. Step 6 — Delivery dialog + API
8. Step 7 — History
9. Step 8 — E2E
10. Step 9 — Docs

---

## Testing Checklist

- [ ] Create with empty mileage → null (not 0)
- [ ] Create with valid mileage still works
- [ ] Detail *Sin registrar* when null
- [ ] Edit mileage on EN_PROCESO
- [ ] Mechanic cannot edit on ENTREGADA (button hidden/disabled)
- [ ] Delivery reminder when null; deliver without blocking
- [ ] Deliver with mileage in dialog persists value
- [ ] History no longer shows 0 for null
- [ ] Regression: existing flows with mileage still work

---

## Error Handling Patterns

| Source | UI |
|--------|-----|
| Invalid mileage input | Zod inline Spanish |
| PATCH 403 post-delivery mechanic | Toast *No puedes editar el kilometraje de una orden entregada* |
| Deliver 400 invalid mileage | Dialog alert; no deliver |

---

## UI/UX Considerations

- **Never default to 0** on create.
- **Spanish** help and reminder copy.
- **Delivery:** optional field must not block primary deliver action.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D7 backend | Migration + endpoints |
| US-008 delivery | MarkDeliveredDialog |
| US-005 create | WorkOrderCreateForm |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **Coordinate US-D1:** Delivery works from OWNER_CONTACTED — mileage edit allowed in same pre-delivery statuses.

---

## Next Steps After Implementation

1. US-D8 plans/implementation
2. Manual test: varado vehicle intake → later km at delivery

---

## Implementation Verification

### Code Quality

- [ ] Single `formatMileage` used across surfaces
- [ ] No `?? 0` for display

### Functionality

- [ ] US-D7 FE criteria complete

### Testing

- [ ] E2E create + deliver paths

### Documentation

- [ ] README updated
