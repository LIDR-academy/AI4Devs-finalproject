# Quickstart: Default Password & Force Change on First Login

## Prerequisites

- Backend running locally (`npm run dev` or `docker compose up`)
- Frontend running locally (`npm run dev` in `frontend/`)
- Prisma migration applied: `npx prisma migrate dev --name add_must_change_password`
- Prisma client regenerated: `npx prisma db:generate`

## Validation Scenarios

### Scenario 1: Admin creates coachee with phone

1. Log in as Admin
2. Navigate to Coachees page
3. Click "Add Coachee"
4. Fill in name, email, and **phone** (required)
5. Submit without phone → verify rejection with "Phone is required" error
6. Submit with all fields including phone → verify coachee is created successfully
7. Note the coachee's email and phone

**Expected**: Admin cannot create a coachee without phone. With phone, creation succeeds.

### Scenario 2: Coachee logs in with phone as password

1. Log out
2. Log in using the newly created coachee's email and **phone number** as password
3. Observe redirect

**Expected**: Login succeeds. Coachee is redirected to `/change-password` instead of home screen.

### Scenario 3: Coachee changes password

1. On `/change-password` page, enter:
   - Current password: the coachee's phone number
   - New password: any password (min 6 characters)
   - Confirm new password: same as new password
2. Submit
3. Observe redirect

**Expected**: Password changes successfully. Coachee is redirected to their home screen (`/coachee/home`).

### Scenario 4: Coachee logs in with new password

1. Log out
2. Log in using coachee's email and **new password**
3. Observe redirect

**Expected**: Login succeeds. Coachee is redirected directly to home screen (no forced change).

### Scenario 5: Coachee tries old password

1. Log out
2. Attempt login with coachee's email and **phone number** (old password)

**Expected**: Login fails with "Invalid credentials".

### Scenario 6: Change password validation

1. Log in as any user
2. Navigate to `/change-password`
3. Test validation:
   - Submit empty fields → error
   - New password < 6 characters → error
   - Mismatched new and confirm → error
   - Wrong current password → error

**Expected**: All validation errors return clear messages.

### Scenario 7: Unauthenticated access to change-password

1. Log out
2. Navigate directly to `/change-password`

**Expected**: Redirected to login page.

## Test Commands

### Backend tests

```bash
# Unit/integration tests
npm test

# Specific test file
npx vitest run backend/src/__tests__/CreateCoachee.test.ts
npx vitest run backend/src/__tests__/auth.test.ts
```

### Lint & Typecheck

```bash
npm run lint
npm run typecheck
```

## API Contract References

- [Full API specifications](../../docs/api-specifications.md)
- [Feature-specific API contracts](contracts/api-contracts.md)
- [Data model changes](data-model.md)

## Database

```bash
# Apply migration
npx prisma migrate dev --name add_must_change_password

# Regenerate client
npx prisma db:generate
```
