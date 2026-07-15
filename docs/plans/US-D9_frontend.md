# Frontend Implementation Plan: US-D9 Ownerless Intake (Third-Party Bringer)

## Overview

Surface **ownerless vehicle registration** and work-order **`THIRD_PARTY` intake** (external bringer: name required, phone optional), show **“Traído por…”** on detail / delivery / history, allow optional **`link-owner`**, and gate **US-D1 contact** when the visit has no owner — without inventing a client.

**Architecture principles:** feature folders (`vehicles`, `work-orders`, `delivery-panel`, `history`); react-hook-form + zod; React Query invalidation; Spanish UI copy; English API/types; Playwright e2e; null-safe rendering everywhere `owner` / `currentOwner` / `ownerAtVisit` used to be required.

**User story reference:** [`us/Deseables/US-D9-ingreso-sin-propietario-mecanico-externo.md`](../../us/Deseables/US-D9-ingreso-sin-propietario-mecanico-externo.md)

**Backend plan:** [`docs/plans/US-D9_backend.md`](./US-D9_backend.md)

**Prerequisites:** US-D9 **backend complete and running** on `feature-entrega2-RFM` (nullable `ownerClientId`, `broughtBy*`, optional vehicle `clientId`, `PATCH .../link-owner`, delivery/history null-safe). Do **not** start FE against mocks.

**Out of scope:** US-D3 transfer UI, editing `broughtBy*` after create, undoing link-owner, inventing placeholder clients, Cypress (project uses Playwright).

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Forms | react-hook-form + zod |
| Server state | React Query |
| E2E | Playwright (`apps/web/e2e`) |

### Files to add/modify

```
apps/web/src/features/vehicles/
├── types/vehicle.types.ts                 # currentOwner null; clientId optional on create
├── utils/createVehicleSchema.ts           # conditional clientId
├── components/VehicleForm.tsx             # toggle “Registrar sin propietario”
├── components/VehicleDetail* / lists      # null-safe currentOwner (search hits if any)
└── services/vehiclesApi.ts                # omit clientId when ownerless

apps/web/src/features/work-orders/
├── types/work-order.types.ts              # nullable owner; intakeMode; broughtBy*; link types
├── utils/createWorkOrderSchema.ts         # intakeMode + broughtBy superRefine
├── utils/mapWorkOrdersError.ts            # new 400/409 messages (ES)
├── services/workOrdersApi.ts              # create body + linkOwner()
├── hooks/useLinkOwner.ts                  # NEW
├── components/VehicleStepPicker.tsx       # null-safe owner line
├── components/WorkOrderCreateForm.tsx     # mode radios + bringer fields
├── components/WorkOrderDetailHeader.tsx   # Sin propietario / Traído por / CTA
├── components/LinkOwnerDialog.tsx         # NEW (ClientPicker)
└── components/WorkOrderDetailPage.tsx     # wire dialog if needed

apps/web/src/features/delivery-panel/
├── types/delivery.types.ts                # nullable owner*; broughtBy*
├── utils/mapDeliveryError.ts              # no-owner contact 409
├── components/DeliveryReadyTable.tsx
├── components/DeliveryReadyDetail.tsx
└── components/DeliveryPanelPage.tsx       # hide mark-contacted when no owner

apps/web/src/features/history/
├── types/history.types.ts
├── utils/normalizeHistoryVisit.ts
└── components/VisitCard.tsx

apps/web/e2e/vehicles.spec.ts             # or extend existing
apps/web/e2e/work-orders.spec.ts
apps/web/e2e/delivery-panel.spec.ts
apps/web/README.md
```

### Routing

No new routes. Reuse:

| Route | Change |
|-------|--------|
| `/vehicles/new` | Ownerless toggle |
| `/work-orders/new` | Intake mode + bringer |
| `/work-orders/[id]` | Intake block + link owner |
| `/admin/delivery` | Null owner + no D1 CTA |
| `/vehicles/[id]` history | Visit ownerless + broughtBy |

### State management

| Concern | Approach |
|---------|----------|
| Create vehicle/OT | Form submit → API; invalidate `['vehicles']` / work-order queries |
| Link owner | `useLinkOwner` → invalidate `['work-orders', id]`, `['vehicles']`, `['delivery']`, history keys used by page |
| Mechanics list | Unrelated (US-D8); keep existing invalidation |
| Delivery list | Refetch after deliver/contact; contact button gated in UI |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`
- **Action:** Confirm US-D9 backend is merged/running locally (DEV API). Do not create `feature/US-D9-frontend`.
- **Smoke before coding:**  
  - `POST /api/vehicles` without `clientId` → 201  
  - `POST /api/work-orders` with `intakeMode: THIRD_PARTY` → 201  

---

### Step 1: Types — Nullability + Intake

- **Files:** `vehicle.types.ts`, `work-order.types.ts`, `delivery.types.ts`, `history.types.ts`
- **Implementation Steps:**

```typescript
// vehicles
currentOwner: CurrentOwner | null;
CreateVehicleRequest: { ...; clientId?: string }; // omit when ownerless

// work-orders
export type WorkOrderIntakeMode = 'OWNER' | 'THIRD_PARTY';

export interface CreateWorkOrderRequest {
  vehicleId: string;
  entryReason: string;
  mileage: number | null;
  assignedMechanicId?: string;
  initialTasks: { description: string }[];
  intakeMode?: WorkOrderIntakeMode;
  broughtByName?: string;
  broughtByPhone?: string | null;
}

export interface WorkOrderDetail {
  // ...
  ownerClientId: string | null;
  owner: { fullName: string; nationalId: string } | null;
  broughtByName: string | null;
  broughtByPhone: string | null;
  intakeMode: WorkOrderIntakeMode; // derived by API
}

export interface LinkWorkOrderOwnerResponse {
  id: string;
  ownerClientId: string;
  owner: { fullName: string; nationalId: string };
  broughtByName: string | null;
  broughtByPhone: string | null;
  vehicleOwnerUnchanged: boolean;
  updatedAt: string;
}

// delivery
ownerName: string | null;
ownerPhone: string | null;
ownerPhoneDisplay: string | null;
ownerEmail: string | null;
broughtByName: string | null;
broughtByPhone: string | null;
// detail.owner: DeliveryOwner | null

// history
ownerAtVisit: OwnerAtVisit | null;
broughtByName: string | null;
broughtByPhone: string | null;
currentOwner: { id: string; fullName: string; nationalId: string } | null; // if exposed on history envelope
```

- **Dependencies:** Backend response contracts from US-D9 BE plan.
- **Notes:** Fix compile errors driven by required → nullable (intentional Step 1+2 cascade).

---

### Step 2: API Clients

- **Files:** `vehiclesApi.ts`, `workOrdersApi.ts`
- **Implementation Steps:**
  1. `vehiclesApi.create`: if no `clientId`, **omit** property from JSON (do not send `null` unless BE explicitly accepts it — BE plan: omit).
  2. `workOrdersApi.create`: pass `intakeMode`, `broughtByName`, `broughtByPhone` when THIRD_PARTY; for OWNER omit broughtBy fields.
  3. Add:

```typescript
linkOwner(workOrderId: string, clientId: string): Promise<LinkWorkOrderOwnerResponse> {
  return apiClient(`/work-orders/${workOrderId}/link-owner`, {
    method: 'PATCH',
    body: JSON.stringify({ clientId }),
  });
}
```

- **Dependencies:** Step 1.

---

### Step 3: Vehicle Create — Schema + Form

- **Files:** `createVehicleSchema.ts`, `VehicleForm.tsx`
- **Schema approach (zod discriminated / refine):**

```typescript
// Conceptual: boolean withoutOwner on form
// If withoutOwner === true → clientId optional/empty and stripped on submit
// Else → clientId uuid required (current behavior)
```

- **UI:**
  1. Checkbox/toggle: **Registrar sin propietario**
  2. Help: *Útil cuando lo trae un taller externo; se puede asociar dueño después.*
  3. When checked: hide or disable `ClientPicker`; clear `clientId`.
  4. Success panel: allow continuing to **Nueva OT** even without owner (existing deep-link if any — keep workable).
- **Submit:** omit `clientId` when ownerless.
- **Null-safe display** after create: do not read `createdVehicle.currentOwner.fullName` without optional chaining.
- **Dependencies:** Step 2.

---

### Step 4: Vehicle Picker / Lists Null-Safe

- **Files:** `VehicleStepPicker.tsx`, any vehicle search/table showing `currentOwner.fullName`
- **Implementation Steps:**
  1. Display *Sin propietario* when `currentOwner == null`.
  2. Ensure selecting an ownerless vehicle is allowed on create OT.
- **Dependencies:** Step 1.

---

### Step 5: Create OT — Schema + Form (Intake Modes)

- **Files:** `createWorkOrderSchema.ts`, `WorkOrderCreateForm.tsx`, `mapWorkOrdersError.ts`
- **Schema:**

```typescript
intakeMode: z.enum(['OWNER', 'THIRD_PARTY']).default('OWNER'),
broughtByName: z.string().optional(),
broughtByPhone: z.string().optional(), // refine digits
```

Use `.superRefine`:

| Mode | Rules |
|------|-------|
| `OWNER` | If selected vehicle has `currentOwner == null` → form error; suggest switching mode |
| `THIRD_PARTY` | `broughtByName` trim min 2 / max 150; phone empty OK else `/^[0-9]{8,15}$/` |

- **UI:**
  1. Radio/tabs: **Dueño / cliente** | **Traído por tercero**
  2. THIRD_PARTY fields: **Nombre de quien lo trae*** , **Teléfono (opcional)**
  3. OWNER mode summary: show vehicle owner; if null → inline error + shortcut to switch mode
  4. Soft notice when vehicle **has** owner but mode is THIRD_PARTY: *Esta visita no asociará al dueño de la ficha.*
  5. Do **not** confuse with **Mecánico asignado** (`MechanicSelect`).
- **Submit payload:**

```typescript
{
  ...,
  intakeMode: values.intakeMode,
  ...(values.intakeMode === 'THIRD_PARTY'
    ? {
        broughtByName: values.broughtByName.trim(),
        broughtByPhone: values.broughtByPhone?.trim() || null,
      }
    : {}),
}
```

- **Error mapping (ES):**

| API message contains | UI |
|----------------------|-----|
| `broughtByName is required` | Indica el nombre de quien trae el vehículo |
| `broughtBy fields are only valid` | Quita los datos de tercero o cambia el modo |
| `Vehicle has no active owner` | El vehículo no tiene dueño; usa “Traído por tercero” |
| Active WO conflict | Existing copy |

- **Dependencies:** Steps 2–4; vehicle detail loaded for selected plate must expose `currentOwner`.

---

### Step 6: Work Order Detail — Intake Block + Link Owner

- **Files:** `WorkOrderDetailHeader.tsx`, `LinkOwnerDialog.tsx` (NEW), `useLinkOwner.ts` (NEW), `WorkOrderDetailPage.tsx`
- **Header display:**

| Condition | UI |
|-----------|-----|
| `owner` present | *Propietario: {name} ({nationalId})* (current) |
| `owner` null | *Sin propietario* |
| `broughtByName` set | *Traído por: {name}* + phone if any (tel link `tel:`) |
| Both | Show owner **and** keep broughtBy (evidence) |

- **CTA:** If `ownerClientId == null`, button **Asociar propietario**.
- **`LinkOwnerDialog`:**
  1. Reuse vehicles `ClientPicker` (or clients search) — same pattern as vehicle form.
  2. Confirm → `workOrdersApi.linkOwner`.
  3. On success: close; invalidate detail + vehicles + delivery queries.
  4. If `vehicleOwnerUnchanged === true`, toast/info: *El dueño registrado del vehículo es otro; esta visita queda asociada al cliente seleccionado sin transferir la placa.*
- **`useLinkOwner`:**

```typescript
onSuccess: (_data, { workOrderId }) => {
  qc.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
  qc.invalidateQueries({ queryKey: ['vehicles'] });
  qc.invalidateQueries({ queryKey: ['delivery'] });
}
```

- **Dependencies:** Step 2.

---

### Step 7: Delivery Panel — Null Owner + Gate D1

- **Files:** `delivery.types.ts`, `DeliveryReadyTable.tsx`, `DeliveryReadyDetail.tsx`, `DeliveryPanelPage.tsx`, `mapDeliveryError.ts`
- **Implementation Steps:**
  1. Types: nullable owner fields + `broughtByName` / `broughtByPhone`.
  2. Table owner cell: `ownerName ?? 'Sin propietario'`; optional secondary line for bringer.
  3. Detail: null-safe `owner.*`; show bringer block.
  4. **Mark contacted:** show button only if `ownerName` / `ownerClient` equivalent present — safest: `Boolean(detail.owner)` or `item.ownerName != null` **and** status allows D1. Prefer detail/list field once BE exposes consistency; if only names: `ownerName != null`.
  5. Map `Work order has no owner to contact` → *Esta orden no tiene propietario para contactar.*
  6. Deliver flow unchanged (must work without owner).
- **Dependencies:** Step 1; US-D1 UI already present.

---

### Step 8: History — VisitCard Null-Safe + BroughtBy

- **Files:** `history.types.ts`, `normalizeHistoryVisit.ts`, `VisitCard.tsx` (+ parent that passes `currentOwnerNationalId`)
- **Implementation Steps:**
  1. `ownerAtVisit` nullable; `broughtBy*` on visit.
  2. Normalizer: if `ownerAtVisit == null`, keep null (do not invent empty strings).
  3. VisitCard:
     - No owner → *Sin propietario*
     - Owner present → existing transfer badge logic vs `currentOwnerNationalId` — only compare when both non-null
     - If `broughtByName` → *Traído por: …*
  4. Parent history page: `currentOwner` may be null → pass nationalId as `''` or optional prop; avoid crash.
- **Dependencies:** Step 1.

---

### Step 9: Playwright E2E

- **Files:** `e2e/vehicles.spec.ts` (extend/create), `e2e/work-orders.spec.ts`, `e2e/delivery-panel.spec.ts`
- **Scenarios (minimum):**

| # | Flow |
|---|------|
| 1 | Create vehicle with **Registrar sin propietario** → success, UI shows sin propietario |
| 2 | Create OT mode **Traído por tercero** with name → detail shows Traído por + Sin propietario |
| 3 | OWNER mode blocked/errors when vehicle has no owner (UI validation) |
| 4 | Link owner from detail → propietario shown; Traído por remains |
| 5 | Vehicle with owner + THIRD_PARTY OT → visit without associating ficha owner on detail |
| 6 | Delivery: ownerless ready row shows Sin propietario; no Mark Contacted; Deliver OK |
| 7 | History: visit shows Sin propietario + Traído por |

- **Auth:** existing admin/mechanic storage states.
- **Data:** unique plates/names with timestamps.
- **Dependencies:** Steps 3–8; live API with D9 BE.

---

### Step 10: Update Technical Documentation

- **File:** `apps/web/README.md`
- **Action:** Document ownerless vehicle toggle, OT intake modes, link-owner CTA, delivery/history null owner behavior.
- **Language:** English for README technical sections (project doc standard); UI strings remain Spanish in code.
- **Optional:** note dependency on US-D9 API fields.
- **Notes:** Mandatory before FE Done.

---

## Implementation Order

1. Step 0 — Branch + BE smoke  
2. Step 1 — Types  
3. Step 2 — API clients  
4. Step 3 — Vehicle form ownerless  
5. Step 4 — Vehicle picker null-safe  
6. Step 5 — Create OT intake UI  
7. Step 6 — Detail + LinkOwnerDialog  
8. Step 7 — Delivery panel  
9. Step 8 — History VisitCard  
10. Step 9 — Playwright e2e  
11. Step 10 — README  

---

## Testing Checklist

- [ ] Vehicle create without owner succeeds; with owner regressions OK  
- [ ] OT THIRD_PARTY requires name; phone optional validation  
- [ ] OT OWNER with ownerless vehicle blocked in UI  
- [ ] THIRD_PARTY on owned plate does not show visit owner until link  
- [ ] Link owner updates detail; soft message when `vehicleOwnerUnchanged`  
- [ ] Double link prevented (API 409 → Spanish error)  
- [ ] Delivery: no D1 without owner; deliver works  
- [ ] History null-safe + broughtBy  
- [ ] MechanicSelect / mileage / D1-with-owner unaffected (regression)  
- [ ] `npm run lint` / `npm run build` green  

---

## Error Handling Patterns

| Source | Pattern |
|--------|---------|
| Zod form | Inline field errors (Spanish) |
| API 400/409 | `mapWorkOrdersError` / `mapDeliveryError` / vehicles mapper |
| Link owner 409 | *Esta orden ya tiene propietario asociado* |
| Link owner 404 client | *Cliente no encontrado* |
| Network | Existing toast/inline alert patterns |

Do not swallow API errors when UI gate fails open — keep BE as source of truth.

---

## UI/UX Considerations

| Topic | Guidance |
|-------|----------|
| Language | Spanish labels/help; no English in user-visible form text |
| Clarity | Separate **quién trae** vs **mecánico asignado del taller** |
| Progressive | Link owner is optional CTA, not mandatory wizard step |
| Delivery | Prefer hide D1 button over opening dialog that always fails |
| A11y | Radios with labels; checkbox associated; focus trap in `LinkOwnerDialog` via existing `Modal` |
| Responsive | Keep single-column form patterns used in create OT/vehicle |
| Loading | Disable submit while mutation pending; spinner on link |

Visual system: reuse existing `Button`, `Modal`, borders/slate tokens — no new design language.

---

## Dependencies

| Package | Already in project |
|---------|-------------------|
| react-hook-form, zod, @hookform/resolvers | Yes |
| @tanstack/react-query | Yes |
| Playwright | Yes |
| ClientPicker | Reuse from vehicles feature |

No new npm dependencies.

---

## Notes

- **Branch:** `feature-entrega2-RFM` only (Deseables policy).  
- **English:** types, API fields, README, commit messages. **Spanish:** UI strings.  
- **TypeScript:** strict null checks — eliminate non-null assertions on `owner!`.  
- **Cache:** invalidate mechanics only if unrelated; always invalidate WO detail after link.  
- **BE contract:** `intakeMode` is **response-derived**; send it on create for clarity.  
- Do not call destructive DB scripts from FE/e2e against production.

---

## Next Steps After Implementation

1. Manual DoD on DEV (`localhost:3010`): authority plate lookup via vehicle history.  
2. Commit / push / prod deploy only when product owner requests (FE rebuild `web` in `C:\Despliegues`).  
3. No separate FE branch merge — same entrega2 branch.

---

## Implementation Verification

### Code Quality
- [ ] No unsafe `.owner.fullName` without null checks  
- [ ] Types align with BE DTOs  
- [ ] Lint/build clean  

### Functionality
- [ ] Ownerless intake E2E path works  
- [ ] Link owner + second THIRD_PARTY visit OK  
- [ ] D1 gated; deliver OK  

### Testing
- [ ] Playwright scenarios above green against DEV stack  

### Integration
- [ ] Against real US-D9 API (no mocks)  

### Documentation
- [ ] `apps/web/README.md` updated (Step 10)  
