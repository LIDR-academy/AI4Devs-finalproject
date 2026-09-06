# Backend Implementation Plan: US-M1 Native Auth Refresh (Android)

## Overview

Extend existing auth so a **native Android client** can receive and rotate a **refresh token without relying on the httpOnly cookie**. Web contract stays unchanged: login JSON has no `refreshToken` unless header `X-MecaTrack-Client: mobile` is present; cookie refresh still works.

No Prisma migration. No new npm packages. No change to JWT TTL, secrets, `User` model, login rate limit, or `apps/web`.

**Architecture principles:** Nest `auth` module (Controller → Service); TDD; English API messages; cookie path `/api/auth` unchanged; US-012 rotation/revocation unchanged; US-014 generic login failures unchanged.

**User story:** [`us/movil/US-M1-autenticacion-android.md`](../../us/movil/US-M1-autenticacion-android.md)

**Android plan:** [`docs/plans/US-M1_android.md`](./US-M1_android.md) (write **after** this backend DoD)

**Prerequisites:** US-001 (`POST /login`, cookie refresh, logout, me); US-012 (`sessionVersion`, refresh rotation).

**Out of scope:** Android UI, EncryptedSharedPreferences, in-progress list (US-M2), intake wizard (US-M3), changing access TTL, CORS (native HTTP does not use CORS), biometric login.

---

## Spike handling

A prior spike may already have touched `auth.controller.ts`, `RefreshTokenDto`, `mobile-client.util.ts`, e2e, OpenAPI, and API README.

**Do not treat that as DoD.** Execute this plan as TDD against the enhanced US:

1. If helper unit tests are **missing** → write them first (red) then implement.
2. If they already **pass** → keep them; add any **missing cases** from this plan (e2e gaps below) before calling backend done.
3. Diff spike vs this contract; delete or fix anything that leaks `refreshToken` to web JSON.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-M1 artifacts |
|-------|----------------|-----------------|
| **Presentation** | Read header/body; set cookie; shape JSON | `AuthController.login` / `refresh` |
| **Application** | Unchanged token issue/rotate | `AuthService.login` / `refresh` / `issueTokens` |
| **Domain** | Header detection; body vs cookie resolution | `mobile-client.util.ts` |
| **Infrastructure** | Cookie + Prisma refresh hash | Existing `setRefreshCookie`, `User.refreshTokenHash` |

`AuthService` already returns `{ accessToken, refreshToken, user }` internally and the controller **strips** `refreshToken` for the web. Native support is **controller + DTO + helper**, not a new token algorithm.

### Files to add/modify

```
apps/api/src/modules/auth/
├── auth.controller.ts
├── dto/refresh-token.dto.ts              # NEW (optional string body)
├── dto/auth-response.dto.ts              # MOD: optional refreshToken on responses
├── utils/mobile-client.util.ts           # NEW
└── utils/mobile-client.util.spec.ts      # NEW

apps/api/src/common/constants/auth.constants.ts   # MOD: header name/value (optional but preferred)
apps/api/test/auth.e2e-spec.ts                    # MOD
docs/api-spec.auth.yml                            # MOD
apps/api/README.md                                # MOD (login/refresh rows)
```

**Do not modify:** `auth.service.ts` token hashing (unless a test proves a bug), Prisma schema, web auth client, CORS.

### API contract (locked)

| Method | Path | Auth | Change |
|--------|------|------|--------|
| `POST` | `/api/auth/login` | Public + throttle | If header mobile → JSON includes `refreshToken`; always set cookie |
| `POST` | `/api/auth/refresh` | Public | Body `{ refreshToken? }` **or** cookie; native JSON includes rotated refresh |
| `POST` | `/api/auth/logout` | Bearer | **No change** |
| `GET` | `/api/auth/me` | Bearer | **No change** |

**Header:** `X-MecaTrack-Client: mobile` (Express: `x-mecatrack-client`). Compare case-insensitive. Any other value = web.

**Refresh resolution:** trimmed body token wins; else trimmed cookie; else `401 Unauthorized`.

**When JSON includes rotated `refreshToken`:** body had a non-empty `refreshToken` **OR** mobile header is present.

**When JSON must omit `refreshToken`:** cookie-only refresh, no mobile header (web).

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM` (no feature branch)

- **Action:** Implement on **`finalproject-RFM`**. Do **not** create `feature/US-M1-backend`.
- **Implementation Steps:**
  1. `git checkout finalproject-RFM`
  2. `git pull origin finalproject-RFM` (if needed)
  3. `git branch --show-current` → must be `finalproject-RFM`
- **Notes:** Same delivery line as US-D10. Android app is a later plan.

---

### Step 1: Write failing unit tests for helpers (TDD)

- **File:** `apps/api/src/modules/auth/utils/mobile-client.util.spec.ts`
- **Action:** Tests for `isMobileClient` and `resolveRefreshToken` **before** (or to lock) the helper.
- **Cases (minimum):**
  1. Header `x-mecatrack-client: mobile` → `true`
  2. `Mobile` / mixed case → `true`
  3. Missing header or `web` → `false`
  4. Body token (with spaces) preferred over cookie
  5. Empty/whitespace body → fall back to cookie
  6. Both empty → `undefined`
- **Function signatures:**

```ts
export const MOBILE_CLIENT_HEADER = 'x-mecatrack-client';
export const MOBILE_CLIENT_VALUE = 'mobile';

export function isMobileClient(headers: Record<string, unknown>): boolean;
export function resolveRefreshToken(
  cookieToken: string | undefined,
  bodyToken: string | undefined,
): string | undefined;
```

- **Implementation Notes:** Prefer exporting header constants from `auth.constants.ts` and re-exporting from the util if that matches existing style. Run `npm test -- --testPathPattern=mobile-client.util.spec` → red if the util is missing.

---

### Step 2: Implement helpers + refresh DTO

- **Files:**
  - `utils/mobile-client.util.ts`
  - `dto/refresh-token.dto.ts`
  - `dto/auth-response.dto.ts` (`refreshToken?: string` on `AuthResponseDto` and `RefreshResponseDto`)
- **Refresh DTO:**

```ts
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
```

- **Implementation Steps:**
  1. Implement helpers to pass Step 1.
  2. Optional body only; ValidationPipe `forbidNonWhitelisted` remains global → extra keys → `400`.
  3. Controller will default `dto` to `{}` when the client sends no body (web cookie refresh).
- **Dependencies:** `class-validator` only.
- **Implementation Notes:** Do not put `refreshToken` as required. Empty POST refresh must still work for the web.

---

### Step 3: Wire `AuthController` (login + refresh)

- **File:** `apps/api/src/modules/auth/auth.controller.ts`
- **Action:** Inject `@Req()` on login; `@Body() dto: RefreshTokenDto = {}` on refresh.
- **Login:** keep `setRefreshCookie`; if `isMobileClient(request.headers)` return `{ ...result, refreshToken }`; else return `result` **without** refresh.
- **Refresh:** `resolveRefreshToken(cookie, dto.refreshToken)`; missing → `UnauthorizedException('Unauthorized')`; call `authService.refresh`; always `setRefreshCookie` with rotated token; include rotated token in JSON iff body token present or mobile header.
- **Implementation Notes:**
  - Do **not** change throttle on login.
  - Cast Express headers to `Record<string, unknown>` or type the helper to `IncomingHttpHeaders`.
  - Cookie flags stay: `httpOnly`, `secure` in production, `sameSite: 'strict'`, `path: REFRESH_COOKIE_PATH`.

---

### Step 4: Make unit tests green

- **File:** `mobile-client.util.spec.ts`
- **Action:** `npm test -- --testPathPattern=mobile-client.util.spec --no-coverage`
- **Notes:** No need for `AuthService` unit changes if issue/rotate already covered.

---

### Step 5: E2E API (web regression + native contract)

- **File:** `apps/api/test/auth.e2e-spec.ts`
- **Action:** Keep existing cookie tests; add native cases. Login in these tests **rotates** refresh hashes — do not reuse `beforeAll` cookies after a mobile login of the same user if a later test depends on them (login as a user whose cookies are no longer needed, or re-login).
- **Cases (minimum):**
  1. **Web login** (no header) → `200`, `accessToken` defined, `refreshToken` **undefined**, `Set-Cookie` contains refresh cookie.
  2. **Mobile login** (`X-MecaTrack-Client: mobile`) → `200`, both tokens, `user.email` matches; cookie still set.
  3. **Cookie refresh** (no body, no header) → `200`, `accessToken`, `refreshToken` **undefined**.
  4. **Refresh no cookie no body** → `401`.
  5. **Body refresh** after mobile login → `200`, new `refreshToken` **≠** previous; second call with the **old** body token → `401` (rotation).
  6. **Mobile header + cookie only** (no body) → `200` includes rotated `refreshToken` in JSON (spec: header alone is enough).
  7. **Invalid body token** → `401`.
  8. Existing: wrong password `401`; `GET /me`; logout `204`.
- **Implementation Notes:** Reuse seed `mechanic@taller.com` / `admin@taller.com`. Header name in tests: `X-MecaTrack-Client` (supertest).

---

### Step 6: Update Technical Documentation

- **Action:** English docs matching the locked contract.
- **Implementation Steps:**
  1. **`docs/api-spec.auth.yml`:** optional header on login/refresh; optional refresh body; `refreshToken` on `200` described as mobile-only; `401` for missing cookie **or** body token.
  2. **`apps/api/README.md`:** login/refresh table rows mention the header and body.
  3. No data-model / Prisma docs (no schema change).
  4. Do **not** write `apps/android/README.md` here (Android plan).
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — Stay on `finalproject-RFM`
2. Step 1 — Failing (or locking) helper unit tests
3. Step 2 — Helper + DTO
4. Step 3 — Controller
5. Step 4 — Unit tests green
6. Step 5 — E2E auth
7. Step 6 — OpenAPI + API README

---

## Testing Checklist

- [ ] Unit: mobile header true/false/case; body vs cookie vs empty
- [ ] E2E: web login omits JSON refresh; mobile login includes it; cookie refresh omits it; body refresh rotates; old token rejected; empty refresh `401`
- [ ] E2E regression: logout, me, wrong password, rate-limit suite still green
- [ ] No migration
- [ ] Lint / `tsc` clean for touched files (do not “fix” unrelated missing `sessionVersion` in old mocks unless the command is run on those files)

---

## Error Response Format

Existing `HttpExceptionFilter` (English `message`):

| Case | Status | Notes |
|------|--------|-------|
| Bad credentials / inactive (current service) | `401` | `"Invalid email or password"` |
| Missing/invalid refresh | `401` | `"Unauthorized"` |
| Validation (email, extra keys) | `400` | ValidationPipe |
| Login throttle | `429` | Unchanged |

---

## Partial Update Support

N/A — auth POST, not PATCH.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm packages | **No** |
| Prisma migration | **No** |
| Existing | `AuthService.issueTokens`, cookie helpers, `JwtAuthGuard`, throttler |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- Technical artifacts in **English**.
- **Never** put `refreshToken` in web login JSON (XSS persistence).
- Native clients ignore the cookie; still setting it is OK and keeps one code path for `issueTokens`.
- CORS unchanged; Android does not send a browser `Origin` that must be allowlisted for this delta.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` equivalent: write **`docs/plans/US-M1_android.md`** (login UI + session). Do not start US-M2.
2. `/develop` Android against that plan.
3. Commit when the user requests (backend ± Android).
4. Prod: rebuild **api** only for this delta; no DB migrate.

---

## Implementation Verification

- [ ] Code quality: typed DTOs, TDD helpers, no token logs
- [ ] Functionality: matches enhanced US-M1 §2
- [ ] Testing: unit + e2e green
- [ ] Integration: web cookie session still works
- [ ] Documentation: `api-spec.auth.yml` + `apps/api/README.md`
- [ ] Branch still `finalproject-RFM`
