# Quickstart Validation Guide

**Feature**: 001-in-app-notification-center
**Date**: 2026-08-24

## Prerequisites

1. PostgreSQL database running (via Docker Compose)
2. Backend server running on port 3001
3. Frontend dev server running on port 5173
4. Database migrated with latest Prisma schema
5. At least one test user per role (Admin, Coach, Coachee)
6. At least one notification in the database (use existing `SendNotification` use case or seed)

## Setup Commands

```bash
# Start infrastructure
docker compose up -d

# Run migrations
cd backend && npm run db:migrate

# Seed database (creates test users + levels)
npm run db:seed

# Start backend
npm run dev  # port 3001

# Start frontend (separate terminal)
cd frontend && npm run dev  # port 5173
```

## Validation Scenarios

### Scenario 1: Header Badge Displays Unread Count

**Steps**:
1. Open browser to `http://localhost:5173`
2. Log in as Coachee user
3. Observe bell icon in header

**Expected**: Bell icon shows a numeric badge with the count of unread notifications.

**API check**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/notifications?limit=1
# Response meta.unreadCount should match badge number
```

### Scenario 2: Admin/Coach Dropdown Shows Today's Notifications

**Steps**:
1. Log in as Admin or Coach
2. Click the bell icon in the header

**Expected**: Dropdown panel opens showing only notifications from today with content, timestamp, and read status.

**API check**:
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?today_only=true"
# Response data should only contain today's notifications
```

### Scenario 3: Coachee Full Notification History

**Steps**:
1. Log in as Coachee
2. Navigate to `/coachee/notifications`

**Expected**: Full chronological list of notifications with pagination (load more button or infinite scroll).

**API check**:
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?limit=20"
# Response should contain paginated list with meta.hasMore
```

### Scenario 4: Mark Notification as Read

**Steps**:
1. Log in as any user
2. Click on an unread notification

**Expected**: Notification is marked as read, badge count decreases by one.

**API check**:
```bash
# Before: check unread count
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?limit=1"
# Note meta.unreadCount

# Mark one as read
curl -X PATCH -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/notifications/<id>/read

# After: check unread count decreased
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?limit=1"
# meta.unreadCount should be 1 less
```

### Scenario 5: Notification Linked to Class Navigation

**Steps**:
1. Log in as any user
2. Click a notification that has a classId

**Expected**: User is navigated to the class detail screen.

**API check**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/notifications/<id>
# Response should include classId when notification references a class
```

### Scenario 6: Empty State

**Steps**:
1. Log in as a user with no notifications for today (Admin/Coach)
2. Click the bell icon

**Expected**: "No notifications today" message displayed.

**API check**:
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?today_only=true"
# Response data should be empty array
```

### Scenario 7: Unread-Only Filter

**Steps**:
1. Log in as Coachee
2. Navigate to notifications page
3. Toggle "Unread only" filter

**Expected**: Only unread notifications are displayed.

**API check**:
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/v1/notifications?unread_only=true"
# All returned notifications should have isRead: false
```

## Test Commands

```bash
# Backend unit tests
cd backend && npm test

# Backend integration tests (API)
cd backend && npm test -- --reporter=verbose --run src/__tests__/notifications.routes.test.ts

# Frontend unit tests
cd frontend && npm test
```
