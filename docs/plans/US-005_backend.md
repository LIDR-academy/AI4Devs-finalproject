# Backend Implementation Plan: US-005 Create Work Order

## Overview

Implement **work order creation** for MecaTrack (US-005): register a vehicle visit with entry reason, mileage, optional assigned mechanic, and at least one initial task — atomically in a single transaction. Enforce **one active work order per vehicle**, snapshot the current owner (`ownerClientId`), and expose supporting endpoints for mechanics list and active-order lookup. Populate vehicle visit history (US-004) with real data.

**Architecture principles:** vertical `work-orders` module, Controller → Service → Prisma, transactional create (WorkOrder + WorkOrderTask[]), DTO validation, TDD, shared auth guards from US-001.

**User story reference:** [`us/US-005-crear-orden-trabajo.md`](../../us/US-005-crear-orden-trabajo.md)

**Prerequisites:** US-001 (auth, `@CurrentUser()`), US-003 (`Client`), US-004 (`Vehicle`, `VehicleOwnership`, active owner resolution).

**Out of scope:** task status transitions (US-006), diagnosis/notes (US-007), delivery panel (US-008), cancel/reopen OT, frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-005 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, nested DTOs | `WorkOrdersController`, `CreateWorkOrderDto` |
| **Application** | Create, active check, owner snapshot, mechanics list | `WorkOrdersService` |
| **Infrastructure** | Transactions, Prisma | `WorkOrder`, `WorkOrderTask`, enums |
| **Domain** | One active WO per vehicle; owner snapshot at check-in | Enforced in service |

### Files to add/modify

```
apps/api/prisma/
├── schema.prisma              # enums, WorkOrder, WorkOrderTask; relations on User/Client/Vehicle
├── migrations/                # add_work_order_and_tasks
└── seed.ts                    # optional sample OT with tasks

apps/api/src/modules/work-orders/
├── work-orders.module.ts
├── work-orders.controller.ts
├── work-orders.service.ts
├── work-orders.service.spec.ts
├── dto/
│   ├── create-work-order.dto.ts
│   ├── initial-task.dto.ts
│   ├── work-order-response.dto.ts
│   ├── work-order-detail-response.dto.ts
│   ├── active-work-order-response.dto.ts
│   └── mechanic-summary.dto.ts
├── mappers/
│   └── work-order.mapper.ts
└── constants/
    └── work-order-status.ts   # ACTIVE_STATUSES = [EN_PROCESO, LISTA_PARA_ENTREGA]

apps/api/src/modules/vehicles/
└── vehicles.service.ts        # populate GET :id/history from WorkOrder

apps/api/src/app.module.ts     # import WorkOrdersModule
```

### API endpoints (US-005)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/work-orders/mechanics` | Bearer | `ADMIN`, `MECHANIC` | Active mechanics for selector |
| `GET` | `/api/work-orders/active` | Bearer | `ADMIN`, `MECHANIC` | Active WO for `vehicleId` query |
| `POST` | `/api/work-orders` | Bearer | `ADMIN`, `MECHANIC` | Create WO + initial tasks |
| `GET` | `/api/work-orders/:id` | Bearer | `ADMIN`, `MECHANIC` | Work order detail (base for US-006) |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-005-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-001 + US-003 + US-004 merged.
  2. `git checkout -b feature/US-005-backend`
  3. Verify vehicles/clients e2e tests pass.

---

### Step 1: Prisma — Enums, WorkOrder, WorkOrderTask

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Add enums and models aligned with `readme.md` §3 Prisma reference.

```prisma
enum WorkOrderStatus {
  EN_PROCESO
  LISTA_PARA_ENTREGA
  OWNER_CONTACTED   // reserved V2 D1; not set in US-005
  ENTREGADA
}

enum WorkOrderTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model WorkOrder {
  id                   String          @id @default(uuid())
  vehicleId            String
  ownerClientId        String
  status               WorkOrderStatus @default(EN_PROCESO)
  entryReason          String
  mileage              Int
  assignedMechanicId   String?
  createdById          String
  checkedInAt          DateTime        @default(now())
  deliveredAt          DateTime?
  ownerContactedAt     DateTime?
  ownerContactedById   String?
  visitDiagnosis       String?         @db.Text
  visitRepairSummary   String?         @db.Text
  visitPartsUsed       String?         @db.Text
  visitAdditionalNotes String?         @db.Text
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  vehicle          Vehicle         @relation(fields: [vehicleId], references: [id], onDelete: Restrict)
  ownerClient      Client          @relation(fields: [ownerClientId], references: [id], onDelete: Restrict)
  assignedMechanic User?           @relation("AssignedMechanic", fields: [assignedMechanicId], references: [id])
  createdBy        User            @relation("CreatedBy", fields: [createdById], references: [id])
  ownerContactedBy User?           @relation("OwnerContactedBy", fields: [ownerContactedById], references: [id])
  tasks            WorkOrderTask[]

  @@index([vehicleId, status])
  @@index([checkedInAt])
}

model WorkOrderTask {
  id              String              @id @default(uuid())
  workOrderId     String
  description     String
  status          WorkOrderTaskStatus @default(PENDING)
  cost            Decimal?            @db.Decimal(12, 2)
  costNotes       String?
  diagnosis       String?             @db.Text
  repairPerformed String?             @db.Text
  partsUsed       String?             @db.Text
  additionalNotes String?             @db.Text
  sortOrder       Int                 @default(0)
  completedAt     DateTime?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  workOrder WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([workOrderId])
}
```

- **Update relations** on existing models:
  - `User`: `workOrdersCreated`, `workOrdersAssigned`, `workOrdersContacted`
  - `Client`: `workOrders`
  - `Vehicle`: `workOrders`
- **Migration:** `npx prisma migrate dev --name add_work_order_and_tasks`
- **Seed (optional):** one `EN_PROCESO` OT with 1–2 `PENDING` tasks on a seed vehicle.
- **Notes:** V2 and US-007 text fields included for schema parity; not writable in US-005 create.

---

### Step 2: Active Work Order Constants

- **File:** `apps/api/src/modules/work-orders/constants/work-order-status.ts`

```typescript
import { WorkOrderStatus } from '@prisma/client';

export const ACTIVE_WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.EN_PROCESO,
  WorkOrderStatus.LISTA_PARA_ENTREGA,
];
```

- **Rule:** A vehicle may have at most one WO with `status IN ACTIVE_WORK_ORDER_STATUSES`.
- **`OWNER_CONTACTED`:** Not active for US-005 duplicate rule (vehicle still on premises until `ENTREGADA` in US-008); document for US-008 if business rules change.

---

### Step 3: DTOs

#### `initial-task.dto.ts`

```typescript
export class InitialTaskDto {
  @IsString()
  @Length(3, 300)
  description: string;
}
```

#### `create-work-order.dto.ts`

```typescript
export class CreateWorkOrderDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  @Length(5, 500)
  entryReason: string;

  @IsInt()
  @Min(0)
  mileage: number;

  @IsOptional()
  @IsUUID()
  assignedMechanicId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks: InitialTaskDto[];
}
```

#### `mechanic-summary.dto.ts`

```typescript
export class MechanicSummaryDto {
  id: string;
  fullName: string;
}
```

#### `work-order-response.dto.ts` / `work-order-detail-response.dto.ts`

- Include: `id`, `vehicleId`, `ownerClientId`, `status`, `entryReason`, `mileage`, `assignedMechanicId`, `checkedInAt`, `createdById`, `tasks[]` (id, description, status, cost, sortOrder).
- **Create response (201):** also embed `vehicle` summary (`licensePlate`, `brand`, `model`) and `owner` (`fullName`, `nationalId`) per US-005 contract.

#### `active-work-order-response.dto.ts`

```typescript
export class ActiveWorkOrderResponseDto {
  activeWorkOrder: {
    id: string;
    status: WorkOrderStatus;
    checkedInAt: Date;
  } | null;
}
```

---

### Step 4: WorkOrdersService — Business Logic

- **File:** `apps/api/src/modules/work-orders/work-orders.service.ts`
- **TDD:** Write `work-orders.service.spec.ts` first.

#### Method signatures

```typescript
findActiveMechanics(): Promise<MechanicSummaryDto[]>
findActiveByVehicle(vehicleId: string): Promise<ActiveWorkOrderResponseDto>
findById(id: string): Promise<WorkOrderDetailResponseDto>
create(dto: CreateWorkOrderDto, createdById: string): Promise<WorkOrderDetailResponseDto>
```

#### `findActiveMechanics`

- `prisma.user.findMany({ where: { role: 'MECHANIC', active: true }, select: { id, fullName }, orderBy: { fullName: 'asc' } })`.

#### `findActiveByVehicle`

1. Verify vehicle exists → else `404`.
2. `findFirst({ where: { vehicleId, status: { in: ACTIVE_WORK_ORDER_STATUSES } } })`.
3. Return `{ activeWorkOrder: row | null }`.

#### `findById`

- Load WO with `tasks` (order `sortOrder asc`, `createdAt asc`), `vehicle`, `ownerClient`, optional `assignedMechanic`.
- `NotFoundException` if missing.

#### `create` (transactional)

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Vehicle exists
  const vehicle = await tx.vehicle.findUnique({
    where: { id: dto.vehicleId },
    include: { ownerships: { where: { validTo: null }, include: { client: true } } },
  });
  if (!vehicle) throw new NotFoundException('Vehicle not found');

  // 2. Resolve current owner snapshot
  const activeOwnership = vehicle.ownerships[0];
  if (!activeOwnership) throw new BadRequestException('Vehicle has no active owner');

  // 3. Active WO check (inside transaction)
  const existingActive = await tx.workOrder.findFirst({
    where: { vehicleId: dto.vehicleId, status: { in: ACTIVE_WORK_ORDER_STATUSES } },
  });
  if (existingActive) throw activeWorkOrderConflict(existingActive.id);

  // 4. Validate assigned mechanic if provided
  if (dto.assignedMechanicId) {
    const mechanic = await tx.user.findFirst({
      where: { id: dto.assignedMechanicId, role: 'MECHANIC', active: true },
    });
    if (!mechanic) throw new BadRequestException('Invalid assigned mechanic');
  }

  // 5. Create WorkOrder
  const workOrder = await tx.workOrder.create({
    data: {
      vehicleId: dto.vehicleId,
      ownerClientId: activeOwnership.clientId,
      entryReason: dto.entryReason.trim(),
      mileage: dto.mileage,
      assignedMechanicId: dto.assignedMechanicId ?? null,
      createdById,
      status: WorkOrderStatus.EN_PROCESO,
      // checkedInAt defaults to now()
    },
  });

  // 6. Create initial tasks
  await tx.workOrderTask.createMany({
    data: dto.initialTasks.map((t, index) => ({
      workOrderId: workOrder.id,
      description: t.description.trim(),
      status: WorkOrderTaskStatus.PENDING,
      sortOrder: index,
    })),
  });

  return workOrder.id;
});
```

- Reload full detail after transaction for response mapping.
- **Concurrency:** Re-check active WO inside transaction; consider `Serializable` isolation or `SELECT ... FOR UPDATE` on vehicle row if duplicate 409 races are a concern in tests.
- **`checkedInAt`:** Server default (`@default(now())`); not client-supplied.

#### `resolveOwnerClientId`

- Private helper: read active `VehicleOwnership` (`validTo IS NULL`); throw if missing.

---

### Step 5: Conflict Response — `activeWorkOrderId`

- **Requirement:** US-005 `409` when vehicle already has active WO.

**Target response:**

```json
{
  "statusCode": 409,
  "message": "Vehicle already has an active work order",
  "error": "Conflict",
  "activeWorkOrderId": "existing-uuid"
}
```

- **File:** Custom `ActiveWorkOrderConflictException` or extend global exception filter (same pattern as US-003/US-004).

---

### Step 6: WorkOrdersController

- **File:** `apps/api/src/modules/work-orders/work-orders.controller.ts`

```typescript
@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MECHANIC')
export class WorkOrdersController {
  @Get('mechanics')
  findMechanics(): Promise<MechanicSummaryDto[]>

  @Get('active')
  findActive(@Query('vehicleId', ParseUUIDPipe) vehicleId: string): Promise<ActiveWorkOrderResponseDto>

  @Post()
  @HttpCode(201)
  create(
    @Body() dto: CreateWorkOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkOrderDetailResponseDto>

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<WorkOrderDetailResponseDto>
}
```

- **Route order:** `mechanics` → `active` → `POST /` → `:id`.
- **`createdById`:** From `@CurrentUser()` JWT `sub` / `userId` — never from request body.

---

### Step 7: WorkOrdersModule Registration

```typescript
@Module({
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
```

- Register in `AppModule`.
- Optional: import `VehiclesModule` only if cross-service calls are needed; prefer updating `VehiclesService` via shared Prisma queries to avoid circular deps.

---

### Step 8: Update VehiclesService — Visit History

- **File:** `apps/api/src/modules/vehicles/vehicles.service.ts`
- **Action:** Implement `getHistory(vehicleId)` with real `WorkOrder` data.

```typescript
// Query work orders for vehicle, orderBy checkedInAt desc
// Map each to VehicleVisitDto:
//   workOrderId, checkedInAt, status, entryReason,
//   totalAmount: sum of task.cost where status=COMPLETED (0 if none),
//   ownerAtVisit: { fullName, nationalId } from ownerClient relation
```

- **US-005:** New OT appears in history immediately after create.
- **totalAmount:** `0` or `null` when no completed tasks with cost (MVP create only has `PENDING` tasks → `null` or `0`).

---

### Step 9: Unit Tests — WorkOrdersService

- **File:** `apps/api/src/modules/work-orders/work-orders.service.spec.ts`
- **Coverage:** ≥ 90% on create paths

| Category | Scenario | Expected |
|----------|----------|----------|
| **Mechanics** | List mechanics | Only `MECHANIC` + `active=true` |
| **Active** | Vehicle with active WO | Returns `activeWorkOrder` |
| **Active** | No active WO | `activeWorkOrder: null` |
| **Active** | Unknown vehicle | `404` |
| **Create** | Valid with 1 task | WO `EN_PROCESO`, tasks `PENDING`, `ownerClientId` from ownership |
| **Create** | Multiple initial tasks | Correct `sortOrder` 0..n |
| **Create** | With assigned mechanic | Mechanic linked |
| **Create** | Empty `initialTasks` | `400` (DTO) |
| **Create** | Invalid mechanic (ADMIN user) | `400` |
| **Create** | Inactive mechanic | `400` |
| **Create** | Unknown `vehicleId` | `404` |
| **Create** | Vehicle without owner | `400` |
| **Create** | Duplicate active WO | `409` + `activeWorkOrderId` |
| **Create** | `createdById` from caller | Matches authenticated user |
| **FindById** | Valid id | Tasks included |
| **FindById** | Unknown id | `404` |

---

### Step 10: E2E Tests — WorkOrdersController

- **File:** `apps/api/test/work-orders.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/work-orders/mechanics` as MECHANIC | `200`, array, no inactive users |
| 2 | `GET /api/work-orders/active?vehicleId=` valid | `200`, null or active |
| 3 | `GET /api/work-orders/active` missing vehicleId | `400` |
| 4 | `POST /api/work-orders` valid as ADMIN | `201`, status `EN_PROCESO`, ≥1 task |
| 5 | `POST /api/work-orders` valid as MECHANIC | `201` |
| 6 | `POST /api/work-orders` no initial tasks | `400` |
| 7 | `POST /api/work-orders` unknown vehicle | `404` |
| 8 | `POST /api/work-orders` second active for same vehicle | `409`, `activeWorkOrderId` |
| 9 | `POST /api/work-orders` invalid mechanic | `400` |
| 10 | `GET /api/work-orders/:id` after create | `200`, tasks present |
| 11 | `GET /api/work-orders/:id` unknown | `404` |
| 12 | `GET /api/vehicles/:id/history` after create | Visit in `visits` array |
| 13 | Unauthenticated `POST` | `401` |
| 14 | Response includes `vehicle` + `owner` summaries on create | Shape matches US |

- **Setup:** Seed vehicle without active WO; use unique entry reasons per run if needed.

---

### Step 11: Update Technical Documentation

1. Confirm `readme.md` §3 `WorkOrder` / `WorkOrderTask` match migration.
2. Add work-orders endpoints to `docs/api-spec.yml` fragment.
3. Update `apps/api/README.md` with create/active/mechanics examples.
4. Document `409` + `activeWorkOrderId` and active-status rule.
5. Note US-004 `GET /vehicles/:id/history` now returns populated visits.

---

## Implementation Order

1. Step 0 — Branch `feature/US-005-backend`
2. Step 1 — Prisma enums + models + migration + optional seed
3. Step 2 — Active status constants
4. Step 3 — DTOs
5. Step 9 (red) — Unit tests
6. Step 4 — `WorkOrdersService` (transactional create)
7. Step 5 — Conflict response handling
8. Step 9 (green) — Unit tests
9. Step 6 — `WorkOrdersController`
10. Step 7 — Module registration
11. Step 8 — `VehiclesService.getHistory` update
12. Step 10 — E2E tests (including history integration)
13. Step 11 — Documentation

---

## Testing Checklist

- [ ] Migration applies; relations on User/Client/Vehicle updated
- [ ] `POST` creates WO + tasks atomically
- [ ] `checkedInAt` set by server; status `EN_PROCESO`
- [ ] `ownerClientId` snapshots active ownership at create time
- [ ] Second active WO for same vehicle → `409` + `activeWorkOrderId`
- [ ] `GET mechanics` returns only active mechanics
- [ ] `GET active` and `GET :id` work for ADMIN and MECHANIC
- [ ] Vehicle history includes new visit
- [ ] Unit + e2e green; service ≥ 90% coverage on create paths

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 400,
  "message": ["initialTasks must contain at least 1 elements"],
  "error": "Bad Request"
}
```

### HTTP status mapping (US-005)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | DTO validation | Field errors |
| `400` | Empty `initialTasks` | Validation error |
| `400` | Invalid/inactive/non-mechanic `assignedMechanicId` | `Invalid assigned mechanic` |
| `400` | Vehicle has no active owner | `Vehicle has no active owner` |
| `401` | No JWT | `Unauthorized` |
| `404` | `vehicleId` not found | `Vehicle not found` |
| `404` | Work order id not found | `Not Found` |
| `409` | Active WO exists for vehicle | `Vehicle already has an active work order` + **`activeWorkOrderId`** |

---

## Partial Update Support

Not applicable — create and read-only in US-005; task/OT updates deferred to US-006/US-008.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-001** | Auth guards, `@CurrentUser()` for `createdById` |
| **US-003** | `Client` for `ownerClientId` FK |
| **US-004** | `Vehicle`, `VehicleOwnership`, history endpoint |
| **Prisma** | `WorkOrder`, `WorkOrderTask`, enums |

No new npm packages beyond US-001 stack.

---

## Notes

- **Active WO definition:** `EN_PROCESO` or `LISTA_PARA_ENTREGA` only (US-005); `OWNER_CONTACTED` handling may extend in US-008.
- **Owner snapshot:** `ownerClientId` is immutable after create (D3 transfer does not retroactively change past visits).
- **Task costs:** Not required on create; `cost` remains `null` for `PENDING` tasks (US-006 enforces on complete).
- **Mileage warning:** UI-only in MVP; backend does not block lower mileage than previous visit.
- **Transition to `LISTA_PARA_ENTREGA`:** US-006 when all tasks completed — not in this ticket.
- **Roles:** Both `ADMIN` and `MECHANIC`.
- **Language:** Code and API messages in **English**; UI Spanish is frontend concern.
- **Branch:** `feature/US-005-backend` from `feature-entrega2-RFM` (with US-004 merged).

---

## Next Steps After Implementation

1. `/plan-backend-ticket @us/US-006-gestion-tareas.md` (or equivalent US file)
2. `/plan-frontend-ticket @us/US-005-crear-orden-trabajo.md`
3. Merge `feature/US-005-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Transaction wraps WO + tasks; active check inside transaction
- [ ] `createdById` never taken from client body
- [ ] Static routes registered before `:id`

### Functionality

- [ ] One active WO per vehicle enforced
- [ ] Owner snapshot from current ownership
- [ ] Vehicle history populated

### Testing

- [ ] All unit + e2e scenarios pass
- [ ] Concurrent create race covered or documented

### Integration

- [ ] US-004 history contract fulfilled with real visits
- [ ] Ready for US-006 task management on `GET /work-orders/:id`

### Documentation

- [ ] Step 11 complete
