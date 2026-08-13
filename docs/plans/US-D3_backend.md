# Backend Implementation Plan: US-D3 Vehicle Ownership Transfer

## Overview

Add **`POST /api/vehicles/:id/transfer-ownership`** so admins and mechanics can transfer a vehicle to an existing client or a newly created client in one atomic transaction: close active `VehicleOwnership` (`validTo = transferAt`) and open a new row (`validFrom = transferAt`, `validTo = null`). Do **not** rewrite `WorkOrder.ownerClientId` on past or open visits. History and client-profile behavior already assume this model — extend regression tests.

**Architecture principles:** Controller → Service → Prisma transaction; reuse client normalizers from US-003; TDD; English API messages; both `ADMIN` and `MECHANIC`.

**User story reference:** [`us/Deseables/US-D3-transferencia-propietario-vehiculo.md`](../../us/Deseables/US-D3-transferencia-propietario-vehiculo.md)

**Prerequisites:** US-003, US-004, US-005 (`ownerClientId` snapshot), US-009 history/client profile.

**Out of scope:** Frontend, legal documents, undo, multi-owner, rewriting OT snapshots, ownership-history timeline endpoint (nice-to-have only).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D3 artifacts |
|-------|----------------|-----------------|
| **Presentation** | HTTP + XOR body validation | `VehiclesController`, `TransferOwnershipDto` |
| **Application** | Transfer orchestration, conflict rules | `VehiclesService.transferOwnership` |
| **Domain** | Single active ownership; immutable WO owner snapshot | Enforced in service (no WO updates) |
| **Infrastructure** | Prisma `$transaction` on `VehicleOwnership` (+ optional `Client` create) | Existing models |

### Files to add/modify

```
apps/api/src/modules/vehicles/
├── dto/transfer-ownership.dto.ts              # NEW
├── dto/transfer-ownership-response.dto.ts     # NEW (or extend VehicleResponseDto)
├── vehicles.controller.ts                     # POST :id/transfer-ownership
├── vehicles.service.ts                        # transferOwnership()
├── vehicles.service.spec.ts                   # unit matrix
└── mappers/vehicle.mapper.ts                  # reuse toVehicleResponse / currentOwner

apps/api/src/modules/clients/
└── utils/client-normalizer.ts                 # reuse (no change unless export needed)

apps/api/src/modules/history/
└── history.service.spec.ts                    # keep/strengthen D3 snapshot test

apps/api/test/
├── vehicles.e2e-spec.ts                       # transfer scenarios
└── (optional) history / clients profile e2e

apps/api/README.md
docs/api-spec.vehicles.yml                     # or relevant OpenAPI fragment
```

### API endpoint

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `POST` | `/api/vehicles/:id/transfer-ownership` | Bearer | `ADMIN`, `MECHANIC` | Transfer ownership |

Optional (not DoD): `GET /api/vehicles/:id/ownership-history`.

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on the delivery branch only.
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Pull if needed; confirm current branch.
  3. Do **not** create `feature/US-D3-backend`.
- **Notes:** Same convention as US-D1/D2 plans and `us/Deseables/README.md`.

---

### Step 1: DTO — XOR Body Validation

- **File:** `dto/transfer-ownership.dto.ts`
- **Action:** Accept exactly one of `newClientId` or `createClient`.
- **Implementation Steps:**
  1. Nested class mirroring `CreateClientDto` fields (`fullName`, `nationalId`, `phone?`, `email?`) with same validators (`Length`, `Matches`, `IsEmail`, optional phone digits).
  2. Top-level:

```typescript
export class TransferOwnershipDto {
  @IsOptional() @IsUUID()
  newClientId?: string;

  @IsOptional() @ValidateNested() @Type(() => TransferCreateClientDto)
  createClient?: TransferCreateClientDto;
}
```

  3. Custom validator **or** service-level check: XOR — if both/neither → `BadRequestException('Provide either newClientId or createClient')`.
     - Prefer `@ValidatorConstraint` / class-validator custom decorator for early 400; service check as safety net.
- **Dependencies:** `class-validator`, `class-transformer`.
- **Implementation Notes:** Use `nationalId`, never `identification`.

---

### Step 2: Response DTO Shape

- **File:** `dto/transfer-ownership-response.dto.ts` (or extend mapper return type)
- **Action:** Vehicle response + transfer metadata.
- **Implementation Steps:**
  1. Base: same fields as `VehicleResponseDto` (`id`, plate, brand, model, year, color, `currentOwner`).
  2. Add:

```typescript
ownershipTransferredAt: Date;
previousOwner: {
  id: string;
  fullName: string;
  nationalId: string;
};
```

  3. Prefer composing: call existing `findById` / `toVehicleResponse` after transaction, then attach metadata.
- **Dependencies:** `CurrentOwnerDto` / vehicle mapper.
- **Implementation Notes:** `previousOwner` captured **before** closing ownership (active ownership’s client).

---

### Step 3: Unit Tests First (Red) — `transferOwnership`

- **File:** `vehicles.service.spec.ts`
- **Action:** Specify behavior before implementation.

#### Successful cases

1. Transfer to existing `newClientId` → closes old ownership, creates new, returns new `currentOwner` + `previousOwner` + `ownershipTransferredAt`.
2. Transfer with `createClient` → creates client (normalized email/nationalId) then ownership swap.
3. Open work order on vehicle: **no** `workOrder.update` called; `ownerClientId` unchanged (assert prisma.workOrder.update not called / count unchanged).

#### Validation / conflicts

4. Neither / both body modes → `400`.
5. Same client as current → `409` `Client is already the current owner`.
6. Vehicle missing → `404`.
7. `newClientId` missing → `404` `Client not found`.
8. `createClient` duplicate `nationalId` → `409` (same message as US-003, e.g. client already exists); ownership rows unchanged.
9. No active ownership → `400` `Vehicle has no active ownership`.
10. Concurrent close: active row already has `validTo` when re-read → `409` `Ownership changed concurrently`.

#### Integrity helpers

11. After transfer, mocked history path: current owner vs visit snapshot (can live in history.spec — keep existing D3 test green).

- **Dependencies:** Existing prisma mock patterns in vehicles.service.spec.ts.
- **Implementation Notes:** Use single `transferAt` Date for both `validTo` and `validFrom`.

---

### Step 4: Implement `VehiclesService.transferOwnership`

- **File:** `vehicles.service.ts`
- **Action:** Transactional transfer.
- **Function Signature:**

```typescript
async transferOwnership(
  vehicleId: string,
  dto: TransferOwnershipDto,
): Promise<TransferOwnershipResponseDto>
```

- **Implementation Steps:**
  1. Validate XOR at start.
  2. `prisma.$transaction(async (tx) => { ... })`:
     a. `vehicle = findUnique(vehicleId)`; else `NotFoundException('Not Found')`.
     b. Resolve `targetClientId`:
        - If `newClientId`: `findUnique`; else `NotFoundException('Client not found')`.
        - If `createClient`: normalize via `normalizeFullName`, `normalizeNationalId`, `normalizePhone`, `normalizeEmail`; check existing nationalId → `ConflictException` (reuse US-003 message); `tx.client.create`.
     c. `active = findFirst({ vehicleId, validTo: null }, include: { client: true })`.
     d. If !active → `BadRequestException('Vehicle has no active ownership')`.
     e. If `active.clientId === targetClientId` → `ConflictException('Client is already the current owner')`.
     f. Optional concurrency: re-check `active.validTo === null` (already filtered); if using updateMany with `where: { id, validTo: null }` and `count !== 1` → concurrent conflict.
     g. `transferAt = new Date()`.
     h. `tx.vehicleOwnership.update({ where: { id: active.id }, data: { validTo: transferAt } })`.
     i. `tx.vehicleOwnership.create({ vehicleId, clientId: targetClientId, validFrom: transferAt, validTo: null })`.
     j. Capture `previousOwner` from `active.client` before/during.
  3. After transaction: `findById(vehicleId)` → attach `ownershipTransferredAt: transferAt`, `previousOwner`.
  4. **Never** touch `WorkOrder` rows.
- **Dependencies:** Client normalizers from `../clients/utils/client-normalizer`; Prisma.
- **Implementation Notes:** Prefer `updateMany`/`count` for concurrency safety on close step.

---

### Step 5: Controller Route

- **File:** `vehicles.controller.ts`
- **Action:** Expose endpoint under existing `@Roles(ADMIN, MECHANIC)`.
- **Function Signature:**

```typescript
@Post(':id/transfer-ownership')
transferOwnership(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: TransferOwnershipDto,
): Promise<TransferOwnershipResponseDto>
```

- **Implementation Steps:**
  1. Place route so it does not collide with `GET :id/history` / `GET :id` (static path segments: `transfer-ownership` is fine under `:id`).
  2. Declare **before** overly generic routes if needed; Nest matches method+path specifically.
  3. No actor id required for audit in V2 (ownership rows suffice); optional log `vehicle.ownership_transferred` with vehicleId/client ids.
- **Dependencies:** Guards already on controller.
- **Implementation Notes:** HTTP `200` (not `201`) — transfer is an action, not resource create of vehicle.

---

### Step 6: Regressions — History + Client Profile

- **Files:** `history.service.spec.ts`; optional clients/history e2e
- **Action:** Prove snapshot integrity and profile lists.
- **Implementation Steps:**
  1. Keep test *preserves ownerAtVisit when current owner differs (D3)*.
  2. Add/extend: after transfer, `getVehicleHistory` → `currentOwner.id === newClient`; visit `ownerAtVisit.id === oldClient`.
  3. Client profile: old client `vehicles[]` excludes transferred plate; new client includes it (unit or e2e against `HistoryService.getClientProfile` / clients endpoint used by US-009).
- **Dependencies:** US-009 services already filter `validTo: null`.
- **Implementation Notes:** No code change expected in history if ownership rows are correct — tests are the guarantee.

---

### Step 7: E2E Tests

- **File:** `test/vehicles.e2e-spec.ts` (extend)
- **Action:** HTTP-level transfer coverage.
- **Implementation Steps:**
  1. As ADMIN (and one MECHANIC case): transfer existing client → 200; GET vehicle shows new owner.
  2. Transfer createClient → 200; GET client by new nationalId exists.
  3. Same owner → 409.
  4. Duplicate nationalId on createClient → 409; GET vehicle owner unchanged.
  5. Seed WO with old owner snapshot; after transfer GET history visits still show old `ownerAtVisit`; `currentOwner` new.
  6. Create **new** WO after transfer → `ownerClientId` is new client.
  7. Unauthenticated → 401.
- **Dependencies:** Existing vehicle/client/work-order e2e helpers.
- **Implementation Notes:** Prefer English assertion on `message` strings.

---

### Step 8: Optional Ownership History (Defer)

- **Action:** Skip for DoD unless time remains.
- **Notes:** `GET .../ownership-history` listed as nice-to-have in US.

---

### Step 9: Update Technical Documentation

- **Action:** Mandatory docs (English for `docs/*`).
- **Implementation Steps:**
  1. Review transfer endpoint + DTO.
  2. Update:
     - `apps/api/README.md` — Vehicles section: transfer-ownership
     - `docs/api-spec.vehicles.yml` (or clients/vehicles OpenAPI file in repo)
     - Brief note in `docs/data-model.md` if ownership lifecycle undocumented
  3. Confirm no schema migration needed (`VehicleOwnership` already exists).
  4. Report updated files in commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/backend-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM`
2. Step 1 — Transfer DTOs + XOR validation
3. Step 2 — Response shape
4. Step 3 — Unit tests (red)
5. Step 4 — `transferOwnership` implementation
6. Step 5 — Controller
7. Step 6 — History/profile regressions
8. Step 7 — E2E
9. Step 8 — Optional ownership-history (skip if needed)
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] Existing client transfer works
- [ ] Inline createClient transfer works
- [ ] XOR / same-owner / missing vehicle/client / duplicate nationalId covered
- [ ] No WO `ownerClientId` mutation
- [ ] New WO after transfer uses new owner
- [ ] History `ownerAtVisit` intact; `currentOwner` updated
- [ ] Old client profile drops vehicle; new client lists it
- [ ] ADMIN and MECHANIC can call; anonymous 401
- [ ] Concurrent close → 409 (unit)
- [ ] Unit + e2e green

---

## Error Response Format

```json
{
  "statusCode": 409,
  "message": "Client is already the current owner",
  "error": "Conflict"
}
```

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | XOR invalid | `Provide either newClientId or createClient` |
| `400` | No active ownership | `Vehicle has no active ownership` |
| `400` | createClient validation | class-validator messages |
| `401` | No JWT | `Unauthorized` |
| `403` | (N/A if both roles allowed) | `Forbidden` |
| `404` | Vehicle | `Not Found` |
| `404` | Target client | `Client not found` |
| `409` | Same owner | `Client is already the current owner` |
| `409` | Duplicate nationalId | Same as US-003 create conflict |
| `409` | Concurrent ownership change | `Ownership changed concurrently` |

---

## Partial Update Support

Not applicable — transfer is a full action with exclusive body modes (existing client **or** create client), not a PATCH of vehicle attributes.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-003** | Client create rules + normalizers |
| **US-004** | Vehicles module, ownership model |
| **US-005** | Snapshot `ownerClientId` on create (unchanged) |
| **US-009** | History + client vehicles list by active ownership |
| **npm** | No new packages |

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **No Prisma migration** expected for core DoD.
- **Active OT:** Transfer must proceed; open visit keeps old snapshot (delivery/contact D1 still use snapshot — intended).
- **Language:** API English; code English.
- **Single active ownership:** Enforced in transaction; partial unique index is optional V2.1 hardening.
- **Clients module import:** Prefer using normalizer utils directly inside vehicles transaction rather than calling `ClientsService.create` (avoids nested transactions / module cycles). Duplicate nationalId check must match US-003 semantics.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/Deseables/US-D3-transferencia-propietario-vehiculo.md` on same branch
2. Commit on `feature-entrega2-RFM`
3. Manual smoke: transfer → history → new OT ownership

---

## Implementation Verification

### Code Quality

- [ ] All changes in one transaction
- [ ] Reused client normalizers
- [ ] No WO updates in transfer path

### Functionality

- [ ] Current owner + previous owner metadata correct
- [ ] History integrity proven by tests

### Testing

- [ ] Unit matrix + e2e green

### Integration

- [ ] Ready for TransferOwnership UI (`ClientPicker` reuse)

### Documentation

- [ ] Step 9 completed
