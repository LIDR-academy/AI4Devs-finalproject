# Backend Implementation Plan: US-003 Client Registration

## Overview

Implement **client search, registration, and update** for MecaTrack (US-003): find existing clients before creating duplicates, create new clients with contact data, update contact fields on existing clients, and expose client lookup by id for downstream flows (US-004 vehicles, US-005 work orders). Accessible to both `ADMIN` and `MECHANIC`.

**Architecture principles:** vertical `clients` module, Controller → Service → Prisma, DTO validation, TDD, shared auth guards from US-001.

**User story reference:** [`us/US-003-registro-clientes.md`](../../us/US-003-registro-clientes.md)

**Prerequisite:** US-001 backend (`JwtAuthGuard`, `RolesGuard`, `apps/api` bootstrapped).

**Out of scope:** delete clients, merge duplicates, change `nationalId`, advanced ID validation, pagination, frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-003 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, query/body DTOs | `ClientsController`, `SearchClientsQueryDto`, `CreateClientDto` |
| **Application** | Search, create, normalization | `ClientsService` |
| **Infrastructure** | Persistence | `PrismaService`, `Client` model migration |
| **Domain** | Unique `nationalId`, optional contact fields | Enforced in service + DB unique constraint |

### Files to add/modify

```
apps/api/prisma/
├── schema.prisma              # add model Client
├── migrations/                # init_client migration
└── seed.ts                    # add 2–3 sample clients

apps/api/src/modules/clients/
├── clients.module.ts
├── clients.controller.ts
├── clients.service.ts
├── clients.service.spec.ts
├── clients.controller.e2e-spec.ts
├── dto/
│   ├── create-client.dto.ts
│   ├── update-client.dto.ts
│   ├── search-clients-query.dto.ts
│   ├── client-response.dto.ts
│   └── client-search-response.dto.ts
└── utils/
    └── client-normalizer.ts   # nationalId, phone, email normalization

apps/api/src/common/exceptions/
└── client-conflict.exception.ts   # optional: 409 + existingClient

apps/api/src/app.module.ts         # import ClientsModule
```

### API endpoints (US-003)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/clients/search` | Bearer | `ADMIN`, `MECHANIC` | Search by `q` or `nationalId` |
| `GET` | `/api/clients/:id` | Bearer | `ADMIN`, `MECHANIC` | Get client by id |
| `POST` | `/api/clients` | Bearer | `ADMIN`, `MECHANIC` | Create client |
| `PATCH` | `/api/clients/:id` | Bearer | `ADMIN`, `MECHANIC` | Update client (`fullName`, `phone`, `email`; `nationalId` immutable) |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-003-backend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` (US-001 auth available).
  2. `git checkout -b feature/US-003-backend`
  3. Verify auth e2e tests pass before starting.

---

### Step 1: Prisma — Client Model and Migration

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Add `Client` model (no `Vehicle` relation until US-004; use `ownerships` placeholder optional).

```prisma
model Client {
  id         String   @id @default(uuid())
  fullName   String
  nationalId String   @unique
  phone      String?
  email      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([fullName])
  @@index([phone])
}
```

- **Migration:** `npx prisma migrate dev --name add_client`
- **Seed** (`prisma/seed.ts`): add 2–3 clients, e.g.:
  - Juan Pérez / `1-2345-6789` / phone / email
  - María López / `2-3456-7890`
- **Notes:** `nationalId` unique at DB level; catches race conditions on create (handle `P2002` → 409).

---

### Step 2: Normalization Utilities

- **File:** `apps/api/src/modules/clients/utils/client-normalizer.ts`

```typescript
export function normalizeNationalId(raw: string): string
export function normalizePhone(raw: string): string      // digits only or strip spaces/dashes
export function normalizeEmail(raw?: string): string | undefined  // lowercase trim; undefined if empty
export function normalizeFullName(raw: string): string   // trim, collapse spaces
```

| Field | Rules |
|-------|-------|
| `fullName` | trim, 2–150 chars |
| `nationalId` | trim; store user-facing format; search compares normalized form |
| `phone` | optional; if provided strip non-digits or spaces/dashes; 8–15 digits |
| `email` | optional; lowercase; empty string → `null` |

---

### Step 3: DTOs

#### `create-client.dto.ts`

```typescript
export class CreateClientDto {
  @IsString()
  @Length(2, 150)
  fullName: string;

  @IsString()
  @Length(5, 20)
  @Matches(/^[a-zA-Z0-9\-]+$/)  // alphanumeric + hyphen; adjust if local IDs need more
  nationalId: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8,15}$/)  // after normalization in pipe or service
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

#### `search-clients-query.dto.ts`

```typescript
export class SearchClientsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  q?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;
}
```

- **Validation at controller:** If both `q` and `nationalId` absent → `400 Bad Request` (`At least one search parameter is required`).
- If `q` present and length < 2 → return `{ items: [], total: 0 }` **or** `400` — **implement `[]`** per US-003 (document in OpenAPI).

#### `client-response.dto.ts`

```typescript
export class ClientResponseDto {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
}
```

#### `client-search-response.dto.ts`

```typescript
export class ClientSearchResponseDto {
  items: ClientResponseDto[];
  total: number;
}
```

---

### Step 4: ClientsService — Business Logic

- **File:** `apps/api/src/modules/clients/clients.service.ts`
- **TDD:** Write `clients.service.spec.ts` first.

#### Method signatures

```typescript
search(query: SearchClientsQueryDto): Promise<ClientSearchResponseDto>
findById(id: string): Promise<ClientResponseDto>
create(dto: CreateClientDto): Promise<ClientResponseDto>
update(id: string, dto: UpdateClientDto): Promise<ClientResponseDto>
findByNationalId(nationalId: string): Promise<Client | null>
```

#### `search`

1. If `nationalId` provided:
   - Normalize → `findFirst({ where: { nationalId: normalized } })` or exact match.
   - Return single-item array if found, else empty.
2. If `q` provided (length ≥ 2):
   - Normalize phone digits from `q` for phone branch.
   - Prisma `where: { OR: [ ... ] }`:
     - `fullName` `contains` `q`, `mode: 'insensitive'`
     - `nationalId` `contains` `q`
     - `phone` `contains` normalized digits
   - `take: 20`, `orderBy: { fullName: 'asc' }`
3. Return `{ items, total: items.length }`.

#### `findById`

- `findUnique` → `NotFoundException` if missing.

#### `create`

1. Normalize all fields.
2. `findByNationalId` → if exists, throw conflict with `existingClient` payload (see Step 5).
3. `prisma.client.create({ data: { fullName, nationalId, phone, email } })`.
4. On `P2002` (unique violation) → fetch existing by `nationalId` → same 409 response (race safety).
5. Return `ClientResponseDto`.

- **Email duplicate:** Allowed in MVP (no unique on email).

#### `update`

1. `findUnique` by `id` → `NotFoundException` if missing.
2. Normalize `fullName`, `phone`, `email`.
3. `prisma.client.update` — **do not change `nationalId`**.
4. Return `ClientResponseDto`.

#### `update-client.dto.ts`

```typescript
export class UpdateClientDto {
  @IsString() @Length(2, 150) fullName: string;
  @IsOptional() @IsString() @Matches(/^[0-9]{8,15}$/) phone?: string;
  @IsOptional() @IsEmail() email?: string;
}
```

---

### Step 5: Conflict Response with `existingClient`

- **Requirement:** US-003 `409` body includes `existingClient` object.
- **Implementation options:**
  - **A)** Custom exception class `ClientNationalIdConflictException` + filter extends response.
  - **B)** `throw new ConflictException({ message: '...', existingClient: dto })` if global filter preserves object shape.

**Target response:**

```json
{
  "statusCode": 409,
  "message": "Client with this national ID already exists",
  "error": "Conflict",
  "existingClient": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789",
    "phone": "88887777",
    "email": "juan@email.com"
  }
}
```

- **File:** Update `http-exception.filter.ts` if needed to pass through `existingClient` on conflict responses.

---

### Step 6: ClientsController

- **File:** `apps/api/src/modules/clients/clients.controller.ts`

```typescript
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MECHANIC')
export class ClientsController {
  @Get('search')
  search(@Query() query: SearchClientsQueryDto): Promise<ClientSearchResponseDto>

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<ClientResponseDto>

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateClientDto): Promise<ClientResponseDto>

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResponseDto>
}
```

- **Route order:** Register `@Get('search')` **before** `@Get(':id')` to avoid `search` parsed as id.
- **Auth:** Unauthenticated → `401`; wrong role N/A (both roles allowed).

---

### Step 7: ClientsModule Registration

- **File:** `apps/api/src/modules/clients/clients.module.ts`

```typescript
@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
```

- Register in `AppModule`.
- No import from `UsersModule` required.

---

### Step 8: Unit Tests — ClientsService

- **File:** `apps/api/src/modules/clients/clients.service.spec.ts`
- **Coverage:** ≥ 90%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Search** | `q` matches fullName fragment | Returns matches, case insensitive |
| **Search** | `q` matches phone digits | Returns client |
| **Search** | `nationalId` exact | Single result or empty |
| **Search** | `q` length 2+ no matches | `{ items: [], total: 0 }` |
| **Create** | Valid client | Returns DTO, normalized email |
| **Create** | Duplicate nationalId | Conflict with `existingClient` |
| **Create** | Prisma P2002 on create | Same 409 handling |
| **FindById** | Valid id | Client DTO |
| **Update** | Valid id | Returns updated DTO; nationalId unchanged |
| **Update** | Unknown id | `NotFoundException` |
| **Edge** | Optional phone/email omitted | Stored as null |
| **Edge** | Email duplicate allowed | Two clients same email OK |

---

### Step 9: E2E Tests — ClientsController

- **File:** `apps/api/test/clients.e2e-spec.ts`

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/clients/search?q=Juan` as ADMIN | `200`, items array |
| 2 | `GET /api/clients/search?nationalId=1-2345-6789` | `200`, match or empty |
| 3 | `GET /api/clients/search` no params | `400` |
| 4 | `GET /api/clients/search?q=a` | `200`, `[]` (if short q policy) |
| 5 | `GET /api/clients/:id` valid | `200` |
| 6 | `GET /api/clients/:id` unknown | `404` |
| 7 | `POST /api/clients` valid as MECHANIC | `201` |
| 8 | `POST /api/clients` valid as ADMIN | `201` |
| 9 | `POST /api/clients` duplicate nationalId | `409`, `existingClient` present |
| 10 | `POST /api/clients` missing fullName | `400` |
| 11 | `GET /api/clients/search` no token | `401` |
| 12 | Create then search by name | New client appears |
| 13 | `PATCH /api/clients/:id` valid as MECHANIC | `200`, updated fields |
| 14 | `PATCH /api/clients/:id` unknown | `404` |
| 15 | `PATCH /api/clients/:id` missing fullName | `400` |

- Use seeded clients + unique nationalIds per test run (timestamp suffix) to avoid collisions.

---

### Step 10: Update Technical Documentation

1. Add `Client` to data model docs (`readme.md` §3 already has it — verify alignment).
2. Add clients endpoints to `docs/api-spec.yml` fragment.
3. Update `apps/api/README.md` with search/create examples.
4. Document `409` + `existingClient` response shape.

---

## Implementation Order

1. Step 0 — Branch `feature/US-003-backend`
2. Step 1 — Prisma Client + migration + seed
3. Step 2 — Normalizer utilities
4. Step 3 — DTOs
5. Step 8 (red) — Unit tests
6. Step 4 — `ClientsService`
7. Step 5 — Conflict response handling
8. Step 8 (green) — Unit tests
9. Step 6 — `ClientsController` (mind route order)
10. Step 7 — Module registration
11. Step 9 — E2E tests
12. Step 10 — Documentation

---

## Testing Checklist

- [ ] Migration applies cleanly
- [ ] Seed clients searchable
- [ ] Search `q` and `nationalId` work for ADMIN and MECHANIC
- [ ] Create returns `201`; duplicate `nationalId` returns `409` + `existingClient`
- [ ] Update returns `200`; `nationalId` remains immutable
- [ ] No delete routes exist
- [ ] `GET :id` works for US-004 client picker integration
- [ ] Unit + e2e green; service ≥ 90% coverage

---

## Error Response Format

### Standard errors

```json
{
  "statusCode": 400,
  "message": ["fullName must be longer than..."],
  "error": "Bad Request"
}
```

### HTTP status mapping (US-003)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | DTO validation | Field errors |
| `400` | Search without `q` or `nationalId` | `At least one search parameter is required` |
| `401` | No JWT | `Unauthorized` |
| `404` | Client id not found | `Not Found` |
| `409` | Duplicate `nationalId` | `Client with this national ID already exists` + **`existingClient`** |

---

## Partial Update Support

`PATCH /api/clients/:id` updates `fullName`, `phone`, and `email`. `nationalId` is not accepted in the request body.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-001** | Auth guards, `apps/api` |
| **Prisma** | New `Client` migration |
| **US-004** | Consumes `GET /clients/:id` and `clientId` on vehicle create |

No new npm packages beyond US-001 stack.

---

## Notes

- **Roles:** Both `ADMIN` and `MECHANIC` — unlike US-002 (admin only).
- **Anti-duplicate:** `nationalId` is the business key; email is **not** unique in MVP.
- **Performance:** Indexes on `fullName`, `phone`, unique on `nationalId`; limit 20 results.
- **US-004 prep:** `Client` model will gain `VehicleOwnership[]` relation in US-004 migration — no `Vehicle` direct FK on Client yet.
- **Language:** Code and API messages in **English**; UI Spanish is frontend concern.
- **Branch:** `feature/US-003-backend` from `feature-entrega2-RFM`.

---

## Next Steps After Implementation

1. `/plan-backend-ticket @us/US-004-registro-vehiculos.md`
2. `/plan-frontend-ticket @us/US-003-registro-clientes.md`
3. Merge `feature/US-003-backend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Normalization centralized; no duplicate logic in controller
- [ ] `ParseUUIDPipe` on `:id`

### Functionality

- [ ] Search-first workflow supported by API
- [ ] 409 payload enables UI `ExistingClientAlert`

### Testing

- [ ] All unit + e2e scenarios pass

### Integration

- [ ] Client immediately searchable after create
- [ ] Ready for `vehicles/new?clientId=` frontend flow

### Documentation

- [ ] Step 10 complete
