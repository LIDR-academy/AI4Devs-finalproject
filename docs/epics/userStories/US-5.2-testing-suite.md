# US-5.2: Testing Suite

**Part of:** US-5.2 — Testing Suite
**Epic:** EP-05 — Production Launch

## Tasks

- [ ] T-5.2.1: **Backend** — Write unit tests for domain services: CapacityValidator (gym capacity scenarios), OverlapChecker (various overlap patterns), ReachCalculator (all level combinations)
- [ ] T-5.2.2: **Backend** — Write unit tests for WaitlistEngine (join/leave/max size) and ProcessWaitingListService (cancellation triggers, first-come-first-served)
- [ ] T-5.2.3: **Backend** — Write integration tests for auth endpoints (login success, invalid credentials, inactive user, refresh, logout, RBAC enforcement)
- [ ] T-5.2.4: **Backend** — Write integration tests for class CRUD (create individual/group, validation errors, cancellation) and enrollment flows
- [ ] T-5.2.5: **Backend** — Write integration tests for waiting list and block management endpoints
- [ ] T-5.2.6: **E2E** — Write Playwright E2E tests for critical flows: login (all roles), create class + view in calendar, coachee joins/cancels class, waiting list join + cancellation trigger
- [ ] T-5.2.7: **Infrastructure** — Configure Vitest workspace (shared config), Supertest for API integration tests, Playwright config, and CI test execution
- [ ] T-5.2.8: **Infrastructure** — Mock external services (Google Calendar, FCM) for integration and E2E tests

---

