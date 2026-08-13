# Backend Implementation Plan: US-007 Technical Notes (Diagnosis & Repairs)

## Overview

Implement **technical documentation** for MecaTrack work orders (US-007): optional diagnosis, repair, parts, and notes at **task level** and **visit level** (WorkOrder). Notes are editable only while the work order is `EN_PROCESO` and the task is not `COMPLETED`. Enrich `GET /work-orders/:id` and `GET /vehicles/:id/history` so technical data appears in vehicle history (US-009 prep).

**Architecture principles:** extend `work-orders` module with a dedicated technical-notes service; keep fields on existing Prisma models (no separate `task-notes` table in MVP); PATCH-only mutations; TDD.

**User story reference:** [`us/US-007-diagnosticos-reparaciones.md`](../../us/US-007-diagnosticos-reparaciones.md)

**Prerequisites:** US-005 (`WorkOrder` with `visit*` fields), US-006 (tasks, status rules, `GET /work-orders/:id`).

**Out of scope:** parts catalog/inventory, file attachments, edit notes after task complete, frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-007 artifacts |
|-------|----------------|------------------|
| **Presentation** | PATCH DTOs | `WorkOrderTechnicalNotesController` |
| **Application** | Edit rules, trim/normalize text | `WorkOrderTechnicalNotesService` |
| **Infrastructure** | Prisma updates | `WorkOrderTask`, `WorkOrder` text columns |
| **Domain** | Read-only when WO closed or task completed | Enforced in service |

### Files to add/modify

```
apps/api/src/modules/work-orders/
├── work-order-technical-notes.controller.ts
├── work-order-technical-notes.service.ts
├── work-order-technical-notes.service.spec.ts
├── work-orders.service.ts              # enrich findById with visit* + task technical fields
├── dto/
│   ├── update-task-technical-notes.dto.ts
│   ├── update-visit-notes.dto.ts
│   └── task-technical-notes-response.dto.ts
└── utils/
    └── technical-notes-normalizer.ts   # trim, empty string → null, max length

apps/api/src/modules/vehicles/
└── vehicles.service.ts                 # enrich getHistory with visitNotes + task technical fields

apps/api/prisma/
└── schema.prisma                       # verify columns exist (likely from US-005)
```

**Module placement:** Implement inside `work-orders` (not a separate `task-notes` Nest module) to avoid circular dependencies; readme `task-notes` is a logical subdomain name only.

### API endpoints (US-007)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `PATCH` | `/api/work-orders/:workOrderId/tasks/:taskId/technical-notes` | Bearer | `ADMIN`, `MECHANIC` | Update task technical fields |
| `PATCH` | `/api/work-orders/:workOrderId/visit-notes` | Bearer | `ADMIN`, `MECHANIC` | Update WO visit-level notes |
| `GET` | `/api/work-orders/:id` | Bearer | `ADMIN`, `MECHANIC` | **Extend:** `visit*` + task technical fields (may already partial) |
| `GET` | `/api/vehicles/:id/history` | Bearer | `ADMIN`, `MECHANIC` | **Extend:** `visitNotes` + `tasks[]` technical fields per visit |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-007-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-006 merged.
  2. `git checkout -b feature/US-007-backend`
  3. Verify task management e2e tests pass.

---

### Step 1: Prisma — Verify Technical Note Columns

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Confirm columns exist per `readme.md` §3:

**`WorkOrderTask`:**

```prisma
diagnosis        String?  @db.Text
repairPerformed  String?  @db.Text
partsUsed        String?  @db.Text
additionalNotes  String?  @db.Text
```

**`WorkOrder`:**

```prisma
visitDiagnosis       String?  @db.Text
visitRepairSummary   String?  @db.Text
visitPartsUsed       String?  @db.Text
visitAdditionalNotes String?  @db.Text
```

- **Migration:** Only if missing — `npx prisma migrate dev --name add_technical_notes_fields`
- **Expected:** No migration if US-005 followed full readme schema.

---

### Step 2: Technical Notes Normalizer

- **File:** `apps/api/src/modules/work-orders/utils/technical-notes-normalizer.ts`

```typescript
const MAX_FIELD_LENGTH = 5000;

export function normalizeTechnicalField(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > MAX_FIELD_LENGTH
    ? trimmed.slice(0, MAX_FIELD_LENGTH) // or throw BadRequest — prefer throw in DTO
    : trimmed;
}
```

- **Validation:** Use `@MaxLength(5000)` on DTOs; normalizer converts empty strings to `null`.
- **Partial PATCH:** Only fields present in request body are updated; omitted fields unchanged. Use explicit DTO with all optional fields + service merge logic, or `PartialType` with `undefined` vs `null` semantics documented:
  - **MVP:** Send full object from frontend on save, or use `undefined` = skip, `null` = clear.

**Recommended semantics:**

| Body value | Behavior |
|------------|----------|
| Field omitted | No change |
| `null` or `""` | Set column to `null` |
| Non-empty string | Set normalized value |

---

### Step 3: DTOs

#### `update-task-technical-notes.dto.ts`

```typescript
export class UpdateTaskTechnicalNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  diagnosis?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  repairPerformed?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  partsUsed?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  additionalNotes?: string | null;
}
```

#### `update-visit-notes.dto.ts`

```typescript
export class UpdateVisitNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  visitDiagnosis?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  visitRepairSummary?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  visitPartsUsed?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  visitAdditionalNotes?: string | null;
}
```

#### Response DTOs

- Task PATCH returns full task object including technical fields + `status`.
- Visit PATCH returns WO fragment: `id`, `visitDiagnosis`, `visitRepairSummary`, `visitPartsUsed`, `visitAdditionalNotes`, `status`.

---

### Step 4: WorkOrderTechnicalNotesService — Business Logic

- **File:** `apps/api/src/modules/work-orders/work-order-technical-notes.service.ts`
- **TDD:** Write `work-order-technical-notes.service.spec.ts` first.

#### Method signatures

```typescript
updateTaskTechnicalNotes(
  workOrderId: string,
  taskId: string,
  dto: UpdateTaskTechnicalNotesDto,
): Promise<TaskTechnicalNotesResponseDto>

updateVisitNotes(
  workOrderId: string,
  dto: UpdateVisitNotesDto,
): Promise<VisitNotesResponseDto>
```

#### `updateTaskTechnicalNotes`

```typescript
const wo = await this.prisma.workOrder.findUnique({
  where: { id: workOrderId },
  include: { tasks: { where: { id: taskId } } },
});
if (!wo) throw new NotFoundException('Work order not found');
if (wo.status !== WorkOrderStatus.EN_PROCESO) {
  throw new ForbiddenException('Work order is not editable');
}

const task = wo.tasks[0];
if (!task) throw new NotFoundException('Task not found');

if (task.status === WorkOrderTaskStatus.COMPLETED) {
  throw new ForbiddenException('Cannot edit technical notes on a completed task');
}

const data = buildPartialUpdate(dto); // only defined fields, normalized

return this.prisma.workOrderTask.update({
  where: { id: taskId },
  data,
});
```

#### `updateVisitNotes`

```typescript
const wo = await this.prisma.workOrder.findUnique({ where: { id: workOrderId } });
if (!wo) throw new NotFoundException('Work order not found');
if (wo.status !== WorkOrderStatus.EN_PROCESO) {
  throw new ForbiddenException('Work order is not editable');
}

const data = buildVisitNotesUpdate(dto);

return this.prisma.workOrder.update({
  where: { id: workOrderId },
  data,
  select: { id: true, status: true, visitDiagnosis: true, visitRepairSummary: true, visitPartsUsed: true, visitAdditionalNotes: true },
});
```

- **Empty body / all null:** Valid `200`; clears provided fields to `null`.
- **Does not affect US-006:** Completing a task without technical notes remains valid (separate PATCH endpoint).

---

### Step 5: WorkOrderTechnicalNotesController

- **File:** `apps/api/src/modules/work-orders/work-order-technical-notes.controller.ts`

```typescript
@Controller('work-orders/:workOrderId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MECHANIC')
export class WorkOrderTechnicalNotesController {
  @Patch('tasks/:taskId/technical-notes')
  updateTaskNotes(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskTechnicalNotesDto,
  ): Promise<TaskTechnicalNotesResponseDto>

  @Patch('visit-notes')
  updateVisitNotes(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() dto: UpdateVisitNotesDto,
  ): Promise<VisitNotesResponseDto>
}
```

- **Route note:** `visit-notes` is static; register before any conflicting `:id` routes if controllers are merged — separate controller on `work-orders/:workOrderId` prefix avoids collision with `WorkOrdersController` `@Get(':id')`.
- **Alternative:** NestJS route `work-orders/:workOrderId/visit-notes` on dedicated controller with prefix `work-orders`.

---

### Step 6: Extend GET Responses

#### `WorkOrdersService.findById`

Include in response:

```json
{
  "visitDiagnosis": "...",
  "visitRepairSummary": "...",
  "visitPartsUsed": "...",
  "visitAdditionalNotes": "...",
  "tasks": [
    {
      "id": "...",
      "description": "...",
      "status": "PENDING",
      "cost": null,
      "diagnosis": "...",
      "repairPerformed": "...",
      "partsUsed": "...",
      "additionalNotes": "..."
    }
  ]
}
```

#### `VehiclesService.getHistory`

Extend each visit item:

```json
{
  "workOrderId": "uuid",
  "checkedInAt": "...",
  "status": "ENTREGADA",
  "entryReason": "...",
  "totalAmount": 85000,
  "ownerAtVisit": { "fullName": "...", "nationalId": "..." },
  "visitNotes": {
    "visitDiagnosis": "...",
    "visitRepairSummary": "...",
    "visitPartsUsed": "...",
    "visitAdditionalNotes": "..."
  },
  "tasks": [
    {
      "description": "...",
      "status": "COMPLETED",
      "cost": 85000,
      "diagnosis": "...",
      "repairPerformed": "...",
      "partsUsed": "...",
      "additionalNotes": "..."
    }
  ]
}
```

- **Query:** Eager-load `tasks` on work orders in history query; order tasks by `sortOrder`, `createdAt`.
- **Performance:** Single query with `include` — avoid N+1.

---

### Step 7: WorkOrdersModule Registration

```typescript
@Module({
  controllers: [
    WorkOrdersController,
    WorkOrderTasksController,
    WorkOrderTechnicalNotesController,
  ],
  providers: [
    WorkOrdersService,
    WorkOrderTasksService,
    WorkOrderTechnicalNotesService,
  ],
  exports: [WorkOrdersService, WorkOrderTasksService, WorkOrderTechnicalNotesService],
})
export class WorkOrdersModule {}
```

---

### Step 8: Unit Tests — WorkOrderTechnicalNotesService

- **File:** `apps/api/src/modules/work-orders/work-order-technical-notes.service.spec.ts`
- **Coverage:** ≥ 85%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Task notes** | Update on `PENDING` task, WO `EN_PROCESO` | `200`, fields saved |
| **Task notes** | Update on `IN_PROGRESS` task | `200` |
| **Task notes** | Task `COMPLETED` | `403` |
| **Task notes** | WO `LISTA_PARA_ENTREGA` | `403` |
| **Task notes** | WO `ENTREGADA` | `403` |
| **Task notes** | Unknown WO / task | `404` |
| **Task notes** | Task not in WO | `404` |
| **Task notes** | All fields empty/null | `200`, columns `null` |
| **Task notes** | Field > 5000 chars | `400` |
| **Task notes** | Partial update (one field) | Others unchanged |
| **Visit notes** | WO `EN_PROCESO` | `200` |
| **Visit notes** | WO `LISTA_PARA_ENTREGA` | `403` |
| **Visit notes** | Clear field with `null` | Column `null` |

---

### Step 9: E2E Tests — Technical Notes

- **File:** `apps/api/test/work-order-technical-notes.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `PATCH .../tasks/:id/technical-notes` on `PENDING` task | `200`, fields in response |
| 2 | `PATCH` on `COMPLETED` task | `403` |
| 3 | `PATCH .../visit-notes` on `EN_PROCESO` WO | `200` |
| 4 | `PATCH .../visit-notes` on `LISTA_PARA_ENTREGA` WO | `403` |
| 5 | `GET /work-orders/:id` | Includes `visit*` and task technical fields |
| 6 | `GET /vehicles/:id/history` | Includes `visitNotes` and task technical data |
| 7 | Complete task (US-006) without technical notes | Still `200` |
| 8 | Save notes → complete task → `GET history` | Notes visible read-only |
| 9 | Unauthenticated `PATCH` | `401` |
| 10 | `PATCH` as MECHANIC | `200` |

- **Setup:** WO in `EN_PROCESO` with at least one `PENDING` task.

---

### Step 10: Regression — US-006 Compatibility

- **Action:** Verify existing e2e for task status transitions still pass.
- **Checks:**
  - `PATCH .../tasks/:id` (US-006) does not require or clear technical fields.
  - Technical notes PATCH does not change task `status` or `cost`.

---

### Step 11: Update Technical Documentation

1. Add technical-notes endpoints to `docs/api-spec.yml`.
2. Update `apps/api/README.md` with PATCH examples.
3. Document field length limits and edit rules.
4. Note `task-notes` logical module maps to `work-orders` implementation.

---

## Implementation Order

1. Step 0 — Branch `feature/US-007-backend`
2. Step 1 — Verify Prisma columns (migrate if needed)
3. Step 2 — Normalizer utility
4. Step 3 — DTOs
5. Step 8 (red) — Unit tests
6. Step 4 — `WorkOrderTechnicalNotesService`
7. Step 8 (green) — Unit tests
8. Step 5 — `WorkOrderTechnicalNotesController`
9. Step 6 — Extend `findById` + `getHistory`
10. Step 7 — Module registration
11. Step 9 — E2E tests
12. Step 10 — US-006 regression
13. Step 11 — Documentation

---

## Testing Checklist

- [ ] Task technical notes editable on `PENDING` / `IN_PROGRESS` only
- [ ] Visit notes editable only when WO `EN_PROCESO`
- [ ] `403` on completed task or closed WO
- [ ] Empty/null fields persist as `null`
- [ ] Max 5000 chars enforced
- [ ] `GET work-orders/:id` and `GET vehicles/:id/history` include technical data
- [ ] US-006 complete flow unaffected
- [ ] Unit + e2e green; service ≥ 85% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 403,
  "message": "Cannot edit technical notes on a completed task",
  "error": "Forbidden"
}
```

### HTTP status mapping (US-007)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | Field exceeds 5000 chars | Validation errors |
| `401` | No JWT | `Unauthorized` |
| `403` | WO not `EN_PROCESO` | `Work order is not editable` |
| `403` | Task `COMPLETED` | `Cannot edit technical notes on a completed task` |
| `404` | WO or task not found | `Not Found` |

---

## Partial Update Support

Both PATCH endpoints support **partial updates**:

| Field sent | Effect |
|------------|--------|
| Omitted | Column unchanged |
| `null` or `""` | Column set to `null` |
| Non-empty string | Normalized value stored |

Applies independently per field in `UpdateTaskTechnicalNotesDto` and `UpdateVisitNotesDto`.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-005** | `WorkOrder` visit fields in schema |
| **US-006** | Task statuses, WO state machine |
| **US-004** | `GET /vehicles/:id/history` to extend |
| **US-001** | Auth guards |

No new npm packages.

---

## Notes

- **Optional fields:** Technical notes never block task completion (US-006).
- **Persistence:** Data lives on `WorkOrderTask` / `WorkOrder`; survives `ENTREGADA` and appears in history read-only.
- **V2 inventory:** Free-text `partsUsed` columns remain; future `Part` + `TaskPartUsage` tables are additive.
- **Module naming:** Readme lists `task-notes`; implement as `work-order-technical-notes` inside `work-orders` module.
- **Shared workshop:** Any `MECHANIC` may edit notes on any in-progress WO.
- **Language:** Code and API messages in **English**; UI Spanish is frontend concern.
- **Branch:** `feature/US-007-backend` from `feature-entrega2-RFM` (with US-006 merged).

---

## Next Steps After Implementation

1. `/plan-backend-ticket` for US-008
2. `/plan-frontend-ticket @us/US-007-diagnosticos-reparaciones.md`
3. Merge `feature/US-007-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Edit rules centralized in technical-notes service
- [ ] Normalizer handles empty → `null`
- [ ] No coupling to US-006 status PATCH

### Functionality

- [ ] Task- and visit-level notes persist correctly
- [ ] Read-only enforcement matches WO/task state

### Testing

- [ ] All unit + e2e scenarios pass
- [ ] US-006 regression green

### Integration

- [ ] Vehicle history shows technical detail for US-009
- [ ] `GET work-orders/:id` ready for frontend technical forms

### Documentation

- [ ] Step 11 complete
