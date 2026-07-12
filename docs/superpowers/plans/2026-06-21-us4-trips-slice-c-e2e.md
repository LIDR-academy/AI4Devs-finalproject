# US4 — My Trips & Cancellation (Slice C: Playwright journey) Implementation Plan

> Executed inline (E2E verification is stack-bound + interactive). Steps use checkbox (`- [ ]`) tracking.

**Goal:** Add the mandated browser E2E for the new cancellation journey — book → confirm → **My Trips → open trip → cancel → see it cancelled (full refund)** — driving the real frontend → backend → Postgres, completing US4's flow-test coverage.

**Architecture:** One thin Playwright spec reusing the existing harness (`playwright.config.ts` points at the running stack; `docker-compose.e2e.yml` builds frontend with `NEXT_PUBLIC_E2E=true` so payment uses the stub). The booking steps shared with `booking-journey.spec.ts` are extracted into `tests/e2e/helpers.ts` (DRY); the new spec continues from confirmation into cancellation. All selectors are the `data-testid`s already added in Slice B (`view-trips-button`, `trip-card`, `open-cancel-button`, `cancellation-modal`, `confirm-cancel-button`).

**Tech Stack:** Playwright (`@playwright/test`), Docker Compose e2e stack, Next.js/React frontend, Kotlin/Spring backend + StubPaymentAdapter.

**Scope:** Slice C of 3 (`docs/superpowers/specs/2026-06-20-us4-my-trips-cancellation-design.md`). Slices A (backend) + B (frontend) merged. No issue number (journey coverage); references US4.

**Branch:** `us4-trips-slice-c-e2e`.

**Conventions (from the frontend-e2e-playwright skill):** navigate via the results list (no Mapbox); pay via the E2E stub; dates relative to today inside `CURRENT_DATE..+89` and clear of seed bookings (`+10-14`, `+20-23`, `+40-45`) — use `46 + (Date.now() % 40)`; `data-testid` selectors; no arbitrary sleeps (web-first assertions); keep the suite thin.

---

### Task 1: Extract a shared booking helper

**Files:**
- Create: `frontend/tests/e2e/helpers.ts`
- Modify: `frontend/tests/e2e/booking-journey.spec.ts` (use the helper — keep its confirmation assertions)

- [ ] **Step 1:** Create `helpers.ts` with `isoDate(daysFromNow)` and `registerAndBookConfirmedStay(page)` that runs register → search (Barcelona + dates) → open property → reserve (via `?check_in&check_out`) → pay (E2E stub) and asserts arrival on `/confirmation/...`. Returns `{ email, propertyId, checkIn, checkOut }`.
- [ ] **Step 2:** Refactor `booking-journey.spec.ts` to call the helper, then keep its existing confirmation assertions (heading "Booking Confirmed!", `^BK-` reference). No behavior change.

### Task 2: Cancellation journey spec

**Files:**
- Create: `frontend/tests/e2e/trips-cancellation.spec.ts`

- [ ] **Step 1:** New spec: `await registerAndBookConfirmedStay(page)` → on the confirmation page click `view-trips-button` → assert `/trips` and a `trip-card` is visible → click it → assert `/trips/[id]` detail shows `confirmed` + `open-cancel-button` → click it → assert `cancellation-modal` visible with a refund amount → click `confirm-cancel-button` → assert the booking now shows `cancelled` and `open-cancel-button` is gone (cancellation persisted + refetched).

### Task 3: Verify against the full e2e stack

- [ ] **Step 1:** `docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d` (builds backend + frontend, reuses postgres + mailhog). Wait for both healthy. NEVER `down -v` (preserve the dev volume).
- [ ] **Step 2:** `cd frontend && npx playwright test` — run BOTH specs (booking-journey regression + new cancellation journey). Expect green. Iterate selectors/timing if needed (web-first assertions, no sleeps).
- [ ] **Step 3:** Tear down only the app containers (keep postgres + mailhog): `docker rm -f stayhub-frontend-e2e stayhub-backend-e2e` (or `compose ... stop backend frontend`).

### Task 4: PR

- [ ] Commit, push `us4-trips-slice-c-e2e`, open PR (title "US4 Slice C — cancellation journey E2E"). Note the e2e CI job is non-blocking; this is the journey that completes US4 flow coverage. Do not close issues.

## Self-review
- Coverage: the full book→cancel journey across pages + real API ✓; reuses stub-pay + results-list nav per skill ✓; thin (one new spec + shared helper) ✓; verified by an actual run against the built stack ✓.
- Selectors all exist from Slice B; dates use the per-run offset to avoid shared-DB 409s.
