---

description: "Task list for Google Calendar infrastructure provisioning"

---

# Tasks: Google Calendar Infrastructure Setup

**Input**: Design documents from `/specs/005-google-calendar-setup/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not applicable — infrastructure provisioning with manual verification checklist (spec.md:165-171) and validation script (quickstart.md)

**Organization**: Tasks are grouped by provisioning phase + user story to enable independent verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/.env.example`
- This feature involves minimal code changes (npm dependency + env vars); primarily GCP-side manual steps.

---

## Phase 1: Setup (Local Environment & Dependencies)

**Purpose**: Install tooling and add backend dependency for Google Calendar API

- [ ] T001 Install Google Cloud SDK (`gcloud` CLI) — run `gcloud --version` to verify **(manual — user needs to install gcloud)**
- [ ] T002 [P] Authenticate gcloud: `gcloud auth login` and set default project context **(manual — user needs gcloud)**
- [X] T003 [P] Add `googleapis` npm dependency in `backend/package.json` (pinned to exact version `173.0.0`): `npm install googleapis --save-exact`
- [X] T004 Update `backend/.env.example` with Google Calendar environment variable placeholders per `specs/005-google-calendar-setup/data-model.md`

**Checkpoint**: Local environment ready — gcloud authenticated **(PENDING — user action needed)**, googleapis dependency installed, env template updated.

---

## Phase 2: Foundational (GCP Project, API & Service Account)

**Purpose**: Core GCP resources that MUST be provisioned before calendars can be set up

**⚠️ CRITICAL**: Calendar creation depends on having the Service Account email.

- [ ] T005 Create GCP project `coacher-scheduling-engine` with billing linked per `spec.md` Step 1 **(manual — needs gcloud + GCP Console)**
- [ ] T006 Enable Calendar API: `gcloud services enable calendar-json.googleapis.com --project=coacher-scheduling-engine` **(manual — needs gcloud)**
- [ ] T007 [P] Verify API is enabled: `gcloud services list --project=coacher-scheduling-engine --enabled | grep calendar` **(manual — needs gcloud)**
- [ ] T008 Create Service Account: `gcloud iam service-accounts create scheduling-engine-calendar-sa` **(manual — needs gcloud)**
- [ ] T009 Generate JSON key: `gcloud iam service-accounts keys create ./coacher-calendar-sa-key.json` **(manual — needs gcloud)**
- [ ] T010 Verify JSON key loads correctly: `gcloud auth activate-service-account --key-file=./coacher-calendar-sa-key.json` **(manual — needs gcloud)**
- [ ] T011 Move key file to secure path outside version control and add path to `.gitignore` **(manual — user action)**

**Checkpoint**: GCP project ready, Calendar API active, Service Account with key secured and loadable. No calendars yet.

---

## Phase 3: User Story 1 - Provision GCP Calendar Infrastructure (Priority: P1) 🎯 MVP

**Goal**: Developer can provision a complete working GCP Calendar API setup with per-environment calendars

**Independent Test**: Service Account can authenticate and list/create/update/delete events on all 3 system calendars via API

### Implementation for User Story 1

- [ ] T012 [US1] Create system calendar "Coacher Scheduling Engine [dev]" in Google Calendar UI per `spec.md` Step 5 **(manual — Google Calendar UI)**
- [ ] T013 [P] [US1] Create system calendar "Coacher Scheduling Engine [staging]" in Google Calendar UI per `spec.md` Step 5 **(manual — Google Calendar UI)**
- [ ] T014 [P] [US1] Create system calendar "Coacher Scheduling Engine [prod]" in Google Calendar UI per `spec.md` Step 5 **(manual — Google Calendar UI)**
- [ ] T015 [US1] Share all 3 calendars with Service Account email (writer permissions) per `spec.md` Step 6 **(manual — Google Calendar UI)**
- [ ] T016 [US1] Record Calendar IDs for all environments per `spec.md` Step 7 **(manual — Google Calendar UI)**
- [X] T017 [US1] Populate `backend/.env` with GOOGLE_CALENDAR_SA_EMAIL, GOOGLE_CALENDAR_SA_KEY_PATH, and all 3 Calendar IDs
- [X] T018 [US1] Create test script `backend/scripts/test-calendar-access.mjs` per `quickstart.md` and verify SA can list only the 3 system calendars
- [X] T019 [US1] Create test script `backend/scripts/test-calendar-crud.mjs` to verify SA can create/read/update/delete events on each calendar
- [X] T020 [US1] Create automated provisioning script `scripts/setup-gcp-calendar.sh` wrapping gcloud commands for reproducibility per FR-011

**Checkpoint**: All 3 calendars provisioned, SA has writer access, API access verified end-to-end, setup reproducible via script.

---

## Phase 4: User Story 2 - Security Review & Least-Privilege Verification (Priority: P1)

**Goal**: Security reviewer confirms least-privilege access and no credential leakage

**Independent Test**: SA has no GCP IAM roles beyond default; key file absent from git history; calendar access restricted to shared calendars only

### Implementation for User Story 2

- [ ] T021 [US2] Verify no broad IAM roles on SA: `gcloud projects get-iam-policy coacher-scheduling-engine` — confirm no roles assigned beyond default
- [ ] T022 [P] [US2] Verify SA cannot access unshared calendars: run `test-calendar-access.mjs` — confirm only 3 expected calendars appear
- [ ] T023 [P] [US2] Verify key file not in git: `git log --all -- '**/coacher-calendar-sa-key*'` returns empty
- [ ] T024 [P] [US2] Verify `.gitignore` excludes key file path: confirm entry in `backend/.gitignore` or root `.gitignore`
- [ ] T025 [US2] Confirm calendar sharing permissions: review each calendar's "Share with specific people" — only SA email present with writer role

**Checkpoint**: Security post-conditions verified — no IAM leakage, no git history contamination, no unauthorized calendar access.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and validation

- [ ] T026 Run full `quickstart.md` validation sequence end-to-end **(manual — needs all GCP steps completed first)**
- [X] T027 [P] Update `docs/infrastructure.md` with GCP project configuration reference
- [X] T028 [P] Document SA key rotation procedure in operations runbook (`docs/operations.md`)
- [X] T029 [P] Document calendar recovery procedure (if calendar deleted accidentally) in `docs/operations.md`
- [X] T030 [P] Document SA deletion recovery procedure in `docs/operations.md`
- [X] T031 [P] Document billing-disabled recovery procedure in `docs/operations.md`

**Checkpoint**: Full documentation complete including all edge case recovery procedures.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — needs SA email before calendar sharing
- **US2 (Phase 4)**: Depends on US1 completion — needs calendars provisioned before verifying access boundaries
- **Polish (Phase 5)**: Depends on US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after User Story 1 — needs provisioned infrastructure to verify

### Within Each User Story

- Provisioning steps before verification
- Calendar creation before sharing
- Calendar sharing before API access verification

### Parallel Opportunities

- All Phase 1 tasks can run in parallel
- T007 (verify API) can run with T008/T009 (SA creation) — T007 is a verification step
- All 3 calendar creations (T012-T014) can run in parallel
- T022-T024 (security checks) can all run in parallel
- T027-T031 (documentation) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Create all 3 calendars in parallel:
Task: "Create [dev] calendar in Google Calendar UI"
Task: "Create [staging] calendar in Google Calendar UI"
Task: "Create [prod] calendar in Google Calendar UI"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — install gcloud, add googleapis dep
2. Complete Phase 2: Foundational — project, API, SA + key
3. Complete Phase 3: User Story 1 — calendars, sharing, env vars, verification, provisioning script
4. **STOP and VALIDATE**: Run `test-calendar-access.mjs` to verify SA can access all 3 calendars
5. Infrastructure is ready for scheduling engine development

### Incremental Delivery

1. Complete Setup + Foundational → GCP project ready for any Calendar work
2. Add User Story 1 → Calendars provisioned and verified → Can begin scheduling engine integration
3. Add User Story 2 → Security posture verified → Ready for production

---

## Notes

- [P] tasks = different resources, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each logical group of provisioning steps
- No automated tests — verification is manual via `gcloud` commands and test scripts
- Tasks T018 and T019 create runnable Node.js scripts using the `googleapis` package installed in T003
- Task T020 creates a reusable shell script under `scripts/` for future reprovisioning or CI
