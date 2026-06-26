# Backend Implementation Plan: US-001 Authentication

## Overview

Implement the **authentication and session management** backend for MecaTrack (US-001). This is the **first executable backend slice** of entrega 2: bootstrap `apps/api` (NestJS + Prisma + PostgreSQL), define the `User` model, and expose auth endpoints (`login`, `refresh`, `logout`, `me`) with JWT access tokens, stateful refresh tokens in `httpOnly` cookies, RBAC guards, and rate limiting on login.

**Architecture principles:** modular monolith, vertical slice by feature (`auth` module), layered flow **Controller → Service → Prisma**, DTO validation with `class-validator`, and TDD (failing tests first).

**User story reference:** [`us/US-001-autenticacion.md`](../../us/US-001-autenticacion.md)

**Out of scope (US-001 backend):** password reset, OAuth, MFA, user CRUD (US-002), frontend (separate `plan-frontend-ticket`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-001 artifacts |
|-------|----------------|------------------|
| **Presentation** | HTTP, DTOs, guards, cookies | `AuthController`, DTOs, `JwtAuthGuard`, `RolesGuard`, `ThrottlerGuard` |
| **Application** | Auth use cases, token lifecycle | `AuthService` |
| **Infrastructure** | DB, hashing, JWT | `PrismaService`, `bcrypt`, `@nestjs/jwt`, `passport-jwt` |
| **Domain** | User rules (active account, roles) | Enforced in `AuthService`; `UserRole` enum in Prisma |

### Target file tree (new — greenfield)

```
apps/api/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── jest.config.js
├── .env.example
├── prisma/
│   ├── schema.prisma          # User + UserRole (minimal for US-001)
│   ├── migrations/
│   └── seed.ts                # 1 ADMIN + 1 MECHANIC
├── src/
│   ├── main.ts                # Global prefix /api, CORS, cookie-parser
│   ├── app.module.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   └── constants/
│   │       └── auth.constants.ts
│   └── modules/
│       └── auth/
│           ├── auth.module.ts
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           ├── auth.service.spec.ts
│           ├── auth.controller.e2e-spec.ts
│           ├── strategies/
│           │   └── jwt.strategy.ts
│           └── dto/
│               ├── login.dto.ts
│               ├── auth-response.dto.ts
│               └── user-payload.dto.ts
docker-compose.yml             # PostgreSQL (repo root)
.env.example                   # Root or apps/api — document DATABASE_URL, JWT_*
```

### API endpoints (US-001)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | Public | Credentials → accessToken + Set-Cookie refresh |
| `POST` | `/api/auth/refresh` | Cookie | New accessToken |
| `POST` | `/api/auth/logout` | Bearer + Cookie | Revoke refresh, clear cookie |
| `GET` | `/api/auth/me` | Bearer | Current user profile |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** Create and switch to backend feature branch (separate from entrega umbrella branch).
- **Branch naming (required):** `feature/US-001-backend`
- **Implementation Steps:**
  1. Ensure `feature-entrega2-RFM` is up to date: `git pull origin feature-entrega2-RFM`
  2. Create branch: `git checkout -b feature/US-001-backend`
  3. Verify: `git branch --show-current`
- **Notes:** Do not implement on `feature-entrega2-RFM` directly; keep backend concerns isolated for review and PR.

---

### Step 1: Bootstrap API Application and Database

- **Files:** `apps/api/*`, `docker-compose.yml`, `.env.example`
- **Action:** Scaffold NestJS app and PostgreSQL for local development.
- **Implementation Steps:**
  1. Create `apps/api` with NestJS CLI (`nest new api --package-manager npm`) or equivalent manual scaffold inside monorepo.
  2. Add dependencies:
     - `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`
     - `@prisma/client`, `prisma` (dev)
     - `bcrypt`, `cookie-parser`, `class-validator`, `class-transformer`
     - `@nestjs/throttler` (login rate limit)
  3. Add root `docker-compose.yml` with PostgreSQL 16 service (`postgres:5432`, db `mecatrack`).
  4. Configure `PrismaService` + `PrismaModule` (global).
  5. Set `main.ts`:
     - Global prefix `api`
     - `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`)
     - `cookie-parser`
     - CORS: `origin` from `CORS_ORIGIN`, `credentials: true`
  6. Create `.env.example` with:
     - `DATABASE_URL`
     - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
     - `JWT_ACCESS_TTL=15m`, `JWT_REFRESH_TTL=7d`
     - `CORS_ORIGIN=http://localhost:3000`
     - `NODE_ENV=development`
  7. Add npm scripts: `dev`, `build`, `test`, `test:e2e`, `prisma:migrate`, `prisma:seed`
- **Notes:** No secrets in repo. Use English for code, comments, and error messages per `docs/base-standards.mdc`.

---

### Step 2: Prisma Schema — User Model

- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Define `User` and `UserRole` for US-001 (minimal schema; other models added in later US).
- **Implementation Steps:**
  1. Add `generator client` and `datasource db` (PostgreSQL).
  2. Define enum `UserRole { ADMIN MECHANIC }`.
  3. Define model `User`:

```prisma
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String
  fullName              String
  role                  UserRole
  active                Boolean   @default(true)
  refreshTokenHash      String?
  refreshTokenExpiresAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

  4. Run `npx prisma migrate dev --name init_user`.
  5. Create `prisma/seed.ts`:
     - Admin: `admin@taller.com` / `AdminPass123` / `ADMIN`
     - Mechanic: `mechanic@taller.com` / `MechanicPass123` / `MECHANIC`
     - Hash passwords with bcrypt (cost 10+)
     - Document seed credentials in `apps/api/README.md` (not production secrets)
- **Dependencies:** `bcrypt`, `@prisma/client`

---

### Step 3: DTOs and Validation

- **Files:** `apps/api/src/modules/auth/dto/*.ts`
- **Action:** Request/response contracts with `class-validator`.

#### `login.dto.ts`

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

#### `auth-response.dto.ts` / `user-payload.dto.ts`

- `AuthResponseDto`: `{ accessToken: string; user: UserPayloadDto }`
- `UserPayloadDto`: `{ id, email, fullName, role }` — **never** `passwordHash`
- `MeResponseDto`: adds `active: boolean`

- **Validation rules:**
  - Invalid email / empty password → `400 Bad Request` (field-level messages from ValidationPipe)
  - Normalize `email` to lowercase in service before lookup

---

### Step 4: AuthService — Core Business Logic

- **File:** `apps/api/src/modules/auth/auth.service.ts`
- **Action:** Implement authentication use cases (TDD: write `auth.service.spec.ts` first).

#### Method signatures

```typescript
login(dto: LoginDto): Promise<AuthResponseDto>
refresh(refreshToken: string): Promise<{ accessToken: string }>
logout(userId: string): Promise<void>
getMe(userId: string): Promise<MeResponseDto>
validateUser(email: string, password: string): Promise<User | null>
issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }>
revokeRefreshToken(userId: string): Promise<void>
hashRefreshToken(token: string): string
```

#### Implementation Steps

1. **`validateUser`:**
   - Find user by email (lowercase).
   - If not found → return `null` (caller maps to generic 401).
   - If `active === false` → throw `ForbiddenException('Your account is inactive. Contact the workshop administrator.')`.
   - Compare password with `bcrypt.compare`; if false → return `null`.

2. **`login`:**
   - Call `validateUser`; if null → `UnauthorizedException('Invalid email or password')`.
   - Call `issueTokens`; persist `refreshTokenHash` + `refreshTokenExpiresAt` on user.
   - Return `accessToken` + safe user payload.

3. **`issueTokens`:**
   - Access JWT: payload `{ sub, email, role }`, TTL from `JWT_ACCESS_TTL`.
   - Refresh token: cryptographically random string (e.g. `randomBytes(32).toString('hex')`).
   - Store **hash** of refresh token in DB (SHA-256 or bcrypt); never store plain refresh token.

4. **`refresh`:**
   - Hash incoming cookie token; find user where hash matches and `refreshTokenExpiresAt > now()`.
   - If not found → `UnauthorizedException`.
   - Issue new access token only (optional: rotate refresh — MVP can reuse same refresh).

5. **`logout`:**
   - Set `refreshTokenHash = null`, `refreshTokenExpiresAt = null` for user.

6. **`getMe`:**
   - Load user by id; if missing → `UnauthorizedException`.
   - Return public fields including `active`.

- **Implementation Notes:**
  - Never log `password`, `accessToken`, or raw `refreshToken`.
  - Log failed login attempts with email only (or hashed identifier).

---

### Step 5: JWT Strategy and Guards

- **Files:**
  - `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
  - `apps/api/src/common/guards/jwt-auth.guard.ts`
  - `apps/api/src/common/guards/roles.guard.ts`
  - `apps/api/src/common/decorators/roles.decorator.ts`
  - `apps/api/src/common/decorators/current-user.decorator.ts`

#### `JwtStrategy`

- Extract JWT from `Authorization: Bearer <token>`.
- Validate signature with `JWT_ACCESS_SECRET`.
- `validate(payload)` → `{ userId: payload.sub, email, role }`.

#### `RolesGuard`

- Read `@Roles('ADMIN', 'MECHANIC')` metadata.
- Compare `request.user.role` with required roles; else `403 Forbidden`.

#### `JwtAuthGuard`

- Extend `AuthGuard('jwt')`; used on `GET /me` and future protected routes.

- **Note:** Register a **health** or **protected sample** route in a follow-up US to verify guards; US-001 only needs `GET /me`.

---

### Step 6: AuthController and Cookie Handling

- **File:** `apps/api/src/modules/auth/auth.controller.ts`
- **Action:** Wire HTTP layer; set/clear refresh cookie.

#### `POST /auth/login`

- `@Throttle({ default: { limit: 5, ttl: 900000 } })` — 5 req / 15 min per IP (configure `@nestjs/throttler`).
- Call `authService.login(dto)`.
- Set cookie `refreshToken`:
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === 'production'`
  - `sameSite: 'strict'`
  - `path: '/api/auth'`
  - `maxAge: 7 days`
- Return `200` + `{ accessToken, user }`.

#### `POST /auth/refresh`

- Read `req.cookies.refreshToken`.
- Return `{ accessToken }`.

#### `POST /auth/logout`

- `@UseGuards(JwtAuthGuard)` (optional but recommended).
- `@CurrentUser() user` → `authService.logout(user.userId)`.
- Clear cookie (`maxAge: 0`).
- Return `204 No Content`.

#### `GET /auth/me`

- `@UseGuards(JwtAuthGuard)`.
- Return `authService.getMe(user.userId)`.

- **File:** `apps/api/src/modules/auth/auth.module.ts`
  - Import `JwtModule.registerAsync`, `PassportModule`, `ThrottlerModule`.
  - Export `AuthService`, `JwtAuthGuard`, `RolesGuard` for US-002+.

---

### Step 7: Global Exception Filter

- **File:** `apps/api/src/common/filters/http-exception.filter.ts`
- **Action:** Consistent error JSON:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

- Map `UnauthorizedException`, `ForbiddenException`, `BadRequestException`, `ThrottlerException` (429).
- Register globally in `main.ts`.

---

### Step 8: Unit Tests — AuthService

- **File:** `apps/api/src/modules/auth/auth.service.spec.ts`
- **Action:** TDD coverage ≥ 90% for service.

#### Test cases

| Category | Scenario | Expected |
|----------|----------|----------|
| **Success** | Valid credentials, active user | Returns tokens + user payload |
| **Success** | `getMe` with valid id | Returns user without passwordHash |
| **Success** | `logout` | Clears refreshTokenHash in DB |
| **Success** | `refresh` with valid cookie token | New accessToken |
| **Validation** | Wrong password | `UnauthorizedException`, generic message |
| **Validation** | Unknown email | Same as wrong password (no user enumeration) |
| **Validation** | Inactive user | `ForbiddenException`, inactive message |
| **Validation** | Expired refresh token | `UnauthorizedException` |
| **Edge** | Email normalized to lowercase on login | User found |

- **Mocking:** `PrismaService` with `jest.mock`; bcrypt with known hash fixtures.

---

### Step 9: E2E Integration Tests — AuthController

- **File:** `apps/api/test/auth.e2e-spec.ts` (or `auth.controller.e2e-spec.ts`)
- **Action:** Full HTTP tests with test database.

#### Setup

- Use separate `DATABASE_URL` for tests (e.g. `mecatrack_test`).
- Run migrations before suite; seed admin + mechanic.
- `beforeEach` / `afterAll` cleanup strategy documented.

#### Test cases

| # | Request | Expected |
|---|---------|----------|
| 1 | `POST /api/auth/login` valid mechanic | `200`, `accessToken`, `Set-Cookie` refreshToken |
| 2 | `POST /api/auth/login` wrong password | `401`, generic message |
| 3 | `POST /api/auth/login` inactive user | `403`, inactive message |
| 4 | `POST /api/auth/login` invalid email format | `400` |
| 5 | `GET /api/auth/me` with Bearer | `200`, user object |
| 6 | `GET /api/auth/me` without token | `401` |
| 7 | `POST /api/auth/refresh` with cookie | `200`, new accessToken |
| 8 | `POST /api/auth/refresh` without cookie | `401` |
| 9 | `POST /api/auth/logout` | `204`, cookie cleared |
| 10 | `POST /api/auth/login` 6th attempt in window | `429` |

---

### Step 10: Update Technical Documentation

- **Action:** Mandatory before marking US-001 backend complete.
- **Implementation Steps:**
  1. Update `readme.md` §1.4 with local API startup steps (migrate, seed, `npm run dev` in `apps/api`).
  2. Add `apps/api/README.md` with env vars and seed users.
  3. Update `docs/api-spec.yml` — replace LTI template with MecaTrack auth paths (login, refresh, logout, me) or add `docs/api-spec.auth.yml` fragment.
  4. Confirm `docs/data-model.md` references MecaTrack `User` or point to `readme.md` §3.
  5. Document auth module in architecture if needed.
- **Language:** English for technical docs per `docs/documentation-standards.mdc`.

---

## Implementation Order

1. Step 0 — Create branch `feature/US-001-backend`
2. Step 1 — Bootstrap NestJS + Docker PostgreSQL
3. Step 2 — Prisma User model + migration + seed
4. Step 3 — DTOs
5. Step 8 (red) — Write failing unit tests for `AuthService`
6. Step 4 — Implement `AuthService`
7. Step 8 (green) — Unit tests pass
8. Step 5 — JWT strategy + guards
9. Step 6 — `AuthController` + cookies
10. Step 7 — Exception filter
11. Step 9 (red/green) — E2E tests
12. Step 10 — Documentation updates

---

## Testing Checklist

- [ ] `npm test` — unit tests pass, auth service ≥ 90% coverage
- [ ] `npm run test:e2e` — all auth e2e scenarios pass
- [ ] `npx prisma migrate dev` succeeds on clean DB
- [ ] `npx prisma db seed` creates admin + mechanic
- [ ] Manual: login returns JWT + httpOnly cookie
- [ ] Manual: inactive user cannot login
- [ ] Manual: logout invalidates refresh; subsequent refresh returns 401
- [ ] No passwords or tokens in application logs

---

## Error Response Format

Standard NestJS / custom filter shape:

```json
{
  "statusCode": number,
  "message": string | string[],
  "error": string
}
```

### HTTP status mapping (US-001)

| Status | Condition | `message` (example) |
|--------|-----------|---------------------|
| `400` | DTO validation failure | Field errors array |
| `401` | Invalid credentials | `Invalid email or password` |
| `401` | Missing/invalid access token | `Unauthorized` |
| `401` | Invalid/expired refresh token | `Unauthorized` |
| `403` | Inactive account | `Your account is inactive. Contact the workshop administrator.` |
| `403` | Wrong role (future routes) | `Forbidden` |
| `429` | Login rate limit exceeded | `Too Many Requests` |

---

## Partial Update Support

Not applicable — US-001 auth endpoints do not support partial updates.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | Framework |
| `@nestjs/config` | Environment variables |
| `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` | JWT auth |
| `@nestjs/throttler` | Login rate limiting |
| `@prisma/client`, `prisma` | ORM |
| `bcrypt` | Password hashing |
| `cookie-parser` | Refresh token cookie |
| `class-validator`, `class-transformer` | DTO validation |
| `jest`, `supertest`, `@nestjs/testing` | Tests |

**Runtime:** Node.js 20+, PostgreSQL 16 (Docker).

---

## Notes

- **Stack:** MecaTrack uses **NestJS** (see `readme.md` §2), not Express — adapt DDD layering to Nest modules/guards/DI.
- **Greenfield:** `apps/api` does not exist yet; Step 1 is required before auth module.
- **US-002 dependency:** This US creates `User` entity and exports guards for user management.
- **Security:** Generic message on failed login; never reveal whether email exists.
- **Refresh token:** Stateful (hash in DB) enables logout and US-002 deactivation to invalidate sessions.
- **Language:** Code, tests, logs, and API error messages in **English** (`docs/base-standards.mdc`).
- **Branch:** Parent delivery branch is `feature-entrega2-RFM`; implementation branch is `feature/US-001-backend`.

---

## Next Steps After Implementation

1. Run `/plan-frontend-ticket @us/US-001-autenticacion.md` for login UI and `apiClient`.
2. Merge `feature/US-001-backend` → `feature-entrega2-RFM`.
3. Proceed to US-002 backend (reuses `User` + guards).
4. Add OpenAPI fragment to `readme.md` §4 during entrega 2.

---

## Implementation Verification

### Code Quality

- [ ] TypeScript strict mode; no `any` in auth module
- [ ] ESLint passes
- [ ] `passwordHash` never serialized in responses

### Functionality

- [ ] All four endpoints behave per US-001 enhanced spec
- [ ] Cookie flags correct for dev/prod

### Testing

- [ ] Unit + e2e green in CI/local
- [ ] Coverage ≥ 90% auth service/controller

### Integration

- [ ] API reachable at `http://localhost:4000/api` (port configurable)
- [ ] CORS allows frontend origin with credentials

### Documentation

- [ ] Step 10 completed
- [ ] `.env.example` committed; `.env` gitignored
