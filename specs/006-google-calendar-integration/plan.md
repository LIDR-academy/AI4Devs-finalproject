# Implementation Plan: Google Calendar Integration

**Branch**: `006-google-calendar-integration` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-google-calendar-integration/spec.md`

## Summary

Implement the CalendarProvider domain port + GoogleCalendarAdapter infrastructure adapter to make Google Calendar the scheduling source of truth. This covers: port interface definition, adapter implementation (create/update/delete events, free/busy queries), syncing TrainingClass and Block operations to Google Calendar, server-side-only free/busy, PII-free event titles, 503 error handling with unique refs, and calendar health monitoring.

## Technical Context

**Language/Version**: Node.js 22 LTS, TypeScript 5.x

**Primary Dependencies**: Express 4.x, Prisma, googleapis 173.0.0 (already installed), Zod, Pino

**Storage**: PostgreSQL 16 via Prisma ORM (existing)

**Testing**: Vitest + Supertest (unit/integration), Playwright (E2E)

**Target Platform**: Linux (Docker container on Render)

**Project Type**: Web service (Express REST API under `/api/v1/`)

**Performance Goals**: Free/busy queries MUST respond within 500ms p95 per constitution. If Google Calendar latency exceeds this, implement server-side caching.

**Constraints**: All Google Calendar API calls server-side only (no browser-to-Google); event titles contain only class type + level (no PII); errors return 503 with unique UUID ref; failure rate >5% in 5 min triggers health alert.

**Scale/Scope**: Single gym scheduling platform; target of ~100 class operations/day. Calendar health monitoring is in-process (no external metrics service for v1).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Check | Status |
|---------|-------|--------|
| I. Domain Purity | CalendarProvider port in domain layer has zero infra deps; GoogleCalendarAdapter lives in infrastructure/adapters/calendar/ | ✅ PASS |
| II. Test-First for Domain Logic | Given/When/Then scenarios defined in spec for all 5 user stories; tests to be written before implementation code | ✅ PASS |
| III. Security-by- Default | Server-side only (no browser-to-Google); no PII in titles; 503 with unique ref; no stack traces exposed | ✅ PASS |
| IV. API Contract Consistency | 503 error envelope `{ error: { code, message, ref } }` matches existing pattern | ✅ PASS |
| V. Dependency Integrity | googleapis@173.0.0 already pinned to exact version | ✅ PASS |
| Security: Error handling | 503 for external dependency failures — matches ServiceUnavailableError pattern | ✅ PASS |
| Security: Secrets mgmt | SA key loaded from env (existing pattern); no key in code | ✅ PASS |
| Performance: Free/busy latency | Constitution requires 500ms p95 for free/busy. Research and design target 500ms p95. Implementation must achieve this. | ✅ PASS |
| Performance: Server-side only | No Google API calls from browser — all calls through backend adapter | ✅ PASS |

**Post-Phase 1 Verdict**: ALL GATES PASS. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-google-calendar-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── CalendarProvider.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── domain/
    │   └── ports/
    │       └── CalendarProvider.ts       # NEW - port interface
    ├── infrastructure/
    │   └── adapters/
    │       └── calendar/
    │           ├── GoogleCalendarAdapter.ts   # NEW - adapter implementation
    │           └── CalendarHealthMonitor.ts   # NEW - health tracking
    └── config/
        └── container.ts                    # UPDATE - wire calendar deps
```

**Structure Decision**: Follows existing hexagonal architecture — domain port in `domain/ports/`, adapter in `infrastructure/adapters/calendar/`, and DI wiring in `config/container.ts`. No frontend changes needed (Calendar API remains server-side only).

## Complexity Tracking

No constitution violations requiring justification.
