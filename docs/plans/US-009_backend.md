# Backend Implementation Plan: US-009 Vehicle & Client History

## Overview

Implement **read-only consolidated history** for MecaTrack (US-009): full vehicle visit timeline with tasks, technical notes, amounts, and owner-at-visit snapshots; client detail page API with active vehicles and last-visit summary. Ampliifies `GET /api/vehicles/:id/history` (started in US-004/005/007) and extends `GET /api/clients/:id` with vehicle list.

**Architecture principles:** read-only `GET` endpoints only; `history` module orchestrates rich Prisma queries; reuse `calculateTotalAmount` and owner resolution from existing modules; no mutations in this US.

**User story reference:** [`us/US-009-historial.md`](../../us/US-009-historial.md)

**Prerequisites:** US-003 (`Client`), US-004 (`Vehicle`, `VehicleOwnership`, basic history stub), US-005–US-008 (`WorkOrder` data, `deliveredAt`), US-007 (technical note fields).

**Out of scope:** PDF export, advanced date filters, `GET /api/history/search` (reuse US-003/US-004 search), sold-vehicle history under former owner, frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-009 artifacts |
|-------|----------------|------------------|
| **Presentation** | GET endpoints | `HistoryController` (optional), extend `VehiclesController`, `ClientsController` |
| **Application** | History assembly, status labels | `HistoryService` |
| **Infrastructure** | Eager-loaded Prisma queries | `WorkOrder`, `WorkOrderTask`, `Client`, `Vehicle`, `VehicleOwnership` |
| **Domain** | `ownerAtVisit` from snapshot; all WO statuses in timeline | Query rules |

### Files to add/modify

```
apps/api/src/modules/history/
├── history.module.ts
├── history.service.ts
├── history.service.spec.ts
├── mappers/
│   ├── visit-history.mapper.ts
│   └── work-order-status-label.ts
└── dto/
    ├── vehicle-history-response.dto.ts      # full US-009 contract
    ├── vehicle-history-visit.dto.ts
    ├── client-profile-response.dto.ts
    └── client-vehicle-summary.dto.ts

apps/api/src/modules/vehicles/
├── vehicles.controller.ts                   # GET :id/history → HistoryService or enriched
└── vehicles.service.ts                        # delegate getHistory to HistoryService

apps/api/src/modules/clients/
├── clients.controller.ts                    # extend GET :id response
└── clients.service.ts                       # findByIdWithVehicles or delegate

apps/api/src/app.module.ts                   # import HistoryModule
```

**Module decision:** Implement core logic in `HistoryService`; `VehiclesService.getHistory` and `ClientsService.findById` delegate to it to avoid duplication. Routes stay on existing controllers (`/vehicles/:id/history`, `/clients/:id`) — no route prefix change required.

### API endpoints (US-009)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/vehicles/:id/history` | Bearer | `ADMIN`, `MECHANIC` | **Ampliar:** full visit timeline |
| `GET` | `/api/clients/:id` | Bearer | `ADMIN`, `MECHANIC` | **Ampliar:** profile + active vehicles + last visit |

No new mutation endpoints. Optional `GET /api/clients/:id/vehicles` — **merge into** `GET /clients/:id` for MVP.

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-009-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-005–US-008 merged (seed data with delivered + in-progress OTs).
  2. `git checkout -b feature/US-009-backend`
  3. Verify existing `GET /vehicles/:id/history` e2e baseline.

---

### Step 1: DTOs — Full History Contract

#### `vehicle-history-visit.dto.ts`

```typescript
export class OwnerAtVisitDto {
  id: string;
  fullName: string;
  nationalId: string;
}

export class VisitNotesDto {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
}

export class HistoryTaskDto {
  id: string;
  description: string;
  status: WorkOrderTaskStatus;
  cost: number | null;
  costNotes: string | null;
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}

export class VehicleHistoryVisitDto {
  workOrderId: string;
  checkedInAt: Date;
  deliveredAt: Date | null;
  status: WorkOrderStatus;
  statusLabel: string;
  entryReason: string;
  mileage: number;
  totalAmount: number;
  ownerAtVisit: OwnerAtVisitDto;
  visitNotes: VisitNotesDto;
  tasks: HistoryTaskDto[];
}
```

#### `vehicle-history-response.dto.ts`

```typescript
export class VehicleHistoryResponseDto {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  currentOwner: CurrentOwnerDto;
  visits: VehicleHistoryVisitDto[];
  total: number;
}
```

#### `client-vehicle-summary.dto.ts`

```typescript
export class ClientVehicleSummaryDto {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  lastVisitAt: Date | null;
  lastVisitStatus: WorkOrderStatus | null;
}
```

#### `client-profile-response.dto.ts`

```typescript
export class ClientProfileResponseDto {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  vehicles: ClientVehicleSummaryDto[];
}
```

---

### Step 2: Status Label Mapper

- **File:** `apps/api/src/modules/history/mappers/work-order-status-label.ts`

```typescript
const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  EN_PROCESO: 'En proceso',
  LISTA_PARA_ENTREGA: 'Lista para entrega',
  OWNER_CONTACTED: 'Propietario contactado',
  ENTREGADA: 'Entregada',
};

export function toStatusLabel(status: WorkOrderStatus): string
```

- API returns `status` (enum) + `statusLabel` (Spanish) per US-009 contract.

---

### Step 3: HistoryService — Vehicle History

- **File:** `apps/api/src/modules/history/history.service.ts`
- **TDD:** Write `history.service.spec.ts` first.

#### Method signatures

```typescript
getVehicleHistory(vehicleId: string): Promise<VehicleHistoryResponseDto>
getClientProfile(clientId: string): Promise<ClientProfileResponseDto>
```

#### `getVehicleHistory`

```typescript
const vehicle = await this.prisma.vehicle.findUnique({
  where: { id: vehicleId },
  include: {
    ownerships: {
      where: { validTo: null },
      include: { client: true },
      take: 1,
    },
    workOrders: {
      orderBy: { checkedInAt: 'desc' },
      include: {
        ownerClient: true,
        tasks: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    },
  },
});

if (!vehicle) throw new NotFoundException('Vehicle not found');

const currentOwner = resolveCurrentOwner(vehicle.ownerships[0]);

const visits = vehicle.workOrders.map((wo) => ({
  workOrderId: wo.id,
  checkedInAt: wo.checkedInAt,
  deliveredAt: wo.deliveredAt,
  status: wo.status,
  statusLabel: toStatusLabel(wo.status),
  entryReason: wo.entryReason,
  mileage: wo.mileage,
  totalAmount: calculateTotalAmount(wo.tasks),
  ownerAtVisit: {
    id: wo.ownerClient.id,
    fullName: wo.ownerClient.fullName,
    nationalId: wo.ownerClient.nationalId,
  },
  visitNotes: {
    visitDiagnosis: wo.visitDiagnosis,
    visitRepairSummary: wo.visitRepairSummary,
    visitPartsUsed: wo.visitPartsUsed,
    visitAdditionalNotes: wo.visitAdditionalNotes,
  },
  tasks: wo.tasks.map(mapHistoryTask),
}));

return {
  vehicleId: vehicle.id,
  licensePlate: vehicle.licensePlate,
  vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
  currentOwner,
  visits,
  total: visits.length,
};
```

**Rules:**

| Rule | Implementation |
|------|----------------|
| All WO statuses included | No filter on `status` |
| Order | `checkedInAt DESC` |
| `ownerAtVisit` | From `wo.ownerClient` (`ownerClientId` snapshot), **not** `currentOwner` |
| `totalAmount` | `calculateTotalAmount(wo.tasks)` |
| Empty history | `{ visits: [], total: 0 }` — valid `200` |

- **D3 integrity:** Even if vehicle owner changed, past visits show original `ownerAtVisit`.

---

### Step 4: HistoryService — Client Profile

#### `getClientProfile`

```typescript
const client = await this.prisma.client.findUnique({
  where: { id: clientId },
});

if (!client) throw new NotFoundException('Client not found');

const activeOwnerships = await this.prisma.vehicleOwnership.findMany({
  where: { clientId, validTo: null },
  include: {
    vehicle: {
      include: {
        workOrders: {
          orderBy: { checkedInAt: 'desc' },
          take: 1,
          select: { checkedInAt: true, status: true },
        },
      },
    },
  },
});

const vehicles = activeOwnerships.map((o) => ({
  id: o.vehicle.id,
  licensePlate: o.vehicle.licensePlate,
  brand: o.vehicle.brand,
  model: o.vehicle.model,
  year: o.vehicle.year,
  lastVisitAt: o.vehicle.workOrders[0]?.checkedInAt ?? null,
  lastVisitStatus: o.vehicle.workOrders[0]?.status ?? null,
}));

return {
  id: client.id,
  fullName: client.fullName,
  nationalId: client.nationalId,
  phone: client.phone,
  email: client.email,
  vehicles,
};
```

- **Active vehicles only:** `VehicleOwnership.validTo IS NULL`.
- **Sold vehicles:** Excluded from client profile (D3 — access via vehicle history by plate).
- **Sort vehicles:** `licensePlate asc` (document in plan).

---

### Step 5: Wire Controllers

#### `VehiclesController`

- **File:** `apps/api/src/modules/vehicles/vehicles.controller.ts`
- **Action:** Inject `HistoryService`; `getHistory` delegates:

```typescript
@Get(':id/history')
getHistory(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleHistoryResponseDto> {
  return this.historyService.getVehicleHistory(id);
}
```

- Remove or slim down inline history logic in `VehiclesService` to avoid drift.

#### `ClientsController`

- **File:** `apps/api/src/modules/clients/clients.controller.ts`
- **Action:** Extend existing `GET :id`:

```typescript
@Get(':id')
findById(@Param('id', ParseUUIDPipe) id: string): Promise<ClientProfileResponseDto> {
  return this.historyService.getClientProfile(id);
}
```

- **Breaking change note:** If US-003 `GET :id` returned minimal client DTO, extend response with `vehicles[]` (additive — backward compatible for clients without vehicles key if frontend updated together).

**Alternative:** Keep `ClientsService.findById` for minimal lookup; add `GET :id/profile` — **prefer extending** `GET :id` per US-009 spec.

---

### Step 6: HistoryModule Registration

```typescript
@Module({
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
```

```typescript
// VehiclesModule, ClientsModule
@Module({
  imports: [HistoryModule],
  // ...
})
```

- Register `HistoryModule` in `AppModule` if not imported transitively.

---

### Step 7: Visit History Mapper (optional extract)

- **File:** `apps/api/src/modules/history/mappers/visit-history.mapper.ts`
- Extract `mapWorkOrderToVisit`, `mapHistoryTask` for testability.

---

### Step 8: Unit Tests — HistoryService

- **File:** `apps/api/src/modules/history/history.service.spec.ts`
- **Coverage:** ≥ 85%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Vehicle history** | Multiple visits | Ordered `checkedInAt` DESC |
| **Vehicle history** | Mixed statuses | All included with correct `statusLabel` |
| **Vehicle history** | `ownerAtVisit` ≠ `currentOwner` | Snapshot preserved (D3 scenario) |
| **Vehicle history** | Tasks + technical notes | All fields mapped |
| **Vehicle history** | `totalAmount` per visit | Sum of completed task costs |
| **Vehicle history** | No visits | `visits: []`, `total: 0` |
| **Vehicle history** | Unknown vehicle | `404` |
| **Vehicle history** | `deliveredAt` on `ENTREGADA` | Present when set (US-008) |
| **Client profile** | Client with 2 active vehicles | Both in `vehicles[]` |
| **Client profile** | `lastVisitAt` / `lastVisitStatus` | From latest WO per vehicle |
| **Client profile** | No vehicles | `vehicles: []` |
| **Client profile** | Unknown client | `404` |
| **Client profile** | Sold vehicle (ownership ended) | Not in list |

---

### Step 9: E2E Tests — History Endpoints

- **File:** `apps/api/test/history.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/vehicles/:id/history` as MECHANIC | `200`, full contract shape |
| 2 | `GET /api/vehicles/:id/history` as ADMIN | `200` |
| 3 | `GET /api/vehicles/:id/history` unknown id | `404` |
| 4 | `GET /api/vehicles/:id/history` no token | `401` |
| 5 | Visits include `EN_PROCESO` and `ENTREGADA` | Both in timeline |
| 6 | Visit includes `tasks[].diagnosis` (US-007) | Field present |
| 7 | `ownerAtVisit` matches `ownerClientId` not current owner | D3 test with ownership change fixture |
| 8 | `GET /api/clients/:id` | `200`, `vehicles[]` with `lastVisitAt` |
| 9 | `GET /api/clients/:id` unknown | `404` |
| 10 | After US-008 deliver, history shows `deliveredAt` | Populated |
| 11 | `total` matches `visits.length` | Consistent |

- **Setup:** Seed vehicle with 2+ work orders (one delivered, one in progress).

---

### Step 10: Performance — Query Optimization

- **Single query** per endpoint with nested `include` (avoid N+1).
- **Index use:** `WorkOrder(vehicleId)`, `WorkOrder(checkedInAt)`, `VehicleOwnership(clientId, validTo)`.
- **Limit:** No pagination in MVP; document assumption ≤ 50 visits per vehicle.
- **Optional:** `select` only required columns on large text fields if payload size is a concern.

---

### Step 11: Read-Only Enforcement

- **Backend:** No `POST`/`PATCH`/`DELETE` in `history` module.
- **Verification:** History endpoints only call read methods; editing remains on `work-orders` / `work-order-tasks` with US-006 rules.
- **Note:** `EN_PROCESO` OTs are editable via work-orders API — history API does not expose mutations.

---

### Step 12: Update Technical Documentation

1. Update `docs/api-spec.yml` with full `GET /vehicles/:id/history` and extended `GET /clients/:id` schemas.
2. Update `apps/api/README.md` with history examples.
3. Document `ownerAtVisit` vs `currentOwner` semantics for D3.
4. Cross-reference US-009 in readme §6 backend ticket list.

---

## Implementation Order

1. Step 0 — Branch `feature/US-009-backend`
2. Step 1 — DTOs
3. Step 2 — Status label mapper
4. Step 8 (red) — Unit tests
5. Step 3 — `getVehicleHistory`
6. Step 4 — `getClientProfile`
7. Step 7 — Extract mappers (if needed)
8. Step 8 (green) — Unit tests
9. Step 5 — Wire controllers (vehicles + clients)
10. Step 6 — `HistoryModule` registration
11. Step 9 — E2E tests
12. Step 10 — Query review
13. Step 11 — Read-only verification
14. Step 12 — Documentation

---

## Testing Checklist

- [ ] Vehicle history returns all WO statuses, DESC order
- [ ] `ownerAtVisit` from snapshot, not current owner
- [ ] Tasks, technical notes, `visitNotes`, `totalAmount` per visit
- [ ] `currentOwner` on history response from active ownership
- [ ] Client profile lists active vehicles only
- [ ] `lastVisitAt` / `lastVisitStatus` per vehicle
- [ ] Empty history / no vehicles — valid `200`
- [ ] ADMIN and MECHANIC authorized; unauthenticated `401`
- [ ] No mutation endpoints added
- [ ] Unit + e2e green; service ≥ 85% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 404,
  "message": "Vehicle not found",
  "error": "Not Found"
}
```

### HTTP status mapping (US-009)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `401` | No JWT | `Unauthorized` |
| `404` | Vehicle id not found | `Vehicle not found` |
| `404` | Client id not found | `Client not found` |

No `403` for role restrictions — both `ADMIN` and `MECHANIC` have access.

---

## Partial Update Support

Not applicable — read-only `GET` endpoints only.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-004** | `GET /vehicles/:id/history` route exists |
| **US-005** | `WorkOrder`, `ownerClientId` snapshot |
| **US-006** | Task costs, statuses |
| **US-007** | Technical note fields on tasks and WO |
| **US-008** | `deliveredAt` on delivered visits |
| **US-003** | `GET /clients/:id` base |
| **US-001** | Auth guards |

Reuse: `calculateTotalAmount`, `resolveCurrentOwner` / `toCurrentOwner` from vehicles module.

No new npm packages.

---

## Notes

- **Search entry points:** No `GET /api/history/search` — frontend uses existing `GET /vehicles/search` and `GET /clients/search` then navigates to detail/history routes.
- **Open vs closed visits:** Timeline includes in-progress OTs with `statusLabel` for operational context.
- **Client vehicles:** Only current ownership; historical ownership after D3 transfer is out of MVP scope.
- **Immutability:** History API never mutates data; US-006/008 govern edits elsewhere.
- **Language:** API `statusLabel` in Spanish; code/messages in English.
- **Branch:** `feature/US-009-backend` from `feature-entrega2-RFM`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/US-009-historial.md`
2. Merge `feature/US-009-backend` → `feature-entrega2-RFM`
3. Backend MVP complete (US-001–US-009) — proceed to `develop-backend` per US or entrega 2 integration

---

## Implementation Verification

### Code Quality

- [ ] Single `HistoryService` source of truth for history assembly
- [ ] No duplicated total/owner mapping logic
- [ ] Eager-loaded queries, no N+1

### Functionality

- [ ] Full US-009 JSON contract on vehicle history
- [ ] Client profile with vehicles and last visit metadata
- [ ] D3 snapshot integrity verified in tests

### Testing

- [ ] All unit + e2e scenarios pass

### Integration

- [ ] US-004 vehicle detail + US-003 client search entry points satisfied
- [ ] Compatible with delivered and in-progress OTs

### Documentation

- [ ] Step 12 complete
