# Manual test — KAN-11 Annual reading goal (US-03)

**Change:** `kan-11-annual-reading-goal`  
**Prerequisites:** Backend on `:3000`, frontend on `:5173`, Postgres migrated, dev login.

## Scenario 1 — Save annual goal (Home)

1. Log in and open `/` (Home).
2. Enter `50` as annual target and click **Guardar**.
3. **Expected:** Card shows saved target; `PUT /v1/goals/{year}` returns 200.

## Scenario 2 — View progress

1. With goal `50`, mark at least one book as `leido` with `finished_on` in the current year (Book Tracker).
2. Return to Home.
3. **Expected:** Card shows `N / 50` and matching percentage with progress bar.

## Scenario 3 — Completion forecast

1. With goal set and ≥1 book `leido` early enough in the year (≥7 days elapsed per API rules).
2. **Expected:** Forecast message appears (ahead / on track / behind).
3. With a brand-new goal and no reads, **expected:** neutral copy about marking books read.

## Cache coherence

1. Note current count on Home goal card.
2. Mark another book `leido` on Book Tracker.
3. Navigate to Home without full reload.
4. **Expected:** Count increments (TanStack Query `['goals', year]` invalidated).

## API smoke (curl)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"kan11-manual@example.com"}' | jq -r .access_token)

YEAR=$(date -u +%Y)

curl -s -X PUT "http://localhost:3000/v1/goals/$YEAR" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"target_book_count":50}' | jq

curl -s "http://localhost:3000/v1/goals/$YEAR" \
  -H "Authorization: Bearer $TOKEN" | jq
```

| Step | Pass | Notes |
| --- | --- | --- |
| 1 Save goal | API ✓ | UI: verify manually at `/` |
| 2 Progress display | API ✓ | 1/50 after PATCH leido |
| 3 Forecast | API ✓ | `status: behind` with 1 book in Jun |
| Cache on leido | Code ✓ | `invalidateQueries(['goals', year])` on transition |
