# Research: Google Calendar Integration

## Decisions

### CalendarProvider Port Interface

- **Decision**: Define `CalendarProvider` interface in `src/domain/ports/CalendarProvider.ts` with four methods: `createEvent`, `updateEvent`, `deleteEvent`, `queryFreeBusy`
- **Rationale**: Follows existing hexagonal architecture pattern (see `CoachRepository` port). Domain layer must have zero Google Calendar imports.
- **Alternatives considered**: Putting port in application layer — rejected because port belongs to domain as an abstraction boundary.

### GoogleCalendarAdapter Implementation

- **Decision**: Implement `GoogleCalendarAdapter` in `src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts` using `googleapis` SDK with Service Account auth
- **Rationale**: `googleapis@173.0.0` is already installed. Service Account JSON key already exists at `secrets/coacher-calendar-sa-key.json`. Follows existing adapter pattern.
- **Alternatives considered**: REST client directly — rejected because `googleapis` provides better typing and auth management.

### Authentication Method

- **Decision**: Use `JWT` auth scope `https://www.googleapis.com/auth/calendar` via Service Account JSON key file loaded from env-configured path
- **Rationale**: Matches proven pattern from `test-calendar-access.mjs` and `test-calendar-crud.mjs` scripts. No OAuth consent screen.
- **Alternatives considered**: OAuth2 client — rejected because Service Account is the correct pattern for server-to-server integration.

### Env Var Reconciliation

- **Decision**: Update `env.ts` Zod schema to use the actual env var names from `.env` (GOOGLE_CALENDAR_SA_EMAIL, GOOGLE_CALENDAR_SA_KEY_PATH, GOOGLE_CALENDAR_ID_DEV) and expose a `calendarId` resolver that picks the right calendar ID based on NODE_ENV
- **Rationale**: Current env.ts has stale optional fields (GOOGLE_SERVICE_ACCOUNT_EMAIL, etc.) that don't match actual `.env` configuration. The adapter needs the SA email, key path, and environment-specific calendar ID.
- **Alternatives considered**: Mapping/aliasing in adapter — rejected; env.ts should be the single source of truth.

### Event Title Format

- **Decision**: Title pattern `<ClassType> - <Level>` (e.g., "GROUP - Beginner", "INDIVIDUAL - Intermediate"). If no level, just `<ClassType>`.
- **Rationale**: Constitution explicitly requires no PII. Class type + level are the only non-PII identifiers.
- **Alternatives considered**: Including coach name — rejected as PII per constitution.

### Error Handling

- **Decision**: Wrap all Google API errors in `ServiceUnavailableError` (HTTP 503) with `crypto.randomUUID()` ref. Log full error details server-side but expose only `{ error: { code: "SERVICE_UNAVAILABLE", message, ref } }`.
- **Rationale**: Matches existing `ServiceUnavailableError` class and `AppError` hierarchy. Constitution says 503 for external dependency failures.
- **Alternatives considered**: Returning specific Google error codes — rejected; external API implementation details should not leak.

### Health Monitoring

- **Decision**: `CalendarHealthMonitor` class using in-memory sliding window of timestamps + success/fail booleans. Exposes `recordCall(success: boolean)`, `getHealth(): { status, failureRate, totalCalls, windowMinutes }`. Check failure rate >5% over each 5-minute window.
- **Rationale**: Simple, no external dependencies. In-process is acceptable for v1 per spec assumptions.
- **Alternatives considered**: Prometheus metrics — out of scope for v1. Database-backed persistence — unnecessary complexity for v1.

### Server-Side Only Enforcement

- **Decision**: No frontend changes needed for this feature. All Google Calendar calls originate from the backend Express server. Frontend communicates with backend via REST API only.
- **Rationale**: Constitution explicitly forbids browser-to-Google API calls. The existing architecture already has backend routes for classes and blocks (currently stubs).

### Capacity Constraints & Overlap Checking

- **Decision**: The CalendarProvider port provides `queryFreeBusy` for free/busy data. Domain services (to be built) will use this data to enforce gym capacity limits (max 2 individual + 1 group simultaneous).
- **Rationale**: Per constitution, capacity enforcement belongs in domain services, not in the adapter. This feature focuses on the calendar integration layer; capacity enforcement is a downstream dependency.

## Known Gaps

1. **env.ts update needed**: Must reconcile env var names between `.env` and Zod schema before adapter can authenticate.
2. **Class and Block route implementations**: These routes are currently 501 stubs. Full class/block CRUD use cases are needed to wire calendar operations. This plan covers only calendar integration; the use cases for class/block CRUD are dependencies that must exist before calendar sync can trigger.
3. **No domain entities for TrainingClass/Block**: Currently only in Prisma schema. Domain entities may be needed for full class management, but are not strictly required for the CalendarProvider port/adapter since the adapter works with simple data types.
