# API Contract: GET /api/v1/notifications

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Endpoint

```
GET /api/v1/notifications
```

## Authentication

Required: Valid JWT in `Authorization: Bearer <token>` header.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 20 | Number of notifications to return (max 100) |
| cursor | string (UUID) | No | null | Notification ID to start after (for pagination) |
| unread_only | boolean | No | false | If true, return only unread notifications |
| today_only | boolean | No | false | If true, return only notifications from today (Europe/Madrid timezone) |

## Response

### Success (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "notificationType": 2,
      "content": "New group class available: Intermediate at 10:00",
      "isRead": false,
      "sentAt": "2026-08-24T08:00:00.000Z",
      "classId": "abc123-def456-ghi789",
      "createdAt": "2026-08-24T08:00:00.000Z"
    }
  ],
  "meta": {
    "hasMore": true,
    "nextCursor": "550e8400-e29b-41d4-a716-446655440001",
    "totalCount": 45,
    "unreadCount": 12
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token",
    "ref": "GET /api/v1/notifications"
  }
}
```

**400 Bad Request** (invalid query parameters)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "limit must be between 1 and 100",
    "ref": "GET /api/v1/notifications"
  }
}
```

## Notes

- Results are ordered by `sent_at DESC` (newest first)
- `meta.totalCount` reflects the total matching notifications (before pagination)
- `meta.unreadCount` is always included for badge display
- `today_only` uses Europe/Madrid timezone for "today" calculation
