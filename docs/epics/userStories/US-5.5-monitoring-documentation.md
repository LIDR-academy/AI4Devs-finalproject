# US-5.5: Monitoring, Logging & Documentation

**Part of:** US-5.5 — Monitoring, Logging & Documentation
**Epic:** EP-05 — Production Launch

## Tasks

- [ ] T-5.5.1: **Backend** — Set up structured JSON logging with pino: custom serializers to redact `req.headers.authorization`, `req.body.password`, `req.body.token`, and similar sensitive fields
- [ ] T-5.5.2: **Backend** — Implement security event logging: auth attempts (success/failure with reason), class creation/cancellation (actor, resource), waiting list joins/leaves, role/level changes, financial data access
- [ ] T-5.5.3: **Backend** — Set up anomaly detection: >5 failed logins from same IP in 5 min → alert, rapid booking/cancellation >10/min/user → alert, Google Calendar >5% failure rate in 5 min window → alert
- [ ] T-5.5.4: **Backend** — Generate OpenAPI 3.1 specification covering all endpoints with request/response schemas and error codes
- [ ] T-5.5.5: **Documentation** — Configure Mintlify (or similar) to host API docs, auto-deploy from CI on merge to main
- [ ] T-5.5.6: **Backend** — Ensure global error handler captures all unhandled rejections/exceptions, returns 503 with unique error ref ID, logs full error detail server-side

---

