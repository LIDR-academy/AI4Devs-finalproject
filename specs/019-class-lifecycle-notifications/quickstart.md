# Quickstart Validation: Class Lifecycle Notifications

**Date**: 2026-08-24
**Feature**: 019-class-lifecycle-notifications

## Prerequisites

- Backend dev server running (`npm run dev` in `backend/`)
- Database migrated (`npm run db:migrate` in `backend/`)
- Seed data loaded (`npm run db:seed` in `backend/`)
- Firebase configured (optional — tests pass without FCM; push delivery is skipped)

## Validation Scenarios

### Scenario 1: New Group Class Notification (#2)

**Trigger**: Create a new GROUP class at a level within reach of existing Coachees.

**Steps**:
1. Log in as Admin or Coach
2. Create a new GROUP class at Level 3 (within reach of Level 2, 3, 4 Coachees)
3. Verify: eligible Coachees receive notification #2 with class details
4. Verify: non-eligible Coachees (Level 1, 5) do NOT receive notification #2
5. Verify: notification content includes "Level 3", date/time, Coach name, "spots open"

**Expected outcome**: `201 Created` response; notification records created for eligible Coachees; push delivered (or logged if no device tokens).

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "notifyNewClassAvailable"
```

---

### Scenario 2: Individual Class Assignment Notification (#8)

**Trigger**: Assign an individual class to a Coachee.

**Steps**:
1. Log in as Admin
2. Assign an individual class (with Coach) to a Coachee
3. Verify: assigned Coach receives notification #8 with Coachee name and class details
4. Verify: notification content includes Coachee name, date/time, level, Coach name

**Expected outcome**: `201 Created` or `200 OK` response; notification record created for Coach; push delivered (or logged).

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "notifyIndividualClassAssigned"
```

---

### Scenario 3: Class Cancellation Notification (#7)

**Trigger**: Cancel a class with enrolled Coachees.

**Steps**:
1. Log in as Coach or Admin
2. Cancel a GROUP class with 2+ enrolled Coachees
3. Verify: ALL enrolled Coachees receive notification #7 with class details
4. Verify: notification content includes "canceled", class type, date/time, level, Coach name

**Expected outcome**: `200 OK` response; notification records created for all enrolled Coachees; push delivered (or logged).

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "notifyClassCanceled"
```

---

### Scenario 4: Coach Assignment Notification (#12)

**Trigger**: Admin assigns a Coach to a class the Coach didn't create.

**Steps**:
1. Log in as Admin
2. Create a class (Coach A is creator)
3. Reassign the class to Coach B
4. Verify: Coach B receives notification #12 with class details
5. Verify: Coach A does NOT receive notification #12

**Expected outcome**: `200 OK` response; notification record created for Coach B; push delivered (or logged).

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "notifyCoachAssigned"
```

---

### Scenario 5: No Device Tokens — Graceful Degradation

**Trigger**: Trigger any notification for a user with no registered devices.

**Steps**:
1. Ensure a Coachee has no device tokens
2. Create a GROUP class within their reach
3. Verify: notification record IS persisted (in-app visible)
4. Verify: push delivery is skipped (no error thrown)
5. Verify: class creation completes successfully

**Expected outcome**: `201 Created` response; notification persisted; no push error; operation succeeds.

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "no device tokens"
```

---

### Scenario 6: Content Rendering

**Trigger**: Verify notification content for each type.

**Steps**:
1. For each notification type (#2, #3, #7, #8, #12), trigger the event
2. Read the notification record from the database
3. Verify the `content` field contains: class type, date/time, level name, Coach name
4. Verify type-specific content:
   - #2: includes "spots open" or similar
   - #7: includes "canceled"
   - #8: includes Coachee name
   - #12: includes "assigned" or similar

**Expected outcome**: All notification records have complete, human-readable content.

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/integration/class-lifecycle-notifications.test.ts -t "content rendering"
```

---

### Scenario 7: Unit Tests — Domain Policy

**Verify**: `ClassLifecycleNotificationPolicy` returns correct types and eligibility checks.

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/unit/domain/services/ClassLifecycleNotificationPolicy.test.ts
```

**Expected outcome**: All policy methods return expected values; eligibility checks are correct.

---

### Scenario 8: Unit Tests — Domain Service

**Verify**: `ClassLifecycleNotificationService` orchestrates correctly with mocked ports.

**Test command**:
```bash
cd backend && npx vitest run --reporter=verbose tests/unit/domain/services/ClassLifecycleNotificationService.test.ts
```

**Expected outcome**: Service calls ports in correct order; handles missing recipients gracefully; never throws on push failure.

---

## Full Test Suite

```bash
cd backend && npx vitest run --reporter=verbose
```

**Expected outcome**: All existing tests pass + new tests pass. No regressions.

## Lint & Type Check

```bash
cd backend && npm run lint && npm run typecheck
```

**Expected outcome**: No lint errors, no type errors.
