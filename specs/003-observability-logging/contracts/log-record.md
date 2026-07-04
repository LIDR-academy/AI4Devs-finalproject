# Contract: Structured Log Record

This is the contract other systems (CloudWatch Logs, any future log viewer, and operators reading raw stdout) can rely on. Field shapes are defined in [data-model.md](../data-model.md#log-record).

## Production mode (`NODE_ENV=production`)

One JSON object per line on stdout. Example — request log:

```json
{"time":"2026-07-04T10:00:00.000Z","level":"info","requestId":"3fa2c1a0-...","method":"POST","url":"/api/pantry/items","statusCode":201,"durationMs":42,"userId":"usr***"}
```

Example — error log (same `requestId` as the request that triggered it):

```json
{"time":"2026-07-04T10:00:00.010Z","level":"error","requestId":"3fa2c1a0-...","module":"PantryService","message":"Item not found","err":{"name":"NotFoundException","stack":"..."}}
```

## Development mode (`NODE_ENV!=production`)

Same fields, rendered human-readable via `pino-pretty` instead of raw JSON. No consumer other than a human reading the terminal depends on this format.

## Guarantees

- Every log line is valid JSON in production (parseable by CloudWatch Logs Insights without a custom parser).
- `requestId` is present and consistent across all log lines emitted while handling a single request.
- `userId`, when present, is always in masked form (`<first-3-chars>***`) — never the raw ID. Email, receipt content, and item notes are never a field on any log record.
- Absence of a field (e.g. `module`/`err` on a non-error log) means that field is omitted entirely, not `null`.
- Pino-http also attaches its own internal `reqId` (a small auto-incrementing integer, not the `requestId` uuid) to every log line via its request-scoped child logger. This is harmless (not PII, not derived from request content) and is a side effect of using `quietReqLogger`/`quietResLogger` to prevent pino-http from attaching the *full* raw `req`/`res` objects — see `research.md` Decision 1 addendum.
