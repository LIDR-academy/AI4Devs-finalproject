# Backend Implementation Plan: US-006 Work Order Task Management

## Overview

Implement **dynamic task management** within work orders for MecaTrack (US-006): add tasks to in-progress work orders, transition task states (`PENDING` → `IN_PROGRESS` → `COMPLETED`), require cost on completion, compute `totalAmount`, and **automatically transition** the work order to `LISTA_PARA_ENTREGA` when all tasks are completed. Extend `GET /work-orders/:id` with task list and totals.

**Architecture principles:** extend vertical `work-orders` module with a task sub-service, Controller → Service → Prisma, transactional updates (task + optional WO status transition), DTO validation, TDD, shared auth guards from US-001.

**User story reference:** [`us/US-006-gestion-tareas.md`](../../us/US-006-gestion-tareas.md)

**Prerequisites:** US-005 (`WorkOrder`, `WorkOrderTask`, `GET/POST /work-orders`).

**Out of scope:** delete tasks, revert `COMPLETED` status, edit cost after complete, diagnosis fields (US-007), delivery panel (US-008), frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-006 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, task DTOs | `WorkOrderTasksController`, `CreateTaskDto`, `UpdateTaskDto` |
| **Application** | Task CRUD, transitions, `totalAmount`, WO auto-transition | `WorkOrderTasksService`, helpers in `WorkOrdersService` |
| **Infrastructure** | Transactions | Prisma `WorkOrderTask` updates |
| **Domain** | State machine, cost on complete, read-only when WO closed | Enforced in service |

### Files to add/modify

```
apps/api/src/modules/work-orders/
├── work-orders.controller.ts          # ensure GET :id includes totalAmount
├── work-orders.service.ts             # totalAmount helper, enrich findById
├── work-order-tasks.controller.ts     # POST, PATCH tasks
├── work-order-tasks.service.ts
├── work-order-tasks.service.spec.ts
├── dto/
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   └── update-task-response.dto.ts    # { task, workOrder }
├── validators/
│   └── task-status-transition.validator.ts
└── utils/
    └── work-order-totals.ts           # calculateTotalAmount(tasks)

apps/api/prisma/
└── schema.prisma                      # verify costNotes, completedAt (likely from US-005)
```

### API endpoints (US-006)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/work-orders/:id` | Bearer | `ADMIN`, `MECHANIC` | **Extend:** `tasks[]`, `totalAmount`, `updatedAt` |
| `POST` | `/api/work-orders/:workOrderId/tasks` | Bearer | `ADMIN`, `MECHANIC` | Add task (OT `EN_PROCESO` only) |
| `PATCH` | `/api/work-orders/:workOrderId/tasks/:taskId` | Bearer | `ADMIN`, `MECHANIC` | Update status / complete with cost |

Optional `GET /api/work-orders/:workOrderId/tasks` — **not required for MVP** if `GET :id` is sufficient.

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-006-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-005 merged.
  2. `git checkout -b feature/US-006-backend`
  3. Verify work-order create e2e tests pass.

---

### Step 1: Prisma — Verify Task Fields

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Confirm `WorkOrderTask` already includes (from US-005 / readme §3):

```prisma
costNotes       String?
completedAt     DateTime?
```

- **Migration:** Only if fields missing — `npx prisma migrate dev --name add_task_completion_fields`
- **No schema change** expected if US-005 followed readme reference model.

---

### Step 2: Task Status Transition Rules

- **File:** `apps/api/src/modules/work-orders/validators/task-status-transition.validator.ts`

```typescript
const ALLOWED_TRANSITIONS: Record<WorkOrderTaskStatus, WorkOrderTaskStatus[]> = {
  PENDING: ['IN_PROGRESS', 'COMPLETED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [], // no transitions in MVP
};

export function assertValidTaskTransition(
  from: WorkOrderTaskStatus,
  to: WorkOrderTaskStatus,
): void
```

| From | To | Extra rules |
|------|-----|-------------|
| `PENDING` | `IN_PROGRESS` | — |
| `PENDING` | `COMPLETED` | `cost` required, ≥ 0 |
| `IN_PROGRESS` | `COMPLETED` | `cost` required, ≥ 0 |
| `COMPLETED` | *any* | `409 Conflict` |

- **WO editability:** Mutations allowed only when `workOrder.status === EN_PROCESO`.
- **Forbidden WO states:** `LISTA_PARA_ENTREGA`, `ENTREGADA`, `OWNER_CONTACTED` → `403 Forbidden`.

---

### Step 3: DTOs

#### `create-task.dto.ts`

```typescript
export class CreateTaskDto {
  @IsString()
  @Length(3, 300)
  description: string;
}
```

#### `update-task.dto.ts`

```typescript
export class UpdateTaskDto {
  @IsEnum(WorkOrderTaskStatus)
  status: WorkOrderTaskStatus;

  @ValidateIf((o) => o.status === WorkOrderTaskStatus.COMPLETED)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  costNotes?: string;
}
```

- Reject `cost` / `costNotes` when status is not `COMPLETED` (strip or `400`).
- Use `class-transformer` to coerce `cost` to `Decimal` in service.

#### `update-task-response.dto.ts`

```typescript
export class UpdateTaskResponseDto {
  task: TaskResponseDto;
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    totalAmount: number;
    updatedAt: Date;
  };
}
```

---

### Step 4: Work Order Totals Utility

- **File:** `apps/api/src/modules/work-orders/utils/work-order-totals.ts`

```typescript
export function calculateTotalAmount(
  tasks: Array<{ status: WorkOrderTaskStatus; cost: Decimal | null }>,
): number {
  return tasks
    .filter((t) => t.status === WorkOrderTaskStatus.COMPLETED && t.cost != null)
    .reduce((sum, t) => sum + Number(t.cost), 0);
}
```

- Use `Prisma.Decimal` or `number` consistently; API returns `number` with 2 decimal places.
- **Enrich** `WorkOrdersService.findById` to include `totalAmount` via this helper.

---

### Step 5: WorkOrderTasksService — Business Logic

- **File:** `apps/api/src/modules/work-orders/work-order-tasks.service.ts`
- **TDD:** Write `work-order-tasks.service.spec.ts` first.

#### Method signatures

```typescript
addTask(workOrderId: string, dto: CreateTaskDto): Promise<TaskResponseDto>
updateTask(
  workOrderId: string,
  taskId: string,
  dto: UpdateTaskDto,
): Promise<UpdateTaskResponseDto>
```

#### `addTask`

```typescript
await this.prisma.$transaction(async (tx) => {
  const wo = await tx.workOrder.findUnique({ where: { id: workOrderId }, include: { tasks: true } });
  if (!wo) throw new NotFoundException('Work order not found');
  if (wo.status !== WorkOrderStatus.EN_PROCESO) {
    throw new ForbiddenException('Work order is not editable');
  }

  const maxSort = wo.tasks.reduce((m, t) => Math.max(m, t.sortOrder), -1);

  return tx.workOrderTask.create({
    data: {
      workOrderId,
      description: dto.description.trim(),
      status: WorkOrderTaskStatus.PENDING,
      sortOrder: maxSort + 1,
    },
  });
});
```

#### `updateTask`

```typescript
await this.prisma.$transaction(async (tx) => {
  const wo = await tx.workOrder.findUnique({
    where: { id: workOrderId },
    include: { tasks: true },
  });
  if (!wo) throw new NotFoundException('Work order not found');
  if (wo.status !== WorkOrderStatus.EN_PROCESO) {
    throw new ForbiddenException('Work order is not editable');
  }

  const task = wo.tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundException('Task not found');

  if (task.status === WorkOrderTaskStatus.COMPLETED) {
    throw new ConflictException('Task is already completed');
  }

  assertValidTaskTransition(task.status, dto.status);

  if (dto.status === WorkOrderTaskStatus.COMPLETED) {
    if (dto.cost == null || dto.cost < 0) {
      throw new BadRequestException('Cost is required when completing a task');
    }
  }

  await tx.workOrderTask.update({
    where: { id: taskId },
    data: {
      status: dto.status,
      ...(dto.status === WorkOrderTaskStatus.COMPLETED && {
        cost: dto.cost,
        costNotes: dto.costNotes?.trim() ?? null,
        completedAt: new Date(),
      }),
    },
  });

  // Re-read all tasks inside transaction
  const updatedTasks = await tx.workOrderTask.findMany({ where: { workOrderId } });
  const allCompleted =
    updatedTasks.length > 0 &&
    updatedTasks.every((t) => t.status === WorkOrderTaskStatus.COMPLETED);

  let woStatus = wo.status;
  if (allCompleted) {
    await tx.workOrder.update({
      where: { id: workOrderId },
      data: { status: WorkOrderStatus.LISTA_PARA_ENTREGA },
    });
    woStatus = WorkOrderStatus.LISTA_PARA_ENTREGA;
  }

  const totalAmount = calculateTotalAmount(updatedTasks);
  return buildUpdateResponse(taskId, woStatus, totalAmount);
});
```

- **Concurrency:** Re-fetch tasks inside transaction before `maybeTransitionWorkOrder` to avoid double transition when two mechanics complete last tasks simultaneously.
- **`completedAt`:** Set only when transitioning to `COMPLETED` (not cleared on invalid revert — N/A in MVP).

#### `maybeTransitionWorkOrder` (private)

- Extracted helper called after task update; updates WO only if all tasks `COMPLETED` and WO still `EN_PROCESO`.

---

### Step 6: WorkOrderTasksController

- **File:** `apps/api/src/modules/work-orders/work-order-tasks.controller.ts`

```typescript
@Controller('work-orders/:workOrderId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MECHANIC')
export class WorkOrderTasksController {
  @Post()
  @HttpCode(201)
  addTask(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto>

  @Patch(':taskId')
  updateTask(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<UpdateTaskResponseDto>
}
```

- Register controller in `WorkOrdersModule` alongside `WorkOrdersController`.

---

### Step 7: Extend WorkOrdersService — GET Detail

- **File:** `apps/api/src/modules/work-orders/work-orders.service.ts`
- **Action:** Ensure `findById` response includes:
  - `tasks[]` ordered by `sortOrder asc`, `createdAt asc`
  - `totalAmount` (computed)
  - `updatedAt` on work order
  - Task fields: `id`, `description`, `status`, `cost`, `costNotes`, `sortOrder`, `completedAt`

---

### Step 8: WorkOrdersModule Registration

```typescript
@Module({
  controllers: [WorkOrdersController, WorkOrderTasksController],
  providers: [WorkOrdersService, WorkOrderTasksService],
  exports: [WorkOrdersService, WorkOrderTasksService],
})
export class WorkOrdersModule {}
```

---

### Step 9: Unit Tests — WorkOrderTasksService

- **File:** `apps/api/src/modules/work-orders/work-order-tasks.service.spec.ts`
- **Coverage:** ≥ 90%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Add** | OT `EN_PROCESO` | `201` equivalent, task `PENDING`, `sortOrder` incremented |
| **Add** | OT `LISTA_PARA_ENTREGA` | `403` |
| **Add** | OT `ENTREGADA` | `403` |
| **Add** | Unknown WO | `404` |
| **Update** | `PENDING` → `IN_PROGRESS` | Task updated, WO unchanged |
| **Update** | `IN_PROGRESS` → `COMPLETED` with cost | Task completed, `completedAt` set |
| **Update** | `PENDING` → `COMPLETED` with cost | Shortcut allowed |
| **Update** | → `COMPLETED` without cost | `400` |
| **Update** | → `COMPLETED` with negative cost | `400` |
| **Update** | `COMPLETED` → any | `409` |
| **Update** | Invalid transition `IN_PROGRESS` → `PENDING` | `400` |
| **Transition** | 2 tasks, complete 1 | WO stays `EN_PROCESO` |
| **Transition** | All tasks completed | WO → `LISTA_PARA_ENTREGA` |
| **Transition** | Last task complete in same TX | Single transition |
| **Total** | Mixed task statuses | `totalAmount` = sum completed costs only |
| **Total** | No completed tasks | `totalAmount` = 0 |

---

### Step 10: E2E Tests — Task Endpoints

- **File:** `apps/api/test/work-order-tasks.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `POST .../tasks` on `EN_PROCESO` WO | `201`, `PENDING` |
| 2 | `POST .../tasks` on `LISTA_PARA_ENTREGA` WO | `403` |
| 3 | `PATCH .../tasks/:id` → `IN_PROGRESS` | `200`, WO `EN_PROCESO` |
| 4 | `PATCH` → `COMPLETED` without cost | `400` |
| 5 | `PATCH` → `COMPLETED` with cost | `200`, task has cost |
| 6 | Complete all tasks | `workOrder.status` = `LISTA_PARA_ENTREGA` |
| 7 | `PATCH` on `COMPLETED` task | `409` |
| 8 | `GET /work-orders/:id` | `totalAmount` correct |
| 9 | `PATCH` on `ENTREGADA` WO | `403` |
| 10 | Unauthenticated `POST` | `401` |
| 11 | Response shape on complete | `{ task, workOrder }` with updated `totalAmount` |

- **Setup:** Create WO with 2 initial tasks via US-005 `POST /work-orders`.

---

### Step 11: Update Vehicle History (optional enrichment)

- **File:** `apps/api/src/modules/vehicles/vehicles.service.ts`
- **Action:** When mapping visits in `getHistory`, set `totalAmount` from completed task costs if not already done in US-005.

---

### Step 12: Update Technical Documentation

1. Document task endpoints in `docs/api-spec.yml`.
2. Update `apps/api/README.md` with task flow examples.
3. Document state machine and auto-transition rule in work-orders module README or inline.
4. Confirm `readme.md` §3 business rules match implementation.

---

## Implementation Order

1. Step 0 — Branch `feature/US-006-backend`
2. Step 1 — Verify Prisma fields (migrate if needed)
3. Step 2 — Transition validator
4. Step 3 — DTOs
5. Step 4 — `calculateTotalAmount` utility
6. Step 9 (red) — Unit tests
7. Step 5 — `WorkOrderTasksService`
8. Step 9 (green) — Unit tests
9. Step 6 — `WorkOrderTasksController`
10. Step 7 — Extend `WorkOrdersService.findById`
11. Step 8 — Module registration
12. Step 10 — E2E tests
13. Step 11 — Vehicle history `totalAmount` (if needed)
14. Step 12 — Documentation

---

## Testing Checklist

- [ ] Add task works on `EN_PROCESO` WO only
- [ ] Status transitions enforced; no revert from `COMPLETED`
- [ ] `cost` required and ≥ 0 on `COMPLETED`
- [ ] `costNotes` optional on complete
- [ ] `completedAt` set on complete
- [ ] WO auto-transitions to `LISTA_PARA_ENTREGA` when all tasks done
- [ ] `totalAmount` correct on `GET :id` and PATCH response
- [ ] Closed WO (`LISTA_PARA_ENTREGA`, `ENTREGADA`) rejects mutations
- [ ] Unit + e2e green; task service ≥ 90% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 400,
  "message": "Cost is required when completing a task",
  "error": "Bad Request"
}
```

### HTTP status mapping (US-006)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | DTO validation | Field errors |
| `400` | Invalid status transition | `Invalid task status transition` |
| `400` | `COMPLETED` without `cost` | `Cost is required when completing a task` |
| `400` | `cost` < 0 | Validation error |
| `401` | No JWT | `Unauthorized` |
| `403` | WO not `EN_PROCESO` | `Work order is not editable` |
| `404` | WO or task not found | `Not Found` |
| `409` | Task already `COMPLETED` | `Task is already completed` |

---

## Partial Update Support

`PATCH` task supports partial semantics for completion payload:

| Field | When sent | Behavior |
|-------|-----------|----------|
| `status` | Required | Drives transition |
| `cost` | Required if `status = COMPLETED` | Persisted on task |
| `costNotes` | Optional with `COMPLETED` | Persisted or `null` |

No partial update of `description` or `cost` after `COMPLETED` in MVP.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-005** | `WorkOrder`, `WorkOrderTask`, create flow |
| **US-001** | Auth guards |
| **Prisma** | `Decimal(12,2)` for `cost` |

No new npm packages beyond US-001 stack.

---

## Notes

- **Shared workshop:** Any `MECHANIC` may edit any OT (not restricted to `assignedMechanicId`).
- **Auto-transition:** Runs in same transaction as last task completion; re-read tasks before checking `allCompleted`.
- **US-008 prep:** Panel filters `LISTA_PARA_ENTREGA`; this US produces those records.
- **US-007 prep:** Diagnosis fields on `WorkOrderTask` exist in schema; editable only on non-`COMPLETED` tasks in US-007.
- **OWNER_CONTACTED:** Not set in US-006; reserved for V2 D1.
- **Language:** Code and API messages in **English**; UI Spanish is frontend concern.
- **Branch:** `feature/US-006-backend` from `feature-entrega2-RFM` (with US-005 merged).

---

## Next Steps After Implementation

1. `/plan-backend-ticket` for US-007
2. `/plan-frontend-ticket @us/US-006-gestion-tareas.md`
3. Merge `feature/US-006-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Transition rules centralized in validator
- [ ] `totalAmount` computed in one utility
- [ ] Transaction wraps task update + WO transition

### Functionality

- [ ] Full task lifecycle through to `LISTA_PARA_ENTREGA`
- [ ] Read-only enforcement on non-editable WO states

### Testing

- [ ] All unit + e2e scenarios pass
- [ ] Concurrent completion edge case covered

### Integration

- [ ] `GET /work-orders/:id` ready for US-006 frontend detail page
- [ ] WO in `LISTA_PARA_ENTREGA` visible for US-008 delivery panel

### Documentation

- [ ] Step 12 complete
