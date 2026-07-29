# Tasks: Google Calendar Integration

**Input**: Design documents from `specs/006-google-calendar-integration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/CalendarProvider.md

**Tests**: The spec defines Given/When/Then scenarios. Test tasks are included per user story to ensure test-first compliance (per constitution Article II).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- All file paths are relative to `backend/` unless prefixed otherwise

---

## Phase 1: Setup

**Purpose**: Environment configuration and port interface foundation

- [X] T001 Update env.ts Zod schema with Google Calendar env vars (GOOGLE_CALENDAR_SA_EMAIL, GOOGLE_CALENDAR_SA_KEY_PATH, GOOGLE_CALENDAR_ID_DEV, GOOGLE_CALENDAR_ID_STAGING, GOOGLE_CALENDAR_ID_PROD) including environment-aware calendar ID resolver in backend/src/config/env.ts
- [X] T002 [P] Create CalendarProvider port interface with createEvent, updateEvent, deleteEvent, queryFreeBusy methods in backend/src/domain/ports/CalendarProvider.ts

---

## Phase 2: User Story 1 - CalendarProvider Port + GoogleCalendarAdapter (Priority: P1)

**Goal**: Developers can use the CalendarProvider port and GoogleCalendarAdapter to create, update, and delete Google Calendar events. All errors are wrapped in ServiceUnavailableError with unique UUID ref (covers US4).

**Independent Test**: Run a test script that creates an event, updates it, deletes it, and confirms each operation via the Google Calendar API. Test also confirms errors return 503 with UUID ref.

### Implementation for User Story 1

- [X] T003 [US1] Implement GoogleCalendarAdapter class with Service Account JWT authentication (load SA key path from env) in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T004 [US1] Implement createEvent method on GoogleCalendarAdapter — calls Google Calendar v3 API events.insert, returns google_event_id in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T005 [P] [US1] Implement updateEvent method on GoogleCalendarAdapter — calls Google Calendar v3 API events.patch in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T006 [P] [US1] Implement deleteEvent method on GoogleCalendarAdapter — calls Google Calendar v3 API events.delete in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T007 [US1] Wrap all Google Calendar API errors in ServiceUnavailableError with crypto.randomUUID() ref — do not leak Google API error details to client in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T008 [P] [US1] Write unit test for GoogleCalendarAdapter — verify createEvent, updateEvent, deleteEvent, and error wrapping (mock googleapis) in backend/src/__tests__/GoogleCalendarAdapter.test.ts
- [X] T009 [US1] Write integration test for GoogleCalendarAdapter — verify real Google Calendar CRUD operations (run against dev calendar) in backend/src/__tests__/GoogleCalendarAdapter.int.test.ts

**Checkpoint**: Calendar events can be created, updated, and deleted on Google Calendar. Errors return 503 with UUID ref.

---

## Phase 3: User Story 3 - Free/Busy Query (Priority: P1)

**Goal**: The adapter can query Google Calendar free/busy server-side. No browser-to-Google calls.

**Independent Test**: Call queryFreeBusy for the system calendar over a time range with known events; verify busy intervals are returned correctly. Confirm query completes under 500ms.

### Implementation for User Story 3

- [X] T010 [US3] Implement queryFreeBusy method on GoogleCalendarAdapter — calls Google Calendar v3 API freebusy.query, returns busy intervals in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T011 [US3] Write unit test for queryFreeBusy — verify correct busy intervals returned (mock googleapis) in backend/src/__tests__/GoogleCalendarAdapter.test.ts
- [X] T012 [US3] Write integration test for queryFreeBusy — verify real free/busy against dev calendar in backend/src/__tests__/GoogleCalendarAdapter.int.test.ts

**Checkpoint**: Free/busy queries work server-side. No Google API credentials in browser.

---

## Phase 4: User Story 2 - Class/Block Calendar Sync (Priority: P1)

**Goal**: Creating a TrainingClass or Block automatically creates a corresponding Google Calendar event. Updating or deleting the record syncs the calendar event. Event titles contain only class type + level (no PII).

**Independent Test**: POST a new class — verify google_event_id is stored and an event appears on Google Calendar with correct title. DELETE the class — verify event is removed from calendar.

### Implementation for User Story 2

- [X] T013 [US2] Create CreateTrainingClass use case — accepts class data, calls adapter.createEvent, persists trainingClass with google_event_id returned in backend/src/application/use-cases/CreateTrainingClass.ts
- [X] T014 [US2] Create UpdateTrainingClass use case — accepts class data + existing google_event_id, calls adapter.updateEvent in backend/src/application/use-cases/UpdateTrainingClass.ts
- [X] T015 [US2] Create DeleteTrainingClass use case — accepts class id, deletes training class + calls adapter.deleteEvent with google_event_id in backend/src/application/use-cases/DeleteTrainingClass.ts
- [X] T016 [US2] Create ListTrainingClasses use case — returns all training classes (no calendar interaction) in backend/src/application/use-cases/ListTrainingClasses.ts
- [X] T017 [US2] Implement POST /api/v1/classes route — calls CreateTrainingClass use case, returns 201 with class data in backend/src/infrastructure/routes/classes.ts
- [X] T018 [US2] Implement GET /api/v1/classes route — calls ListTrainingClasses use case in backend/src/infrastructure/routes/classes.ts
- [X] T019 [US2] Implement DELETE /api/v1/classes/:id route — calls DeleteTrainingClass use case in backend/src/infrastructure/routes/classes.ts
- [X] T020 [P] [US2] Implement PUT /api/v1/classes/:id route — calls UpdateTrainingClass use case in backend/src/infrastructure/routes/classes.ts
- [X] T021 [US2] Create CreateBlock use case — accepts block data, calls adapter.createEvent, persists block with google_event_id in backend/src/application/use-cases/CreateBlock.ts
- [X] T022 [US2] Create DeleteBlock use case — accepts block id, deletes block + calls adapter.deleteEvent with google_event_id in backend/src/application/use-cases/DeleteBlock.ts
- [X] T023 [US2] Create ListBlocks use case — returns all blocks (no calendar interaction) in backend/src/application/use-cases/ListBlocks.ts
- [X] T024 [US2] Implement POST /api/v1/blocks route — calls CreateBlock use case in backend/src/infrastructure/routes/blocks.ts
- [X] T025 [US2] Implement GET /api/v1/blocks route — calls ListBlocks use case in backend/src/infrastructure/routes/blocks.ts
- [X] T026 [US2] Implement DELETE /api/v1/blocks/:id route — calls DeleteBlock use case in backend/src/infrastructure/routes/blocks.ts
- [X] T027 [US2] Wire all calendar dependencies (CalendarProvider, use cases) in DI container in backend/src/config/container.ts
- [X] T028 [US2] Ensure all event titles use format `<ClassType> - <LevelName>` with zero PII — no coach name, coachee name, email, or phone in title or description in backend/src/application/use-cases/
- [X] T029 [US2] Write integration test for class creation/deletion with real Google Calendar in backend/src/__tests__/classes.int.test.ts

**Checkpoint**: Creating a class or block syncs to Google Calendar. Titles are PII-free.

---

## Phase 5: User Story 5 - Calendar Health Monitoring (Priority: P2)

**Goal**: System tracks Google Calendar API success/failure rates. Failure rate >5% in 5-minute window triggers alert and degraded health status.

**Independent Test**: Simulate multiple failures, verify health endpoint reports degraded status with correct failure rate. Verify alert is logged.

### Implementation for User Story 5

- [X] T030 [US5] Implement CalendarHealthMonitor with rolling 5-minute window — recordCall(success), getHealth() returns { status, failureRate, totalCalls, windowMinutes } in backend/src/infrastructure/adapters/calendar/CalendarHealthMonitor.ts
- [X] T031 [US5] Wire CalendarHealthMonitor to GoogleCalendarAdapter — call recordCall after every API attempt (success or failure) in backend/src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts
- [X] T032 [US5] Expose calendar health status via GET /api/v1/health endpoint — include calendar status, failure rate, and total calls in response in backend/src/infrastructure/routes/health.ts
- [X] T033 [US5] Log alert via Pino logger when failure rate exceeds 5% within the rolling 5-minute window in backend/src/infrastructure/adapters/calendar/CalendarHealthMonitor.ts
- [X] T034 [US5] Write unit test for CalendarHealthMonitor — verify rolling window, failure rate calculation, and alert threshold in backend/src/__tests__/CalendarHealthMonitor.test.ts

**Checkpoint**: Health endpoint returns calendar status. Alert logged on high failure rate.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, documentation, and final validation

- [X] T035 [P] Run quickstart.md validation scenarios to verify all acceptance criteria
- [X] T036 Run full test suite — biome check, tsc --noEmit, vitest run — to ensure no regressions
- [X] T037 Run npm audit --audit-level=high to verify dependency integrity
- [X] T038 Clean up any remaining 501 stub routes in classes.ts and blocks.ts that are not yet implemented (mark them as TODO rather than 501)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (US1)**: Depends on T001-T002 (env + port interface)
- **Phase 3 (US3)**: Depends on T003 (adapter auth) — can run after T003 completes in parallel with T004-T009
- **Phase 4 (US2)**: Depends on Phase 2 (US1) completion — needs working adapter
- **Phase 5 (US5)**: Depends on Phase 2 (US1) completion — needs adapter calls to monitor
- **Phase 6 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Foundational adapter — no dependencies on other stories
- **US3 (P1)**: Needs adapter auth (T003) then independent — can be parallel with T004-T009
- **US2 (P1)**: Depends on US1 (adapter) for calendar calls — independent otherwise
- **US5 (P2)**: Depends on US1 (adapter calls to monitor) — independent otherwise

### Within Each User Story

- Models/use cases before routes
- Core implementation before tests
- Story complete before moving to next priority

---

## Parallel Opportunities

| Task Group | Can Run With |
|------------|-------------|
| T001 (env.ts) + T002 (port interface) | Parallel within Phase 1 |
| T003 (adapter auth) | Must complete before T010 (free/busy) |
| T004, T005, T006 (adapter methods) | Parallel within US1 |
| T013-T016 (class use cases) | Parallel within US2 |
| T021-T023 (block use cases) | Parallel with T013-T016 |
| T017-T020 (class routes) | Depends on corresponding use cases |
| T024-T026 (block routes) | Depends on corresponding use cases |
| T030 (health monitor) + T033 (alert) | Parallel within US5 |

---

## Implementation Strategy

### MVP Scope (Phase 2 + Phase 3 = CalendarProvider + Adapter + Free/Busy)

1. Complete Phase 1: Setup (env + port)
2. Complete Phase 2: GoogleCalendarAdapter with CRUD + error handling (US1)
3. Complete Phase 3: Free/busy query (US3)
4. **STOP and VALIDATE**: Test adapter independently via test scripts
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Adapter → CalendarProvider works standalone (MVP!)
2. Add free/busy → Availability checking works (MVP+)
3. Add class/block sync → Full scheduling integration (complete)
4. Add health monitoring → Production readiness

### Parallel Team Strategy (2 developers)

1. Setup together (T001-T002)
2. Developer A: US1 adapter (T003-T009) + US5 health (T030-T034)
3. Developer B: US3 free/busy (T010-T012) + US2 class/block sync (T013-T029)
