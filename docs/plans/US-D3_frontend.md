# Frontend Implementation Plan: US-D3 Vehicle Ownership Transfer

## Overview

Replace the “future version” stub on vehicle edit/detail with a **Transferir propietario** flow: pick an existing client (`ClientPicker`) or register a new one inline, confirm, call `POST /api/vehicles/:id/transfer-ownership`, then refresh vehicle/history/client queries. Show an **informational** warning when the vehicle has an active work order (transfer still allowed; OT snapshot owner does not change).

**Architecture principles:** feature folder `vehicles`; React Query mutation; reuse `ClientPicker` + client create schema patterns; Spanish UI; Playwright e2e; roles `ADMIN` + `MECHANIC` (same as vehicle routes).

**User story reference:** [`us/Deseables/US-D3-transferencia-propietario-vehiculo.md`](../../us/Deseables/US-D3-transferencia-propietario-vehiculo.md)

**Backend plan:** [`docs/plans/US-D3_backend.md`](./US-D3_backend.md)

**Prerequisites:** US-003/US-004 frontend; US-D3 backend transfer endpoint on `feature-entrega2-RFM`.

**Out of scope:** Ownership timeline page, undoing transfers, rewriting OT display owners, US-D5 required (nice if email search already works).

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query |
| Forms | react-hook-form + zod (create-client branch) |
| Styling | Tailwind |
| HTTP | `apiClient` |
| E2E | Playwright |

### Files to add/modify

```
apps/web/src/features/vehicles/
├── types/vehicle.types.ts
│     # TransferOwnershipRequest, TransferOwnershipResponse
├── services/vehiclesApi.ts
│     # transferOwnership()
├── hooks/useTransferOwnership.ts          # NEW
├── utils/mapVehiclesError.ts              # transfer 409/400 messages
├── components/
│   ├── TransferOwnershipDialog.tsx        # NEW — wizard/modal
│   ├── VehicleDetailHeader.tsx            # CTA Transferir
│   └── VehicleEditForm.tsx                # remove future stub; CTA / dialog
└── index.ts                               # export if needed

apps/web/src/features/clients/
└── utils/createClientSchema.ts            # reuse for inline create

apps/web/e2e/vehicles.spec.ts              # transfer scenarios
apps/web/README.md
```

### Routing

| Route | Access | Change |
|-------|--------|--------|
| `/vehicles/[id]` | ADMIN, MECHANIC | Add transfer CTA on header |
| `/vehicles/[id]/edit` | ADMIN, MECHANIC | Replace stub with transfer CTA |

No new dedicated page required (modal is enough).

### State management

| Concern | Approach |
|---------|----------|
| Vehicle detail | Existing `useVehicle` / page query |
| Active OT warning | Existing `useActiveWorkOrder(vehicleId)` |
| Transfer | `useTransferOwnership` mutation |
| Dialog steps | Local state: `mode: 'search' \| 'create' \| 'confirm'` |
| Selected client | Local `Client \| null` |
| Cache | Invalidate `['vehicles', id]`, `['vehicles']`, history keys, `['clients']` |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on delivery branch only.
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Confirm US-D3 backend endpoint available.
  3. Do **not** create `feature/US-D3-frontend`.
- **Notes:** Same entrega-2 convention as D1/D2 plans.

---

### Step 1: Types

- **File:** `types/vehicle.types.ts`
- **Action:** Request/response contracts.
- **Implementation Steps:**

```typescript
export type TransferOwnershipRequest =
  | { newClientId: string }
  | {
      createClient: {
        fullName: string;
        nationalId: string;
        phone?: string;
        email?: string;
      };
    };

export interface TransferOwnershipResponse extends Vehicle {
  ownershipTransferredAt: string;
  previousOwner: {
    id: string;
    fullName: string;
    nationalId: string;
  };
}
```

- **Dependencies:** Existing `Vehicle` / `CurrentOwner`.
- **Implementation Notes:** XOR enforced in UI before submit (never send both).

---

### Step 2: API Method

- **File:** `services/vehiclesApi.ts`
- **Action:** Call transfer endpoint.
- **Function Signature:**

```typescript
transferOwnership(
  vehicleId: string,
  body: TransferOwnershipRequest,
): Promise<TransferOwnershipResponse>
```

- **Implementation Steps:**
  1. `POST /vehicles/${vehicleId}/transfer-ownership` with JSON body.
  2. Return typed response.
- **Dependencies:** `apiClient`.
- **Implementation Notes:** Path matches backend plan.

---

### Step 3: `useTransferOwnership` Hook

- **File:** `hooks/useTransferOwnership.ts` (new)
- **Action:** Mutation + cache invalidation.
- **Implementation Steps:**
  1. `useMutation({ mutationFn: ({ vehicleId, body }) => vehiclesApi.transferOwnership(vehicleId, body) })`.
  2. On success invalidate:
     - `['vehicles', vehicleId]`
     - `['vehicles']` / search keys used by app
     - vehicle history query key(s) (`useVehicleHistory`)
     - `['clients']` (old/new owner profiles)
  3. Optionally `setQueryData` with returned vehicle for snappy header update.
- **Dependencies:** React Query.
- **Implementation Notes:** Mirror `useUpdateVehicle` / `useDeleteVehicle` patterns.

---

### Step 4: Extend `mapVehiclesError`

- **File:** `utils/mapVehiclesError.ts`
- **Action:** Map transfer-specific API messages to Spanish.
- **Implementation Steps:**
  1. `409` + `Client is already the current owner` → *“Este cliente ya es el propietario actual”*.
  2. `409` + concurrent ownership → *“El propietario cambió en otro proceso; actualiza e intenta de nuevo”*.
  3. `409` duplicate nationalId (US-003 style message) → *“Ya existe un cliente con esta identificación”* (reuse clients mapping if available).
  4. `400` XOR / no active ownership → clear Spanish strings.
  5. Keep plate-conflict and delete WO messages unchanged (match on message content carefully).
- **Dependencies:** `ApiError`.
- **Implementation Notes:** Prefer matching English `message` substrings from backend plan.

---

### Step 5: `TransferOwnershipDialog` Component

- **File:** `components/TransferOwnershipDialog.tsx` (new)
- **Action:** Multi-step modal for transfer.
- **Component Signature:**

```typescript
export function TransferOwnershipDialog({
  vehicle,
  open,
  onOpenChange,
  onSuccess,
}: {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: TransferOwnershipResponse) => void;
})
```

- **Implementation Steps:**
  1. Reuse `Modal` + `Button` like `DeleteVehicleDialog`.
  2. Header context: plate + current owner name.
  3. **Active OT banner** (informational, not blocking): if `useActiveWorkOrder(vehicle.id)` has active WO →  
     *“Hay una visita abierta; el propietario de esa orden de trabajo no cambiará.”*  
     Optional link *Ver orden activa*.
  4. Step **search**: embed/adapt `ClientPicker` (or its search modal) to select `Client`; exclude selecting current owner (disable/skip if same id; show hint).
  5. CTA **Registrar nuevo propietario** → step **create**: form with `createClientSchema` fields (fullName, nationalId, phone, email); primary continues to confirm with draft values (not persisted until API).
  6. Step **confirm**:  
     *“¿Transferir {placa} de {actual} a {nuevo}?”*  
     Confirm calls mutation with either `{ newClientId }` or `{ createClient }`.
  7. Pending: disable actions; show errors via `mapVehiclesError`.
  8. Success: close dialog; `onSuccess(result)`; toast on parent.
- **Dependencies:** `ClientPicker`, `createClientSchema`, `useTransferOwnership`, `useActiveWorkOrder`.
- **Implementation Notes:**
  - Prefer not nesting two full-screen modals; if `ClientPicker` opens its own modal, either lift search UI into this dialog or allow sequential modals carefully.
  - Create-client path should **not** call `POST /clients` alone — only via transfer body (backend creates in same TX).

---

### Step 6: Wire CTAs — Detail + Edit

- **Files:** `VehicleDetailHeader.tsx`, `VehicleEditForm.tsx`
- **Action:** Expose transfer entry points; remove future stub.
- **Implementation Steps:**
  1. **Detail header:** Button **Transferir propietario** (secondary) next to Editar; opens dialog with `vehicle` prop. Parent page owns `open` state if header is presentational — or stateful header with local dialog (prefer local dialog for less prop drilling).
  2. **Edit form:** Remove “versión futura” text; add button **Transferir propietario** under current owner box (same dialog).
  3. After success: update displayed `currentOwner` (invalidate/`router.refresh` if needed).
- **Dependencies:** Step 5.
- **Implementation Notes:** Both ADMIN and MECHANIC see CTA (layout already allows both roles on `/vehicles`).

---

### Step 7: Success Toast / Feedback

- **Files:** Detail page and/or edit page
- **Action:** User feedback after transfer.
- **Implementation Steps:**
  1. Toast: *“Propietario actualizado”* (include new name if easy).
  2. Ensure visit history section refetches so `currentOwner` in history header updates while visit cards keep old `ownerAtVisit` (regression visibility).
- **Dependencies:** Existing toast patterns or simple status banner.

---

### Step 8: Playwright E2E

- **File:** `e2e/vehicles.spec.ts` (extend)
- **Action:** Cover transfer happy paths + conflict.
- **Implementation Steps:**
  1. Login admin (and optionally mechanic).
  2. Open vehicle with known current owner.
  3. Transfer to **existing** other client via search → assert new owner on detail.
  4. Transfer via **new client** form (unique nationalId) → assert new owner.
  5. Attempt transfer to **same** owner → Spanish error.
  6. Optional: with active WO open, assert warning text visible but transfer still succeeds; history visit still shows previous owner snapshot if fixture exists.
  7. Do not regress plate edit / delete flows.
- **Dependencies:** API + seed clients/vehicles; Playwright storage states.
- **Implementation Notes:** Use unique nationalIds/timestamps to avoid 409 flakiness.

---

### Step 9: Update Technical Documentation

- **Action:** Mandatory docs update.
- **Implementation Steps:**
  1. Review UI entry points and API usage.
  2. Update `apps/web/README.md` — vehicles: transfer owner flow; remove “future” wording if present.
  3. Keep this plan aligned if UX steps change.
  4. English for `docs/*`; Spanish UI examples OK in web README if project already mixes.
  5. Report updated files in commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/frontend-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM`
2. Step 1 — Types
3. Step 2 — `vehiclesApi.transferOwnership`
4. Step 3 — `useTransferOwnership`
5. Step 4 — Error mapping
6. Step 5 — `TransferOwnershipDialog`
7. Step 6 — Detail + edit CTAs (remove stub)
8. Step 7 — Toast / invalidate UX
9. Step 8 — Playwright
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] Stub “versión futura” removed
- [ ] Transfer existing client updates `currentOwner` on detail/edit
- [ ] Transfer createClient works without prior standalone client create
- [ ] Same-owner shows Spanish conflict
- [ ] Duplicate nationalId on create path shows Spanish conflict
- [ ] Active OT warning shown; transfer not blocked
- [ ] History current owner updates; visit snapshots unchanged (manual or e2e)
- [ ] Cache invalidation: search results / client profiles not stale
- [ ] ADMIN and MECHANIC can transfer
- [ ] Playwright green

---

## Error Handling Patterns

| Case | UI |
|------|-----|
| Mutation pending | Disable confirm; loading label |
| 409 same owner | Alert in dialog |
| 409 duplicate nationalId | Alert; stay on create/confirm step |
| 409 concurrent | Alert + suggest refresh |
| 404 | Alert + close/refetch vehicle |
| Network | Generic connection error |

Keep errors inside dialog (`role="alert"`) until dismissed.

---

## UI/UX Considerations

- **Spanish** copy throughout.
- Confirmation step mandatory before API call.
- Informational (amber) banner for active OT — not an error.
- Reuse existing Modal/Button density; avoid new design language.
- Accessibility: dialog title *Transferir propietario*; focus return to CTA on close.
- Mobile: stack steps; full-width primary buttons.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D3 backend | Transfer endpoint |
| US-003 UI | `ClientPicker`, `createClientSchema` |
| US-004 UI | Vehicle detail/edit |
| `useActiveWorkOrder` | Warning only |
| **No new npm packages** | |

US-D5 (email in client search) improves picker UX but is not required.

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **Code English / UI Spanish.**
- **Do not** PATCH vehicle owner field — ownership is only via transfer API.
- **Do not** call create-client then transfer as two requests for the create path — single transfer body with `createClient`.
- Nested modals: if painful, inline client search list inside `TransferOwnershipDialog` instead of opening `ClientPicker`’s modal.

---

## Next Steps After Implementation

1. Commit on `feature-entrega2-RFM`
2. Manual smoke: transfer → open history → create new OT (new owner) with old visits intact
3. Continue other deseables on same branch

---

## Implementation Verification

### Code Quality

- [ ] Logic under `features/vehicles`
- [ ] Reused ClientPicker/schema where practical
- [ ] Playwright, not Cypress

### Functionality

- [ ] Both transfer modes work from detail and edit
- [ ] Active OT warning correct

### Testing

- [ ] E2E covers existing + create client paths

### Integration

- [ ] Types match `docs/plans/US-D3_backend.md`

### Documentation

- [ ] Step 9 completed
