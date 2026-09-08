# Tasks: In-App Notification Center

**Input**: Design documents from `/specs/001-in-app-notification-center/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies or project setup needed. Existing stack covers all requirements.

- [x] T001 [P] Verify Prisma Notification model indexes support required query patterns in backend/prisma/schema.prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend domain entity, repository port extension, and Prisma implementation — ALL user stories depend on this

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create Notification domain entity in backend/src/domain/entities/Notification.ts
- [x] T003 Extend NotificationRepository port with findById, listByRecipient, countUnreadByRecipient, markAsRead in backend/src/domain/ports/NotificationRepository.ts
- [x] T004 Implement new repository methods in PrismaNotificationRepository in backend/src/infrastructure/persistence/PrismaNotificationRepository.ts
- [x] T005 Create ListNotifications use case with pagination and filters in backend/src/application/use-cases/ListNotifications.ts
- [x] T006 Create MarkNotificationAsRead use case in backend/src/application/use-cases/MarkNotificationAsRead.ts
- [x] T007 Add Zod validation schemas for GET /notifications query params in backend/src/infrastructure/dto/notificationSchemas.ts
- [x] T008 Implement GET /api/v1/notifications endpoint with pagination, today_only, unread_only filters in backend/src/infrastructure/routes/notifications.ts
- [x] T009 Implement GET /api/v1/notifications/:id endpoint in backend/src/infrastructure/routes/notifications.ts
- [x] T010 Implement PATCH /api/v1/notifications/:id/read endpoint in backend/src/infrastructure/routes/notifications.ts
- [x] T011 Wire new use cases into DI container in backend/src/config/container.ts

**Checkpoint**: Backend API fully functional — GET /notifications, GET /notifications/:id, PATCH /notifications/:id/read all working

---

## Phase 3: User Story 1 - View Unread Notifications via Header Badge (Priority: P1) 🎯 MVP

**Goal**: Users see an accurate unread notification count badge on the bell icon in the header, updating in real time.

**Independent Test**: Log in as any user, verify bell icon shows correct unread count, mark a notification as read via API, verify badge decrements.

### Implementation for User Story 1

- [x] T012 [P] [US1] Add Notification interface and list response types in frontend/src/domain/types/notification.ts
- [x] T013 [P] [US1] Add listNotifications and markNotificationAsRead use case functions in frontend/src/domain/usecases/
- [x] T014 [P] [US1] Extend notificationsRepository with listNotifications and markNotificationAsRead API calls in frontend/src/infrastructure/repositories/notificationsRepository.ts
- [x] T015 [US1] Create useUnreadCount hook with 30s polling via TanStack React Query in frontend/src/infrastructure/hooks/useUnreadCount.ts
- [x] T016 [US1] Create useMarkNotificationAsRead mutation hook in frontend/src/infrastructure/hooks/useMarkNotificationAsRead.ts
- [x] T017 [US1] Rewrite NotificationBell.tsx to display real unread count badge from useUnreadCount hook in frontend/src/ui/components/NotificationBell.tsx

**Checkpoint**: Header badge shows real unread count, updates every 30s and on mark-as-read

---

## Phase 4: User Story 2 - Admin/Coach Daily Notification Panel (Priority: P2)

**Goal**: Admins and Coaches see today's notifications in a dropdown panel when clicking the bell icon.

**Independent Test**: Log in as Admin or Coach, click bell icon, verify dropdown shows only today's notifications with content, timestamp, and read status.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create useNotifications hook with today_only filter in frontend/src/infrastructure/hooks/useNotifications.ts
- [x] T019 [US2] Rewrite NotificationBell dropdown to show today's notifications list with empty state in frontend/src/ui/components/NotificationBell.tsx
- [x] T020 [US2] Add click handler to mark notification as read and navigate to class detail (if classId present) in frontend/src/ui/components/NotificationBell.tsx

**Checkpoint**: Admin/Coach can click bell, see today's notifications, tap to mark read and navigate to class

---

## Phase 5: User Story 3 - Coachee Full Notification History (Priority: P3)

**Goal**: Coachees access a dedicated notifications screen showing full chronological history with pagination and unread filter.

**Independent Test**: Log in as Coachee, navigate to /coachee/notifications, verify full list loads chronologically with pagination, toggle unread-only filter.

### Implementation for User Story 3

- [x] T021 [P] [US3] Create useNotifications hook with pagination (cursor-based) and unread_only filter in frontend/src/infrastructure/hooks/useNotifications.ts
- [x] T022 [US3] Rewrite NotificationsPage.tsx with chronological list, load-more pagination, and unread toggle in frontend/src/ui/pages/coachee/NotificationsPage.tsx
- [x] T023 [US3] Add click handler to mark notification as read and navigate to class detail (if classId present) in frontend/src/ui/pages/coachee/NotificationsPage.tsx
- [x] T024 [US3] Add empty state message "No notifications yet" for Coachee notifications page in frontend/src/ui/pages/coachee/NotificationsPage.tsx

**Checkpoint**: Coachee can view full history, paginate, filter unread, tap to mark read and navigate

---

## Phase 6: User Story 4 - Mark Notifications as Read (Priority: P4)

**Goal**: Tapping any notification marks it as read and updates the badge count immediately.

**Independent Test**: Open notification panel, tap unread notification, verify it's marked as read and badge count decreases.

### Implementation for User Story 4

- [x] T025 [US4] Integrate useMarkNotificationAsRead mutation into NotificationBell click handler with optimistic badge update in frontend/src/ui/components/NotificationBell.tsx
- [x] T026 [US4] Integrate useMarkNotificationAsRead mutation into NotificationsPage click handler with optimistic badge update in frontend/src/ui/pages/coachee/NotificationsPage.tsx
- [x] T027 [US4] Add error handling for failed mark-as-read with toast notification in frontend/src/ui/components/NotificationBell.tsx and frontend/src/ui/pages/coachee/NotificationsPage.tsx

**Checkpoint**: Mark-as-read works from both dropdown and full page, badge updates optimistically

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, empty states, and validation

- [x] T028 Add empty state "No notifications today" for Admin/Coach dropdown when no today's notifications in frontend/src/ui/components/NotificationBell.tsx
- [x] T029 Add loading skeleton/spinner states for notification list in NotificationBell and NotificationsPage in frontend/src/ui/components/NotificationBell.tsx and frontend/src/ui/pages/coachee/NotificationsPage.tsx
- [x] T030 Run quickstart.md validation scenarios end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (badge) → US2 (dropdown) → US3 (history) → US4 (mark as read)
  - US1 must complete before US2/US3 (they reuse the same hooks/components)
  - US4 depends on US1 hooks being in place
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 — Reuses useUnreadCount hook and NotificationBell component
- **User Story 3 (P3)**: Depends on US1 — Reuses useNotifications hook and notification types
- **User Story 4 (P4)**: Depends on US1 — Reuses useMarkNotificationAsRead hook

### Within Each User Story

- Types/interfaces before hooks
- Hooks before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 can run in parallel with Phase 2 tasks
- T012, T013, T014 can all run in parallel (different files)
- T018 and T021 can run in parallel (different hook files, but T021 needs types from T012)
- Different user stories can be worked on sequentially (US1→US2→US3→US4)

---

## Parallel Example: User Story 1

```bash
# Launch all types/repos/hooks for US1 together:
Task: "Add Notification interface and list response types in frontend/src/domain/types/notification.ts"
Task: "Add listNotifications and markNotificationAsRead use case functions in frontend/src/domain/usecases/"
Task: "Extend notificationsRepository with listNotifications and markNotificationAsRead API calls in frontend/src/infrastructure/repositories/notificationsRepository.ts"

# Then launch hooks:
Task: "Create useUnreadCount hook with 30s polling via TanStack React Query in frontend/src/infrastructure/hooks/useUnreadCount.ts"
Task: "Create useMarkNotificationAsRead mutation hook in frontend/src/infrastructure/hooks/useMarkNotificationAsRead.ts"

# Then UI:
Task: "Rewrite NotificationBell.tsx to display real unread count badge from useUnreadCount hook in frontend/src/ui/components/NotificationBell.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T011) — Backend API fully working
3. Complete Phase 3: User Story 1 (T012-T017) — Badge shows real count
4. **STOP and VALIDATE**: Test badge works independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Backend API ready
2. Add User Story 1 → Badge works → Deploy/Demo (MVP!)
3. Add User Story 2 → Admin/Coach dropdown works → Deploy/Demo
4. Add User Story 3 → Coachee history works → Deploy/Demo
5. Add User Story 4 → Mark-as-read works → Deploy/Demo
6. Polish → Edge cases handled → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Backend tasks (T002-T011) are shared infrastructure — completing them enables all frontend stories
- Frontend stories build incrementally on shared hooks and types
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
