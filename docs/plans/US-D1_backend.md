# Backend Implementation Plan: US-D1 Owner Contact Registration

## Overview

Extend the **delivery** module so an administrator can mark a work order as **owner contacted** (`LISTA_PARA_ENTREGA` → `OWNER_CONTACTED`), persist contact audit fields (`ownerContactedAt`, `ownerContactedById`), keep those OTs visible in the delivery panel until pickup, and allow **deliver** from either ready status. Also fix the **active work order** rule so `OWNER_CONTACTED` blocks a second open OT for the same vehicle.

**Architecture principles:** Controllers → Services → Prisma (Nest modular monolith); TDD; reuse existing delivery module; English API messages; no email (US-D2).

**User story reference:** [`us/Deseables/US-D1-registro-contacto-propietario.md`](../../us/Deseables/US-D1-registro-contacto-propietario.md)

**Prerequisites:** US-008 delivery panel implemented; Prisma already has `OWNER_CONTACTED`, `ownerContactedAt`, `ownerContactedById`.

**Out of scope:** Frontend (`plan-frontend-ticket`), email (US-D2), reverse transition to `LISTA_PARA_ENTREGA`, SMS.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D1 artifacts |
|-------|----------------|-----------------|
| **Presentation** | HTTP routes, auth, actor id | `DeliveryController.markContacted` |
| **Application** | Status transitions, list/detail/deliver rules | `DeliveryService.markContacted`, widen list/detail/deliver |
| **Domain** | Active OT statuses; contact only from `LISTA_PARA_ENTREGA` | `ACTIVE_WORK_ORDER_STATUSES`, service guards |
| **Infrastructure** | Prisma update + include `ownerContactedBy` | Existing `WorkOrder` / `User` relations |

### Files to add/modify

```
apps/api/src/modules/work-orders/
└── constants/work-order-status.ts          # + OWNER_CONTACTED
└── work-orders.service.spec.ts             # active status tests

apps/api/src/modules/delivery/
├── delivery.controller.ts                  # PATCH mark-contacted
├── delivery.service.ts                     # markContacted + widen queries
├── delivery.service.spec.ts
├── dto/
│   ├── delivery-ready-item.dto.ts          # + status, ownerContacted*
│   ├── delivery-ready-detail.dto.ts        # inherit / extend
│   ├── mark-contacted-response.dto.ts      # NEW
│   └── delivery-ready-query.dto.ts         # optional contactFilter (nice-to-have)
└── (remove stub comment once implemented)

apps/api/test/
├── delivery.e2e-spec.ts                    # mark-contacted + deliver from OWNER_CONTACTED
└── work-orders.e2e-spec.ts                 # optional: 409 create when OWNER_CONTACTED

apps/api/README.md
docs/api-spec.delivery.yml
```

### API endpoints (US-D1)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `PATCH` | `/api/delivery/ready/:workOrderId/mark-contacted` | Bearer | `ADMIN` | Contact audit + `OWNER_CONTACTED` **(new)** |
| `GET` | `/api/delivery/ready` | Bearer | `ADMIN` | List **both** ready statuses + contact fields **(extend)** |
| `GET` | `/api/delivery/ready/:workOrderId` | Bearer | `ADMIN` | Detail for both statuses **(extend)** |
| `PATCH` | `/api/delivery/ready/:workOrderId/deliver` | Bearer | `ADMIN` | Allow deliver from `OWNER_CONTACTED` **(extend)** |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement US-D1 backend **on the existing delivery branch** (no per-ticket feature branch for this delivery).
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. `git pull origin feature-entrega2-RFM` (if tracking remote)
  3. Confirm with `git branch --show-current` → must be `feature-entrega2-RFM`
  4. Do **not** create `feature/US-D1-backend` or `feature/US-D1-frontend` while entrega 2 is in progress; backend and frontend of desirables land on this same branch unless the team later splits PRs.
- **Notes:** Entrega 2 aggregates V2 desirables + security delivery work. Per-US `feature/[id]-backend` naming from generic workflow is **deferred** until after this delivery branch.

---

### Step 1: Verify Prisma Model (No Migration Expected)

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Confirm already present:
  - `WorkOrderStatus.OWNER_CONTACTED`
  - `WorkOrder.ownerContactedAt DateTime?`
  - `WorkOrder.ownerContactedById String?`
  - relation `ownerContactedBy User? @relation("OwnerContactedBy", ...)`
- **Implementation Steps:**
  1. Grep schema/migration `20260619160000_add_work_order_and_tasks` — fields already created in V1.
  2. If any environment is missing columns, generate a corrective migration; otherwise **skip migration**.
- **Dependencies:** None.
- **Implementation Notes:** US-D1 is primarily **behavioral**; schema work should be verify-only.

---

### Step 2: Expand Active Work Order Statuses (Critical)

- **File:** `apps/api/src/modules/work-orders/constants/work-order-status.ts`
- **Action:** Treat `OWNER_CONTACTED` as an active visit (vehicle cannot start another OT).
- **Function Signature:** N/A (constant array).
- **Implementation Steps:**
  1. Add `WorkOrderStatus.OWNER_CONTACTED` to `ACTIVE_WORK_ORDER_STATUSES`.
  2. Update unit tests in `work-orders.service.spec.ts` that assert the `where.status.in` array / conflict behavior.
  3. Add explicit test: vehicle with WO `OWNER_CONTACTED` → `create` throws `409` with `activeWorkOrderId`.
  4. Confirm `findActiveByVehicle` returns that WO.
- **Dependencies:** `@prisma/client` `WorkOrderStatus`.
- **Implementation Notes:** Without this step, admin can open a second OT after contacting — data integrity bug.

---

### Step 3: DTOs — Contact Fields + Mark-Contacted Response

- **Files:**
  - `apps/api/src/modules/delivery/dto/delivery-ready-item.dto.ts`
  - `apps/api/src/modules/delivery/dto/delivery-ready-detail.dto.ts`
  - `apps/api/src/modules/delivery/dto/mark-contacted-response.dto.ts` (new)
- **Action:** Extend list/detail item shape; add response DTO for mark-contacted.
- **Implementation Steps:**
  1. Add to list item DTO:
     - `status: WorkOrderStatus` (or string enum)
     - `ownerContactedAt: Date | null`
     - `ownerContactedBy: { id: string; fullName: string } | null`
  2. Ensure detail DTO carries the same (via extends/spread pattern already used).
  3. Create `MarkContactedResponseDto`:

```typescript
export class MarkContactedResponseDto {
  workOrderId!: string;
  status!: WorkOrderStatus; // OWNER_CONTACTED
  ownerContactedAt!: Date;
  ownerContactedBy!: { id: string; fullName: string };
}
```

  4. Optional nice-to-have: `contactFilter` on `DeliveryReadyQueryDto` (`pending` | `contacted` | `all`); **can defer** to frontend-only filter.
- **Dependencies:** `@prisma/client` for enum typing if used.
- **Implementation Notes:** Keep existing US-008 fields (`ownerPhone`, etc.) unchanged for regression.

---

### Step 4: Write Unit Tests First (Red) — DeliveryService

- **File:** `apps/api/src/modules/delivery/delivery.service.spec.ts`
- **Action:** Add failing tests for US-D1 before implementation (TDD).
- **Implementation Steps:**

#### Successful cases

1. `markContacted` from `LISTA_PARA_ENTREGA` sets status, `ownerContactedAt`, `ownerContactedById`, returns actor summary.
2. `listReady` returns mixed `LISTA_PARA_ENTREGA` + `OWNER_CONTACTED` items with status + contact fields.
3. `getReadyDetail` succeeds for `OWNER_CONTACTED`.
4. `markDelivered` succeeds from `OWNER_CONTACTED`; does **not** clear contact audit fields in update data.
5. Deliver from `LISTA_PARA_ENTREGA` still works (regression).

#### Conflict / not found

6. `markContacted` when already `OWNER_CONTACTED` → `409` `Owner already contacted` (no second update).
7. `markContacted` when `EN_PROCESO` or `ENTREGADA` → `409` `Work order is not ready for contact`.
8. Missing WO → `404` `Work order not found`.
9. `getReadyDetail` for `EN_PROCESO` / `ENTREGADA` → still `404`.
10. `markDelivered` from `EN_PROCESO` → still `409`.

#### Edge cases

11. Double call markContacted: first OK, second 409.
12. Mapper: `LISTA_PARA_ENTREGA` item has `ownerContactedAt: null` and `ownerContactedBy: null`.

- **Dependencies:** Existing Prisma mocks in delivery.service.spec.ts.
- **Implementation Notes:** Align error **messages** with the table in Error Response Format below (frontend mapDeliveryError may key off them later).

---

### Step 5: Implement DeliveryService.markContacted + Widen Existing Methods

- **File:** `apps/api/src/modules/delivery/delivery.service.ts`
- **Action:** Implement contact transition; widen list/detail/deliver predicates; enrich mappers.
- **Function Signature:**

```typescript
async markContacted(
  workOrderId: string,
  actorUserId: string,
): Promise<MarkContactedResponseDto>

async listReady(query: DeliveryReadyQueryDto): Promise<DeliveryReadyListResponseDto>
async getReadyDetail(workOrderId: string): Promise<DeliveryReadyDetailDto>
async markDelivered(workOrderId: string): Promise<DeliverWorkOrderResponseDto>
```

- **Implementation Steps:**

1. **Define panel statuses constant** (module-local):

```typescript
const DELIVERY_PANEL_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.LISTA_PARA_ENTREGA,
  WorkOrderStatus.OWNER_CONTACTED,
];
```

2. **`listReady`:** `where: { status: { in: DELIVERY_PANEL_STATUSES } }`; include `ownerContactedBy: { select: { id: true, fullName: true } }` in `READY_INCLUDE` (extend type `ReadyWorkOrder`).

3. **`toReadyItem`:** map `status`, `ownerContactedAt`, `ownerContactedBy` (null-safe).

4. **`getReadyDetail`:** allow status in `DELIVERY_PANEL_STATUSES`; else `NotFoundException('Work order is not ready for delivery')`.

5. **`markContacted`:**
   - `findUnique` by id.
   - If missing → `NotFoundException('Work order not found')`.
   - If `OWNER_CONTACTED` → `ConflictException('Owner already contacted')`.
   - If not `LISTA_PARA_ENTREGA` → `ConflictException('Work order is not ready for contact')`.
   - `update` with `status`, `ownerContactedAt: new Date()`, `ownerContactedById: actorUserId`.
   - Load actor `fullName` (include on update or separate find) for response.
   - Return `MarkContactedResponseDto`.
   - Do **not** call any email service.

6. **`markDelivered`:**
   - Keep `ENTREGADA` → `409` already delivered.
   - Allow if status ∈ `DELIVERY_PANEL_STATUSES`.
   - Else → `409` not ready.
   - Update only `status` + `deliveredAt` (preserve contact fields).

7. Remove obsolete stub comment or replace with “implemented US-D1”.

- **Dependencies:** `ConflictException`, `NotFoundException`, Prisma, DTOs.
- **Implementation Notes:** Atomic single `update` is enough (no multi-row transaction required). Actor must be the authenticated admin id from JWT (`userId`), not from body.

---

### Step 6: Controller — Route mark-contacted

- **File:** `apps/api/src/modules/delivery/delivery.controller.ts`
- **Action:** Expose PATCH endpoint with current user.
- **Function Signature:**

```typescript
@Patch('ready/:workOrderId/mark-contacted')
markContacted(
  @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  @CurrentUser() user: AuthenticatedUser,
): Promise<MarkContactedResponseDto>
```

- **Implementation Steps:**
  1. Import `CurrentUser`, `AuthenticatedUser` from common decorators.
  2. Call `this.deliveryService.markContacted(workOrderId, user.userId)`.
  3. Keep class-level `@Roles(UserRole.ADMIN)` (no MECHANIC).
  4. Route order: declare `mark-contacted` alongside existing `deliver` (both under `ready/:workOrderId/...`) — no conflict with `GET ready/:workOrderId`.
- **Dependencies:** Existing guards.
- **Implementation Notes:** Empty body; no DTO required for request.

---

### Step 7: Make Unit Tests Green + Active-Status Specs

- **Files:** `delivery.service.spec.ts`, `work-orders.service.spec.ts`
- **Action:** Implement until Step 4/2 tests pass; adjust mocks for new include `ownerContactedBy`.
- **Implementation Steps:**
  1. Run `npm test -- delivery.service.spec` / work-orders specs in `apps/api`.
  2. Aim ≥ 90% coverage on changed service methods.
- **Dependencies:** Jest setup existing in api package.

---

### Step 8: E2E Tests

- **File:** `apps/api/test/delivery.e2e-spec.ts` (extend)
- **Action:** Cover HTTP contract for US-D1.
- **Implementation Steps:**

#### Successful cases

1. As ADMIN: create path to `LISTA_PARA_ENTREGA` (reuse seed/helpers) → `PATCH .../mark-contacted` → `200` + body fields.
2. `GET /api/delivery/ready` includes that WO with `status: OWNER_CONTACTED` and contact audit.
3. `GET .../ready/:id` works for contacted WO.
4. `PATCH .../deliver` from contacted → `200` `ENTREGADA`; WO leaves list.
5. After deliver, `POST /api/work-orders` for same vehicle allowed again.

#### Auth / conflicts

6. MECHANIC → `403` on mark-contacted.
7. Unauthenticated → `401`.
8. Second mark-contacted → `409`.
9. Mark-contacted on wrong status → `409`.
10. Create OT while `OWNER_CONTACTED` → `409` (active rule).

- **Dependencies:** E2E app bootstrap, admin JWT helpers from existing delivery/auth tests.
- **Implementation Notes:** Prefer English assertions on `message` strings.

---

### Step 9: Optional Query Filter (Defer if Time-Boxed)

- **File:** `dto/delivery-ready-query.dto.ts`, `listReady`
- **Action:** Optional `contactFilter=pending|contacted|all`.
- **Implementation Steps:** Only if capacity remains; otherwise document frontend filter as MVP for US-D1 UI.
- **Notes:** Not required for backend DoD if story allows client-side filter.

---

### Step 10: Update Technical Documentation

- **Action:** Review and update technical documentation according to changes made (mandatory).
- **Implementation Steps:**
  1. **Review Changes:** mark-contacted route, widened list/detail/deliver, active statuses.
  2. **Identify Documentation Files:**
     - `apps/api/README.md` — remove “D1 reserved / not implemented”; document endpoint + statuses.
     - `docs/api-spec.delivery.yml` — add `mark-contacted`; extend schemas with `status`, `ownerContactedAt`, `ownerContactedBy`; update deliver description.
     - `docs/data-model.md` — only if WorkOrder contact fields undocumented.
     - `us/Deseables/US-D1-...` — no need to rewrite; plan is source for implementers.
  3. **Update Documentation** in **English** per `docs/documentation-standards.mdc`.
  4. **Verify** OpenAPI paths match Nest routes under global `/api` prefix.
  5. **Report Updates** in PR description.
- **References:** `docs/documentation-standards.mdc`, `docs/backend-standards.mdc`.
- **Notes:** Do not skip this step.

---

## Implementation Order

1. Step 0 — Ensure branch `feature-entrega2-RFM`
2. Step 1 — Verify Prisma (no migration unless broken)
3. Step 2 — `ACTIVE_WORK_ORDER_STATUSES` + work-orders unit tests
4. Step 3 — DTOs
5. Step 4 — Delivery unit tests (red)
6. Step 5 — `DeliveryService` implementation
7. Step 6 — Controller route
8. Step 7 — Unit tests green
9. Step 8 — E2E tests
10. Step 9 — Optional contactFilter (skip if needed)
11. Step 10 — Documentation updates

---

## Testing Checklist

- [ ] `mark-contacted` transitions only from `LISTA_PARA_ENTREGA`
- [ ] Audit fields set server-side from JWT user id
- [ ] Second contact → `409`, audit unchanged
- [ ] List includes both panel statuses with `status` + contact fields
- [ ] Detail works for `OWNER_CONTACTED`
- [ ] Deliver works from both panel statuses; contact audit preserved
- [ ] Vehicle with `OWNER_CONTACTED` cannot create another OT (`409`)
- [ ] After `ENTREGADA`, new OT allowed
- [ ] `MECHANIC` → `403` on all delivery routes
- [ ] No email side effects
- [ ] Unit + e2e green; changed services ≥ 90% coverage

---

## Error Response Format

### Standard Nest error body

```json
{
  "statusCode": 409,
  "message": "Owner already contacted",
  "error": "Conflict"
}
```

### HTTP status mapping (US-D1)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `401` | No / invalid JWT | `Unauthorized` |
| `403` | Non-ADMIN | `Forbidden` |
| `404` | WO id not found (mark-contacted) | `Work order not found` |
| `404` | Detail when status not in panel set | `Work order is not ready for delivery` |
| `409` | Already `OWNER_CONTACTED` | `Owner already contacted` |
| `409` | Mark contact from non-ready status | `Work order is not ready for contact` |
| `409` | Deliver already `ENTREGADA` | `Work order is already delivered` |
| `409` | Deliver from non-panel status | `Work order is not ready for delivery` |
| `409` | Create OT while active including `OWNER_CONTACTED` | Existing US-005 conflict message |

---

## Partial Update Support

Not applicable for `mark-contacted` (no request body fields). Deliver remains status transition only (body reserved for US-D7 mileage later — do not block empty body).

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-008** | Delivery module, ADMIN guards, list/detail/deliver baseline |
| **US-005** | Active WO constant used by create |
| **US-001** | JWT + `RolesGuard`, `CurrentUser.userId` |
| **US-D2** | Explicitly **not** required; leave extension hook only |

No new npm packages.

---

## Notes

- **Business rule:** Contacting is optional before deliver; direct `LISTA_PARA_ENTREGA` → `ENTREGADA` remains valid.
- **Idempotency:** Prefer strict `409` on second contact (no silent overwrite of `ownerContactedAt`).
- **Owner snapshot:** Phone/email continue to come from `ownerClientId`, not current vehicle ownership (D3-safe).
- **Language:** Code identifiers and API messages in **English**; product UI Spanish is frontend.
- **Branch:** All US-D1 work (and remaining deseables for this delivery) goes on `feature-entrega2-RFM`.
- **Stub alignment:** Path must be `PATCH /api/delivery/ready/:workOrderId/mark-contacted` (matches existing code comment).

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/Deseables/US-D1-registro-contacto-propietario.md` (also on `feature-entrega2-RFM`)
2. Commit/push on `feature-entrega2-RFM` (no merge from a separate US-D1 branch)
3. Sequence US-D2 on the same entrega 2 branch after D1 is done

---

## Implementation Verification

### Code Quality

- [ ] No duplicated total/elapsed helpers
- [ ] All delivery routes remain `@Roles('ADMIN')`
- [ ] Contact timestamps/actor only set server-side
- [ ] No mailer imports

### Functionality

- [ ] Full path: ready → contacted → delivered
- [ ] Ready → delivered without contact still works
- [ ] Active WO includes `OWNER_CONTACTED`

### Testing

- [ ] Unit + e2e scenarios in Step 4/8 pass
- [ ] Work-orders active-status regression covered

### Integration

- [ ] Response shapes ready for delivery-panel frontend
- [ ] OpenAPI/README match runtime routes

### Documentation

- [ ] Step 10 completed
