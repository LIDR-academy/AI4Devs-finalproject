# Quickstart Validation: Waiting List Automation

**Feature**: 018-waiting-list-automation
**Date**: 2026-08-24

## Prerequisites

- Backend running locally (`npm run dev` in `backend/`)
- Database seeded with at least: 1 Coach, 2 Coachees (with levels), 1 Level, 1 group class (ACTIVE, full capacity 4/4)
- Coachee A enrolled in the class, Coachee B and Coachee C on the waiting list
- Valid JWT tokens for Coachee A, Coachee B, Coachee C, and the Coach

## Scenario 1: Cancellation triggers waiting-list notification

**Setup**: Seed a group class with 1 enrollment (Coachee A) and 2 waiting-list entries (Coachee B, Coachee C).

**Action**:
```bash
# Coachee A cancels enrollment
curl -X DELETE http://localhost:3001/api/v1/classes/{classId}/enrollment \
  -H "Authorization: Bearer {coacheeA_token}"
```

**Expected**:
- Response includes `waitingListProcessed: true`, `notificationsSent: 3`, `waitingListMembersNotified: 2`
- Database: `Notification` table has 3 new rows — type 1 for Coachee B, type 1 for Coachee C, type 4 for the Coach
- Database: `ClassEnrollment` row for Coachee A is deleted

## Scenario 2: Cancellation without waiting list notifies coach only

**Setup**: Seed a group class with 1 enrollment and 0 waiting-list entries.

**Action**:
```bash
curl -X DELETE http://localhost:3001/api/v1/classes/{classId}/enrollment \
  -H "Authorization: Bearer {coacheeA_token}"
```

**Expected**:
- Response includes `waitingListProcessed: false`, `notificationsSent: 1`, `waitingListMembersNotified: 0`
- Database: 1 new `Notification` — type 5 for the Coach

## Scenario 3: First-come-first-served claim

**Setup**: After Scenario 1, Coachee B and Coachee C both have type-1 notifications.

**Action** (Coachee B claims first):
```bash
curl -X POST http://localhost:3001/api/v1/classes/{classId}/waiting-list/claim \
  -H "Authorization: Bearer {coacheeB_token}"
```

**Expected**:
- 200 OK with enrollment data
- Database: new `ClassEnrollment` for Coachee B
- Database: `WaitingList` entry for Coachee B is deleted
- Database: 2 new `Notification` — type 9 for Coachee B, type 6 for the Coach

**Action** (Coachee C tries to claim):
```bash
curl -X POST http://localhost:3001/api/v1/classes/{classId}/waiting-list/claim \
  -H "Authorization: Bearer {coacheeC_token}"
```

**Expected**:
- 409 Conflict with code `SPOT_TAKEN`
- No new enrollment created

## Scenario 4: Claim on canceled class is refused

**Setup**: A class with a waiting list is canceled by an Admin.

**Action**:
```bash
curl -X POST http://localhost:3001/api/v1/classes/{canceledClassId}/waiting-list/claim \
  -H "Authorization: Bearer {coachee_token}"
```

**Expected**:
- 422 Validation Error: "This class has been canceled."
- No enrollment created, no waiting-list entry removed

## Scenario 5: Concurrent claim contention

**Setup**: Open a spot in a class with 2 waitlisted Coachees.

**Action** (simultaneous):
```bash
# Terminal 1
curl -X POST http://localhost:3001/api/v1/classes/{classId}/waiting-list/claim \
  -H "Authorization: Bearer {coacheeB_token}" &

# Terminal 2
curl -X POST http://localhost:3001/api/v1/classes/{classId}/waiting-list/claim \
  -H "Authorization: Bearer {coacheeC_token}" &
wait
```

**Expected**:
- Exactly one returns 200 OK
- The other returns 409 Conflict with code `SPOT_TAKEN`
- Database: exactly 1 new `ClassEnrollment`, 1 `WaitingList` entry deleted

## Scenario 6: Audit log entries

**After any scenario above**, verify:
```sql
SELECT * FROM "SecurityAuditLog"
WHERE resource = 'WAITING_LIST' OR resource = 'CLASS_ENROLLMENT'
ORDER BY created_at DESC LIMIT 10;
```

**Expected**: Each action (cancel-enrollment, waiting-list.claim) has a corresponding audit entry with actor_id, action, resource, and outcome.
