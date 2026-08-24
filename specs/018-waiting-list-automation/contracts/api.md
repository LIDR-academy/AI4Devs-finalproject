# API Contracts: Waiting List Automation

**Feature**: 018-waiting-list-automation
**Date**: 2026-08-24

## Modified Endpoint

### `POST /api/v1/classes/:id/enrollment` (Cancel Enrollment)

The existing cancellation response is extended with new fields. The endpoint behavior and request remain unchanged.

**Response (200 OK)**:
```json
{
  "message": "Enrollment canceled.",
  "waitingListProcessed": true,
  "claimedByCoachee": null,
  "notificationsSent": 3,
  "waitingListMembersNotified": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Confirmation message (unchanged) |
| `waitingListProcessed` | boolean | `true` if the class had a waiting list with members |
| `claimedByCoachee` | string \| null | Always `null` on cancellation (reserved for future use) |
| `notificationsSent` | number | Total notifications dispatched (waitlisted coachees + coach) |
| `waitingListMembersNotified` | number | Number of waitlisted Coachees notified about the opened spot |

**Notes**:
- When `waitingListProcessed` is `false`, `notificationsSent` is `1` (coach notification #5 only) and `waitingListMembersNotified` is `0`.
- When `waitingListProcessed` is `true`, `notificationsSent` is `N + 1` (N waitlisted coachees + 1 coach) and `waitingListMembersNotified` is `N`.

---

## New Endpoint

### `POST /api/v1/classes/:id/waiting-list/claim`

Allows a waitlisted Coachee to claim an opened spot in a class.

**Auth**: Required. JWT must carry `role: "COACHEE"`.

**Request**: Empty body (Coachee identity from JWT).

**Response (200 OK)**:
```json
{
  "data": {
    "enrollmentId": "uuid",
    "classId": "uuid",
    "coacheeId": "uuid",
    "joinedAt": "2026-08-24T10:00:00.000Z"
  }
}
```

**Error Responses**:

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | No valid JWT |
| 403 | `FORBIDDEN` | JWT role is not COACHEE |
| 404 | `NOT_FOUND` | Class not found |
| 404 | `NOT_FOUND` | Coachee not on the waiting list for this class |
| 409 | `CONFLICT` | `SPOT_TAKEN` — another Coachee already claimed the spot |
| 409 | `CONFLICT` | `ALREADY_ENROLLED` — Coachee is already enrolled in this class |
| 422 | `VALIDATION_ERROR` | Class is canceled |
| 422 | `VALIDATION_ERROR` | Class is already full |

**Error envelope**:
```json
{
  "error": {
    "code": "SPOT_TAKEN",
    "message": "This spot has already been claimed by another Coachee.",
    "ref": "POST /api/v1/classes/:id/waiting-list/claim"
  }
}
```

---

## Notification Types Reference

| Type | Recipient | Content Semantics |
|------|-----------|-------------------|
| 1 | Waitlisted Coachee | Spot opened — claim it now (FCFS) |
| 4 | Coach | Spot opened, waitlisted Coachees notified |
| 5 | Coach | Spot opened (no waiting list) |
| 6 | Coach | Waitlisted Coachee claimed the spot |
| 9 | Claiming Coachee | You joined from the waiting list |
| 10 | Leaving Coachee | You left the waiting list |
