# Extended Non-MVP Product Requirements Document

**Product:** RealSaveFooding  
**Version:** 1.1 — Post-MVP Extension  
**Date:** 2026-06-20  
**Status:** Draft

---

## Executive Summary

The MVP (Deliverable 2) has been completed, delivering a working full-stack application covering authentication, pantry management, receipt OCR, expiration intelligence, household sharing, consumption/waste tracking, notifications, dashboard, price comparison, and schema hardening across 13 tickets.

This document identifies the functional gaps between the MVP and a production-ready (GA) product. It classifies all remaining features by priority, provides user stories, acceptance criteria, and a phased release strategy.

Strategic future capabilities (native app, ML prediction, supermarket QR partnerships, cross-user benchmarking) are out of scope for this phase and are documented separately in [6_Future-Capabilities.md](./6_Future-Capabilities.md).

---

## Current State Assessment

### Implemented in MVP

| Capability | Ticket(s) | Status |
|---|---|---|
| JWT authentication (register, login, me) | TKT-001 | ✅ Implemented |
| Pantry CRUD + manual add, edit, name-edit | TKT-002, TKT-012, TKT-014 | ✅ Implemented |
| Receipt upload + AWS Textract OCR pipeline | TKT-003, TKT-011 | ✅ Implemented |
| Expiration estimation with confidence | TKT-004 | ✅ Implemented |
| Expiring-soon notifications (SNS backend) | TKT-005 | ✅ Implemented |
| Price comparison (static MVP dataset) | TKT-006 | ✅ Implemented |
| Dashboard summary and use-next widget | TKT-007 | ✅ Implemented |
| Household sharing (invite, accept, revoke) | TKT-008 | ✅ Implemented |
| Consumption and waste events with history | TKT-009 | ✅ Implemented |
| Use-next prioritization algorithm | TKT-010 | ✅ Implemented |
| Schema hardening and dev setup | TKT-014 | ✅ Implemented |

### MVP Coverage Summary

The MVP delivers a complete end-to-end user journey: sign up → add items (manually or via receipt) → receive expiration suggestions → share pantry with a household member → get notified before food expires → mark consumed or wasted → view dashboard and waste analytics.

The core data model is production-safe: audit events, snapshot fields, household-scoped authorization, and schema migrations are all in place.

### Known Gaps and Explicit Non-Goals from MVP

The following were explicitly deferred during MVP planning:

- Recipe recommendation engine (PRD §5, Non-MVP.md)
- Automatic expiry learning loop from user edits (PRD §5)
- Live supermarket price integrations (PRD §5)
- Real delivery of push and email notifications (Non-MVP.md)
- CI/CD deployment pipeline (Non-MVP.md)
- Gamification (Non-MVP.md)
- Barcode scan item entry (PRD §7 future evolution)
- Cross-user benchmarking and analytics (PRD §5) → deferred to [6_Future-Capabilities.md](./6_Future-Capabilities.md)
- Mobile-native app (PRD §5) → deferred to [6_Future-Capabilities.md](./6_Future-Capabilities.md)
- Supermarket QR code collaboration (Non-MVP.md) → deferred to [6_Future-Capabilities.md](./6_Future-Capabilities.md)
- ML-based expiration prediction (PRD §7.1) → deferred to [6_Future-Capabilities.md](./6_Future-Capabilities.md)
- Production-grade deployment hardening (PRD §5)

---

## Identified Functional Gaps

### Gap 1 — Notifications are backend-only, not delivered

SNS integration emits events but no actual email or mobile push delivery reaches users. The notification preferences UI exists, but users never receive the alert in practice.

**Impact:** Core retention mechanic is silently broken in production.

---

### Gap 2 — No CI/CD pipeline

There is no automated build, test, or deployment pipeline. Every release requires manual steps, which increases error risk and blocks team scaling.

**Impact:** Cannot safely deploy to any environment beyond local development.

---

### Gap 3 — Recipe suggestions are absent

The PRD explicitly deferred recipes from MVP. However, the recipe screen is referenced in the design mocks and is the most natural next action after "use-next" prioritization. Free recipe APIs (TheMealDB, Edamam developer plan) make this feasible without cost.

**Impact:** Users know what to consume next but have no guidance on how to use it. Reduces the daily-active-use motivation.

---

### Gap 4 — Price comparison relies on a static internal dataset

The MVP price catalog is seeded manually. Prices become stale, do not match real market values, and have no update mechanism. Mercadona exposes an unofficial public REST API that can serve as a live data source.

**Impact:** The comparison feature loses accuracy over time; user trust erodes.

---

### Gap 5 — No barcode scan for item entry

Manual entry remains the only add path when no receipt is available. Barcode scanning via Open Food Facts (free, no auth) and `@zxing/browser` (MIT-licensed) would cover the gap at zero API cost.

**Impact:** Adoption friction for users who find manual entry too slow.

---

### Gap 6 — Automatic expiry learning is not persisted

Users can override expiry suggestions but the system never learns from those overrides to improve future estimates. A pure data-driven weighted-average algorithm (no AI/ML infrastructure required) can address this.

**Impact:** Repeated manual corrections; low-confidence suggestions remain low-confidence indefinitely per user.

---

### Gap 7 — No production deployment, monitoring, or observability

No infrastructure-as-code for staging or production environments. No application performance monitoring. No structured logging pipeline.

**Impact:** Cannot operate the product in production safely.

---

### Gap 8 — No gamification or social engagement loop

Users get waste metrics but there is no motivation mechanic tied to progress or personal achievement over time.

**Impact:** Low long-term retention; core metric (waste reduction over 4 weeks) is harder to achieve without re-engagement hooks.

---

### Gap 9 — Consumption automation is manual

Far-past-expiry items require the user to explicitly mark them as wasted. The system suggests but cannot act automatically.

**Impact:** Pantry accumulates ghost items (long-expired, never marked). Analytics become inaccurate.

---

## Recommended Features

### P1 — Essential for GA Release

These features are required before the product can be considered production-ready.

> **Implementation note for P1-002, P1-003, P1-004:** Infrastructure and pipeline work should be implemented **after all feature tickets are delivered**. Doing it earlier risks rework as the service surface grows. P1-001 (notification delivery) is the exception — it unblocks retention measurement and should be tackled in the first iteration.

---

#### P1-001: Real notification delivery (email and mobile push)

**Problem Statement:**  
Expiring-soon notifications are emitted to SNS but never delivered to users. The core retention mechanic does not work.

**User Story:**  
As a user, I want to receive a real email or push notification when my food is about to expire, so that I take action before it is too late.

**Business Value:**  
Notifications are the primary daily engagement driver. Without delivery, the notification preferences UI is deceptive and the retention metric (40% of alerts lead to a consume event) cannot be measured.

**Acceptance Criteria:**
- User receives an email to their registered address when an item enters the expiring-soon window.
- User can opt into mobile push via browser permission (PWA web push).
- Notification delivery respects user preferences (opted-out users receive nothing).
- Failed deliveries are logged with reason.
- No duplicate delivery for the same item within the same 24-hour window.
- Amazon SNS sends push notifications to subscribed endpoints (SES for email, web push endpoint for browser).

**Dependencies:** SNS backend (done), Amazon SES for email delivery, web push subscription endpoint.

**Priority:** P1  
**Effort:** Medium

---

#### P1-002: CI/CD deployment pipeline

> **Implementation note:** Build this after all feature tickets are delivered.

**Problem Statement:**  
There is no automated path from a merged PR to a running environment. Releases require manual CLI steps.

**User Story:**  
As a developer, I want every merged PR to automatically build, test, and optionally deploy to staging, so that releases are repeatable and safe.

**Business Value:**  
A release pipeline is a prerequisite for operating the product with any user base. Without it, hot fixes, rollbacks, and staged rollouts are dangerously manual.

**Acceptance Criteria:**
- Every PR triggers a CI run: lint, type-check, unit tests, E2E tests.
- Merge to `main` produces a versioned build artifact.
- Staging environment is automatically updated on merge to `main`.
- Production deployment is gated on manual approval.
- Failed pipelines block merge.

**Dependencies:** GitHub Actions, containerized backend and frontend, staging environment infra (P1-003).

**Priority:** P1  
**Effort:** Medium

---

#### P1-003: Production infrastructure (staging + production environments)

> **Implementation note:** Build this after all feature tickets are delivered.

**Problem Statement:**  
The project has only a local Docker setup. There is no reproducible cloud infrastructure for any non-local environment.

**User Story:**  
As an operator, I want a reproducible staging and production environment, so that I can deploy, monitor, and roll back safely.

**Business Value:**  
Cannot onboard real users without a stable hosted environment. Prerequisite for all observability and delivery features.

**Acceptance Criteria:**
- Terraform (or equivalent IaC) definitions exist for staging and production.
- Backend runs in a containerized service (ECS, App Runner, or equivalent).
- Frontend is served from a CDN (CloudFront or equivalent).
- RDS PostgreSQL instance is provisioned for each environment.
- Secrets are managed via AWS Secrets Manager or SSM Parameter Store.
- S3 buckets have private ACL and server-side encryption.

**Dependencies:** AWS account, domain name, TLS certificate.

**Priority:** P1  
**Effort:** High

---

#### P1-004: Application observability (structured logging + metrics)

> **Implementation note:** Build this after all feature tickets are delivered, in parallel with P1-003.

**Problem Statement:**  
There is no structured logging, no error tracking, and no performance monitoring. Production failures are invisible.

**User Story:**  
As an operator, I want structured logs and error tracking, so that I can detect and diagnose production issues without SSH access.

**Business Value:**  
Observability is a prerequisite for operating any service with real users. Without it, MTTR for production incidents is unbounded.

**Acceptance Criteria:**
- All backend log output is structured JSON with at minimum: timestamp, level, requestId, userId (masked), module, message.
- Errors are forwarded to an error tracking service (Sentry or CloudWatch).
- Key business metrics (item_create, receipt_processed, notification_sent, login_success, login_failure) are emitted as CloudWatch metrics or equivalent.
- A dashboard exists showing error rate, p95 latency, and active sessions.

**Dependencies:** P1-003, logging provider.

**Priority:** P1  
**Effort:** Medium

---

### P2 — High-Value Enhancements

These features significantly improve adoption, retention, or the core product value proposition.

---

#### P2-001: Recipe suggestions based on current pantry

**Problem Statement:**  
Users know what to consume next but have no guidance on how to use those ingredients. The recipe screen appears in the design mocks but was deferred from MVP. Free recipe APIs are available that require no cost or complex agreement.

**User Story:**  
As a user, I want recipe suggestions based on what is expiring in my pantry, so that I can use those ingredients before they go bad.

**Business Value:**  
Recipes convert a passive tracker into an active daily tool. This is the feature most often cited as "missing" in comparable apps (market research §2).

**Acceptance Criteria:**
- User can access a recipes section from the bottom navigation.
- Recipes are filtered/ranked by overlap with pantry items that are expiring soon.
- Each recipe shows required ingredients, estimated prep time, and which pantry items it uses.
- User can mark a recipe as cooked, which triggers a consume event for each matched ingredient.
- System integrates with TheMealDB (completely free, no auth required) as the primary recipe data source. Edamam developer plan (free tier: 10,000 calls/month) is an alternative if richer data is needed.

**Dependencies:** Pantry and consumption event model (done), TheMealDB API (free, no auth).

**Priority:** P2  
**Effort:** Medium (reduced from High given free data source availability)

---

#### P2-002: Barcode scan for item entry

**Problem Statement:**  
Manual entry is the only add path when no receipt is available. Barcode scanning is the natural alternative for packaged goods. Both the scanning library and product database are free and open-source.

**User Story:**  
As a user, I want to scan a product barcode with my camera, so that item name, quantity, and unit are filled in automatically.

**Business Value:**  
Reduces add-item friction by ~70% for packaged goods. Increases pantry completeness, which improves all downstream features.

**Acceptance Criteria:**
- User can open a barcode scanner from the add-item screen using the device camera.
- Successful scan pre-fills name, quantity, and unit from Open Food Facts (free, no auth, open-source product database with strong EU/Spanish coverage).
- Unrecognized barcodes fall back to the manual entry form with the scanned code shown.
- Expiration date suggestion is triggered automatically after a successful scan.

**Dependencies:** Camera API (PWA `getUserMedia`), `@zxing/browser` MIT-licensed barcode scanning library, Open Food Facts API (free, no auth).

**Priority:** P2  
**Effort:** Medium

---

#### P2-003: Automatic expiry learning from user overrides

**Problem Statement:**  
Users repeatedly override the same low-confidence suggestions. The system learns nothing from these corrections.

**User Story:**  
As a user, I want the system to remember my preferred expiry windows so that I spend less time correcting the same suggestions.

**Business Value:**  
Each override is a free training signal. Learning from it reduces the friction of the expiry flow over time, increasing the percentage of OCR-derived entries accepted without edits (current MVP success metric target: 80%).

**Algorithm (pure data-driven, no AI/ML infrastructure required):**  
When the user saves a manual override, the system stores the delta in days (user date minus suggested date) against their `userId` and the item's inferred category. A rolling weighted average of the user's last 5 overrides per category is computed and stored as `UserCategoryExpiryPreference`. Future estimates for that user+category apply this offset on top of the baseline rule, clamped to a ±30-day window. No external service, model training, or inference endpoint is needed — the entire logic runs in the existing NestJS expiration service.

**Acceptance Criteria:**
- When a user overrides an expiry suggestion, the delta (days) is stored against the user's category preference record.
- For subsequent items in the same category, the base estimate is adjusted by the user's weighted-average delta.
- User can view and reset per-category preferences in settings.
- Confidence level is upgraded from LOW to MEDIUM when the estimate is informed by at least 3 historical overrides.
- No external ML infrastructure, RAG, or AI model is used.

**Dependencies:** ExpirationAssessment model (done), new `UserCategoryExpiryPreference` table (simple key-value with userId, category, averageDelta, sampleCount).

**Priority:** P2  
**Effort:** Medium

---

#### P2-004: Live price comparison via Mercadona integration

**Problem Statement:**  
The MVP price catalog is static and becomes stale. Mercadona, the largest Spanish supermarket chain, exposes an unofficial public REST API that is widely used by open-source projects and can serve as a live data source with no agreements or costs.

**User Story:**  
As a user, I want current prices from Mercadona so that I can see whether what I paid was a fair price and where to buy next time.

**Business Value:**  
Live pricing turns the comparison feature from a curiosity into a decision tool, directly supporting the "money saved" product outcome.

**Integration approach:**  
Mercadona exposes a public REST API at `tienda.mercadona.es/api/` (no authentication required, used by community projects). Product lookup by normalized name returns current price, unit, and category. Results are cached server-side with a 24-hour TTL to minimize calls and handle rate limits gracefully.

Other supermarkets assessed (Carrefour, Lidl, Aldi, Dia): no official or stable unofficial APIs exist. Web scraping carries ToS and reliability risk and is excluded from this scope. These chains can be added in the future if APIs become available.

**Acceptance Criteria:**
- Price comparison for a pantry item queries the Mercadona API by normalized product name.
- Results are cached with a 24-hour TTL per product name.
- Staleness is shown with a "last updated" timestamp.
- When no Mercadona result is found, the existing static catalog entry is shown as a fallback.
- Users without a network connection see the last cached price clearly labelled as cached.

**Dependencies:** Mercadona public API (`tienda.mercadona.es/api/`), server-side cache layer (Redis or in-memory with TTL).

**Priority:** P2  
**Effort:** Medium (reduced from High given Mercadona's accessible unofficial API)

---

#### P2-005: Gamification and achievement system

**Problem Statement:**  
Users track waste data but have no reward mechanic tied to reducing it over time. The product is informative but not motivating.

**User Story:**  
As a user, I want to earn points and badges for reducing food waste, so that I stay engaged and build better habits.

**Business Value:**  
Gamification is a proven retention mechanism in habit-forming apps. Points for food saved create a positive feedback loop aligned directly with the product's core outcome.

**Acceptance Criteria:**
- User earns points for each consume event registered before item expiry.
- A waste event logs a negative point entry.
- User can view their total points, estimated € saved, and CO₂ equivalent over time.
- Weekly summary badge is awarded for zero-waste weeks.
- No cross-user leaderboard in this phase.

**Dependencies:** Consumption event model (done), new `UserPoints` ledger entity, notification delivery (P1-001) for badge push.

**Priority:** P2  
**Effort:** Medium

---

#### P2-006: Consumption automation for long-expired items

**Problem Statement:**  
Items that are many days past expiry accumulate in the pantry as ghost records. The current waste-suggestion flow requires the user to manually visit each item.

**User Story:**  
As a user, I want the system to automatically clean up items that are clearly past expiry, so that my pantry stays accurate without manual intervention.

**Business Value:**  
Ghost items corrupt the use-next ranking, waste analytics, and dashboard counts. Automation keeps pantry data meaningful.

**Acceptance Criteria:**
- A scheduled job identifies items expired beyond a configurable threshold (default: 14 days).
- The system sends a digest notification listing candidate items.
- User can bulk-confirm waste or individually review before confirmation.
- If no user action is taken within 7 days of the digest, items are auto-marked as wasted and a final event is logged with method `AUTO_EXPIRED`.
- User can disable auto-expiry in settings.

**Dependencies:** Notification delivery (P1-001), ConsumptionEvent model (done).

**Priority:** P2  
**Effort:** Medium

---

## Cross-Cutting Concerns

### Security

- Rate limiting is documented in the MVP PRD as an identified risk but not implemented. Before GA, brute-force protection on auth endpoints (`POST /api/auth/login`) is required.
- JWT refresh token rotation policy must be defined and implemented before production.
- Receipt image retention policy (deletion after N days) must be enforced via S3 lifecycle rules.
- GDPR-compliant account deletion must cascade to events, receipts, and household memberships.

### Observability and Monitoring

- Structured JSON logging across all backend modules (see P1-004).
- CloudWatch alarms on error rate > 1% and p95 latency > 500 ms on pantry list and receipt upload endpoints.
- Business metric dashboards: daily active users, receipts processed, items consumed vs wasted ratio, notification delivery rate.

### Performance

- Pantry list query must remain under 250 ms p95 as household size grows. Composite index already exists; validate under load before GA.
- Receipt OCR is async by design. Add a visible processing state and webhook/polling fallback on the frontend.

### Accessibility

- All form inputs must have associated labels (WCAG 2.1 AA).
- Color is not the only indicator for expiry risk levels (add icon or text suffix).
- Keyboard navigation must be fully functional on dashboard and pantry list.

### Internationalization

- MVP is localized to Spain (Spanish market price rules, date formats). Before expanding:
  - Externalize all string literals to i18n keys.
  - Add language selector to user settings.
  - Support at minimum: `es-ES` and `en-GB`.

### Documentation

- API documentation via OpenAPI/Swagger is not yet generated. Add an auto-generated spec from the NestJS controllers before GA.
- Runbook for on-call: how to restart services, apply migrations, roll back a deployment.

---

## Release Strategy

### Phase 1 — GA Readiness (P1 features)

**Goal:** Make the product safe and operable for real users. Feature work is complete before this phase starts.

**Scope:**
- P1-001: Real notification delivery (email via SES, web push via SNS)
- P1-002: CI/CD pipeline (GitHub Actions → staging) — build last
- P1-003: Production infrastructure (IaC, staging environment) — build last
- P1-004: Structured logging and error tracking — build last
- Security: rate limiting on auth, JWT refresh policy, S3 lifecycle rules, account deletion
- Accessibility: WCAG 2.1 AA baseline

**Success criteria:**
- Zero critical security vulnerabilities in an OWASP ZAP baseline scan.
- 99% uptime over 30 days on staging.
- 100% of CI checks pass before merge.
- Error tracking receives and surfaces first production error within 5 minutes of occurrence.

---

### Phase 2 — Growth (P2 features)

**Goal:** Increase daily active use and expand the addressable user base.

**Scope:**
- P2-001: Recipe suggestions (TheMealDB free API)
- P2-002: Barcode scan (Open Food Facts + @zxing/browser)
- P2-003: Expiry learning from overrides (weighted-average algorithm)
- P2-004: Live price comparison (Mercadona unofficial API)
- P2-005: Gamification (points and badges)
- P2-006: Consumption automation for long-expired items

**Success criteria:**
- Recipe feature used in at least 30% of active sessions.
- Barcode scan adoption ≥ 40% of add-item events.
- Low-confidence expiry suggestions reduce by 25% after 4 weeks of user history.
- Zero-waste week badge earned by ≥ 20% of monthly active users.
- Mercadona price match rate ≥ 60% for scanned/added items.

---

### Future — Strategic Expansion

All strategic future capabilities (native mobile app, ML-based expiration, supermarket QR partnerships, cross-user benchmarking) are documented in [6_Future-Capabilities.md](./6_Future-Capabilities.md) and are not scheduled for this phase.

---

## Success Metrics

### Phase 1 (GA Readiness)

| Metric | Target |
|---|---|
| Notification delivery rate | ≥ 95% of generated events delivered within 5 minutes |
| CI pipeline pass rate | 100% before merge to main |
| Production uptime (staging) | ≥ 99% over 30-day window |
| p95 pantry list latency | ≤ 250 ms |
| Critical security findings (OWASP scan) | 0 |

### Phase 2 (Growth)

| Metric | Target |
|---|---|
| Recipe feature session penetration | ≥ 30% of DAU sessions |
| Barcode scan adoption | ≥ 40% of add-item events |
| First-week receipt upload rate | ≥ 50% of new users |
| Week-4 waste value reduction (returning users) | Downward trend measurable |
| Low-confidence expiry suggestion rate | Reduces ≥ 25% within 4 weeks of user history |
| Mercadona price match rate | ≥ 60% of queried items |

---

## Appendix: Feature Summary Table

| ID | Feature | Priority | Effort | Phase |
|---|---|---|---|---|
| P1-001 | Real notification delivery (email + web push) | P1 | Medium | 1 |
| P1-002 | CI/CD pipeline | P1 | Medium | 1 (last) |
| P1-003 | Production infrastructure (IaC) | P1 | High | 1 (last) |
| P1-004 | Structured logging and error tracking | P1 | Medium | 1 (last) |
| P2-001 | Recipe suggestions (TheMealDB free API) | P2 | Medium | 2 |
| P2-002 | Barcode scan (Open Food Facts + @zxing/browser) | P2 | Medium | 2 |
| P2-003 | Expiry learning (weighted-average algorithm) | P2 | Medium | 2 |
| P2-004 | Live price comparison (Mercadona API) | P2 | Medium | 2 |
| P2-005 | Gamification (points and badges) | P2 | Medium | 2 |
| P2-006 | Consumption automation (auto-expired) | P2 | Medium | 2 |
| Future | Strategic capabilities | — | — | See [6_Future-Capabilities.md](./6_Future-Capabilities.md) |
