# EP-05: Production Launch

## Milestone
**Application is secure, tested, deployable, and mobile-ready.**

## Description
Harden security, implement comprehensive testing, set up CI/CD and deployment, optimize for PWA/mobile, and add monitoring/logging. After this epic, the application is production-ready and can be deployed and operated reliably.

## Priority: High
## Dependencies: EP-02 (Scheduling), EP-03 (Coachee Self-Service), EP-04 (Notifications)

---

## User Stories

### US-5.1: Security Hardening

**As a** company,  
**I want** the application to implement security best practices,  
**So that** user and coach data is protected.

**Acceptance Criteria:**
- [ ] All endpoints have Zod input validation (malformed input → 400)
- [ ] Rate limiting: 100 req/min globally, 10 req/min on `/auth/login`
- [ ] CORS restricted to single frontend origin
- [ ] Security headers set via helmet (HSTS, X-Content-Type-Options, X-Frame-Options, CSP)
- [ ] Coach financial data encrypted with AES-256-GCM at rest
- [ ] No secrets in logs (passwords, tokens, PII redacted)
- [ ] SQL injection prevented (Prisma parameterized queries, no raw SQL)
- [ ] npm audit passes with no high/critical vulnerabilities
- [ ] Exact version pinning for all dependencies

**Task File:** `userStories/US-5.1-security-hardening.md`

---

### US-5.2: Testing Suite

**As a** developer,  
**I want** comprehensive automated tests,  
**So that** the application is reliable and regressions are caught early.

**Acceptance Criteria:**
- [ ] Unit tests for all domain services: CapacityValidator, OverlapChecker, ReachCalculator, WaitlistEngine, ProcessWaitingListService
- [ ] Integration tests for all API endpoints (auth, classes, blocks, waiting lists, notifications)
- [ ] E2E tests for critical user flows:
  - Login flow (all roles)
  - Create class + view in calendar
  - Coachee joins class + cancels
  - Waiting list join + cancellation triggers
  - Notification delivery
- [ ] Tests run in CI on every PR
- [ ] Test coverage thresholds established
- [ ] External services (Google Calendar, FCM) mocked in integration/E2E tests

**Task File:** `userStories/US-5.2-testing-suite.md`

---

### US-5.3: CI/CD & Deployment

**As a** developer,  
**I want** automated build, test, and deployment,  
**So that** releases are consistent and fast.

**Acceptance Criteria:**
- [ ] Dockerfile for backend (non-root user, health check)
- [ ] Docker Compose for local development (api + db + frontend)
- [ ] GitHub Actions workflow: lint → typecheck → test → build → deploy
- [ ] PR checks block merge on failure
- [ ] Production deployment on Render (or similar) with managed PostgreSQL
- [ ] Staging environment with separate database and secrets
- [ ] Environment variables injected via deployment dashboard (never committed)
- [ ] Health check endpoint (`GET /health`) returns minimal 200 OK

**Task File:** `userStories/US-5.3-cicd-deployment.md`

---

### US-5.4: PWA & Mobile Optimization

**As a** Coachee,  
**I want** to install the app on my mobile device and have a fast, native-like experience,  
**So that** I can access the platform conveniently.

**Acceptance Criteria:**
- [ ] PWA manifest configured with app icons and theme colors
- [ ] Service Worker precaches static assets
- [ ] "Add to Home Screen" prompt appears for eligible users
- [ ] App functions offline for cached content
- [ ] Push notifications work when installed (via service worker)
- [ ] Lighthouse performance score > 90
- [ ] Code splitting and lazy loading implemented
- [ ] Mobile responsive: no horizontal scroll, touch-friendly targets

**Task File:** `userStories/US-5.4-pwa-mobile-optimization.md`

---

### US-5.5: Monitoring, Logging & Documentation

**As a** developer,  
**I want** monitoring, structured logging, and API documentation,  
**So that** the application can be operated reliably in production.

**Acceptance Criteria:**
- [ ] Structured JSON logging with pino, custom serializers to redact sensitive fields
- [ ] Security events logged: auth attempts (success/failure), class create/cancel, waiting list joins/leaves, level changes, financial data access
- [ ] Anomaly detection alerts: >5 failed logins/5 min, >5% Calendar API failure rate
- [ ] OpenAPI 3.1 specification generated for all endpoints
- [ ] API documentation hosted on Mintlify (auto-deployed from CI)
- [ ] Global error handler catches all unhandled errors
- [ ] Error responses include unique ref ID for traceability
- [ ] No stack traces or internal details exposed to client

**Task File:** `userStories/US-5.5-monitoring-documentation.md`
