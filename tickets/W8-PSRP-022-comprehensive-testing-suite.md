## PSRP-022: test(testing): comprehensive-testing-suite

**Type:** test
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W8
**Dependencies:** PSRP-004, PSRP-006, PSRP-008, PSRP-010, PSRP-014

## Feature Summary
Implement a comprehensive testing suite covering unit tests for all Core services, integration tests with Testcontainers for PostgreSQL repositories and Dragonfly queue operations, API integration tests with WebApplicationFactory, and end-to-end tests for critical user flows (registration, RSVP, payment). Target: >80% code coverage for Core, >60% for Infrastructure, >50% for Api.

## Requirements
- [ ] Set up test projects: `Aura.Core.Tests` (unit tests), `Aura.Infrastructure.Tests` (integration tests), `Aura.Api.Tests` (API integration tests)
- [ ] Configure test frameworks: xUnit (test runner), NSubstitute (mocking), AwesomeAssertions (assertions), Testcontainers (PostgreSQL + Dragonfly for integration tests)
- [ ] Write unit tests for AuthService: magic link request (new user, existing user), token verification (valid, expired, already used), JWT generation, rate limiting
- [ ] Write unit tests for EventService: slug generation (unique, duplicate handling), CRUD operations, geocoding, DataRetentionJob creation
- [ ] Write unit tests for GuestService: CSV validation (valid, invalid, duplicates), free mode limit, soft delete cascade
- [ ] Write unit tests for RsvpService: token verification, deadline enforcement, idempotent submission, attendance validation
- [ ] Write unit tests for PaymentService: webhook handling (succeeded, failed), idempotent processing, status transitions
- [ ] Write unit tests for LiveMessageService: permission check, rate limiting, enqueue logic
- [ ] Write integration tests for repositories with Testcontainers PostgreSQL: GuestRepository (CRUD, soft delete filter, search), InvitationRepository (token lookup), RsvpRepository (upsert)
- [ ] Write integration tests for DragonflyQueueService with Testcontainers: enqueue/dequeue round-trip, queue length, empty queue behavior
- [ ] Write API integration tests with WebApplicationFactory: AuthController (magic link, verify), EventsController (CRUD, authorization), RsvpController (submit, deadline), GuestsController (import CSV)
- [ ] Write end-to-end tests (Playwright or Cypress): registration flow (email → magic link → profile → dashboard), RSVP flow (invitation link → form → submit → confirmation), payment flow (publish → Stripe → success)
- [ ] Configure code coverage collection: `dotnet test --collect:"XPlat Code Coverage"` with ReportGenerator for HTML reports
- [ ] Configure CI/CD test execution: run unit tests on every PR, integration tests on main branch, upload coverage to Codecov
- [ ] Achieve coverage targets: Core >80%, Infrastructure >60%, Api >50%

## Technical Notes
- **Backend:**
  - Unit tests: NSubstitute for mocking repositories and services. Test each service method with happy path, error cases, edge cases
  - Integration tests: Testcontainers.PostgreSQL for real PostgreSQL, Testcontainers.Redis (Dragonfly image) for queue tests. Use `IAsyncLifetime` for setup/teardown
  - API tests: `WebApplicationFactory<Program>` with in-memory API, replace external services (Email, WhatsApp, Stripe) with NSubstitute mocks
  - E2E tests: Playwright for browser automation. Test critical paths: registration, RSVP, payment
- **Frontend:**
  - Angular tests: Jasmine + Karma for component tests. TestBed for service tests
  - Component tests: auth flow, guest table, RSVP form, swipe button
- **Database:** Testcontainers PostgreSQL with real migrations applied
- **Integrations:** Testcontainers Dragonfly for queue tests
- **Key files:**
  - `backend/tests/Aura.Core.Tests/Services/AuthServiceTests.cs`
  - `backend/tests/Aura.Core.Tests/Services/EventServiceTests.cs`
  - `backend/tests/Aura.Core.Tests/Services/GuestServiceTests.cs`
  - `backend/tests/Aura.Core.Tests/Services/RsvpServiceTests.cs`
  - `backend/tests/Aura.Core.Tests/Services/PaymentServiceTests.cs`
  - `backend/tests/Aura.Infrastructure.Tests/Repositories/GuestRepositoryTests.cs`
  - `backend/tests/Aura.Infrastructure.Tests/Queue/DragonflyQueueServiceTests.cs`
  - `backend/tests/Aura.Api.Tests/Controllers/AuthControllerTests.cs`
  - `backend/tests/Aura.Api.Tests/Controllers/EventsControllerTests.cs`
  - `backend/tests/Aura.Api.Tests/Controllers/RsvpControllerTests.cs`
  - `frontend/src/app/**/*.spec.ts`
  - `e2e/registration.spec.ts`
  - `e2e/rsvp.spec.ts`
  - `e2e/payment.spec.ts`

## Acceptance Criteria
- [ ] AC1: Given the test suite is run with `dotnet test`, when all tests complete, then all unit tests pass (AuthService, EventService, GuestService, RsvpService, PaymentService, LiveMessageService)
- [ ] AC2: Given integration tests are run with Testcontainers, when PostgreSQL and Dragonfly containers start, then repository and queue tests pass against real databases
- [ ] AC3: Given API integration tests are run, when WebApplicationFactory boots the API, then Auth, Events, RSVP, and Guests controller tests pass with mocked external services
- [ ] AC4: Given code coverage is collected, when the report is generated, then Core coverage is >80%, Infrastructure >60%, Api >50%
- [ ] AC5: Given E2E tests are run, when Playwright executes the registration flow, then the test passes: email entry → magic link → profile setup → dashboard
- [ ] AC6: Given the CI/CD pipeline runs on a PR, when the test step executes, then unit tests run and coverage is uploaded to Codecov

## Related Items
- **PRD section:** 08-success-metrics.md (quality metrics)
- **Architecture:** 06-testing.md (testing strategy, test pyramid, frameworks)
- **Data model:** N/A

## Blockers
Blocked by: PSRP-004, PSRP-006, PSRP-008, PSRP-010, PSRP-014

## Branch Name
`feature/PSRP-022-comprehensive-testing-suite`
