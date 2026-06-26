# Backend Implementation Plan: US-004 Vehicle Registration

## Overview

Implement **vehicle search, registration, and detail** for MecaTrack (US-004): find vehicles by license plate, register new vehicles linked to an existing client via `VehicleOwnership`, and expose vehicle detail with visit history contract (empty until US-005). Accessible to both `ADMIN` and `MECHANIC`.

**Architecture principles:** vertical `vehicles` module, Controller → Service → Prisma, transactional create (Vehicle + ownership), DTO validation, TDD, shared auth guards from US-001.

**User story reference:** [`us/US-004-registro-vehiculos.md`](../../us/US-004-registro-vehiculos.md)

**Prerequisites:** US-001 (auth), US-003 (`Client` model and `ClientsService` / DB table).

**Out of scope:** owner transfer (D3/V2), vehicle deactivation (D4), populated visit history (US-005).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-004 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, query/body DTOs | `VehiclesController`, `SearchVehiclesQueryDto`, `CreateVehicleDto` |
| **Application** | Search, create, ownership resolution, history | `VehiclesService` |
| **Infrastructure** | Persistence, transactions | `PrismaService`, `Vehicle`, `VehicleOwnership` |
| **Domain** | Unique `licensePlate`, one active ownership per vehicle | Enforced in service + DB |

### Files to add/modify

```
apps/api/prisma/
├── schema.prisma              # Vehicle, VehicleOwnership; Client.ownerships
├── migrations/                # add_vehicle_and_ownership
└── seed.ts                    # 1–2 vehicles per seed client

apps/api/src/modules/vehicles/
├── vehicles.module.ts
├── vehicles.controller.ts
├── vehicles.service.ts
├── vehicles.service.spec.ts
├── dto/
│   ├── create-vehicle.dto.ts
│   ├── search-vehicles-query.dto.ts
│   ├── vehicle-response.dto.ts
│   ├── vehicle-search-response.dto.ts
│   ├── current-owner.dto.ts
│   └── vehicle-history-response.dto.ts
├── mappers/
│   └── vehicle.mapper.ts      # toVehicleResponse, resolveCurrentOwner
└── utils/
    └── license-plate-normalizer.ts

apps/api/src/common/exceptions/
└── vehicle-conflict.exception.ts   # optional: 409 + existingVehicle

apps/api/src/app.module.ts         # import VehiclesModule
```

### API endpoints (US-004)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/vehicles/search` | Bearer | `ADMIN`, `MECHANIC` | Search by `q` or `licensePlate` |
| `GET` | `/api/vehicles/:id/history` | Bearer | `ADMIN`, `MECHANIC` | Visit history (empty until US-005) |
| `GET` | `/api/vehicles/:id` | Bearer | `ADMIN`, `MECHANIC` | Vehicle detail + `currentOwner` |
| `PATCH` | `/api/vehicles/:id` | Bearer | `ADMIN`, `MECHANIC` | Update vehicle data (incl. license plate) |
| `DELETE` | `/api/vehicles/:id` | Bearer | `ADMIN`, `MECHANIC` | Delete vehicle if no work orders |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-004-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-001 + US-003 merged (or stacked on `feature/US-003-backend`).
  2. `git checkout -b feature/US-004-backend`
  3. Verify clients e2e tests pass; seed clients exist for vehicle seeding.

---

### Step 1: Prisma — Vehicle, VehicleOwnership, Client Relation

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Add models aligned with `readme.md` §3 Prisma reference.

```prisma
model Client {
  // ... existing fields from US-003
  ownerships  VehicleOwnership[]
  // workOrders WorkOrder[] — add in US-005
}

model Vehicle {
  id                   String   @id @default(uuid())
  licensePlate         String   @unique
  brand                String
  model                String
  year                 Int
  color                String?
  excludeFromReminders Boolean  @default(false)
  excludedAt           DateTime?
  excludedById         String?
  lastReminderSentAt   DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  excludedBy User?              @relation("ExcludedBy", fields: [excludedById], references: [id])
  ownerships VehicleOwnership[]
  // workOrders WorkOrder[] — add in US-005

  @@index([licensePlate])
}

model VehicleOwnership {
  id        String    @id @default(uuid())
  vehicleId String
  clientId  String
  validFrom DateTime  @default(now())
  validTo   DateTime?

  vehicle Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Restrict)
  client  Client  @relation(fields: [clientId], references: [id], onDelete: Restrict)

  @@index([vehicleId, validTo])
  @@index([clientId])
}
```

- **Migration:** `npx prisma migrate dev --name add_vehicle_and_ownership`
- **Seed:** Link 1–2 vehicles to existing seed clients with active ownership (`validTo: null`).
- **Notes:**
  - V2 fields (`excludedAt`, `excludedById`, `lastReminderSentAt`) included for schema parity; no API exposure in US-004.
  - `onDelete: Restrict` prevents orphan ownership if client/vehicle deleted (no delete endpoints in MVP).

---

### Step 2: License Plate Normalization

- **File:** `apps/api/src/modules/vehicles/utils/license-plate-normalizer.ts`

```typescript
export function normalizeLicensePlate(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}
```

| Field | Rules |
|-------|-------|
| `licensePlate` | Normalized before persist and search; unique at DB |
| `brand` / `model` | trim; 1–60 chars |
| `year` | integer 1900 … `currentYear + 1` |
| `color` | optional; trim; 0–40 chars |
| `clientId` | valid UUID; must reference existing `Client` |

---

### Step 3: DTOs

#### `create-vehicle.dto.ts`

```typescript
export class CreateVehicleDto {
  @IsString()
  @Length(2, 15)  // after normalization
  licensePlate: string;

  @IsString()
  @Length(1, 60)
  brand: string;

  @IsString()
  @Length(1, 60)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(() => new Date().getFullYear() + 1)
  year: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @IsUUID()
  clientId: string;
}
```

#### `search-vehicles-query.dto.ts`

```typescript
export class SearchVehiclesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  q?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;
}
```

- If both `q` and `licensePlate` absent → `400` (`At least one search parameter is required`).
- If `q` length < 2 → return `{ items: [], total: 0 }` (same policy as US-003).

#### `current-owner.dto.ts`

```typescript
export class CurrentOwnerDto {
  id: string;
  fullName: string;
  nationalId: string;
}
```

#### `vehicle-response.dto.ts`

```typescript
export class VehicleResponseDto {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  currentOwner: CurrentOwnerDto;
  createdAt: Date;
}
```

#### `vehicle-search-response.dto.ts`

```typescript
export class VehicleSearchResponseDto {
  items: VehicleResponseDto[];
  total: number;
}
```

#### `vehicle-history-response.dto.ts`

```typescript
export class VehicleVisitDto {
  workOrderId: string;
  checkedInAt: Date;
  status: string;
  entryReason: string;
  totalAmount: number | null;
  ownerAtVisit: { fullName: string; nationalId: string };
}

export class VehicleHistoryResponseDto {
  vehicleId: string;
  visits: VehicleVisitDto[];
}
```

- **US-004:** `visits` is always `[]` until `WorkOrder` model and query exist (US-005).

---

### Step 4: Vehicle Mapper — Current Owner Resolution

- **File:** `apps/api/src/modules/vehicles/mappers/vehicle.mapper.ts`

```typescript
export function toCurrentOwner(
  ownership: VehicleOwnership & { client: Client },
): CurrentOwnerDto

export function toVehicleResponse(
  vehicle: Vehicle,
  currentOwner: CurrentOwnerDto,
): VehicleResponseDto
```

- **Rule:** Active ownership = `VehicleOwnership` where `validTo IS NULL` for the vehicle.
- **Invariant:** On create, exactly one active ownership is inserted; service must reject create if active ownership already exists (should not happen on new vehicle).

---

### Step 5: VehiclesService — Business Logic

- **File:** `apps/api/src/modules/vehicles/vehicles.service.ts`
- **TDD:** Write `vehicles.service.spec.ts` first.

#### Method signatures

```typescript
search(query: SearchVehiclesQueryDto): Promise<VehicleSearchResponseDto>
findById(id: string): Promise<VehicleResponseDto>
getHistory(vehicleId: string): Promise<VehicleHistoryResponseDto>
create(dto: CreateVehicleDto): Promise<VehicleResponseDto>
findByLicensePlate(licensePlate: string): Promise<Vehicle | null>
```

#### `search`

1. If `licensePlate` provided:
   - Normalize → exact match on `licensePlate`.
   - Include active ownership + client for `currentOwner`.
   - Return 0 or 1 item.
2. If `q` provided (length ≥ 2):
   - Normalize `q` for plate partial match.
   - `where: { licensePlate: { contains: normalizedQ, mode: 'insensitive' } }` (stored plates are uppercase; `contains` on normalized string).
   - `take: 20`, `orderBy: { licensePlate: 'asc' }`.
   - Eager-load active ownership + client per vehicle.
3. Return `{ items, total: items.length }`.

#### `findById`

- `findUnique` with active ownership + client.
- `NotFoundException` if vehicle missing.
- `NotFoundException` or `500` if no active ownership (data integrity bug — should not occur after valid create).

#### `getHistory`

1. Verify vehicle exists → else `404`.
2. **US-004:** Return `{ vehicleId, visits: [] }`.
3. **US-005 extension point:** Query `WorkOrder` where `vehicleId`, order `checkedInAt DESC`, map to `VehicleVisitDto` with `ownerAtVisit` from `ownerClientId` snapshot.

#### `create` (transactional)

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Verify client exists
  const client = await tx.client.findUnique({ where: { id: dto.clientId } });
  if (!client) throw new NotFoundException('Client not found');

  // 2. Check duplicate plate (pre-insert)
  const normalizedPlate = normalizeLicensePlate(dto.licensePlate);
  const existing = await tx.vehicle.findUnique({ where: { licensePlate: normalizedPlate } });
  if (existing) throw vehicleConflict(existing);

  // 3. Create vehicle
  const vehicle = await tx.vehicle.create({ data: { ... } });

  // 4. Create active ownership
  await tx.vehicleOwnership.create({
    data: { vehicleId: vehicle.id, clientId: dto.clientId, validFrom: new Date(), validTo: null },
  });

  return vehicle;
});
```

- On `P2002` (unique `licensePlate`) → fetch existing vehicle → `409` with `existingVehicle`.
- Return `VehicleResponseDto` with `currentOwner` from the new client.

#### `findByLicensePlate`

- Used internally for duplicate checks and conflict payloads.

---

### Step 6: Conflict Response with `existingVehicle`

- **Requirement:** US-004 `409` body includes `existingVehicle` summary.

**Target response:**

```json
{
  "statusCode": 409,
  "message": "Vehicle with this license plate already exists",
  "error": "Conflict",
  "existingVehicle": {
    "id": "uuid",
    "licensePlate": "ABC123",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2018
  }
}
```

- Reuse pattern from US-003 (`existingClient`): custom exception or `ConflictException` + global filter passthrough.
- **File:** Extend `http-exception.filter.ts` if needed for `existingVehicle` key.

---

### Step 7: VehiclesController

- **File:** `apps/api/src/modules/vehicles/vehicles.controller.ts`

```typescript
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MECHANIC')
export class VehiclesController {
  @Get('search')
  search(@Query() query: SearchVehiclesQueryDto): Promise<VehicleSearchResponseDto>

  @Get(':id/history')
  getHistory(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleHistoryResponseDto>

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleResponseDto>

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateVehicleDto): Promise<VehicleResponseDto>
}
```

- **Route order:** `search` → `:id/history` → `:id` (static segments before parametric).
- **Auth:** Unauthenticated → `401`.

---

### Step 8: VehiclesModule Registration

- **File:** `apps/api/src/modules/vehicles/vehicles.module.ts`

```typescript
@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
```

- Register in `AppModule`.
- No direct import of `ClientsModule` required if client existence is checked via Prisma; optional `ClientsService` injection only if shared validation logic is extracted.

---

### Step 9: Unit Tests — VehiclesService

- **File:** `apps/api/src/modules/vehicles/vehicles.service.spec.ts`
- **Coverage:** ≥ 90%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Normalizer** | `"abc 123"` → `ABC123` | Uppercase, no spaces |
| **Search** | `q` partial plate | Matching vehicles with `currentOwner` |
| **Search** | `licensePlate` exact | Single result or empty |
| **Search** | No matches | `{ items: [], total: 0 }` |
| **Create** | Valid vehicle + client | Vehicle + ownership in transaction |
| **Create** | Invalid `clientId` | `NotFoundException` |
| **Create** | Duplicate plate | Conflict with `existingVehicle` |
| **Create** | Prisma P2002 on plate | Same 409 handling |
| **FindById** | Valid id | DTO with `currentOwner` |
| **FindById** | Unknown id | `NotFoundException` |
| **History** | Existing vehicle | `{ visits: [] }` |
| **History** | Unknown vehicle | `NotFoundException` |
| **Edge** | Optional color omitted | Stored as null |
| **Edge** | Year at boundaries | 1900 and currentYear+1 accepted |

- **Transaction rollback:** Mock transaction so ownership insert failure does not leave orphan vehicle (integration test covers real DB).

---

### Step 10: E2E Tests — VehiclesController

- **File:** `apps/api/test/vehicles.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/vehicles/search?q=AB` as ADMIN | `200`, items array |
| 2 | `GET /api/vehicles/search?licensePlate=ABC123` | `200`, match or empty |
| 3 | `GET /api/vehicles/search` no params | `400` |
| 4 | `GET /api/vehicles/search?q=A` | `200`, `[]` |
| 5 | `GET /api/vehicles/:id` valid | `200`, `currentOwner` present |
| 6 | `GET /api/vehicles/:id` unknown | `404` |
| 7 | `GET /api/vehicles/:id/history` | `200`, `visits: []` |
| 8 | `POST /api/vehicles` valid as MECHANIC | `201`, normalized plate |
| 9 | `POST /api/vehicles` valid as ADMIN | `201` |
| 10 | `POST /api/vehicles` duplicate plate | `409`, `existingVehicle` present |
| 11 | `POST /api/vehicles` unknown `clientId` | `404` |
| 12 | `POST /api/vehicles` invalid year | `400` |
| 13 | `GET /api/vehicles/search` no token | `401` |
| 14 | Create vehicle → search by plate | New vehicle appears |
| 15 | Create vehicle → `GET :id/history` | Empty visits, stable contract |

- Use unique plates per test run (timestamp suffix) to avoid seed collisions.

---

### Step 11: Update Technical Documentation

1. Confirm `readme.md` §3 `Vehicle` and `VehicleOwnership` match migration.
2. Add vehicles endpoints to `docs/api-spec.yml` fragment.
3. Update `apps/api/README.md` with search/create/history examples.
4. Document `409` + `existingVehicle` and empty `visits` contract until US-005.
5. Cross-reference US-004 in `readme.md` §6 when documenting entrega 2 tickets.

---

## Implementation Order

1. Step 0 — Branch `feature/US-004-backend`
2. Step 1 — Prisma Vehicle + VehicleOwnership + seed
3. Step 2 — License plate normalizer
4. Step 3 — DTOs
5. Step 4 — Vehicle mapper
6. Step 9 (red) — Unit tests
7. Step 5 — `VehiclesService` (transactional create)
8. Step 6 — Conflict response handling
9. Step 9 (green) — Unit tests
10. Step 7 — `VehiclesController` (route order)
11. Step 8 — Module registration
12. Step 10 — E2E tests
13. Step 11 — Documentation

---

## Testing Checklist

- [ ] Migration applies; Client relation updated
- [ ] Seed vehicles searchable with `currentOwner`
- [ ] Search `q` and `licensePlate` work for ADMIN and MECHANIC
- [ ] Create returns `201`; duplicate plate returns `409` + `existingVehicle`
- [ ] Create with invalid `clientId` returns `404`
- [ ] Vehicle + ownership created atomically (rollback on failure)
- [ ] `GET :id/history` returns stable empty `visits` array
- [ ] No update/delete routes exposed
- [ ] Unit + e2e green; service ≥ 90% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 400,
  "message": ["year must not be greater than..."],
  "error": "Bad Request"
}
```

### HTTP status mapping (US-004)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | DTO validation | Field errors |
| `400` | Search without `q` or `licensePlate` | `At least one search parameter is required` |
| `401` | No JWT | `Unauthorized` |
| `404` | Vehicle id not found | `Not Found` |
| `404` | Client `clientId` not found on create | `Client not found` |
| `409` | Duplicate `licensePlate` | `Vehicle with this license plate already exists` + **`existingVehicle`** |

---

## Partial Update Support

Not applicable — create and read-only search/get/history; no PATCH/PUT.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-001** | Auth guards, `apps/api` |
| **US-003** | `Client` table; `clientId` FK on ownership |
| **Prisma** | `Vehicle`, `VehicleOwnership` migration |
| **US-005** | Populates `GET /history` visits; `WorkOrder` model |

No new npm packages beyond US-001 stack.

---

## Notes

- **Ownership model:** One active ownership (`validTo IS NULL`) per vehicle at create; D3 transfer closes old + opens new in V2.
- **Plate storage:** Always normalized uppercase without spaces; UI may accept mixed case.
- **History contract:** Ship empty array in US-004 so frontend ficha is stable; US-005 fills `visits` without breaking API shape.
- **Optional US-005 prep:** Add `hasActiveWorkOrder: boolean` on `VehicleResponseDto` in US-005 when `WorkOrder` exists; not required for US-004 DoD.
- **Roles:** Both `ADMIN` and `MECHANIC` — same as US-003.
- **Performance:** Index on `licensePlate`; limit 20 search results.
- **Language:** Code and API messages in **English**; UI Spanish is frontend concern.
- **Branch:** `feature/US-004-backend` from `feature-entrega2-RFM` (with US-003 merged).

---

## Next Steps After Implementation

1. `/plan-backend-ticket @us/US-005-ordenes-trabajo.md`
2. `/plan-frontend-ticket @us/US-004-registro-vehiculos.md`
3. Merge `feature/US-004-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Normalization centralized; transactional create in service
- [ ] `ParseUUIDPipe` on `:id` params
- [ ] Route registration order correct

### Functionality

- [ ] Search-first + anti-duplicate plate flow supported
- [ ] `currentOwner` resolved via active ownership
- [ ] `409` payload enables UI duplicate plate alert

### Testing

- [ ] All unit + e2e scenarios pass
- [ ] Transaction rollback verified

### Integration

- [ ] Vehicle immediately searchable after create
- [ ] Ready for US-005 `work-orders/new?vehicleId=` flow
- [ ] US-003 link `vehicles/new?clientId=` supported via `clientId` on create

### Documentation

- [ ] Step 11 complete
