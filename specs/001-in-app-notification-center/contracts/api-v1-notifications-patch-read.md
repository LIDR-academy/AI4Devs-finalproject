# API Contract: PATCH /api/v1/notifications/:id/read

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Endpoint

```
PATCH /api/v1/notifications/:id/read
```

## Authentication

Required: Valid JWT in `Authorization: Bearer <token>` header.

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Notification ID |

## Request Body

No request body required.

## Response

### Success (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "notificationType": 2,
  "content": "New group class available: Intermediate at 10:00",
  "isRead": true,
  "sentAt": "2026-08-24T08:00:00.000Z",
  "classId": "abc123-def456-ghi789",
  "createdAt": "2026-08-24T08:00:00.000Z",
  "updatedAt": "2026-08-24T09:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token",
    "ref": "PATCH /api/v1/notifications/:id/read"
  }
}
```

**403 Forbidden** (notification belongs to another user)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied",
    "ref": "PATCH /api/v1/notifications/:id/read"
  }
}
```

**404 Not Found**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found",
    "ref": "PATCH /api/v1/notifications/:id/read"
  }
}
```

## Notes

- Idempotent: marking an already-read notification as read returns the same result
- The response includes `updatedAt` reflecting the read timestamp
- Only the notification's own user can mark it as read (authorization check)
