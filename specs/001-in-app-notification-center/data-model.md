# Data Model: In-App Notification Center

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Existing Prisma Model

The `Notification` model already exists in `backend/prisma/schema.prisma`:

```prisma
model Notification {
  id                String         @id @default(uuid()) @db.Uuid
  notification_type Int
  recipient_id      String         @db.Uuid
  class_id          String?        @db.Uuid
  content           String
  is_read           Boolean        @default(false)
  sent_at           DateTime       @db.Timestamptz(6)
  created_at        DateTime       @default(now()) @db.Timestamptz(6)
  updated_at        DateTime       @updatedAt @db.Timestamptz(6)

  recipient         User           @relation(fields: [recipient_id], references: [id])
  class             TrainingClass? @relation(fields: [class_id], references: [id])

  @@index([recipient_id, is_read])
  @@index([recipient_id, sent_at])
}
```

**No schema changes required.** The existing model supports all feature requirements.

## Domain Entity

### Notification Entity

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| notificationType | number | Type code (2=new class, 7=canceled, 8=individual assigned, 12=coach assigned) |
| recipientId | string (UUID) | ID of the user receiving the notification |
| classId | string \| null | Optional reference to a TrainingClass |
| content | string | Human-readable notification text |
| isRead | boolean | Whether the user has viewed this notification |
| sentAt | Date | When the notification was sent |
| createdAt | Date | When the record was created |
| updatedAt | Date | When the record was last modified |

### Relationships

```
Notification ──→ User (recipient)       [mandatory, many-to-one]
Notification ──→ TrainingClass (class)   [optional, many-to-one]
```

## Validation Rules

| Rule | Source | Enforcement |
|------|--------|-------------|
| recipientId must reference an existing User | FK constraint | Prisma/PostgreSQL |
| classId must reference an existing TrainingClass | FK constraint | Prisma/PostgreSQL |
| content must be non-empty string | Business rule | Zod schema on input |
| isRead defaults to false | Business rule | Prisma default |
| notificationType must be a valid type code | Business rule | Domain service |

## State Transitions

```
Notification Created (is_read: false)
    │
    └──→ User marks as read (is_read: true)
```

No other state transitions exist. Notifications are immutable except for `is_read` and `updated_at`.

## Query Patterns

| Query | Purpose | Index Used |
|-------|---------|------------|
| `WHERE recipient_id = ? AND is_read = false` | Unread count | `[recipient_id, is_read]` |
| `WHERE recipient_id = ? AND sent_at > ?` | Today's notifications | `[recipient_id, sent_at]` |
| `WHERE recipient_id = ? ORDER BY sent_at DESC LIMIT ?` | Paginated list | `[recipient_id, sent_at]` |
| `WHERE recipient_id = ? AND id = ?` | Single notification | Primary key + index |
| `UPDATE is_read = true WHERE id = ?` | Mark as read | Primary key |
