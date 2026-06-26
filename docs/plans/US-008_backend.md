# Backend Implementation Plan: US-008 Delivery Panel

## Overview

Implement the **delivery panel backend** for MecaTrack (US-008): list work orders ready for pickup (`LISTA_PARA_ENTREGA`), expose owner phone in the list API for admin contact, show expandable detail with tasks and totals, and **mark as delivered** (`ENTREGADA` + `deliveredAt`). This is the **first ADMIN-only** module in the operational flow.

**Architecture principles:** vertical `delivery` module, Controller → Service → Prisma, reuse `calculateTotalAmount` from `work-orders`, DTO validation, TDD, `@Roles('ADMIN')` on all routes.

**User story reference:** [`us/US-008-panel-entrega.md`](../../us/US-008-panel-entrega.md)

**Prerequisites:** US-006 (`LISTA_PARA_ENTREGA`, task costs, `totalAmount`), US-005 (`WorkOrder` model), US-003 (`Client.phone`).

**Out of scope:** mark owner contacted (D1), email notifications (D2), WebSockets, frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-008 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, query params | `DeliveryController`, list/detail/deliver DTOs |
| **Application** | List filter, deliver transition, elapsed label | `DeliveryService` |
| **Infrastructure** | Prisma queries with joins | `WorkOrder`, `Vehicle`, `Client`, `WorkOrderTask` |
| **Domain** | Only `LISTA_PARA_ENTREGA` in panel; deliver → `ENTREGADA` | Enforced in service |

### Files to add/modify

```
apps/api/src/modules/delivery/
├── delivery.module.ts
├── delivery.controller.ts
├── delivery.service.ts
├── delivery.service.spec.ts
├── dto/
│   ├── delivery-ready-list-response.dto.ts
│   ├── delivery-ready-item.dto.ts
│   ├── delivery-ready-detail.dto.ts
│   ├── deliver-work-order-response.dto.ts
│   └── delivery-ready-query.dto.ts
└── utils/
    └── elapsed-label.ts              # formatElapsed(checkedInAt, now)

apps/api/src/modules/work-orders/
└── utils/work-order-totals.ts        # reuse calculateTotalAmount (from US-006)

apps/api/src/app.module.ts            # import DeliveryModule

apps/api/prisma/
└── schema.prisma                     # verify OWNER_CONTACTED, deliveredAt, ownerContacted*
```

### API endpoints (US-008)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/delivery/ready` | Bearer | `ADMIN` | List OTs `LISTA_PARA_ENTREGA` with `ownerPhone` |
| `GET` | `/api/delivery/ready/:workOrderId` | Bearer | `ADMIN` | Detail for expanded panel row |
| `PATCH` | `/api/delivery/ready/:workOrderId/deliver` | Bearer | `ADMIN` | Mark `ENTREGADA`, set `deliveredAt` |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-008-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-006 merged (OTs can reach `LISTA_PARA_ENTREGA`).
  2. `git checkout -b feature/US-008-backend`
  3. Seed or fixture: at least one WO in `LISTA_PARA_ENTREGA` for manual/e2e tests.

---

### Step 1: Prisma — Verify Delivery Fields

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Confirm per `readme.md` §3:

```prisma
enum WorkOrderStatus {
  EN_PROCESO
  LISTA_PARA_ENTREGA
  OWNER_CONTACTED   // reserved V2 D1
  ENTREGADA
}

model WorkOrder {
  // ...
  deliveredAt          DateTime?
  ownerContactedAt     DateTime?
  ownerContactedById   String?
  ownerContactedBy     User?   @relation("OwnerContactedBy", ...)
}
```

- **Migration:** Only if missing — `npx prisma migrate dev --name add_delivery_fields`
- **Expected:** Fields present if US-005 followed full readme schema.

---

### Step 2: Shared Utilities

#### `elapsed-label.ts`

- **File:** `apps/api/src/modules/delivery/utils/elapsed-label.ts`

```typescript
export function formatElapsedLabel(checkedInAt: Date, now = new Date()): string
```

- **MVP implementation:** Human-readable Spanish label for API (`"3 días 4 horas"`) using day/hour diff; or return ISO + let frontend format — **US requires `elapsedLabel` in API response** per enhanced spec.
- **Example logic:** `differenceInDays` + remainder hours; handle same-day as `"2 horas"`.

#### `owner-phone-display.ts` (optional)

```typescript
export function formatPhoneDisplay(phone: string | null): string | null
```

- **MVP:** Return raw phone or simple grouping (`8888-7777`); `null` if no phone.

#### Reuse `calculateTotalAmount`

- Import from `apps/api/src/modules/work-orders/utils/work-order-totals.ts` (US-006).
- **Do not duplicate** total logic in `DeliveryService`.

---

### Step 3: DTOs

#### `delivery-ready-query.dto.ts`

```typescript
export class DeliveryReadyQueryDto {
  @IsOptional()
  @IsIn(['checkedInAt', 'totalAmount'])
  sort?: 'checkedInAt' | 'totalAmount';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
```

- **Default:** `sort=checkedInAt`, `order=asc` (oldest first).

#### `delivery-ready-item.dto.ts`

```typescript
export class DeliveryReadyItemDto {
  workOrderId: string;
  licensePlate: string;
  vehicleLabel: string;       // "{brand} {model} {year}"
  ownerName: string;
  ownerPhone: string | null;
  ownerPhoneDisplay: string | null;
  ownerEmail: string | null;
  totalAmount: number;
  checkedInAt: Date;
  elapsedLabel: string;
}
```

#### `delivery-ready-list-response.dto.ts`

```typescript
export class DeliveryReadyListResponseDto {
  items: DeliveryReadyItemDto[];
  total: number;
}
```

#### `delivery-ready-detail.dto.ts`

- Extends list fields plus: `status`, `entryReason`, `mileage`, `vehicle` object, `owner` object, `tasks[]` (id, description, status, cost, costNotes).

#### `deliver-work-order-response.dto.ts`

```typescript
export class DeliverWorkOrderResponseDto {
  workOrderId: string;
  status: WorkOrderStatus;   // ENTREGADA
  deliveredAt: Date;
}
```

---

### Step 4: DeliveryService — Business Logic

- **File:** `apps/api/src/modules/delivery/delivery.service.ts`
- **TDD:** Write `delivery.service.spec.ts` first.

#### Method signatures

```typescript
listReady(query: DeliveryReadyQueryDto): Promise<DeliveryReadyListResponseDto>
getReadyDetail(workOrderId: string): Promise<DeliveryReadyDetailDto>
markDelivered(workOrderId: string): Promise<DeliverWorkOrderResponseDto>
```

#### `listReady`

```typescript
const workOrders = await this.prisma.workOrder.findMany({
  where: { status: WorkOrderStatus.LISTA_PARA_ENTREGA },
  include: {
    vehicle: true,
    ownerClient: true,
    tasks: true,
  },
  orderBy: buildOrderBy(query), // default checkedInAt asc
});

return {
  items: workOrders.map((wo) => ({
    workOrderId: wo.id,
    licensePlate: wo.vehicle.licensePlate,
    vehicleLabel: `${wo.vehicle.brand} ${wo.vehicle.model} ${wo.vehicle.year}`,
    ownerName: wo.ownerClient.fullName,
    ownerPhone: wo.ownerClient.phone,
    ownerPhoneDisplay: formatPhoneDisplay(wo.ownerClient.phone),
    ownerEmail: wo.ownerClient.email,
    totalAmount: calculateTotalAmount(wo.tasks),
    checkedInAt: wo.checkedInAt,
    elapsedLabel: formatElapsedLabel(wo.checkedInAt),
  })),
  total: workOrders.length,
};
```

- **`ownerClientId` snapshot:** Use `ownerClient` relation (propietario al ingreso), not current `VehicleOwnership`.
- **Sort by `totalAmount`:** Compute in memory after map, or use raw query — in-memory sort acceptable for MVP (≤ 50 rows).

#### `getReadyDetail`

1. Load WO with `vehicle`, `ownerClient`, `tasks` (order `sortOrder asc`).
2. If not found → `404`.
3. If `status !== LISTA_PARA_ENTREGA` → `404` (or `409` — use **`404`** with message `Work order is not ready for delivery` to avoid leaking state).
4. Map to `DeliveryReadyDetailDto` with full task list and `totalAmount`.

#### `markDelivered`

```typescript
const wo = await this.prisma.workOrder.findUnique({ where: { id: workOrderId } });
if (!wo) throw new NotFoundException('Work order not found');

if (wo.status === WorkOrderStatus.ENTREGADA) {
  throw new ConflictException('Work order is already delivered');
}

if (wo.status !== WorkOrderStatus.LISTA_PARA_ENTREGA) {
  throw new ConflictException('Work order is not ready for delivery');
}

const deliveredAt = new Date();

return this.prisma.workOrder.update({
  where: { id: workOrderId },
  data: {
    status: WorkOrderStatus.ENTREGADA,
    deliveredAt,
  },
  select: { id: true, status: true, deliveredAt: true },
});
```

- **`deliveredAt`:** Server timestamp only; not client-supplied.
- **After deliver:** WO no longer appears in `listReady`; vehicle eligible for new active WO (US-005).
- **Idempotency:** Second deliver on `ENTREGADA` → `409` (per US-008 enhanced).
- **D1 prep:** Do not transition via `OWNER_CONTACTED` in MVP.

---

### Step 5: DeliveryController

- **File:** `apps/api/src/modules/delivery/delivery.controller.ts`

```typescript
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DeliveryController {
  @Get('ready')
  listReady(@Query() query: DeliveryReadyQueryDto): Promise<DeliveryReadyListResponseDto>

  @Get('ready/:workOrderId')
  getReadyDetail(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  ): Promise<DeliveryReadyDetailDto>

  @Patch('ready/:workOrderId/deliver')
  markDelivered(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  ): Promise<DeliverWorkOrderResponseDto>
}
```

- **Route order:** `GET ready` before `GET ready/:workOrderId` — Nest handles correctly with static `ready` segment.
- **`MECHANIC`:** `403 Forbidden` on all routes (class-level `@Roles('ADMIN')`).
- **Unauthenticated:** `401`.

---

### Step 6: DeliveryModule Registration

```typescript
@Module({
  imports: [], // PrismaModule global; no WorkOrdersModule import if using Prisma directly
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
```

- Register in `AppModule`.
- **Optional:** Import `WorkOrdersModule` only if reusing exported helpers; prefer importing `calculateTotalAmount` as pure function to avoid circular deps.

---

### Step 7: Unit Tests — DeliveryService

- **File:** `apps/api/src/modules/delivery/delivery.service.spec.ts`
- **Coverage:** ≥ 90%

| Category | Scenario | Expected |
|----------|----------|----------|
| **List** | Multiple `LISTA_PARA_ENTREGA` | All returned; excludes `EN_PROCESO`, `ENTREGADA` |
| **List** | `ownerPhone` populated | Present from `ownerClient.phone` |
| **List** | Client without phone | `ownerPhone: null` |
| **List** | `totalAmount` | Matches sum of completed task costs |
| **List** | Default sort | `checkedInAt` asc |
| **List** | Sort by `totalAmount` desc | Correct order |
| **List** | `elapsedLabel` | Non-empty string |
| **Detail** | Valid ready WO | Full payload with tasks |
| **Detail** | WO `EN_PROCESO` | `404` |
| **Detail** | Unknown id | `404` |
| **Deliver** | From `LISTA_PARA_ENTREGA` | `ENTREGADA`, `deliveredAt` set |
| **Deliver** | From `EN_PROCESO` | `409` |
| **Deliver** | Already `ENTREGADA` | `409` |
| **Deliver** | Unknown id | `404` |

---

### Step 8: E2E Tests — DeliveryController

- **File:** `apps/api/test/delivery.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/delivery/ready` as ADMIN | `200`, items with `ownerPhone` key |
| 2 | `GET /api/delivery/ready` as MECHANIC | `403` |
| 3 | `GET /api/delivery/ready` no token | `401` |
| 4 | `GET /api/delivery/ready/:id` valid | `200`, tasks + total |
| 5 | `GET /api/delivery/ready/:id` wrong status | `404` |
| 6 | `PATCH .../deliver` as ADMIN | `200`, `ENTREGADA`, `deliveredAt` |
| 7 | `PATCH .../deliver` as MECHANIC | `403` |
| 8 | `PATCH .../deliver` twice | Second `409` |
| 9 | After deliver, `GET ready` | OT absent from list |
| 10 | After deliver, `POST /work-orders` same vehicle | `201` (new active WO allowed) |
| 11 | Client without phone in list | `ownerPhone: null` |

- **Setup flow:** Create WO → complete all tasks (US-006) → appears in delivery list.

---

### Step 9: Integration — US-005 Active WO Rule

- **Action:** After `markDelivered`, verify US-005 `findActiveByVehicle` returns `null` and new WO create succeeds.
- **Note:** Active statuses are `EN_PROCESO` and `LISTA_PARA_ENTREGA` only; `ENTREGADA` releases the vehicle.

---

### Step 10: V2 Placeholder — D1 Mark Contacted

- **Action:** Add code comment or stub interface for future endpoint:

```typescript
// V2 D1: PATCH /api/delivery/ready/:workOrderId/mark-contacted
// Transitions LISTA_PARA_ENTREGA → OWNER_CONTACTED
// Sets ownerContactedAt, ownerContactedById
```

- **No implementation** in US-008 DoD.

---

### Step 11: Update Technical Documentation

1. Add delivery endpoints to `docs/api-spec.yml`.
2. Update `apps/api/README.md` with admin-only delivery examples.
3. Document `ownerPhone` requirement in list API.
4. Note D1/D2 reserved fields in schema docs.

---

## Implementation Order

1. Step 0 — Branch `feature/US-008-backend`
2. Step 1 — Verify Prisma fields (migrate if needed)
3. Step 2 — `formatElapsedLabel`, phone display, reuse `calculateTotalAmount`
4. Step 3 — DTOs
5. Step 7 (red) — Unit tests
6. Step 4 — `DeliveryService`
7. Step 7 (green) — Unit tests
8. Step 5 — `DeliveryController`
9. Step 6 — Module registration
10. Step 8 — E2E tests
11. Step 9 — US-005 integration check
12. Step 10 — D1 placeholder comment
13. Step 11 — Documentation

---

## Testing Checklist

- [ ] List returns only `LISTA_PARA_ENTREGA` OTs
- [ ] Every list item includes `ownerPhone` (nullable)
- [ ] `totalAmount` and `elapsedLabel` correct
- [ ] Detail includes tasks with costs
- [ ] `markDelivered` sets `ENTREGADA` + `deliveredAt`
- [ ] Delivered OT removed from list
- [ ] `MECHANIC` gets `403` on all delivery endpoints
- [ ] Double deliver returns `409`
- [ ] New WO can be created for vehicle after delivery
- [ ] Unit + e2e green; service ≥ 90% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Forbidden"
}
```

### HTTP status mapping (US-008)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `401` | No JWT | `Unauthorized` |
| `403` | `MECHANIC` or wrong role | `Forbidden` |
| `404` | WO not found | `Not Found` |
| `404` | WO not in `LISTA_PARA_ENTREGA` (detail) | `Work order is not ready for delivery` |
| `409` | Deliver from wrong status | `Work order is not ready for delivery` |
| `409` | Already `ENTREGADA` | `Work order is already delivered` |

---

## Partial Update Support

Not applicable — `PATCH deliver` has no body fields in MVP (optional `{ "confirm": true }` ignored). Status transition is atomic.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-006** | `LISTA_PARA_ENTREGA`, task costs, `calculateTotalAmount` |
| **US-005** | `WorkOrder` model, active WO rule after deliver |
| **US-003** | `Client.phone`, `Client.email` on `ownerClient` |
| **US-001** | Auth guards, `RolesGuard` |

No new npm packages. Optional: `date-fns` for `elapsedLabel` if not already in project — prefer lightweight custom impl to minimize deps.

---

## Notes

- **ADMIN only:** First operational module restricted to administrator (unlike US-003–007).
- **Owner contact data:** From `ownerClientId` snapshot, not current vehicle owner (D3-safe).
- **Phone column:** `ownerPhone` **required key** in list response even when `null` — critical for US-008 DoD.
- **No WebSockets:** Panel refreshes via manual refetch or frontend polling.
- **`OWNER_CONTACTED`:** In enum for D1; panel MVP filters only `LISTA_PARA_ENTREGA`.
- **Currency:** API returns raw numbers; CRC formatting is frontend concern.
- **Language:** Code and API messages in **English**; `elapsedLabel` may be Spanish per product UX.
- **Branch:** `feature/US-008-backend` from `feature-entrega2-RFM` (with US-006 merged).

---

## Next Steps After Implementation

1. `/plan-backend-ticket` for US-009
2. `/plan-frontend-ticket @us/US-008-panel-entrega.md`
3. Merge `feature/US-008-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] `calculateTotalAmount` reused, not duplicated
- [ ] All delivery routes `@Roles('ADMIN')`
- [ ] `deliveredAt` server-set only

### Functionality

- [ ] Full close cycle: `LISTA_PARA_ENTREGA` → `ENTREGADA`
- [ ] `ownerPhone` in every list item
- [ ] Vehicle unlocked for new WO after delivery

### Testing

- [ ] All unit + e2e scenarios pass
- [ ] US-005 create-after-deliver integration verified

### Integration

- [ ] Panel API ready for `/admin/delivery` frontend
- [ ] D1 extension point documented

### Documentation

- [ ] Step 11 complete
