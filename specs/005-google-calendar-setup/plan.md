# Implementation Plan: Google Calendar Infrastructure Setup

**Branch**: `005-google-calendar-setup` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-google-calendar-setup/spec.md`

## Summary

Provision the complete Google Cloud infrastructure required for the scheduling engine to authenticate and interact with Google Calendar programmatically. This is a one-time setup of a GCP project, Calendar API enablement, Service Account with JSON key, and per-environment dedicated system calendars (dev/staging/prod). The resulting credentials are consumed by the existing backend scheduling engine.

## Technical Context

**Language/Version**: N/A (infrastructure provisioning — `gcloud` CLI, Google Calendar API v3)

**Primary Dependencies**: `gcloud` CLI (Google Cloud SDK), Google Calendar API (`calendar-json.googleapis.com`)

**Storage**: N/A — calendar data lives in Google Calendar (SaaS)

**Testing**: Manual verification via checklist in spec (`spec.md:165-171`); no automated test suite for provisioning

**Target Platform**: Google Cloud Platform (server-side, no end-user compute)

**Project Type**: Infrastructure provisioning (one-time GCP setup)

**Performance Goals**: N/A — no application code; Calendar API latency handled later by scheduling engine

**Constraints**: 
- Service Account key MUST NOT be committed to version control (Constitution §III.4)
- All credentials injected via environment variables
- Least-privilege: no broad GCP IAM roles for the Service Account
- Calendar access exclusively server-side via Service Account (Constitution §Performance & UX.1)

**Scale/Scope**: 1 GCP project, 1 Service Account, 3 calendars (dev/staging/prod)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain Purity | PASS — no application code in this feature (infrastructure only) | |
| II. Test-First | PASS — not applicable (infrastructure provisioning, no domain services) | |
| III. Security-by-Default | PASS — spec enforces least-privilege SA, no broad IAM roles, secrets managed via env vars | §IV.4 (secrets management) directly satisfied by FR-006, FR-010 |
| IV. API Contract Consistency | PASS — no new API endpoints in this feature | |
| V. Dependency Integrity | PASS — no npm dependencies introduced | |

**Security Requirements Check**:
- [x] Rate limiting: N/A (no endpoints)
- [x] Security headers: N/A (no endpoints)
- [x] Error handling: Deferred to scheduling engine implementation
- [x] Secrets management: FR-006, FR-010 explicitly require env-var injection; Configuration Steps guide secure key storage
- [x] Security event logging: Deferred to scheduling engine implementation
- [x] Google Calendar server-side only: Confirmed by architecture (Constitution §Performance & UX.1)
- [x] Calendar event titles (zero PII): Deferred to scheduling engine implementation

**Gate decision**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-google-calendar-setup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# No source code changes — this is infrastructure provisioning only.
# The resulting credentials (SA key path, Calendar IDs) are consumed
# as environment variables by the existing backend at runtime.
```

**Structure Decision**: No application code changes. All artifacts are documentation within `specs/005-google-calendar-setup/`. The backend `.env` file (already in `.gitignore`) will be updated with the new environment variables.

## Complexity Tracking

> No Constitution violations detected. No complexity justification required.
