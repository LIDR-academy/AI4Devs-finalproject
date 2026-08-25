# Data Model: Default Password & Force Change on First Login

## Entity Changes

### User (existing, modified)

The `User` entity gains one new attribute. No new entities are introduced.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `must_change_password` | Boolean | `@default(true)` | Whether the user must change their password on next login. Set to `true` for new coachees. Set to `false` after successful password change. |

**State transitions for `must_change_password`:**

```
User created (role=coachee)
  → must_change_password = true
    
User logs in successfully
  → must_change_password unchanged (still true)
    
User changes password via POST /auth/change-password
  → must_change_password = false
    
User created with role=admin or role=coach
  → must_change_password = true (default, but Admin/Coach have separate password flow)
```

### Validation Rules

| Requirement | Rule |
|-------------|------|
| Phone required for coachee creation | `z.string().min(1).max(20)` — phone must be non-empty |
| Current password verification | Must match stored bcrypt hash of user's current password |
| New password minimum length | Minimum 6 characters |
| New password confirmation | New password value must match confirmation value (frontend validation) |
| Authentication required | All change-password requests must include valid JWT |
| Rate limiting | Standard auth rate limiting (10 req/min on auth endpoints) applies |

### Prisma Schema Change

```prisma
model User {
  id                  String   @id @default(uuid())
  email               String   @unique
  password_hash       String
  must_change_password Boolean @default(true)    // NEW FIELD
  name                String
  phone               String?
  role                Role     @default(COACHEE)
  status              Status   @default(ACTIVE)
  // ... existing fields unchanged ...
}
```

### Migration

- New column: `must_change_password` with default `true` on the `User` table.
- Existing users get `must_change_password = true` by default (though only coachees are expected to have this flow triggered — Admin/Coach creation flow handles password separately).
- Migration command: `npx prisma migrate dev --name add_must_change_password`
- Post-migration: `npx prisma db:generate`
