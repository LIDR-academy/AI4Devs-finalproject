# Backend Implementation Plan: US-D7 Optional Work Order Mileage

## Overview

Make **`WorkOrder.mileage` nullable**, allow optional mileage on **create**, add **`PATCH /api/work-orders/:id/mileage`**, and extend **`PATCH /api/delivery/ready/:workOrderId/deliver`** with optional body `{ mileage }` so delivery never requires mileage but can capture it in the same transaction. Update DTOs/mappers for `number | null` across work-orders, delivery, and history.

**Architecture principles:** Prisma migration; TDD; transactional deliver+mileage; English API errors; role rules for post-delivery edits.

**User story reference:** [`us/Deseables/US-D7-kilometraje-opcional-orden-trabajo.md`](../../us/Deseables/US-D7-kilometraje-opcional-orden-trabajo.md)

**Prerequisites:** US-005, US-008 on `feature-entrega2-RFM`. US-D1 `OWNER_CONTACTED` included in pre-delivery statuses for mileage PATCH.

**Out of scope:** Frontend, mileage version history, hard-block on decreasing km, mandatory reporting.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D7 artifacts |
|-------|----------------|-----------------|
| **Presentation** | New PATCH routes + deliver body | Controllers |
| **Application** | Create/updateMileage/markDelivered | Services |
| **Infrastructure** | Nullable column | Prisma migration |

### Files to add/modify

```
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/<timestamp>_work_order_mileage_nullable/

apps/api/src/modules/work-orders/
├── dto/create-work-order.dto.ts
├── dto/update-work-order-mileage.dto.ts     # NEW
├── dto/work-order-detail-response.dto.ts
├── mappers/work-order.mapper.ts
├── work-orders.controller.ts                # PATCH :id/mileage
├── work-orders.service.ts                   # create + updateMileage
└── work-orders.service.spec.ts

apps/api/src/modules/delivery/
├── dto/deliver-work-order.dto.ts            # NEW (optional mileage)
├── dto/deliver-work-order-response.dto.ts   # + mileage nullable
├── dto/delivery-ready-detail.dto.ts
├── delivery.controller.ts                   # @Body() optional
├── delivery.service.ts                      # markDelivered(id, dto?)
└── delivery.service.spec.ts

apps/api/src/modules/history/mappers/visit-history.mapper.ts

apps/api/test/work-orders.e2e-spec.ts
apps/api/test/delivery.e2e-spec.ts
apps/api/README.md
```

### API endpoints

| Method | Path | Auth | Roles | Change |
|--------|------|------|-------|--------|
| `POST` | `/api/work-orders` | Bearer | ADMIN, MECHANIC | `mileage` optional/null |
| `PATCH` | `/api/work-orders/:id/mileage` | Bearer | ADMIN, MECHANIC* | **NEW** |
| `PATCH` | `/api/delivery/ready/:id/deliver` | Bearer | ADMIN | optional `{ mileage }` |

\* MECHANIC forbidden when OT `ENTREGADA`.

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`

---

### Step 1: Prisma Migration

- **File:** `schema.prisma`
- **Action:** `mileage Int` → `mileage Int?`
- **Implementation Steps:**
  1. Change field to optional.
  2. `npx prisma migrate dev --name work_order_mileage_nullable`
  3. SQL: `ALTER TABLE "WorkOrder" ALTER COLUMN "mileage" DROP NOT NULL;`
  4. Existing rows keep numeric values unchanged.
- **Dependencies:** Prisma CLI.

---

### Step 2: Update Create DTO + Service

- **Files:** `create-work-order.dto.ts`, `work-orders.service.ts`
- **Action:** Optional/nullable mileage on create.
- **Implementation Steps:**

```typescript
@IsOptional()
@ValidateIf((_, v) => v !== null && v !== undefined)
@IsInt()
@Min(0)
@Type(() => Number)
mileage?: number | null;
```

  1. In `create`: `mileage: dto.mileage ?? null` (omit → null, not 0).
  2. `-1` or decimal → `400` via validation.
  3. Unit tests: omit mileage → null; explicit null; valid int; invalid → 400.
- **Dependencies:** Step 1.

---

### Step 3: `UpdateWorkOrderMileageDto` + `updateMileage`

- **Files:** new DTO, `work-orders.service.ts`, controller
- **Function Signature:**

```typescript
async updateMileage(
  id: string,
  dto: UpdateWorkOrderMileageDto,
  actor: { userId: string; role: UserRole },
): Promise<{ id: string; mileage: number | null; updatedAt: Date }>
```

- **Implementation Steps:**
  1. DTO: `{ mileage: number | null }` with validation (int ≥ 0 or null).
  2. Load WO → `404` if missing.
  3. Allowed statuses: `EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED` for both roles.
  4. If `ENTREGADA`: only `ADMIN` → else `403 Forbidden`.
  5. Update `mileage` + return summary fields.
  6. Route: `@Patch(':id/mileage')` **before** or after other `:id` routes — ensure no conflict with task routes (likely `work-orders/:id/tasks` is separate path).
  7. Unit tests: each status; mechanic on delivered → 403; admin on delivered → 200; clear to null.
- **Dependencies:** `ACTIVE_WORK_ORDER_STATUSES` / status enum.

---

### Step 4: Detail + History DTOs

- **Files:** `work-order-detail-response.dto.ts`, `work-order.mapper.ts`, `visit-history.mapper.ts`, delivery DTOs
- **Action:** Type `mileage: number | null` everywhere.
- **Implementation Steps:**
  1. Mapper passes through null without coercing to 0.
  2. History visit DTO: nullable mileage.
  3. `DeliveryReadyDetailDto.mileage` → `number | null`.
- **Dependencies:** Step 1.

---

### Step 5: Extend `markDelivered`

- **Files:** `deliver-work-order.dto.ts`, `delivery.service.ts`, `delivery.controller.ts`
- **Function Signature:**

```typescript
async markDelivered(
  workOrderId: string,
  dto?: DeliverWorkOrderDto,
): Promise<DeliverWorkOrderResponseDto>
```

- **Implementation Steps:**
  1. DTO: optional `@IsOptional() @IsInt() @Min(0) mileage?: number`.
  2. In transaction:
     - Validate WO ready for delivery (existing US-008 rules + D1 `OWNER_CONTACTED`).
     - If `dto?.mileage !== undefined` → set `mileage` (including allow update if already set).
     - Set `ENTREGADA`, `deliveredAt`.
  3. Invalid mileage → `400`, no status change.
  4. No body + null mileage → deliver with `mileage: null`.
  5. Response includes final `mileage`.
  6. Unit tests: deliver without body; with mileage; invalid mileage; regression 409 double deliver.
- **Dependencies:** Step 1, US-008 delivery logic.

---

### Step 6: E2E Tests

- **Files:** `work-orders.e2e-spec.ts`, `delivery.e2e-spec.ts`
- **Scenarios:**
  1. POST work-order without mileage → 201, `mileage: null`.
  2. PATCH mileage on EN_PROCESO → 200.
  3. PATCH deliver with `{ mileage: N }` → ENTREGADA + mileage set.
  4. PATCH deliver without body, mileage null → ENTREGADA, null.

---

### Step 7: Update Technical Documentation

- **Files:** `apps/api/README.md`, `readme.md` / data-model if still NOT NULL
- **Action:** Document nullable mileage, new PATCH, deliver body.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Migration
3. Step 2 — Create optional
4. Step 3 — updateMileage endpoint
5. Step 4 — DTO/mapper null types
6. Step 5 — markDelivered extension
7. Step 6 — E2E
8. Step 7 — Documentation

---

## Testing Checklist

- [ ] Migration applied; existing data preserved
- [ ] Create without mileage → null
- [ ] Create with valid mileage → number
- [ ] updateMileage pre-delivery ADMIN+MECHANIC
- [ ] updateMileage post-delivery ADMIN only
- [ ] deliver optional mileage in same transaction
- [ ] deliver never requires mileage
- [ ] Invalid values → 400
- [ ] History/delivery detail return null not 0

---

## Error Response Format

| Status | Condition |
|--------|-----------|
| `400` | Invalid mileage; validation |
| `403` | MECHANIC editing delivered OT mileage |
| `404` | OT not found |
| `409` | Deliver conflicts (US-008) |

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-005 | Create WO |
| US-008 | Delivery panel |
| US-D1 | OWNER_CONTACTED in allowed pre-delivery statuses |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **Transaction:** deliver + mileage set must be atomic.
- **API English;** email/UI Spanish is FE concern.

---

## Next Steps After Implementation

1. `docs/plans/US-D7_frontend.md`
2. Manual smoke: stranded vehicle intake without odometer

---

## Implementation Verification

### Code Quality

- [ ] No `mileage ?? 0` in API mappers

### Functionality

- [ ] Full US-D7 backend criteria

### Testing

- [ ] Unit + e2e green

### Integration

- [ ] Ready for create form, detail edit, delivery dialog FE

### Documentation

- [ ] README + data model aligned
