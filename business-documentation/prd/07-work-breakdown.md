# 7. Work Breakdown by Discipline

> [Back to PRD Index](../PRD.md) | [Previous: MVP Features](06-mvp-features.md) | [Next: Success Metrics](08-success-metrics.md)

---

## 7.1 UX

| Key Workstreams | Open Questions |
|----------------|----------------|
| User flows for 4 personas (Couple, Guest, Accomplice, Planner) | DECISION NEEDED: Accomplice onboarding flow - account vs. link-only access |
| RSVP form optimization (mobile-first, <60s completion) | DECISION NEEDED: RSVP form depth - minimum fields vs. comprehensive |
| Accomplice panel simplicity (swipe-to-send, mobile-first) | DECISION NEEDED: Number of default message templates (5 vs. 8) |
| Mobile-first guest journey (microsite, maps, calendar) | DECISION NEEDED: Calendar sync priority - Google Calendar only or Apple/Outlook too |
| Registration/onboarding flows (2-step wizard) | DECISION NEEDED: Onboarding wizard steps - mandatory vs. skippable |

## 7.2 UI

| Key Workstreams | Open Questions |
|----------------|----------------|
| Design system (tokens, components, typography, colors) | DECISION NEEDED: Template customization depth - colors/fonts only or layout too |
| Template editor builder (real-time preview, auto-save) | DECISION NEEDED: Number of templates at launch (3 vs. 5) |
| Responsive breakpoints (mobile-first, tablet, desktop) | DECISION NEEDED: Desktop support for accomplice panel (click-drag vs. swipe) |
| Accessibility (WCAG 2.1 AA compliance) | DECISION NEEDED: Accessibility scope for V1 - full AA or partial |
| Onboarding wizard screens (template selection, event basics) | DECISION NEEDED: Onboarding visual style - step-by-step vs. single-page |

## 7.3 Frontend (Angular 22)

| Key Workstreams | Open Questions |
|----------------|----------------|
| Host dashboard SPA (Angular 22, standalone components, signals) | DECISION NEEDED: State management - signals only or NgRx for complex state |
| Accomplice panel SPA (touch gestures, JWT auth) | DECISION NEEDED: Gesture library - Angular CDK or Hammer.js |
| Static site generator for guest microsites (Razor templates) | DECISION NEEDED: Static site build pipeline - Razor vs. string interpolation |
| Typed forms (registration, RSVP, guest import) | DECISION NEEDED: Form validation - reactive forms vs. template-driven |
| Auth/registration forms (magic link flow) | DECISION NEEDED: Session storage - httpOnly cookie vs. localStorage |
| Template editor (color picker, font selector, image upload) | DECISION NEEDED: Image upload handling - direct to API or presigned URL |

## 7.4 Backend (.NET 10)

| Key Workstreams | Open Questions |
|----------------|----------------|
| Auth (magic links + JWT, rate limiting, session management) | DECISION NEEDED: JWT storage - httpOnly cookie vs. Bearer token |
| Registration endpoint, profile management, terms acceptance | DECISION NEEDED: Terms versioning strategy - enforce re-acceptance on update |
| Events/Guests/Invitations/RSVPs CRUD | DECISION NEEDED: Slug generation algorithm - deterministic vs. random |
| CSV import (validation, deduplication, error handling) | DECISION NEEDED: CSV encoding - UTF-8 only or auto-detect |
| Payment webhook (Stripe, idempotent processing) | DECISION NEEDED: Webhook retry - Stripe built-in or custom queue |
| Background jobs (30-day deletion, reminders, email/WhatsApp dispatch) | DECISION NEEDED: Background service - single BackgroundService or distributed queue |

## 7.5 Database (PostgreSQL/EF Core)

| Key Workstreams | Open Questions |
|----------------|----------------|
| Schema for all entities (11 entities, relationships, constraints) | DECISION NEEDED: Primary key type - ULID vs. GUID vs. integer |
| Users table with profile fields (name, terms, timezone, locale) | DECISION NEEDED: User profile extensibility - JSON blob or dedicated columns |
| Soft deletes (IsDeleted flag, global query filters) | DECISION NEEDED: Soft delete cascade - automatic or manual per entity |
| Indexes for query patterns (16 indexes mapped to queries) | DECISION NEEDED: Composite indexes - which combinations for common queries |
| Migrations (EF Core, versioned, reversible) | DECISION NEEDED: Migration strategy - automatic or manual review |
| Encryption at rest | DECISION NEEDED: SQLCipher vs. application-level AES-256 |

## 7.6 Integrations

| Key Workstreams | Open Questions |
|----------------|----------------|
| WhatsApp Business API (templates, webhooks, rate limits, retry logic) | DECISION NEEDED: Direct Meta API vs. BSP (Twilio/MessageBird) |
| Gmail SMTP (templates, 500/day limit, no bounce webhooks) | DECISION NEEDED: IEmailService abstraction for future swap |
| Stripe Connect (publish payment, webhook, future gift registry) | DECISION NEEDED: Stripe Connect vs. standard Stripe for MVP |
| Google Maps (embed, geocoding, directions deep links) | DECISION NEEDED: Maps API key security - referrer vs. IP restriction |
| WhatsApp API approval | DECISION NEEDED: Pre-submit templates 1 week before launch |

## 7.7 Infrastructure/DevOps

| Key Workstreams | Open Questions |
|----------------|----------------|
| CDN for static sites (Cloudflare, MinIO origin, cache invalidation) | Resolved: Cloudflare |
| CI/CD pipeline (GitHub Actions, Docker build, GHCR, kubectl apply) | Resolved: Kustomize + kubectl |
| Environments (local, staging, production) | DECISION NEEDED: Staging environment - shared or per-PR |
| Observability (Serilog, OpenTelemetry, Sentry) | DECISION NEEDED: Error tracking - Sentry vs. Application Insights |
| Secrets management (environment variables, key rotation) | DECISION NEEDED: Secrets storage - GitHub Secrets vs. Azure Key Vault |

## 7.8 Security/Compliance

| Key Workstreams | Open Questions |
|----------------|----------------|
| AuthZ policies (EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit) | DECISION NEEDED: Policy granularity - coarse (role-based) or fine (resource-based) |
| Rate limiting (5 endpoint categories, 429 responses) | DECISION NEEDED: Rate limit storage - in-memory vs. distributed (Redis) |
| PII handling (application-level AES-256 encryption) | DECISION NEEDED: SQLCipher vs. app-level encryption for MVP |
| 30-day auto-delete job (BackgroundService, transactional) | DECISION NEEDED: Deletion failure handling - alert vs. auto-retry |
| GDPR rights endpoints (access, rectify, erase, portability) | DECISION NEEDED: GDPR data export format - CSV vs. JSON vs. both |
| Consent tracking (terms version, timestamp, marketing opt-in) | DECISION NEEDED: Cookie consent banner - required or not (no third-party cookies) |

---

> [Back to PRD Index](../PRD.md) | [Previous: MVP Features](06-mvp-features.md) | [Next: Success Metrics](08-success-metrics.md)
