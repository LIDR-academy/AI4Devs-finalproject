# Backend Implementation Plan: US-D10 In-Progress Work Orders List

## Overview

Add **`GET /api/work-orders/in-progress`** so dashboards and a dedicated list page can show **active** work orders (`EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED`) with pagination. Admins see all active OTs; mechanics see only OTs assigned to them. No schema migration.

**Architecture principles:** Nest modular monolith (Controller → Service → Prisma); TDD; reuse `ACTIVE_WORK_ORDER_STATUSES`; English API messages / DTOs; Spanish UI is frontend-only; null-safe owner / broughtBy (US-D9).

**User story:** [`us/Deseables/US-D10-ordenes-activas-dashboard.md`](../../us/Deseables/US-D10-ordenes-activas-dashboard.md)

**Frontend plan:** [`docs/plans/US-D10_frontend.md`](./US-D10_frontend.md) (to be written separately)

**Prerequisites:** US-001 auth; US-005/006 work orders; `ACTIVE_WORK_ORDER_STATUSES` already includes `OWNER_CONTACTED` (US-D1).

**Out of scope:** Dashboard UI, nav, Playwright, KPIs, filters by plate/mechanic, changing status machine, email, delivery panel changes.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D10 artifacts |
|-------|----------------|------------------|
| **Presentation** | Route, query validation, auth, pass `AuthenticatedUser` | `WorkOrdersController.findInProgress` |
| **Application** | Role-scoped query, map to list DTO | `WorkOrdersService.findInProgress` |
| **Domain** | Active status set (existing) | `ACTIVE_WORK_ORDER_STATUSES` |
| **Infrastructure** | Prisma `findMany` + `count` | `WorkOrder` + includes |

### Files to add/modify

```
apps/api/src/modules/work-orders/
├── work-orders.controller.ts
├── work-orders.service.ts
├── work-orders.service.spec.ts
├── constants/work-order-status.ts          # verify only (no change expected)
└── dto/
    ├── in-progress-work-orders-query.dto.ts       # NEW
    ├── in-progress-work-order-item.dto.ts         # NEW
    └── in-progress-work-orders-response.dto.ts    # NEW

apps/api/test/work-orders.e2e-spec.ts              # MOD
docs/api-spec.work-orders.yml                      # MOD
apps/api/README.md                                 # MOD (short endpoint note)
```

### API endpoint

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/work-orders/in-progress` | Bearer | `ADMIN`, `MECHANIC` | Paginated active OT list **(new)** |

**Must register before** `@Get(':id')` (same as `mechanics` / `active`).

**Does not change:** `GET /api/work-orders/active?vehicleId=`

### Query / response contract (locked)

**Query**

| Param | Default | Rules |
|-------|---------|--------|
| `limit` | `20` | integer, `@Min(1)`, `@Max(50)` |
| `offset` | `0` | integer, `@Min(0)` |

**Response `200`**

```ts
{
  items: InProgressWorkOrderItemDto[];
  total: number;   // full matching count (not page length)
  limit: number;   // echoed
  offset: number;  // echoed
}
```

**Item fields**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (uuid) | |
| `status` | `WorkOrderStatus` | Active only |
| `entryReason` | string | |
| `checkedInAt` | Date | |
| `updatedAt` | Date | |
| `vehicle` | `{ id, licensePlate, brand, model }` | Always present |
| `owner` | `{ fullName, nationalId } \| null` | From `ownerClient` |
| `broughtByName` | string \| null | US-D9 |
| `intakeMode` | `'OWNER' \| 'THIRD_PARTY'` | Use `deriveIntakeMode` helper |
| `assignedMechanic` | `{ id, fullName, role } \| null` | |

**Ordering:** `updatedAt DESC`, then `id DESC`.

**Role filter:** if `user.role === UserRole.MECHANIC` → `assignedMechanicId: user.userId`; admin → no assignee filter.

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM` (no feature branch)

- **Action:** Implement on **`finalproject-RFM`**. Do **not** create `feature/US-D10-backend`.
- **Implementation Steps:**
  1. `git checkout finalproject-RFM`
  2. `git pull origin finalproject-RFM` (if needed)
  3. `git branch --show-current` → must be `finalproject-RFM`
- **Notes:** Product mandate for this delivery line. Overrides generic ai-specs Step 0 naming.

---

### Step 1: Write failing unit tests for `findInProgress` (TDD)

- **File:** `apps/api/src/modules/work-orders/work-orders.service.spec.ts`
- **Action:** Add describe block `findInProgress` with mocks on `prisma.workOrder.findMany` / `count`.
- **Cases (minimum):**
  1. **Admin** — `where` is `{ status: { in: ACTIVE_WORK_ORDER_STATUSES } }` only; returns mapped items + total.
  2. **Mechanic** — `where` also has `assignedMechanicId: user.userId`.
  3. **Empty** — `items: []`, `total: 0`, echoes `limit`/`offset`.
  4. **Pagination** — passes `skip: offset`, `take: limit` to Prisma; `total` from `count`, not `items.length`.
  5. **Order** — `orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }]`.
  6. **Null owner / broughtBy** — item has `owner: null`, `broughtByName` set, `intakeMode: 'THIRD_PARTY'`.
  7. **Null assignedMechanic** — `assignedMechanic: null`.
- **Dependencies:** Mock `AuthenticatedUser` with `role: 'ADMIN' | 'MECHANIC'`.
- **Implementation Notes:** Run tests → **red** before service implementation.

---

### Step 2: Create query + response DTOs

- **Files:**
  - `dto/in-progress-work-orders-query.dto.ts`
  - `dto/in-progress-work-order-item.dto.ts`
  - `dto/in-progress-work-orders-response.dto.ts`
- **Action:** Class-validator query; plain response classes matching contract.
- **Query signature:**

```ts
export class InProgressWorkOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
```

- **Implementation Steps:**
  1. Match existing DTO style (`@Type(() => Number)`, class-validator).
  2. Item DTO: nest small vehicle/owner/mechanic shapes (can mirror fields from detail DTO; vehicle **includes `id`**).
  3. Response DTO: `items`, `total`, `limit`, `offset`.
- **Dependencies:** `class-validator`, `class-transformer`, `@prisma/client` enums as needed.
- **Implementation Notes:** Defaults: apply in service if undefined (`limit ?? 20`, `offset ?? 0`) so behavior is explicit even if ValidationPipe strips defaults.

---

### Step 3: Implement `WorkOrdersService.findInProgress`

- **File:** `apps/api/src/modules/work-orders/work-orders.service.ts`
- **Action:** Role-scoped paginated list + mapper.
- **Function Signature:**

```ts
async findInProgress(
  user: AuthenticatedUser,
  query: InProgressWorkOrdersQueryDto,
): Promise<InProgressWorkOrdersResponseDto>
```

- **Implementation Steps:**
  1. Normalize `limit = query.limit ?? 20`, `offset = query.offset ?? 0`.
  2. Build `where`:
     - `status: { in: ACTIVE_WORK_ORDER_STATUSES }`
     - if `user.role === UserRole.MECHANIC` → `assignedMechanicId: user.userId`
     - Compare role with `UserRole` enum (cast/normalize if `AuthenticatedUser.role` is `string`).
  3. `Promise.all([findMany, count])`:
     - `include` / `select`: `vehicle: { select: { id, licensePlate, brand, model } }`, `ownerClient: { select: { fullName, nationalId } }`, `assignedMechanic: { select: { id, fullName, role } }`, plus scalar fields needed (`status`, `entryReason`, `checkedInAt`, `updatedAt`, `broughtByName`, `broughtByPhone` if needed for derive, `ownerClientId`).
     - `orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }]`
     - `skip: offset`, `take: limit`
  4. Map rows to items:
     - `owner` from `ownerClient` or `null`
     - `intakeMode` via existing `deriveIntakeMode(workOrder)` (same as detail mapper)
     - `assignedMechanic` or `null`
  5. Return `{ items, total, limit, offset }`.
- **Dependencies:** `ACTIVE_WORK_ORDER_STATUSES`, `AuthenticatedUser`, `UserRole`, `deriveIntakeMode`.
- **Implementation Notes:**
  - Do **not** filter `ENTREGADA`.
  - Do **not** change `findActiveByVehicle`.
  - Prefer `select` over heavy `WORK_ORDER_DETAIL_INCLUDE` (no tasks needed).

---

### Step 4: Expose controller route

- **File:** `apps/api/src/modules/work-orders/work-orders.controller.ts`
- **Action:** Add `GET in-progress` **above** `@Get(':id')`.
- **Signature:**

```ts
@Get('in-progress')
findInProgress(
  @Query() query: InProgressWorkOrdersQueryDto,
  @CurrentUser() user: AuthenticatedUser,
): Promise<InProgressWorkOrdersResponseDto>
```

- **Implementation Steps:**
  1. Place after `active`, before `create`/`findById` as preferred (must be before `:id`).
  2. Reuse class-level `@Roles(UserRole.ADMIN, UserRole.MECHANIC)`.
  3. Pass `user` into service (required for mechanic filter).
- **Dependencies:** Query/response DTOs, `CurrentUser`.
- **Implementation Notes:** Invalid query → global ValidationPipe `400`. No body.

---

### Step 5: Make unit tests green

- **File:** `work-orders.service.spec.ts`
- **Action:** Implement enough service logic to pass Step 1 cases.
- **Implementation Steps:**
  1. `npm test -- --testPathPattern=work-orders.service.spec`
  2. Fix mapping / where / pagination mismatches.
- **Notes:** Keep tests focused; do not assert full Prisma include shape beyond what the service uses.

---

### Step 6: E2E API smoke

- **File:** `apps/api/test/work-orders.e2e-spec.ts`
- **Action:** Add cases against running Nest + DB.
- **Cases (minimum):**
  1. Admin login → `GET /api/work-orders/in-progress` → `200`, body has `items`, `total`, `limit`, `offset`.
  2. Create/use an active OT assigned to mechanic → mechanic token lists it; optionally assert another mechanic does not see it.
  3. `GET /api/work-orders/in-progress?limit=5&offset=0` → `limit === 5`.
  4. Unauthenticated → `401`.
  5. Regression: `GET /api/work-orders/active?vehicleId=` still works.
- **Implementation Notes:** Reuse existing e2e helpers/seed users (`admin@taller.com`, `mechanic@taller.com`). Keep fixtures minimal.

---

### Step 7: Update Technical Documentation

- **Action:** Mandatory English docs for the new endpoint.
- **Implementation Steps:**
  1. **`docs/api-spec.work-orders.yml`:** Add `/work-orders/in-progress` with query params, `200` schema, `400`/`401`/`403`. Update description of “active” statuses to include `OWNER_CONTACTED` on related paths if still outdated.
  2. **`apps/api/README.md`:** One-line note under work orders: list in-progress OTs for dashboard (US-D10).
  3. No Prisma / data-model changes → skip schema docs.
  4. Do not invent frontend docs here (FE plan owns web README).
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — Stay on `finalproject-RFM`
2. Step 1 — Failing unit tests
3. Step 2 — DTOs
4. Step 3 — Service `findInProgress`
5. Step 4 — Controller route
6. Step 5 — Unit tests green
7. Step 6 — E2E API
8. Step 7 — OpenAPI + API README

---

## Testing Checklist

- [ ] Unit: admin where / mechanic where / empty / pagination / order / null owner / null mechanic
- [ ] E2E: 200 shape; mechanic isolation; limit echo; 401; `active?vehicleId` regression
- [ ] Manual (optional): `curl` with Bearer admin `?limit=5`
- [ ] No migration generated
- [ ] Lint / `tsc` clean for touched files

---

## Error Response Format

Follow existing Nest filters (English `message`):

| Case | Status | Notes |
|------|--------|-------|
| Missing/invalid JWT | `401` | Existing |
| Wrong role | `403` | Existing RolesGuard |
| Invalid `limit`/`offset` | `400` | ValidationPipe |
| Empty list | `200` | Not an error |

No domain `404` for this list endpoint.

---

## Partial Update Support

N/A — read-only GET.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm packages | **No** |
| Prisma migration | **No** |
| Existing | `JwtAuthGuard`, `RolesGuard`, `ACTIVE_WORK_ORDER_STATUSES`, `deriveIntakeMode` |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- Technical artifacts in **English**; UI Spanish is FE.
- Route name **`in-progress`** is fixed (avoid colliding with `active` by-vehicle).
- Mechanic filter is **server-side** — never trust client-only hiding.
- Admin with `canActAsMechanic` still uses **ADMIN** visibility (sees all), unless product later changes; role string from JWT is `ADMIN`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-D10 (if not done).
2. `/develop-frontend` against FE plan (widget + page + nav).
3. Commit BE (+ FE) on `finalproject-RFM` when user requests.
4. Prod deploy: rebuild **api** (and later web); no DB wipe; `migrate deploy` no-op if no migration.

---

## Implementation Verification

- [ ] Code quality: typed DTOs, TDD, no dead code
- [ ] Functionality: contract matches enhanced US-D10
- [ ] Testing: unit + e2e green
- [ ] Integration: does not break `active` / `:id` / create
- [ ] Documentation: `api-spec.work-orders.yml` + `apps/api/README.md` updated
- [ ] Branch still `finalproject-RFM`
