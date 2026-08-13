# Backend Implementation Plan: US-D9 Ownerless Intake (Third-Party Bringer)

## Overview

Enable workshop intake when a vehicle is brought by an **external mechanic / other workshop**, without inventing an owner:

1. **`POST /api/vehicles`** — `clientId` becomes optional; omit → vehicle with **no** `VehicleOwnership`.
2. **`WorkOrder.ownerClientId`** → nullable; add **`broughtByName`** / **`broughtByPhone`**.
3. **`POST /api/work-orders`** — `intakeMode: OWNER | THIRD_PARTY` (default `OWNER`); third-party sets `ownerClientId = null` and requires bringer name.
4. **`PATCH /api/work-orders/:id/link-owner`** — optional later association (atomic rules; **never** silent ownership transfer).
5. **Null-safety** across vehicle mapper, work-order detail, delivery list/detail + D1 guard, and vehicle history visits.

**Architecture principles:** Prisma migration first; TDD on create/link helpers; English API errors; derive `intakeMode` in responses (`broughtByName != null` → `THIRD_PARTY`); RBAC unchanged; no generic “placeholder client”.

**User story reference:** [`us/Deseables/US-D9-ingreso-sin-propietario-mecanico-externo.md`](../../us/Deseables/US-D9-ingreso-sin-propietario-mecanico-externo.md)

**Prerequisites on `feature-entrega2-RFM`:** US-004, US-005, US-008, US-009, US-D1 (`mark-contacted`), US-D7 (nullable mileage).

**Out of scope:** Frontend, US-D3 transfer endpoint, editing `broughtBy*` after create, undoing `link-owner`, external workshop as `Client` entity.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D9 artifacts |
|-------|----------------|-----------------|
| **Domain** | Intake mode rules; link-owner ownership matrix | Service branching + small pure helpers (optional) |
| **Application** | Vehicles create, WO create/link, delivery/history mapping | Nest services |
| **Presentation** | DTOs, validation, controller routes | Controllers + class-validator |
| **Infrastructure** | Nullable FK + bringer columns | Prisma migration |

### Files to add/modify

```
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/<timestamp>_work_order_optional_owner_brought_by/migration.sql

apps/api/src/modules/vehicles/
├── dto/create-vehicle.dto.ts
├── dto/vehicle-response.dto.ts              # currentOwner: CurrentOwnerDto | null
├── mappers/vehicle.mapper.ts                # resolveCurrentOwner → null-safe
├── vehicles.service.ts                      # create without ownership
└── vehicles.service.spec.ts

apps/api/src/modules/work-orders/
├── constants/intake-mode.ts                  # NEW (OWNER | THIRD_PARTY enum/const)
├── dto/create-work-order.dto.ts
├── dto/link-work-order-owner.dto.ts         # NEW
├── dto/link-work-order-owner-response.dto.ts # NEW
├── dto/work-order-detail-response.dto.ts
├── mappers/work-order.mapper.ts
├── utils/intake-mode.ts                     # NEW optional: deriveIntakeMode, normalizeBroughtByPhone
├── work-orders.controller.ts                # PATCH :id/link-owner
├── work-orders.service.ts                   # create + linkOwner
└── work-orders.service.spec.ts

apps/api/src/modules/delivery/
├── dto/delivery-ready-item.dto.ts
├── dto/delivery-ready-detail.dto.ts
├── delivery.service.ts                      # map null owner + broughtBy; markContacted guard
└── delivery.service.spec.ts

apps/api/src/modules/history/
├── dto/vehicle-history-visit.dto.ts
├── mappers/visit-history.mapper.ts
├── history.service.ts                       # types: ownerClient nullable
└── history.service.spec.ts / mapper specs

apps/api/test/vehicles.e2e-spec.ts
apps/api/test/work-orders.e2e-spec.ts
apps/api/test/delivery.e2e-spec.ts
apps/api/README.md

docs/api-spec.vehicles.yml
docs/api-spec.work-orders.yml
docs/api-spec.delivery.yml
docs/api-spec.history.yml
```

### API changes

| Method | Path | Auth | Roles | Change |
|--------|------|------|-------|--------|
| `POST` | `/api/vehicles` | Bearer | ADMIN, MECHANIC | `clientId` optional |
| `GET` | `/api/vehicles/:id` (and search) | Bearer | ADMIN, MECHANIC | `currentOwner` may be `null` |
| `POST` | `/api/work-orders` | Bearer | ADMIN, MECHANIC | `intakeMode` + `broughtBy*`; nullable owner |
| `GET` | `/api/work-orders/:id` | Bearer | ADMIN, MECHANIC | nullable owner + broughtBy + derived `intakeMode` |
| `PATCH` | `/api/work-orders/:id/link-owner` | Bearer | ADMIN, MECHANIC | **NEW** |
| `GET` | `/api/delivery/ready` (+ detail) | Bearer | ADMIN | nullable owner fields + broughtBy |
| `PATCH` | `/api/delivery/ready/:id/mark-contacted` | Bearer | ADMIN | `409` if no owner |
| `PATCH` | `/api/delivery/ready/:id/deliver` | Bearer | ADMIN | allow null owner (regression) |
| `GET` | `/api/vehicles/:id/history` | Bearer | ADMIN, MECHANIC | `ownerAtVisit` null + broughtBy |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`
- **Action:** Do **not** create `feature/US-D9-backend`. Confirm clean working tree for intended files; pull latest if needed.
- **Notes:** Deseables delivery policy in `us/Deseables/README.md`.

---

### Step 1: Prisma Migration

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Make owner optional; add bringer fields.

```prisma
model WorkOrder {
  ownerClientId   String?
  broughtByName   String?
  broughtByPhone  String?
  ownerClient     Client?  @relation(fields: [ownerClientId], references: [id], onDelete: Restrict)
  // ...
}
```

- **Implementation Steps:**
  1. Update schema fields + relation optional.
  2. Create migration SQL:

```sql
ALTER TABLE "WorkOrder" ALTER COLUMN "ownerClientId" DROP NOT NULL;
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByName" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByPhone" TEXT;
```

  3. `npx prisma migrate dev` (or deploy on Docker) + `prisma generate`.
  4. Confirm existing rows keep `ownerClientId`; new columns NULL.
- **Dependencies:** Prisma.
- **Do not** add DB column `intakeMode` (derived in application layer).

---

### Step 2: Vehicle Mapper Null-Safety — TDD

- **Files:** `vehicle.mapper.ts`, `vehicle-response.dto.ts`, callers in `vehicles.service.ts`
- **Function signatures:**

```typescript
export function resolveCurrentOwner(
  vehicle: VehicleWithActiveOwnership,
): CurrentOwnerDto | null

export function toVehicleResponse(
  vehicle: Vehicle,
  currentOwner: CurrentOwnerDto | null,
): VehicleResponseDto
```

- **Implementation Steps:**
  1. Change `VehicleResponseDto.currentOwner` to `CurrentOwnerDto | null`.
  2. Replace throw in `resolveCurrentOwner` with `return null` when `ownerships[0]` missing.
  3. Update every `toVehicleResponse` / map path (create, findById, search, update) to pass nullable owner.
  4. Unit tests: vehicle without ownership → `currentOwner: null`; with ownership → unchanged.
- **Dependencies:** Step 1 not strictly required for mapper compile, but keep order after generate.
- **Notes:** Search for `has no active ownership` / `resolveCurrentOwner` throws across API.

---

### Step 3: Optional `clientId` on Create Vehicle — TDD

- **Files:** `create-vehicle.dto.ts`, `vehicles.service.ts`, `vehicles.service.spec.ts`
- **DTO:**

```typescript
@IsOptional()
@IsUUID()
clientId?: string;
```

- **Service create logic:**
  1. If `dto.clientId` present: existing flow (validate client exists → create vehicle + ownership in transaction).
  2. If absent/`undefined`: create **only** vehicle; **no** `vehicleOwnership.create`.
  3. Treat explicit `null` as absent if ValidationPipe allows (prefer omit; if using `@ValidateIf`, document).
- **Unit tests:**
  - create without `clientId` → no ownership row; response `currentOwner: null`
  - create with `clientId` → ownership + owner (regression)
  - invalid `clientId` → existing 404/400 behavior
- **E2E (later Step 10):** POST without clientId → 201.

---

### Step 4: Intake Constants + CreateWorkOrderDto

- **Files:** `constants/intake-mode.ts` (NEW), `create-work-order.dto.ts`
- **Constants:**

```typescript
export enum WorkOrderIntakeMode {
  OWNER = 'OWNER',
  THIRD_PARTY = 'THIRD_PARTY',
}
```

- **DTO additions:**

```typescript
@IsOptional()
@IsEnum(WorkOrderIntakeMode)
intakeMode?: WorkOrderIntakeMode;

@IsOptional()
@IsString()
@Length(2, 150)
broughtByName?: string;

@IsOptional()
@ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
@IsString()
@Matches(/^[0-9]{8,15}$/)
broughtByPhone?: string | null;
```

- **Implementation Notes:**
  - Service-layer still enforces mode rules (DTO cannot express cross-field well alone).
  - Empty string phone: normalize to `null` in service before persist.
  - Whitespace-only name: reject in service even if Length passes after trim failure — **trim first**, then Length check / BadRequest.

---

### Step 5: Work Order Detail DTO + Mapper Null-Safety

- **Files:** `work-order-detail-response.dto.ts`, `work-order.mapper.ts`, `WORK_ORDER_DETAIL_INCLUDE` if typed
- **Action:** Prepare detail shape before create changes land.

```typescript
ownerClientId!: string | null;
owner!: WorkOrderOwnerSummaryDto | null;
broughtByName!: string | null;
broughtByPhone!: string | null;
intakeMode!: 'OWNER' | 'THIRD_PARTY'; // derived: broughtByName != null ? THIRD_PARTY : OWNER
```

- **Implementation Steps:**
  1. Mapper: if `ownerClient` missing → `owner: null`, `ownerClientId: null`.
  2. Map `broughtByName` / `broughtByPhone` from entity.
  3. Set `intakeMode` derived (do not read nonexistent column).
  4. Fix TypeScript includes: `ownerClient: Client | null`.
  5. Update unit/mapper expectations for classic OWNER visits (regression).
- **Dependencies:** Step 1.

---

### Step 6: `WorkOrdersService.create` Intake Branching — TDD

- **File:** `work-orders.service.ts`
- **Signature:** unchanged `create(dto, createdById)`
- **Implementation Steps:**

1. `const mode = dto.intakeMode ?? WorkOrderIntakeMode.OWNER`.
2. Normalize:
   - `broughtByName = dto.broughtByName?.trim() ?? null`
   - `broughtByPhone = empty → null`
3. **If `THIRD_PARTY`:**
   - If `!broughtByName` or length &lt; 2 → `400 BadRequestException('broughtByName is required for THIRD_PARTY intake')`
   - `ownerClientId = null`
   - Persist `broughtByName`, `broughtByPhone`
   - **Do not** require / read active ownership
4. **If `OWNER`:**
   - If `broughtByName` or `broughtByPhone` provided → `400 BadRequestException('broughtBy fields are only valid for THIRD_PARTY intake')`
   - Require `vehicle.ownerships[0]` else `400 BadRequestException('Vehicle has no active owner')`
   - `ownerClientId = ownership.clientId`
   - Persist bringer as `null`
5. Keep existing: vehicle 404, active WO conflict 409, `assignedMechanicId` + `assignableMechanicWhere` (US-D8), mileage nullable (US-D7), initial tasks.
6. Return `findById` with new fields.

- **Unit tests (minimum):**

| Case | Expect |
|------|--------|
| THIRD_PARTY + name, vehicle without owner | 201, `ownerClientId` null, broughtBy set |
| THIRD_PARTY + name, vehicle **with** owner | 201, WO owner null; ownership unchanged |
| THIRD_PARTY without name / whitespace | 400 |
| OWNER without ownership | 400 `Vehicle has no active owner` |
| OWNER with ownership (omit intakeMode) | 201 regression |
| OWNER + broughtByName | 400 |
| Active WO exists | 409 regression |

- **Dependencies:** Steps 1, 4, 5.

---

### Step 7: `linkOwner` — TDD then Controller

- **Files:** `link-work-order-owner.dto.ts`, `link-work-order-owner-response.dto.ts`, `work-orders.service.ts`, `work-orders.controller.ts`
- **DTO request:**

```typescript
export class LinkWorkOrderOwnerDto {
  @IsUUID()
  clientId!: string;
}
```

- **Response DTO (minimum):**

```typescript
{
  id: string;
  ownerClientId: string;
  owner: { fullName: string; nationalId: string };
  broughtByName: string | null;
  broughtByPhone: string | null;
  vehicleOwnerUnchanged: boolean;
  updatedAt: Date;
}
```

- **Service `linkOwner(workOrderId, dto, actorId?)` in transaction:**

1. Load WO; missing → `404 NotFoundException('Work order not found')` (align message with existing WO 404 style if different — prefer consistent `Work order not found`).
2. If `ownerClientId != null` → `409 ConflictException('Owner already linked')`.
3. Load client; missing → `404 NotFoundException('Client not found')`.
4. Load active ownership for `workOrder.vehicleId` (`validTo: null`).
5. Matrix:

| Active ownership | Persist |
|------------------|---------|
| None | `WO.ownerClientId = clientId` + `vehicleOwnership.create({ vehicleId, clientId, validTo: null })`; `vehicleOwnerUnchanged = false` |
| Same `clientId` | Only update WO; `vehicleOwnerUnchanged = false` |
| Different `clientId` | Only update WO; **do not** touch ownership; `vehicleOwnerUnchanged = true` |

6. **Never** modify `broughtByName` / `broughtByPhone`.
7. Allowed for any status including `ENTREGADA`.

- **Controller:**

```typescript
@Patch(':id/link-owner')
@HttpCode(HttpStatus.OK)
linkOwner(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: LinkWorkOrderOwnerDto,
): Promise<LinkWorkOrderOwnerResponseDto>
```

- Place route **before** overly generic `:id` conflicts if any; Nest order: static segments like `mechanics` already above; `link-owner` is fine as `@Patch(':id/link-owner')`.
- **Unit tests:** three ownership cases + double link 409 + missing WO/client 404 + broughtBy preserved.
- **Dependencies:** Step 1, 6.

---

### Step 8: Delivery Null-Safety + D1 Guard — TDD

- **Files:** delivery DTOs + `delivery.service.ts` + specs
- **Type include:** `ownerClient: Client | null` (update `READY_INCLUDE` typing).
- **Map list/detail:**

```typescript
ownerName: workOrder.ownerClient?.fullName ?? null;
ownerPhone: workOrder.ownerClient?.phone ?? null;
ownerPhoneDisplay: formatPhoneDisplay(workOrder.ownerClient?.phone ?? null);
ownerEmail: workOrder.ownerClient?.email ?? null;
broughtByName: workOrder.broughtByName;
broughtByPhone: workOrder.broughtByPhone;
// detail:
owner: workOrder.ownerClient ? { fullName, nationalId, phone, email } : null;
```

- **`markContacted`:** after load, if `!workOrder.ownerClientId` → `409 ConflictException('Work order has no owner to contact')` **before** status checks (or after existence 404; before ready-status 409).
- **`deliver`:** must succeed when `ownerClientId` is null (no new requirement).
- **Unit tests:** map without owner; markContacted no owner → 409; deliver without owner → ENTREGADA; markContacted with owner still works (D1 regression).
- **Dependencies:** Step 1.

---

### Step 9: History Visit Null-Safety + BroughtBy — TDD

- **Files:** `vehicle-history-visit.dto.ts`, `visit-history.mapper.ts`, `history.service.ts`, specs
- **DTO:**

```typescript
ownerAtVisit!: OwnerAtVisitDto | null;
broughtByName!: string | null;
broughtByPhone!: string | null;
```

- **Mapper type:** `ownerClient: Client | null`
- **Logic:** `ownerAtVisit = ownerClient ? { id, fullName, nationalId } : null`; pass through broughtBy fields.
- **Tests:** ownerless visit; visit with owner (regression); broughtBy present on THIRD_PARTY visit.
- **Dependencies:** Step 1, 6 (data).

---

### Step 10: E2E API Tests

- **Files:** `test/vehicles.e2e-spec.ts`, `test/work-orders.e2e-spec.ts`, `test/delivery.e2e-spec.ts`
- **Scenarios (happy path chain):**
  1. Admin/mechanic creates vehicle **without** `clientId` → 201, `currentOwner: null`.
  2. Create OT `THIRD_PARTY` with name (+ optional phone) → 201, owner null, broughtBy set, `intakeMode: THIRD_PARTY`.
  3. `GET` vehicle history → visit with `ownerAtVisit: null`, broughtBy visible.
  4. `PATCH link-owner` → 200; if vehicle had no ownership, now has currentOwner; broughtBy unchanged.
  5. Deliver ownerless OT (before link) **or** after link — cover at least one ownerless deliver.
  6. `mark-contacted` on ownerless ready OT → 409.
  7. Vehicle **with** owner + new OT `THIRD_PARTY` → 201 owner null; vehicle ownership unchanged.
  8. Second OT `THIRD_PARTY` after prior link-owner on previous visit → 201 (when no active WO).
  9. Regression: create OT OWNER default without intakeMode still works.
- **Cleanup:** isolate plates/emails with timestamps like other e2e specs; restore admins if touching users.

---

### Step 11: Update Technical Documentation

- **Action:** Mandatory before BE Done.
- **Implementation Steps:**
  1. `apps/api/README.md` — document optional vehicle owner, intake modes, `link-owner`, delivery without owner / D1 guard.
  2. OpenAPI:
     - `docs/api-spec.vehicles.yml` — optional `clientId`; nullable `currentOwner`
     - `docs/api-spec.work-orders.yml` — create fields + `link-owner` + detail nullables
     - `docs/api-spec.delivery.yml` — nullable owner* + broughtBy; mark-contacted 409
     - `docs/api-spec.history.yml` — nullable `ownerAtVisit` + broughtBy
  3. Cross-check `us/Deseables/README.md` already lists US-D9 (no change unless status note needed).
  4. English only in technical docs.
- **References:** `docs/documentation-standards.mdc`, `docs/backend-standards.mdc`.

---

## Implementation Order

1. Step 0 — stay on `feature-entrega2-RFM`
2. Step 1 — Prisma migration
3. Step 2 — vehicle mapper null-safety (TDD)
4. Step 3 — optional `clientId` create vehicle (TDD)
5. Step 4 — intake DTO/constants
6. Step 5 — WO detail mapper null-safety
7. Step 6 — create OT intake branching (TDD)
8. Step 7 — `link-owner` (TDD + route)
9. Step 8 — delivery null-safety + markContacted guard
10. Step 9 — history mapper
11. Step 10 — e2e API
12. Step 11 — documentation / OpenAPI

---

## Testing Checklist

- [ ] Migration applied on local DEV DB (`5435`) without wiping prod (`5434`)
- [ ] Unit: vehicles create ± clientId; mapper null owner
- [ ] Unit: WO create matrix (THIRD_PARTY / OWNER / errors)
- [ ] Unit: link-owner 3 ownership cases + 409
- [ ] Unit: delivery map / markContacted / deliver
- [ ] Unit: history ownerAtVisit null + broughtBy
- [ ] E2E chain: ownerless vehicle → THIRD_PARTY OT → history → link → second THIRD_PARTY
- [ ] E2E: mark-contacted without owner → 409
- [ ] Regression: classic OWNER create + delivery with owner
- [ ] `npm test` + targeted `test:e2e` green
- [ ] Docs/OpenAPI updated

---

## Error Response Format

Align with existing Nest `HttpExceptionFilter` body shape (message + statusCode + optional details).

| HTTP | When | Message (English) |
|------|------|-------------------|
| `400` | THIRD_PARTY missing/invalid name | `broughtByName is required for THIRD_PARTY intake` |
| `400` | OWNER with broughtBy fields | `broughtBy fields are only valid for THIRD_PARTY intake` |
| `400` | OWNER, no active ownership | `Vehicle has no active owner` |
| `400` | Invalid phone / validation pipe | class-validator defaults |
| `400` | Invalid assigned mechanic | `Invalid assigned mechanic` (existing) |
| `404` | Vehicle / WO / Client missing | `Vehicle not found` / `Work order not found` / `Client not found` |
| `409` | Active WO on plate | existing US-005 message |
| `409` | Owner already linked | `Owner already linked` |
| `409` | mark-contacted, no owner | `Work order has no owner to contact` |

Example:

```json
{
  "statusCode": 409,
  "message": "Work order has no owner to contact",
  "error": "Conflict"
}
```

---

## Partial Update Support

- **N/A** for create vehicle/OT.
- **`link-owner`:** single-purpose PATCH (not a general WO update); only sets owner once.
- **Do not** allow clearing owner or patching `broughtBy*` in this US.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| NestJS + class-validator / class-transformer | Existing |
| Prisma / PostgreSQL | Migration |
| Jest + Supertest | Unit + e2e |
| US-D1 / US-D7 / US-D8 code already on branch | Guards, mileage, assignable mechanic |

No new npm packages required.

---

## Notes

- **Language:** API messages, logs, docs, code identifiers in **English**; Spanish only if updating user-facing copy (frontend plan).
- **Business:** `assignedMechanicId` ≠ `broughtByName`.
- **Integrity:** never create placeholder clients; never silent plate transfer (US-D3 remains explicit).
- **Safety:** run migrations only against DEV DB from this repo (`mecatrack-dev` / port `5435`). Production updates only via approved `C:\Despliegues` deploy.
- **Derived `intakeMode`:** response-only; persistence is `broughtByName` presence.
- **`vehicleOwnerUnchanged`:** `true` only when active ownership exists for a **different** client than the linked one.

---

## Next Steps After Implementation

1. Frontend plan / implementation: `docs/plans/US-D9_frontend.md` (create if missing) then UI work on same branch.
2. Manual DoD: “authority asks for plate” via history.
3. Optional later: commit + prod deploy when product owner requests (backup + migrate via API entrypoint).

---

## Implementation Verification

### Code Quality
- [ ] Types: nullable owner relations compile across modules
- [ ] No `any`; no leftover throws in vehicle mapper for missing ownership
- [ ] English error strings match this plan

### Functionality
- [ ] Ownerless vehicle + THIRD_PARTY OT works
- [ ] OWNER default unchanged
- [ ] link-owner matrix correct
- [ ] D1 blocked without owner; deliver allowed

### Testing
- [ ] Unit + e2e checklist above green

### Integration
- [ ] History and delivery consume nullable FK without runtime crash

### Documentation
- [ ] README + OpenAPI specs updated (Step 11)
