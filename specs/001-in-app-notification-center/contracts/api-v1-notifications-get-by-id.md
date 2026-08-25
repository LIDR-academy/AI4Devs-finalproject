# API Contract: GET /api/v1/notifications/:id

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Endpoint

```
GET /api/v1/notifications/:id
```

## Authentication

Required: Valid JWT in `Authorization: Bearer <token>` header.

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Notification ID |

## Response

### Success (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "notificationType": 2,
  "content": "New group class available: Intermediate at 10:00",
  "isRead": false,
  "sentAt": "2026-08-24T08:00:00.000Z",
  "classId": "abc123-def456-ghi789",
  "createdAt": "2026-08-24T08:00:00.000Z"
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token",
    "ref": "GET /api/v1/notifications/:id"
  }
}
```

**403 Forbidden** (notification belongs to another user)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied",
    "ref": "GET /api/v1/notifications/:id"
  }
}
```

**404 Not Found**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found",
    "ref": "GET /api/v1/notifications/:id"
  }
}
```

## Notes

- Users can only access their own notifications (enforced by recipient_id check)
- The response is a single resource object (not wrapped in `data: []`)
