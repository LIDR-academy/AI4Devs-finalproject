# US-5.1: Security Hardening

**Part of:** US-5.1 — Security Hardening
**Epic:** EP-05 — Production Launch

## Tasks

- [ ] T-5.1.1: **Backend** — Audit all API endpoints for Zod validation coverage; ensure every request body is validated before reaching business logic
- [ ] T-5.1.2: **Backend** — Verify rate limiting config: global 100 req/min, auth 10 req/min, express-rate-limit with proper headers
- [ ] T-5.1.3: **Backend** — Verify CORS configuration (single origin), helmet middleware (HSTS, nosniff, DENY frame, CSP), and CSP allows Tailwind inline styles + FCM connect-src
- [ ] T-5.1.4: **Backend** — Audit Coach financial data encryption: confirm AES-256-GCM with `crypto.createCipheriv`, key from env var (COACH_FINANCIAL_ENCRYPTION_KEY)
- [ ] T-5.1.5: **Backend** — Verify pino serializer redacts `req.headers.authorization`, `req.body.password`, and similar sensitive fields
- [ ] T-5.1.6: **Backend** — Run `npm audit --audit-level=high`, fix or document any high/critical vulnerabilities
- [ ] T-5.1.7: **Frontend** — Verify React JSX escaping for all user-rendered data (coachee names, class descriptions, notification text)

---

