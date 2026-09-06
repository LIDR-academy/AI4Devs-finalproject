# Backend Implementation Plan: US-D6 Workshop User Edit

## Overview

Add **`PATCH /api/users/:id`** for partial updates (`fullName`, `email`, `role`, optional `password`, optional `canActAsMechanic` for US-D8) with the same integrity rules as MVP create/deactivate: unique email, last active admin guard, inactive user blocked. **Session invalidation (US-012)** when `password` or `role` changes: bump `sessionVersion`, clear refresh tokens.

**Architecture principles:** extend `users` module; TDD; transaction for update; English API messages; structured log `user.updated` without password values.

**User story reference:** [`us/Deseables/US-D6-edicion-usuarios-taller.md`](../../us/Deseables/US-D6-edicion-usuarios-taller.md)

**Prerequisites:** US-002, US-012 on `feature-entrega2-RFM`. **Coordinate with US-D8:** include `canActAsMechanic` in DTO/response if D8 migration merged (or stub field as `false` until D8).

**Out of scope:** Frontend, reactivate endpoint (nice-to-have), `mustChangePassword`, self-service profile, physical delete.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D6 artifacts |
|-------|----------------|-----------------|
| **Presentation** | `PATCH /users/:id` | `UsersController` |
| **Application** | Update + validation + session bump | `UsersService.update` |
| **Domain** | Last admin, email uniqueness, inactive block | Service rules |

### Files to add/modify

```
apps/api/src/modules/users/
├── dto/update-user.dto.ts           # NEW
├── users.controller.ts              # PATCH :id (order vs :id/deactivate)
├── users.service.ts                 # update()
├── users.service.spec.ts            # unit matrix
└── dto/user-response.dto.ts         # + canActAsMechanic if D8 schema present

apps/api/test/users.e2e-spec.ts      # extend
apps/api/README.md
```

### API endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `PATCH` | `/api/users/:id` | Bearer | `ADMIN` | Partial user update |

**Routing note:** Keep `@Patch(':id/deactivate')` — Nest matches more specific path first when declared before or ensure `:id/deactivate` is not captured by generic `:id` PATCH. **Recommended:** declare `deactivate` route **before** generic `@Patch(':id')` or use distinct paths only (current `deactivate` suffix is safe if generic PATCH is `:id` without conflicting).

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`
- Do **not** create `feature/US-D6-backend`.

---

### Step 1: `UpdateUserDto`

- **File:** `dto/update-user.dto.ts` (new)
- **Action:** Partial update validation; at least one field required.
- **Implementation Steps:**

```typescript
export class UpdateUserDto {
  @IsOptional() @IsString() @Length(2, 120) fullName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @ValidateIf((o) => o.password !== undefined && o.password !== '')
  @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsBoolean() canActAsMechanic?: boolean;
}
```

  1. Add custom validator or service check: at least one defined field → else `400`.
  2. Trim `fullName`; lowercase+trim `email` in service (match create).
  3. Empty password string → treat as omitted (`400` if explicit empty preferred).
- **Dependencies:** `class-validator`, `UserRole`.

---

### Step 2: Extend `UserResponseDto`

- **File:** `dto/user-response.dto.ts`
- **Action:** Include `canActAsMechanic: boolean` when Prisma field exists (US-D8).
- **Implementation Steps:**
  1. If D8 not merged yet, add field with default `false` in mapper until migration lands.
  2. Update `toUserResponse` in service.

---

### Step 3: `UsersService.update` — TDD

- **File:** `users.service.ts` (+ spec)
- **Function Signature:**

```typescript
async update(
  id: string,
  dto: UpdateUserDto,
  actorId: string,
): Promise<UserResponseDto>
```

- **Implementation Steps:**
  1. `$transaction`: load user by id → `404` if missing.
  2. If `!user.active` → `409 ConflictException('User is inactive')`.
  3. Merge proposed values; trim/normalize strings.
  4. **Email change:** if `dto.email` and normalized !== current → `findUnique` by email → `409` if other user.
  5. **Role change:** if demoting `ADMIN` → `MECHANIC`, count other active admins (reuse `countActiveAdmins` excluding target) → `400` if zero would remain.
  6. **Self role change:** if `actorId === id` and demoting ADMIN → same last-admin check.
  7. **canActAsMechanic:** if final role is `MECHANIC`, force `false`; if `ADMIN`, persist dto value or keep current.
  8. **Password:** if provided → `bcrypt.hash(dto.password, 12)`.
  9. **Session invalidation:** if `roleChanged || passwordChanged` → `refreshTokenHash: null`, `refreshTokenExpiresAt: null`, `sessionVersion: { increment: 1 }`.
  10. **No bump** for `fullName`, `email`, or `canActAsMechanic` only.
  11. Log `{ event: 'user.updated', actorId, userId, changedFields: [...] }` — never log password.
  12. Return `toUserResponse(updated)`.
- **Unit tests:**
  - update fullName only → 200, no sessionVersion bump
  - email conflict → 409
  - demote last admin → 400
  - password change → sessionVersion increment + refresh cleared
  - role change → sessionVersion increment
  - inactive user → 409
  - canActAsMechanic on MECHANIC normalized to false
  - same email no-op → 200
- **Dependencies:** bcrypt, Prisma, existing `countActiveAdmins`.

---

### Step 4: Controller Route

- **File:** `users.controller.ts`
- **Action:** Expose PATCH handler.
- **Implementation Steps:**

```typescript
@Patch(':id')
update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateUserDto,
  @CurrentUser() actor: AuthenticatedUser,
): Promise<UserResponseDto> {
  return this.usersService.update(id, dto, actor.userId);
}
```

  1. Place **after** `@Patch(':id/deactivate')` declaration (deactivate already registered — verify Nest route order: static suffix `deactivate` must not conflict; PATCH `:id` won't match `deactivate` segment if path is `:id/deactivate` — OK).
  2. Class-level `@Roles(ADMIN)` unchanged.
- **Dependencies:** Step 1–3.

---

### Step 5: E2E API Tests

- **File:** `test/users.e2e-spec.ts`
- **Action:** HTTP coverage.
- **Implementation Steps:**
  1. ADMIN patches fullName → 200.
  2. Duplicate email → 409.
  3. MECHANIC token → 403.
  4. Deactivate still works (regression).
  5. Optional: password change → old refresh token fails (US-012 smoke).
- **Dependencies:** E2E auth helpers.

---

### Step 6: Update Technical Documentation

- **File:** `apps/api/README.md`
- **Action:** Document `PATCH /users/:id`, fields, errors, session invalidation rules.
- **References:** `docs/documentation-standards.mdc`.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — `UpdateUserDto`
3. Step 2 — Response DTO + mapper
4. Step 3 — Service + unit tests
5. Step 4 — Controller
6. Step 5 — E2E
7. Step 6 — Documentation

---

## Testing Checklist

- [ ] Partial update each field
- [ ] Empty body → 400
- [ ] Email unique → 409
- [ ] Last admin demotion → 400
- [ ] Inactive → 409
- [ ] Password/role → sessionVersion bump
- [ ] Name/email only → no bump
- [ ] canActAsMechanic normalization
- [ ] Create/list/deactivate regression
- [ ] MECHANIC → 403

---

## Error Response Format

| Status | Condition | Message (English) |
|--------|-----------|-------------------|
| `400` | Validation; last admin; empty body | Standard validation / `At least one active administrator is required` |
| `401` | No JWT | |
| `403` | Non-ADMIN | |
| `404` | Unknown id | `Not Found` |
| `409` | Email duplicate; inactive user | `This email is already registered` / `User is inactive` |

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-002 | Users module baseline |
| US-012 | sessionVersion + refresh invalidation |
| US-D8 (optional same epic) | `canActAsMechanic` field on User |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **OT history:** FKs unchanged — rename/email does not rewrite `createdById` / `assignedMechanicId`.
- **Pairs with D8:** implement D8 migration before or with D6 if editing flag is DoD.

---

## Next Steps After Implementation

1. `docs/plans/US-D6_frontend.md`
2. Consider US-D8 backend next (shared user fields)

---

## Implementation Verification

### Code Quality

- [ ] Transaction wraps update
- [ ] No password in logs/responses

### Functionality

- [ ] PATCH complete per US-D6

### Testing

- [ ] Unit + e2e green

### Integration

- [ ] Ready for `EditUserDialog` FE

### Documentation

- [ ] README updated
