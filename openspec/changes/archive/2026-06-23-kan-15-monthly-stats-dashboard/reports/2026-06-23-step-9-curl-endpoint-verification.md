# Step 9 Report - Manual Endpoint Testing (curl)

- Date: 2026-06-23
- Change: kan-15-monthly-stats-dashboard
- Agent: Cursor (openspec-apply-change)

## Environment

- An ephemeral backend instance built from this branch was started on port **3010** (`PORT=3010 nest start`) to avoid disturbing the user's existing servers on `:3000`/`:3001`. It connected to the dev PostgreSQL (`postgresql://...@localhost:5433/reading_analytics`).
- Startup log confirmed the new route: `Mapped {/v1/stats/:year/:month, GET}` and `StatsController {/v1/stats}`.
- The instance was stopped after testing; port 3010 confirmed free.

## Commands Executed and Results

GET-only and error cases (no data mutation required):

```bash
# 1) No token → 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/v1/stats/2025/6
# → 401

# 2) Dev login (creates/returns user)
TOKEN=$(curl -s -X POST http://localhost:3010/v1/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"kan15-curl@example.com"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
# → token length 232

# 3) Empty month → 200 with zeroed payload
curl -s http://localhost:3010/v1/stats/2025/2 -H "Authorization: Bearer $TOKEN"
# → {"year":2025,"month":2,"books_read":0,"pages_read":0,"average_rating":null,
#    "genre_distribution":[],"format_distribution":[],"predominant_format":null}  (HTTP 200)

# 4) Invalid month (13) → 400
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/v1/stats/2025/13 -H "Authorization: Bearer $TOKEN"
# → 400

# 5) Invalid year (1800) → 400
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/v1/stats/1800/6 -H "Authorization: Bearer $TOKEN"
# → 400
```

| Case | Expected | Actual | Pass |
| --- | --- | --- | --- |
| No token | 401 | 401 | ✅ |
| Empty month | 200 + zeroed payload | 200 + zeroed payload | ✅ |
| Invalid month 13 | 400 | 400 | ✅ |
| Invalid year 1800 | 400 | 400 | ✅ |

## Seeded-aggregation coverage

The populated-month path (correct `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, `predominant_format`, boundary inclusion/exclusion, non-`leido` exclusion, and per-user isolation) is fully exercised by `test/stats.integration-spec.ts` (11 tests) via supertest against a real Nest application. This avoids seeding/cleaning the shared dev database for equivalent assertions.

## Database State Restoration

- `dev-login` created one `users` row (`kan15-curl@example.com`). It was deleted afterward via the `pg` client (`DELETE FROM users WHERE email='kan15-curl@example.com'` → 1 row), restoring the pre-test state.
- No books or reading records were created by these read-only/error cases.

## Outcome

- Step 9 status: PASS
- Blocking issues: none
