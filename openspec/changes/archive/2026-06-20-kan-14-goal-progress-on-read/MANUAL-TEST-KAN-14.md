# Manual test checklist — KAN-14 (US-04 scenario 9)

**Prerequisites:** Backend on `:3000`, frontend on `:5173`, PostgreSQL migrated, dev login. KAN-11 goals module and Home must be available.

## Scenario 1 — Goal progress updates after mark as read

1. Log in and open `/` (Home).
2. Set annual goal to `50` if not already set; note current count `N / 50`.
3. Open `/book-tracker` and mark a **pendiente** or **leyendo** book as **Leído** (complete or dismiss modal).
4. Navigate to `/` without full page reload.
5. **Expected:** Goal card shows `(N + 1) / 50` and updated percentage; forecast message updates when sufficient data exists.

## Scenario 2 — Revert from Leído decrements count

1. On Book Tracker, change a **Leído** book back to **Leyendo**.
2. Navigate to Home.
3. **Expected:** Goal count decrements by one compared to scenario 1.

## Scenario 3 — Cross-year finish date edit

1. Mark a book **Leído** with finish date in the current UTC year.
2. Edit **Fecha de fin** inline to a date in the previous UTC year.
3. Return to Home (current year goal).
4. **Expected:** Current-year count decrements; prior-year count would increment if a goal existed for that year (`GET /v1/goals/{priorYear}` via API smoke).

## Scenario 4 — Book finished outside goal year

1. Mark a book **Leído** with finish date in **last year** (via inline date or modal).
2. Check Home for **current** year goal.
3. **Expected:** Current-year count does **not** increment.

## API smoke (curl)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"kan14-manual@example.com"}' | jq -r .access_token)

YEAR=$(date -u +%Y)

curl -s -X PUT "http://localhost:3000/v1/goals/$YEAR" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"target_book_count":50}' | jq

# Create book, PATCH leido, GET goals — see tasks step 7 report
```

| Step | Pass | Notes |
| --- | --- | --- |
| 1 Mark read → Home | | |
| 2 Revert decrement | | |
| 3 Cross-year edit | | |
| 4 Outside year | | |

**Out of scope:** TBR auto-complete (KAN-13), stats dashboard (KAN-15), backend GoalsService hook.
