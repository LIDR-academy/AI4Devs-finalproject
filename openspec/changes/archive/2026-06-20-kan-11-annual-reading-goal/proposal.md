## Why

KAN-12 (US-04) delivers reliable `leido` + `finished_on` data, but readers still cannot set or track an annual reading goal — a core MVP retention feature in the PRD and UC-06. Without `annual_reading_goals` and a Home progress widget, the product cannot show «20 / 50», percentage progress, or a pace-based forecast. KAN-11 (US-03) closes that gap now that reading-record lifecycle and TBR hooks are in place.

## What Changes

- **Database:** new table `annual_reading_goals` with `UNIQUE (user_id, year)` and `CHECK (target_book_count > 0)` per `readme.md` §3.2.6.
- **`goals` module (backend):** `GoalsService` with upsert, progress count (`leido` + `finished_on` in calendar year), and linear forecast calculation.
- **REST API:** `GET /v1/goals/{year}`, `PUT /v1/goals/{year}` returning goal, `books_read`, `progress_percent`, and optional `forecast`.
- **Home UI:** new `/` route with `AnnualGoalCard` — set/edit target, show «N / target», progress bar, and forecast message when data is sufficient.
- **Cache coherence:** invalidate TanStack Query `['goals', year]` after reading-record PATCH transitions to `leido` so the Home card updates without reload.
- **Docs & tests:** update `docs/data-model.md` and `docs/api-spec.yml`; integration tests for goals CRUD and forecast; manual checklist `MANUAL-TEST-KAN-11.md`.

**Non-goals (explicit):**

- Dedicated `/goals` page with multi-year history or evolution charts (follow-up ticket).
- Side-effect hook in `BooksService` beyond client cache invalidation (progress is computed on read).
- `StatsService` monthly KPIs (KAN-15).
- Notifications, challenges, or social goal sharing.
- Import-driven backfill of past-year goals (UC-08).

## Capabilities

### New Capabilities

- `annual-reading-goal-api`: Schema migration, `GoalsModule` / `GoalsService`, authenticated REST endpoints, progress aggregation, forecast calculation.
- `annual-goal-home-ui`: Home page route, annual goal card component, TanStack Query wiring, form validation for target input.

### Modified Capabilities

- `book-tracker-lifecycle-ui`: Extend cache coherence to invalidate `['goals', year]` when status transitions to `leido` (UTC year of `finished_on`).

## Impact

- **Backend:** new `backend/src/goals/` module; migration; register in `app.module.ts`.
- **Frontend:** `HomePage`, `AnnualGoalCard`, `api/client.ts` + `api/types.ts`, route `/` in `App.tsx`; extend Book Tracker PATCH handler for goals cache invalidation.
- **Docs:** `docs/data-model.md`, `docs/api-spec.yml`, `docs/product/user-stories.md` (link KAN-11 on US-03 / US-04 scenario 9).
- **Product refs:** US-03, UC-06; Jira **KAN-11** (épica KAN-6).
- **Dependencies:** KAN-12 (`reading_records` with `status = leido` and `finished_on`). Recommended after KAN-13 (TBR hook stable).
