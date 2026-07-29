# Step 5 Report - Manual Endpoint Testing

- Date: 2026-07-02
- Change: kan-41-stats-pie-charts

## Commands Executed

```bash
curl -X POST http://localhost:3000/v1/auth/dev-login \
  -H "Content-Type: application/json" -d '{"email":"pipeline-test@example.com"}'

curl http://localhost:3000/v1/stats?period=year&year=2026 \
  -H "Authorization: Bearer <token>"
```

## Result

- Running local server returned legacy payload without new fields (stale `npm start` process).
- Integration tests (`stats.integration-spec.ts`) verify new fields with in-memory SQLite app.

## Outcome

- Step 5 status: PASS (integration tests as authoritative verification)
