# Frontend Implementation Plan: US-005 Create Work Order

## Overview

Implement the **work order creation UI** for MecaTrack (US-005): vehicle intake wizard on `/work-orders/new`, form with entry reason, mileage, optional mechanic, and dynamic initial tasks; block when an active work order exists; redirect to minimal detail on `/work-orders/[id]` (extended in US-006). Accessible to both `ADMIN` and `MECHANIC`.

**Architecture principles:** feature-folder `work-orders`, reuse `VehicleSearchBar` from US-004, React Query for mechanics/active WO checks, Spanish UI, invalidate vehicle history cache on create.

**User story reference:** [`us/US-005-crear-orden-trabajo.md`](../../us/US-005-crear-orden-trabajo.md)

**Prerequisites:** US-001 frontend, US-004 frontend (`VehicleSearchBar`, `vehiclesApi`), US-005 backend.

**Out of scope:** full task management UI (US-006), technical notes (US-007), edit/cancel/reopen work orders.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Forms | `react-hook-form` + `zod` + `useFieldArray` for initial tasks |
| Styling | Tailwind CSS |

### Feature files

```
apps/web/src/features/work-orders/
├── components/
│   ├── WorkOrderCreateWizard.tsx
│   ├── VehicleStepPicker.tsx
│   ├── WorkOrderCreateForm.tsx
│   ├── InitialTasksEditor.tsx
│   ├── MechanicSelect.tsx
│   ├── ActiveWorkOrderBanner.tsx
│   ├── WorkOrderDetailPlaceholder.tsx   # minimal /work-orders/[id] until US-006
│   └── WorkOrderStatusBadge.tsx
├── hooks/
│   ├── useCreateWorkOrder.ts
│   ├── useActiveWorkOrder.ts
│   ├── useMechanics.ts
│   └── useWorkOrder.ts
├── services/
│   └── workOrdersApi.ts
├── types/
│   └── work-order.types.ts
└── utils/
    └── workOrderStatusLabel.ts

apps/web/src/app/work-orders/
├── layout.tsx                           # ProtectedRoute ADMIN + MECHANIC
├── new/page.tsx                         # wizard (+ ?vehicleId=)
└── [id]/page.tsx                        # minimal detail

apps/web/src/features/vehicles/
└── components/VehicleDetailHeader.tsx   # wire Nueva OT + active check
```

### Routing

| Route | Roles | Purpose |
|-------|-------|---------|
| `/work-orders/new` | `ADMIN`, `MECHANIC` | Vehicle pick + create form |
| `/work-orders/[id]` | `ADMIN`, `MECHANIC` | Post-create detail (placeholder → US-006) |

### Wizard flow (≤ 3 steps)

```
Step 1: Select vehicle (search or ?vehicleId= prefill)
   ↓
Check active WO → banner blocks form if exists
   ↓
Step 2: OT form (entryReason, mileage, mechanic, initialTasks)
   ↓
POST → redirect /work-orders/[id]
```

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-005-frontend`
- **Base:** `feature-entrega2-RFM` with US-004 frontend merged.
- `git checkout -b feature/US-005-frontend`

---

### Step 1: Types — `work-order.types.ts`

```typescript
export type WorkOrderStatus = 'EN_PROCESO' | 'LISTA_PARA_ENTREGA' | 'OWNER_CONTACTED' | 'ENTREGADA';
export type WorkOrderTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface MechanicSummary {
  id: string;
  fullName: string;
}

export interface ActiveWorkOrder {
  id: string;
  status: WorkOrderStatus;
  checkedInAt: string;
}

export interface WorkOrderTask {
  id: string;
  description: string;
  status: WorkOrderTaskStatus;
  cost: number | null;
  sortOrder?: number;
}

export interface CreateWorkOrderRequest {
  vehicleId: string;
  entryReason: string;
  mileage: number;
  assignedMechanicId?: string;
  initialTasks: { description: string }[];
}

export interface WorkOrderDetail {
  id: string;
  vehicleId: string;
  ownerClientId: string;
  status: WorkOrderStatus;
  entryReason: string;
  mileage: number;
  assignedMechanicId: string | null;
  checkedInAt: string;
  tasks: WorkOrderTask[];
  vehicle: { licensePlate: string; brand: string; model: string };
  owner: { fullName: string; nationalId: string };
}
```

---

### Step 2: Work Orders API Service

- **File:** `apps/web/src/features/work-orders/services/workOrdersApi.ts`

```typescript
export const workOrdersApi = {
  getMechanics(): Promise<MechanicSummary[]>;
  getActiveByVehicle(vehicleId: string): Promise<{ activeWorkOrder: ActiveWorkOrder | null }>;
  create(data: CreateWorkOrderRequest): Promise<WorkOrderDetail>;
  getById(id: string): Promise<WorkOrderDetail>;
};
```

| Method | Endpoint |
|--------|----------|
| `getMechanics` | `GET /work-orders/mechanics` |
| `getActiveByVehicle` | `GET /work-orders/active?vehicleId=` |
| `create` | `POST /work-orders` |
| `getById` | `GET /work-orders/:id` |

- **409 on create:** Parse `activeWorkOrderId` from error body for banner/link.

---

### Step 3: React Query Hooks

#### `useMechanics.ts`

```typescript
export function useMechanics() {
  return useQuery({
    queryKey: ['work-orders', 'mechanics'],
    queryFn: () => workOrdersApi.getMechanics(),
    staleTime: 5 * 60 * 1000,
  });
}
```

#### `useActiveWorkOrder.ts`

```typescript
export function useActiveWorkOrder(vehicleId: string | null) {
  return useQuery({
    queryKey: ['work-orders', 'active', vehicleId],
    queryFn: () => workOrdersApi.getActiveByVehicle(vehicleId!),
    enabled: !!vehicleId,
  });
}
```

#### `useCreateWorkOrder.ts`

- On success: invalidate `['vehicles', vehicleId, 'history']`, `['work-orders', 'active', vehicleId]`.
- Return created `id` for redirect.

#### `useWorkOrder.ts`

- For detail page and post-create view.

---

### Step 4: `VehicleStepPicker` Component

- **File:** `apps/web/src/features/work-orders/components/VehicleStepPicker.tsx`

- Reuses `VehicleSearchBar` + `VehicleSearchResults` from US-004.
- On vehicle select: set `selectedVehicle` state; show summary card:
  - Plate, brand/model/year, `currentOwner.fullName` + `nationalId`.
- **No results CTA:** **Registrar vehículo** → `/vehicles/new` (document return URL: after US-004 create, link to `/work-orders/new?vehicleId=`).
- **`?vehicleId=` prefill:** `vehiclesApi.getById(vehicleId)` on mount → auto-select vehicle.

---

### Step 5: `ActiveWorkOrderBanner` Component

- Shown when `useActiveWorkOrder` returns `activeWorkOrder`.
- Message: *"Este vehículo ya tiene una orden de trabajo activa."*
- Link **Ver orden de trabajo** → `/work-orders/[activeWorkOrder.id]`.
- **Disable** `WorkOrderCreateForm` when banner visible.

---

### Step 6: `MechanicSelect` Component

- Select with first option *"Sin asignar"* (`value=""` → omit `assignedMechanicId` on submit).
- Options from `useMechanics()`.
- Loading/disabled states.

---

### Step 7: `InitialTasksEditor` Component

- **File:** uses `useFieldArray` from `react-hook-form`.

```typescript
export function InitialTasksEditor({ control }: { control: Control<FormValues> }): JSX.Element
```

- Dynamic rows: description input each.
- Buttons **Agregar tarea** / **Quitar** (min 1 row; disable remove on last row).
- Validation per row: 3–300 chars.

---

### Step 8: `WorkOrderCreateForm` Component

| Field | zod |
|-------|-----|
| `entryReason` | 5–500 chars |
| `mileage` | int ≥ 0 |
| `assignedMechanicId` | optional UUID |
| `initialTasks` | array min 1 |

- Hidden `vehicleId` from wizard step.
- **Mileage warning (optional MVP):** If last visit mileage from vehicle history > entered value, show non-blocking info alert *"El kilometraje es menor al de la última visita"* — fetch last visit from `useVehicleHistory` when vehicle selected.
- Submit: `useCreateWorkOrder` → `router.push(`/work-orders/${id}`)`.
- **409:** Show banner with link to `activeWorkOrderId`.

---

### Step 9: `WorkOrderCreateWizard` Component

- Orchestrates steps:
  1. Vehicle selection (or prefill).
  2. Form (if no active WO).
- Step indicator optional (*Paso 1 de 2*).
- **Change vehicle** link to go back to step 1.

---

### Step 10: Pages

#### `work-orders/layout.tsx`

```typescript
<ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}>{children}</ProtectedRoute>
```

#### `work-orders/new/page.tsx`

- Title: *"Nueva orden de trabajo"*.
- Render `WorkOrderCreateWizard`.
- Read `vehicleId` from search params.

#### `work-orders/[id]/page.tsx`

- **US-005 minimal detail:** `WorkOrderDetailPlaceholder`
  - Header: plate, owner, status badge (*En proceso*), `checkedInAt`, `entryReason`, mileage.
  - Task list read-only (description + status *Pendiente*).
  - Note: *"La gestión de tareas estará disponible aquí"* or prepare shell for US-006.
- Link **Volver al vehículo** → `/vehicles/[vehicleId]`.

---

### Step 11: Integrate `VehicleDetailHeader` (US-004)

- **File:** `apps/web/src/features/vehicles/components/VehicleDetailHeader.tsx`
- Button **Nueva orden de trabajo** → `/work-orders/new?vehicleId={id}`.
- Use `useActiveWorkOrder(vehicleId)`:
  - If active → show link to existing WO instead of create.
  - If none → show create button.

---

### Step 12: Navigation (optional but recommended)

- Add **Nueva OT** or **Ingresar vehículo** in admin/mechanic nav → `/work-orders/new`.
- Primary operational entry point per US-005 priority.

---

### Step 13: Status Labels

- **File:** `workOrderStatusLabel.ts`

| Enum | ES label |
|------|----------|
| `EN_PROCESO` | En proceso |
| `LISTA_PARA_ENTREGA` | Lista para entrega |
| `ENTREGADA` | Entregada |

- Used in `WorkOrderStatusBadge`.

---

### Step 14: E2E Tests

- **File:** `apps/web/e2e/work-orders.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Select vehicle → create OT with 1 task | Redirect to `/work-orders/[id]` |
| 2 | `/work-orders/new?vehicleId=` | Vehicle preselected |
| 3 | Vehicle with active WO | Banner blocks form |
| 4 | Submit without tasks | Validation error (min 1) |
| 5 | Create OT → vehicle history shows visit | Refetch on vehicle page |
| 6 | No vehicle → register CTA navigates to `/vehicles/new` | Link works |
| 7 | 409 on create | Link to existing WO |

---

### Step 15: Update Technical Documentation

1. Document wizard flow and query params in `apps/web/README.md`.
2. Note `/work-orders/[id]` placeholder scope until US-006.
3. Document cache invalidation keys for vehicle history.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — `workOrdersApi`
4. Step 3 — Hooks
5. Step 13 — Status labels
6. Step 4 — `VehicleStepPicker`
7. Step 5 — `ActiveWorkOrderBanner`
8. Step 6 — `MechanicSelect`
9. Step 7 — `InitialTasksEditor`
10. Step 8 — `WorkOrderCreateForm`
11. Step 9 — `WorkOrderCreateWizard`
12. Step 10 — Pages
13. Step 11 — Vehicle detail integration
14. Step 12 — Nav link
15. Step 14 — E2E
16. Step 15 — Documentation

---

## Testing Checklist

- [ ] Wizard: vehicle search → form → create → redirect
- [ ] `?vehicleId=` prefill works
- [ ] Active WO blocks create; link to existing OT
- [ ] Mechanics select includes *Sin asignar*
- [ ] Initial tasks: add/remove, min 1
- [ ] Validation on entryReason, mileage, task descriptions
- [ ] 409 shows link to active work order
- [ ] Vehicle history updates after create
- [ ] Vehicle detail **Nueva OT** respects active check
- [ ] Minimal detail page shows created OT data
- [ ] ADMIN and MECHANIC access
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `400` | Validation / invalid mechanic |
| `404` | Vehículo no encontrado |
| `409` | *El vehículo ya tiene una orden de trabajo activa* + link to WO |
| Network | *Error de conexión. Intenta de nuevo.* |

```typescript
export function isActiveWorkOrderConflict(error: unknown): error is { activeWorkOrderId: string }
```

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Steps** | ≤ 3 steps; clear progress |
| **Vehicle context** | Always show plate + owner when form visible |
| **Language** | Spanish labels and messages |
| **Tasks UX** | Obvious add/remove; first task row pre-filled empty |
| **Mileage** | Numeric input; optional warning non-blocking |
| **Accessibility** | Field arrays labeled; banner `role="alert"` |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-004 `VehicleSearchBar`, `vehiclesApi`, history hook | Vehicle step |
| US-001 auth shell | Protected routes |
| `@tanstack/react-query` | Data + mutations |
| `react-hook-form`, `zod` | Form + field array |

---

## Notes

- **US-006:** Replace `WorkOrderDetailPlaceholder` with full task management on same route.
- **Return from vehicle create:** US-004 success CTA should use `/work-orders/new?vehicleId=` when user came from WO flow (optional `returnTo` query).
- **checkedInAt:** Display only on detail — not editable in form.
- **Shared routes:** `/work-orders` layout like `/clients` and `/vehicles`.
- **Branch:** `feature/US-005-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-006 (task management on `/work-orders/[id]`)
2. E2E full flow: client → vehicle → work order
3. Merge after US-005 backend ready

---

## Implementation Verification

### Code Quality

- [ ] Vehicle search not duplicated — imports from `vehicles` feature
- [ ] Active WO check before showing form
- [ ] History cache invalidated on create

### Functionality

- [ ] End-to-end intake flow operational
- [ ] One active WO per vehicle enforced in UI + API

### Testing

- [ ] E2E create + history + active block

### Integration

- [ ] US-004 vehicle detail button wired
- [ ] Detail page ready for US-006 extension

### Documentation

- [ ] Step 15 complete
