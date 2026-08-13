# Backend Implementation Plan: US-002 User Management

## Overview

Implement **admin-only user management** for MecaTrack (US-002): list all users, create new employees (`ADMIN` | `MECHANIC`), and soft-deactivate accounts without deleting records. Builds on the `User` model and auth infrastructure from **US-001** (`JwtAuthGuard`, `RolesGuard`, bcrypt, Prisma).

**Architecture principles:** vertical `users` module, Controller → Service → Prisma, DTO validation, TDD, reuse shared guards from `src/common/`.

**User story reference:** [`us/US-002-gestion-usuarios.md`](../../us/US-002-gestion-usuarios.md)

**Prerequisite:** US-001 backend merged or available on branch (`apps/api`, `User` in Prisma, auth working).

**Out of scope:** update profile, reactivate user, physical `DELETE`, password reset, `mustChangePassword` (V2), frontend (`plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-002 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, DTOs, guards | `UsersController`, `CreateUserDto`, `@Roles('ADMIN')` |
| **Application** | User lifecycle rules | `UsersService` |
| **Infrastructure** | Persistence, hashing | `PrismaService`, `bcrypt`; token revocation via `AuthService` or shared helper |
| **Domain** | Business invariants | Last active admin, no self-deactivate, unique email |

### Files to add/modify

```
apps/api/src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.service.spec.ts
├── users.controller.e2e-spec.ts
└── dto/
    ├── create-user.dto.ts
    ├── user-response.dto.ts
    └── deactivate-user-params.dto.ts   # optional UUID pipe validation

apps/api/src/modules/auth/
└── auth.service.ts                     # export revokeRefreshToken (if not already)

apps/api/src/app.module.ts              # import UsersModule
```

### API endpoints (US-002)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/users` | Bearer | `ADMIN` | List all users (active + inactive) |
| `POST` | `/api/users` | Bearer | `ADMIN` | Create active user |
| `PATCH` | `/api/users/:id/deactivate` | Bearer | `ADMIN` | Soft-deactivate user |

**No** `PUT`, `PATCH` (general), or `DELETE` endpoints in MVP.

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-002-backend`
- **Implementation Steps:**
  1. Base branch: `feature-entrega2-RFM` (with US-001 backend merged or rebased).
  2. `git checkout feature-entrega2-RFM && git pull`
  3. `git checkout -b feature/US-002-backend`
  4. Verify US-001 auth e2e tests still pass before new work.

---

### Step 1: DTOs and Response Mapping

- **Files:** `apps/api/src/modules/users/dto/*.ts`

#### `create-user.dto.ts`

```typescript
export class CreateUserDto {
  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

#### `user-response.dto.ts`

```typescript
export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;  // include on deactivate response
}
```

#### Mapping helper

- **File:** `users.service.ts` or `users.mapper.ts`
- **Function:** `toUserResponse(user: User): UserResponseDto` — **omit** `passwordHash`, `refreshTokenHash`, `refreshTokenExpiresAt`.

- **Validation:** Invalid DTO → `400` via global `ValidationPipe`.

---

### Step 2: UsersService — Business Logic

- **File:** `apps/api/src/modules/users/users.service.ts`
- **Action:** Implement use cases (write `users.service.spec.ts` first — TDD).

#### Method signatures

```typescript
findAll(): Promise<UserResponseDto[]>
create(dto: CreateUserDto, actorId: string): Promise<UserResponseDto>
deactivate(userId: string, actorId: string): Promise<UserResponseDto>
countActiveAdmins(excludeUserId?: string): Promise<number>
```

#### `findAll`

1. Query `prisma.user.findMany`.
2. Order: `active desc`, then `fullName asc` (Prisma: `[{ active: 'desc' }, { fullName: 'asc' }]`).
3. Map to `UserResponseDto[]`.

#### `create`

1. Normalize `email` to lowercase trim.
2. Check existing user by email (including inactive) → `ConflictException('This email is already registered')` (`409`).
3. Hash `password` with bcrypt (cost ≥ 10).
4. Insert user: `active: true`, `passwordHash`, `fullName`, `role`.
5. Log structured: `{ event: 'user.created', actorId, userId }` (no password).
6. Return `UserResponseDto`.

#### `deactivate`

1. Load user by `id` → `NotFoundException` if missing (`404`).
2. If `!user.active` → `ConflictException('User is already inactive')` (`409`).
3. If `userId === actorId` → `BadRequestException('You cannot deactivate your own account')` (`400`).
4. If `user.role === ADMIN`:
   - `activeAdmins = await countActiveAdmins(userId)` (admins with `active=true`, excluding target).
   - If `activeAdmins < 1` → `BadRequestException('At least one active administrator is required')` (`400`).
5. Update in transaction:
   - `active: false`
   - `refreshTokenHash: null`, `refreshTokenExpiresAt: null`
6. Log: `{ event: 'user.deactivated', actorId, userId }`.
7. Return updated `UserResponseDto`.

- **Dependencies:** `PrismaService`, `AuthService` (optional — for `revokeRefreshToken` reuse), `Logger`
- **Notes:** Do **not** delete row; do **not** modify FK references (WorkOrder etc. — future US-005).

---

### Step 3: UsersController

- **File:** `apps/api/src/modules/users/users.controller.ts`

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  @Get()
  findAll(): Promise<UserResponseDto[]>

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateUserDto, @CurrentUser() actor): Promise<UserResponseDto>

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor): Promise<UserResponseDto>
}
```

- **Guards:** All routes require JWT + `ADMIN`. `MECHANIC` → `403 Forbidden` (verified in e2e).
- **Param validation:** `ParseUUIDPipe` on `:id` → `400` for invalid UUID.

---

### Step 4: UsersModule and App Registration

- **File:** `apps/api/src/modules/users/users.module.ts`

```typescript
@Module({
  imports: [AuthModule],  // if AuthService exported for token revocation
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // optional for US-005 mechanic list
})
export class UsersModule {}
```

- **File:** `apps/api/src/app.module.ts` — add `UsersModule` to imports.
- **File:** `apps/api/src/modules/auth/auth.module.ts` — `exports: [AuthService, JwtAuthGuard, RolesGuard]` if not already.

---

### Step 5: Cross-Cutting — Auth Integration

- **File:** `apps/api/src/modules/auth/auth.service.ts`
- **Action:** Confirm US-001 behavior (no code change if already correct):

| Scenario | Expected |
|----------|----------|
| Login `active=false` | `403` inactive message |
| Login after deactivate | `403` (deactivate clears refresh + sets active false) |
| Refresh after deactivate | `401` (refresh hash null) |

- **Optional refactor:** Extract `revokeUserSessions(userId: string)` in `AuthService`; call from `UsersService.deactivate` to avoid duplicating token-clear logic.

- **Integration test:** After `PATCH deactivate`, `POST /auth/login` with same credentials → `403`.

---

### Step 6: Unit Tests — UsersService

- **File:** `apps/api/src/modules/users/users.service.spec.ts`
- **Coverage target:** ≥ 90%

| Category | Scenario | Expected |
|----------|----------|----------|
| **Success** | `create` valid MECHANIC | `201` payload, bcrypt hash stored |
| **Success** | `findAll` | Sorted active first, no passwordHash |
| **Success** | `deactivate` active mechanic | `active=false`, tokens cleared |
| **Conflict** | Duplicate email (active) | `ConflictException` |
| **Conflict** | Duplicate email (inactive) | `ConflictException` |
| **Conflict** | Deactivate already inactive | `ConflictException` |
| **Bad request** | Deactivate self | `BadRequestException` |
| **Bad request** | Deactivate last active ADMIN | `BadRequestException` |
| **Not found** | Deactivate unknown id | `NotFoundException` |
| **Edge** | Email normalized on create | lowercase stored |

- **Mock:** `PrismaService`; spy `bcrypt.hash`.

---

### Step 7: E2E Tests — UsersController

- **File:** `apps/api/test/users.e2e-spec.ts`

#### Setup

- Seed: at least 1 `ADMIN` (admin@taller.com), 1 `MECHANIC`.
- Helper: `loginAsAdmin()` → `{ accessToken }`.
- Helper: `loginAsMechanic()` → `{ accessToken }`.

#### Test cases

| # | Request | Expected |
|---|---------|----------|
| 1 | `GET /api/users` as ADMIN | `200`, array, no `passwordHash` |
| 2 | `GET /api/users` as MECHANIC | `403` |
| 3 | `GET /api/users` no token | `401` |
| 4 | `POST /api/users` valid body as ADMIN | `201`, `active: true` |
| 5 | `POST /api/users` duplicate email | `409` |
| 6 | `POST /api/users` as MECHANIC | `403` |
| 7 | `POST /api/users` invalid password (<8) | `400` |
| 8 | `PATCH /api/users/:id/deactivate` target mechanic | `200`, `active: false` |
| 9 | `PATCH deactivate` self (admin) | `400` |
| 10 | `PATCH deactivate` last admin | `400` |
| 11 | `PATCH deactivate` unknown id | `404` |
| 12 | `PATCH deactivate` twice same user | `409` second time |
| 13 | After deactivate mechanic → `POST /auth/login` as mechanic | `403` |
| 14 | After deactivate → `POST /auth/refresh` with old cookie | `401` |

#### Last-admin test setup

- Seed or create scenario with exactly one active ADMIN before attempting to deactivate them.

---

### Step 8: Optional — Mechanics List for US-005

- US-005 needs `GET /api/work-orders/mechanics` (active mechanics only).
- **Decision for US-002:** Either:
  - **A)** Add `UsersService.findActiveMechanics()` + endpoint in `UsersController` `@Get('mechanics')` with `@Roles('ADMIN','MECHANIC')`, or
  - **B)** Defer to US-005 in `work-orders` module.
- **Recommendation:** Defer to US-005; not required for US-002 DoD.

---

### Step 9: Update Technical Documentation

- **Implementation Steps:**
  1. Add users endpoints to `docs/api-spec.yml` (or `docs/api-spec.users.yml` fragment): `GET/POST /users`, `PATCH /users/{id}/deactivate`.
  2. Update `apps/api/README.md` with admin-only user management notes.
  3. Cross-reference US-002 in `readme.md` §6 Ticket 1 (backend) when documenting entrega 2.
  4. Confirm `readme.md` §3 `User` entity matches implementation (field `active`, not `activo`).
- **Language:** English per `docs/documentation-standards.mdc`.

---

## Implementation Order

1. Step 0 — Branch `feature/US-002-backend`
2. Step 1 — DTOs + response mapper
3. Step 6 (red) — Failing unit tests
4. Step 2 — `UsersService`
5. Step 6 (green) — Unit tests pass
6. Step 3 — `UsersController`
7. Step 4 — `UsersModule` registration
8. Step 5 — Verify auth integration + add cross-test
9. Step 7 — E2E tests
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] `npm test` — users service ≥ 90% coverage
- [ ] `npm run test:e2e` — all users + auth integration scenarios pass
- [ ] ADMIN can create MECHANIC; new user can login
- [ ] MECHANIC receives `403` on all `/api/users` routes
- [ ] Deactivated user cannot login or refresh
- [ ] Last active admin cannot be deactivated
- [ ] Admin cannot deactivate own account
- [ ] No `password` or `passwordHash` in API responses or logs

---

## Error Response Format

Same global filter as US-001:

```json
{
  "statusCode": 409,
  "message": "This email is already registered",
  "error": "Conflict"
}
```

### HTTP status mapping (US-002)

| Status | Condition | `message` |
|--------|-----------|-----------|
| `400` | Validation error | Field messages |
| `400` | Deactivate self | `You cannot deactivate your own account` |
| `400` | Deactivate last admin | `At least one active administrator is required` |
| `401` | Missing/invalid JWT | `Unauthorized` |
| `403` | MECHANIC access | `Forbidden` |
| `404` | User id not found | `Not Found` |
| `409` | Email duplicate | `This email is already registered` |
| `409` | Already inactive | `User is already inactive` |

---

## Partial Update Support

Not applicable — only full create and deactivate operations; no `PATCH` for partial user fields.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-001** | `User` model, `JwtAuthGuard`, `RolesGuard`, `AuthService`, bcrypt pattern |
| **Prisma** | No new migration if `User` from US-001 is complete |
| **NestJS** | `@nestjs/common`, existing `class-validator` setup |

No new npm packages required beyond US-001.

---

## Notes

- **Field naming:** Use `active` (English), not `activo`, per Prisma schema and `docs/base-standards.mdc`.
- **Historical integrity:** Deactivation is logical only; FKs to `User` remain for future `WorkOrder` (US-005).
- **Security:** Only `ADMIN` manages users; never return or log passwords.
- **Reactivation:** Explicitly out of scope — no endpoint; inactive users stay inactive until V2.
- **Concurrency:** Last-admin check should run inside transaction with `deactivate` update to avoid race if two admins deactivate simultaneously (use `prisma.$transaction` + re-count).
- **Branch:** Parent `feature-entrega2-RFM`; implementation `feature/US-002-backend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/US-002-gestion-usuarios.md` — `/admin/users` UI.
2. Merge `feature/US-002-backend` → `feature-entrega2-RFM`.
3. US-003 / US-004 can proceed in parallel (both roles use auth).
4. US-005 will consume active mechanics list.

---

## Implementation Verification

### Code Quality

- [ ] Strict TypeScript; no password leakage in DTOs/responses
- [ ] `UsersService` single responsibility; deactivate rules testable

### Functionality

- [ ] All three endpoints match US-002 enhanced spec
- [ ] Sort order: active first, then `fullName` asc

### Testing

- [ ] Unit + e2e green; US-001 login integration after deactivate

### Integration

- [ ] `UsersModule` registered; guards applied consistently

### Documentation

- [ ] Step 9 complete; API spec updated
