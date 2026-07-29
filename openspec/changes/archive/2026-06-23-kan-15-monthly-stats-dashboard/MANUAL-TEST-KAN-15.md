# Manual test checklist — KAN-15 (US-05 / UC-07)

**Prerequisites:** Backend on `:3000`, frontend on `:5173`, PostgreSQL migrated, dev login. At least one book marked **Leído** with a `finished_on` in the target month, ideally with mixed genres, ratings, and read formats.

## Scenario 1 — Books and pages read (US-05 scenario 1)

1. Log in and open `/stats` (also reachable via the **Reading Stats** link on Home).
2. The dashboard defaults to the current UTC month.
3. **Expected:** KPI cards show the number of books read and total pages read for the month, matching the underlying records (books with no `page_count` add 0 pages). Average rating shows over rated books only, or `—` when none are rated.

## Scenario 2 — Genre distribution chart (US-05 scenario 2)

1. With finished books of different genres in the month, observe the **Distribución por género** chart.
2. **Expected:** One bar per genre with its count; books without a genre appear under **Sin género** (`unknown`); bars are ordered by count descending.

## Scenario 3 — Change month recalculates indicators (US-05 scenario 3)

1. Use the month selector to pick a different month.
2. **Expected:** KPIs and charts refetch and update for the selected month without a full page reload.

## Scenario 4 — Empty month

1. Select a month with no books marked **Leído**.
2. **Expected:** KPI cards show 0 / 0 / `—` and an empty-state message instead of charts or an error.

## Scenario 5 — Cache coherence with Book Tracker

1. Open `/stats` for the current month and note `books_read`.
2. In `/book-tracker`, mark a book **Leído** with a finish date in that month.
3. Return to `/stats`.
4. **Expected:** `books_read` and the distributions reflect the new book without a manual refresh (stats query invalidated on the `leido` transition).

## API smoke (curl)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"kan15-manual@example.com"}' | jq -r .access_token)

# Empty month → 200 zeroed payload
curl -s "http://localhost:3000/v1/stats/2025/2" \
  -H "Authorization: Bearer $TOKEN" | jq

# Invalid month / year → 400
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/v1/stats/2025/13" -H "Authorization: Bearer $TOKEN"
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/v1/stats/1800/6" -H "Authorization: Bearer $TOKEN"

# No token → 401
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/v1/stats/2025/6"
```


| Step       | Pass | Notes |
| ---------- | ---- | ----- |
| Scenario 1 | YES |       |
| Scenario 2 | YES  |       |
| Scenario 3 | YES  |       |
| Scenario 4 | YES  |       |
| Scenario 5 | YES  |       |
| API smoke  | YES  |       |


