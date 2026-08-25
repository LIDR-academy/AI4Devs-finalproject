# Research: In-App Notification Center

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Decision Log

### 1. Backend: Notification Repository Methods

**Decision**: Extend existing `NotificationRepository` port with `findById`, `listByRecipient`, `countUnreadByRecipient`, and `markAsRead` methods.

**Rationale**: The existing port only has `create()`. The feature requires reading notifications (list, single) and marking them as read. Following the established pattern, the port interface lives in `domain/ports/NotificationRepository.ts` and the Prisma implementation in `infrastructure/persistence/PrismaNotificationRepository.ts`.

**Alternatives considered**:
- *Separate read repository*: Rejected — the existing pattern uses a single repository per entity.
- *Raw SQL queries*: Rejected — constitution mandates Prisma parameterized queries only.

### 2. Backend: Notification Entity

**Decision**: Create a `Notification` entity in `domain/entities/Notification.ts` with fields matching the Prisma model.

**Rationale**: The constitution requires domain entities to be pure TypeScript classes with zero infrastructure dependencies. The entity represents the core attributes: id, type, recipientId, classId, content, isRead, sentAt, createdAt.

**Alternatives considered**:
- *Use Prisma type directly*: Rejected — violates Domain Purity principle.
- *No entity, use raw objects*: Rejected — domain services need typed entities for business logic.

### 3. Backend: Unread Count Strategy

**Decision**: Add a dedicated `countUnreadByRecipient(recipientId)` method to the repository rather than computing from full list.

**Rationale**: The header badge needs only the count, not the full notification list. A COUNT query is more efficient than fetching all notifications just to count them. This avoids unnecessary data transfer and memory usage.

**Alternatives considered**:
- *Fetch all and count client-side*: Rejected — inefficient for users with many notifications.
- *Cache count in memory*: Rejected — adds complexity; Prisma COUNT is fast enough at this scale.

### 4. Backend: Today's Filter for Admin/Coach

**Decision**: Add a `sentAfter` filter parameter to `listByRecipient` rather than a separate `listTodayByRecipient` method.

**Rationale**: More flexible — the same method can support "today", "last 7 days", or any date range. The route layer determines what "today" means (timezone-aware start of day in Europe/Madrid).

**Alternatives considered**:
- *Separate method for today*: Rejected — creates method explosion for simple filter variations.
- *Database-level today filter*: Rejected — timezone handling belongs in application layer, not DB queries.

### 5. Frontend: Unread Count Polling

**Decision**: Use TanStack React Query with a 30-second polling interval for the unread count badge.

**Rationale**: The spec requires "real time" badge updates. WebSocket/SSE would be ideal but adds infrastructure complexity. Polling at 30s is a reasonable tradeoff for this scale. The existing frontend already uses TanStack React Query extensively.

**Alternatives considered**:
- *WebSocket/SSE*: Rejected — requires new infrastructure (e.g., Socket.io server), significant complexity increase.
- *Push-only updates*: Insufficient — push notifications are for new alerts, not for badge state sync.
- *No polling, manual refresh only*: Rejected — violates "real time" requirement in spec.

### 6. Frontend: Admin/Coach Dropdown vs Coachee Page

**Decision**: Implement both views using shared hooks. Admin/Coach uses the existing `NotificationBell.tsx` dropdown. Coachee uses the existing `NotificationsPage.tsx` route.

**Rationale**: The spec differentiates display by role. Both views consume the same API but with different filters (today vs all). The `NotificationBell` already exists as a placeholder; `NotificationsPage` already exists as a placeholder.

**Alternatives considered**:
- *Single view for all roles*: Rejected — spec explicitly requires different behavior per role.
- *Separate API endpoints*: Rejected — same endpoint with role-based filtering is cleaner.

### 7. Pagination Strategy

**Decision**: Use cursor-based pagination with `cursor` (notification ID) and `limit` parameters, returning `hasMore` in meta.

**Rationale**: Cursor-based pagination is more efficient than offset-based for frequently updated lists (new notifications arriving). Follows the existing pattern used by other list endpoints in the codebase.

**Alternatives considered**:
- *Offset-based pagination*: Rejected — can cause items to shift when new notifications arrive between page loads.
- *Infinite scroll with no pagination*: Rejected — spec requires pagination support.

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Should notifications auto-delete after N days? | No — no retention policy specified; keep indefinitely. |
| Should read status sync across devices? | Yes — read status is server-side, so it syncs naturally. |
| Should there be a "mark all as read" button? | Not in spec — out of scope for v1. |
| What notification types are supported? | Already defined in codebase: types 2, 7, 8, 12. No new types needed. |

## Dependencies Verified

- Prisma `Notification` model already exists with required fields
- `NotificationRepository` port exists (needs extension)
- `PrismaNotificationRepository` exists (needs extension)
- `NotificationBell.tsx` exists (needs rewrite)
- `NotificationsPage.tsx` exists (needs rewrite)
- No new npm packages required
