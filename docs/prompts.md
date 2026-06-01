# ReservaPro — AI Prompts Documentation

> Documentation of key prompts used during the creation of ReservaPro, organized by project phase.

---

## 1. Product Definition & PRD

### Prompt 1.1: Initial PRD Generation
**Tool**: Claude (opencode)
**Phase**: Product Requirements Document

**Prompt**:
```
I have a detailed idea analysis document for ReservaPro, a SaaS booking platform
for barbershops and salons in Colombia. The target market is ~80,000 barbershops
in Colombia with planned expansion across LATAM and Spain. Key differentiators
are native WhatsApp integration, local payment methods (MercadoPago, Nequi),
LATAM-adapted pricing ($19-59/mo), and Spanish-first UX.

Generate a complete PRD that includes: executive summary, problem statement with
pain points table, 3 user personas (business owner, professional, end client),
Jobs-to-be-Done, SMART goals with success metrics, 10 epics with Given/When/Then
acceptance criteria using MoSCoW prioritization, functional requirements tables,
non-functional requirements, information architecture, data model overview,
high-level architecture, release plan with 6 phases, and risks/mitigations.

Use the attached idea analysis as context. All currency references should be in
COP. Include Colombia-specific considerations like Ley 1581/2012 data protection
and DIAN electronic invoicing.
```

**Guidance note**: Provided the complete idea analysis document (`idea-software-reservas-nicho.md`) as context. Asked for 10 epics with Given/When/Then acceptance criteria. Specified MoSCoW prioritization. Requested Colombia-specific regulatory references and local payment methods.

**Human adjustments**: Adjusted pricing tiers from the initial $15-40 range to $19/35/59/mo based on competitive analysis. Added specific no-show reduction target of 40% based on industry benchmarks. Refined the North Star Metric to "Weekly Active Appointments" instead of generic MRR. Added the 15 open questions section to guide future decisions.

### Prompt 1.2: User Stories and Acceptance Criteria Refinement
**Tool**: Claude (opencode)
**Phase**: User Stories Detail

**Prompt**:
```
Based on the PRD we just generated for ReservaPro, I need to refine the user
stories for the 10 epics. For each epic, ensure every story follows the format:
"As a [role], I want to [action], so I can [benefit]" with Given/When/Then
acceptance criteria.

Focus especially on:
- Epic 4 (Calendar & Availability): the slot calculation engine must mention
  database-level exclusion constraints to prevent race conditions
- Epic 7 (Online Payments): include both MercadoPago and Stripe flows, with
  deposit configuration (0%, 50%, 100%) per service
- Epic 8 (WhatsApp Reminders): include delivery failure fallback to email

Each story should be testable and specific enough to hand off to development.
```

**Guidance note**: Asked the AI to specifically strengthen the technical acceptance criteria in the calendar, payments, and notification epics. Required that double-booking prevention reference PostgreSQL exclusion constraints, not just application-level checks.

**Human adjustments**: Added booking_channel field tracking (online, in_store, phone, whatsapp) to appointment stories for analytics. Added the 2-hour cancellation policy enforcement story. Refined the WhatsApp fallback story to specify automatic email fallback with logging for owner review.

### Prompt 1.3: Non-Functional Requirements and Release Planning
**Tool**: Claude (opencode)
**Phase**: NFRs & Roadmap

**Prompt**:
```
For the ReservaPro PRD, generate a detailed non-functional requirements table
covering: performance (page load times, API response times), scalability
(concurrent users, appointment volume), security (encryption, PCI DSS, rate
limiting), availability (uptime SLA, backup, disaster recovery), data privacy
(Colombian Ley 1581/2012 compliance, data residency, right to deletion), and
accessibility (WCAG 2.1 AA, mobile usability).

Then create a 6-phase release plan spanning ~30 weeks: Foundation, Core Booking,
Public Booking, Payments, Notifications, Dashboard & Polish, and Beta Launch.
For each phase specify scope, timeline, and success criteria. Also define MVP
in-scope vs out-of-scope features and a post-MVP roadmap by quarter.
```

**Guidance note**: Specified the Colombian data protection law by name (Ley 1581/2012). Requested specific numeric targets (e.g., <2s LCP on 4G, p95 <300ms API). Asked for clear MVP boundary to avoid scope creep.

**Human adjustments**: Changed uptime SLA from 99.9% to 99.5% as more realistic for a solo-dev MVP. Added RPO <1 hour and RTO <4 hours for disaster recovery. Moved Google Calendar sync and recurring appointments from MVP to post-MVP. Added the beta launch phase with 5-10 businesses target and NPS >40 goal.

---

## 2. Architecture & System Design

### Prompt 2.1: Architecture Design
**Tool**: Claude (opencode)
**Phase**: System Architecture

**Prompt**:
```
Act as a senior software architect. Design the system architecture for
ReservaPro, a multitenant SaaS booking platform for barbershops in Colombia.

Constraints:
- Solo developer building the MVP over 6 months
- Target: 0-100 businesses in year one, ~500 appointments/day peak
- Must support multitenancy via business_id foreign key on all tenant tables
- 9 domain modules: Auth, Business & Staff, Service Catalog, Calendar &
  Availability, Booking Engine, Public Booking Page, Payments, Notifications,
  Dashboard & Analytics

I want a modular monolith (not microservices) with clean module boundaries.
Use PostgreSQL (Neon serverless) as primary database, Upstash Redis for
caching and BullMQ job queues, and an adapter pattern for payment providers
(Stripe + MercadoPago). Authentication via Clerk with JWT sessions and RBAC.

Generate: architecture overview paragraph, tech stack table with justifications
and alternatives considered, module/service inventory, a Mermaid architecture
diagram with 6 layers (clients, edge, application, data, external, CI/CD),
and infrastructure cost estimates for MVP/Growth/Scale phases.
```

**Guidance note**: Explicitly requested modular monolith over microservices given the solo-dev constraint. Specified the 9 domain boundaries upfront. Required the adapter pattern for payments to abstract Stripe and MercadoPago. Asked for cost estimates at three growth stages.

**Human adjustments**: Chose Hono over NestJS for the API layer due to lighter weight. Switched from AWS S3 to Cloudflare R2 for zero egress fees. Added Railway for BullMQ worker hosting separate from Vercel. Adjusted MVP cost estimate down to $20-35/mo by leveraging free tiers more aggressively.

### Prompt 2.2: Tech Stack Selection and Justification
**Tool**: Claude (opencode)
**Phase**: Technology Decisions

**Prompt**:
```
For the ReservaPro system design, create a detailed tech stack table. For each
layer (frontend, backend/API, database, ORM, auth, payments, WhatsApp, email,
hosting, cache/queue, file storage, monitoring, analytics, CI/CD, testing),
provide: the chosen technology, a specific justification for why it fits a
solo-dev SaaS targeting Colombian barbershops, and the main alternative that
was considered and why it was rejected.

Key priorities: minimize operational overhead, maximize free tier usage for
MVP, ensure excellent Next.js integration, and support LATAM payment methods.
The stack should allow the entire MVP to run under $35/month.
```

**Guidance note**: Required alternatives considered for every choice to document decision rationale. Emphasized free tier availability and solo-dev operational simplicity as primary selection criteria.

**Human adjustments**: Replaced PlanetScale with Neon for PostgreSQL (better free tier and branching for dev/staging). Chose Drizzle ORM over Prisma for lighter bundle size and SQL-like syntax. Selected Resend over SendGrid for better developer experience and React Email support. Added Vitest + Playwright for testing instead of Jest + Cypress.

### Prompt 2.3: Infrastructure Cost Optimization
**Tool**: Claude (opencode)
**Phase**: Cost Planning

**Prompt**:
```
For ReservaPro's infrastructure, create a cost optimization strategy across
three phases: MVP (0-100 businesses), Growth (100-500), and Scale (500+).

For each phase, list every service with its specific plan and monthly cost.
Focus on leveraging free tiers aggressively during MVP — Neon Free, Upstash
Free, Clerk Free (up to 10k MAU), Resend Free (3000/mo), R2 Free (10GB),
Sentry Free, PostHog Free (1M events/mo). The only paid services during MVP
should be Railway Starter (~$5) and Twilio WhatsApp usage (~$15-25).

Also include cost optimization strategies for each growth phase: when to
negotiate startup credits, how to batch WhatsApp notifications, and when to
switch from serverless to dedicated workers for BullMQ.
```

**Guidance note**: Provided specific free tier limits for each service. Required the MVP infrastructure to stay under $35/month total. Asked for specific transition triggers between phases.

**Human adjustments**: Added Twilio WhatsApp costs as the primary variable expense ($0.008/message). Negotiated the Growth phase estimate to $80-150/mo by including Clerk startup credits. Added note about PostHog remaining on free tier through Growth phase due to generous 1M events/month allowance.

---

## 3. Data Model

### Prompt 3.1: Entity Design & ERD
**Tool**: Claude (opencode)
**Phase**: Database Schema

**Prompt**:
```
Act as a senior database architect. Design the complete data model for
ReservaPro, a multitenant SaaS booking platform. The model must cover these
entities: Business (tenant root), User (staff), Role, UserRole, Service,
ServiceProfessional (junction), Client (end customers), Subscription,
Appointment, AppointmentStatusHistory, Payment, Notification,
ProfessionalSchedule, TimeOff, AuditLog, and OutboxEvent.

For each entity provide:
- Full field list with name, type, and description
- Relationships with cardinality
- Design decisions explaining non-obvious choices

Key requirements:
- All tenant-scoped tables must have business_id FK for multitenancy
- Use UUID primary keys throughout
- All timestamps as timestamptz
- Soft-delete via deleted_at on business-critical entities
- Integer cents for all monetary fields (price_cents, amount_cents)
- jsonb for flexible configuration fields (settings, permissions, features)

After defining all entities, generate a complete Mermaid ERD showing all
entities, their fields, and relationships.
```

**Guidance note**: Provided the complete entity list upfront to ensure nothing was missed. Specified UUID PKs, timestamptz timestamps, and integer cents as non-negotiable conventions. Required design decisions for each entity to document rationale.

**Human adjustments**: Added Colombian-specific fields to Business entity (tax_id for NIT/RUT, department for Colombian states). Added consent_marketing and consent_data_processing boolean flags to Client for Ley 1581/2012 compliance. Added anonymized_at field for PII anonymization per data retention policy. Added booking_channel field to Appointment for acquisition analytics.

### Prompt 3.2: Double-Booking Prevention and Timezone Handling
**Tool**: Claude (opencode)
**Phase**: Concurrency & Scheduling

**Prompt**:
```
For the ReservaPro data model, I need detailed design decisions for the
Appointment entity focusing on two critical concerns:

1. Double-booking prevention: Design a PostgreSQL exclusion constraint using
   EXCLUDE USING gist that prevents overlapping appointments for the same
   professional. The constraint should use tstzrange(starts_at, ends_at) with
   the && overlap operator. Explain how this handles race conditions that
   application-level checks cannot.

2. Timezone handling: All appointment times must be stored in UTC. The business
   timezone (default America/Bogota) is used only for display. Explain how
   ProfessionalSchedule times (stored as time without timezone) interact with
   appointment UTC timestamps when calculating available slots across daylight
   saving transitions (relevant for future LATAM expansion beyond Colombia).

Also design the AppointmentStatusHistory entity as an append-only audit log
with from_status, to_status, changed_by, changed_by_type (user/client/system),
reason, and metadata jsonb. Include a database trigger that rejects UPDATE
and DELETE on this table.
```

**Guidance note**: Specifically requested PostgreSQL-level exclusion constraints rather than application-level locking. Required UTC storage with display-timezone conversion. Asked for append-only enforcement via database triggers.

**Human adjustments**: Added booking_channel field to track acquisition source. Changed changed_by_type values to include 'system' for automated transitions (auto-completion, auto-cancellation). Added metadata jsonb to capture contextual data like notification_id and cancellation_fee without schema changes.

### Prompt 3.3: Payment Model and Audit Logging
**Tool**: Claude (opencode)
**Phase**: Financial Data & Compliance

**Prompt**:
```
Design the Payment, AuditLog, and OutboxEvent entities for ReservaPro.

Payment requirements:
- Support Colombian payment methods: cash, card, transfer, nequi, daviplata, pse
- Append-only pattern: refunds are status transitions (completed → refunded),
  not separate records
- Store raw gateway response as jsonb for reconciliation
- Support split payments (multiple payment records per appointment)
- Include collected_by FK for in-store cash payments

AuditLog requirements:
- Strictly append-only (trigger rejects UPDATE/DELETE)
- Store before_state and after_state as complete jsonb snapshots
- Include computed changes diff for quick scanning
- Partitioned by created_at monthly for query performance at scale

OutboxEvent requirements:
- Transactional outbox pattern: events written in same DB transaction as
  domain operation
- Relay process polls pending events and publishes to message broker
- Exponential backoff with max_retries before dead-lettering

Generate the entity definitions with all fields, relationships, and design
decisions. Then update the Mermaid ERD to include these three entities.
```

**Guidance note**: Required append-only patterns for both Payment and AuditLog to ensure financial data integrity. Specified the transactional outbox pattern for reliable event publishing. Asked for Colombian-specific payment methods in the method enum.

**Human adjustments**: Added refund_amount_cents to Payment for partial refund support. Added request_id and ip_address to AuditLog for security forensics. Added retry_count and error_message to OutboxEvent for operational debugging. Specified 30-day archival policy for published events.

---

## 4. Use Cases

### Prompt 4.1: Use Case Identification
**Tool**: Claude (opencode)
**Phase**: Requirements Analysis

**Prompt**:
```
Act as a senior software analyst. Based on the ReservaPro PRD, identify and
document the 3 most critical use cases that represent the core value proposition
of the platform. These should cover:

1. The end-to-end client booking flow (client visits public page → selects
   service/professional/time → pays via MercadoPago or Stripe → receives WhatsApp
   confirmation)
2. The business owner managing appointments and staff (configuring services,
   setting schedules, handling cancellations with policy enforcement, monitoring
   dashboard metrics)
3. Payment processing and no-show management (online deposit/full payment,
   failed payment slot release, no-show detection, penalty application, refund
   processing)

For each use case provide:
- A detailed description paragraph covering actors, preconditions, main flow,
  alternative flows, and postconditions
- A Mermaid flowchart diagram showing all steps, decision points, and actors

The booking page must be mobile-first and load within 3 seconds on 4G
connections common in Colombia. All timestamps normalized to America/Bogota.
```

**Guidance note**: Directed the AI to focus on the 3 use cases that represent the core platform value. Required Mermaid flowcharts (not sequence diagrams) for better readability. Specified Colombian context (4G speeds, America/Bogota timezone).

**Human adjustments**: Added the 10-minute slot hold mechanism for failed payments in use case 3. Added the configurable grace period (default 15 minutes) for no-show detection. Ensured use case 1 mentioned the <60 second booking completion target. Added QR code as a common way clients access booking pages.

### Prompt 4.2: Booking Flow and Cancellation Policy Use Case
**Tool**: Claude (opencode)
**Phase**: Detailed Flow Design

**Prompt**:
```
For the ReservaPro use case "Business Owner Manages Appointments and Staff",
expand the cancellation and rescheduling sub-flow. The system must evaluate
cancellation requests against the configured policy:

- Configurable time window before appointment (default 2 hours)
- Within policy window: full refund or free reschedule
- Outside policy window: system calculates penalty or partial refund
- Owner can approve exceptions to the standard policy
- All status changes trigger WhatsApp notifications to the professional

Include decision points for: policy window check, owner exception approval,
refund vs credit decision. The Mermaid diagram should show the Owner, Client,
and Professional as actors with clear decision diamonds and notification steps.

Also include the Owner's dashboard monitoring flow: viewing real-time metrics
(revenue, appointment fill rate, professional utilization) and how these
reports aggregate data from appointments and payments.
```

**Guidance note**: Focused on the cancellation sub-flow because it involves multiple actors, policy enforcement, and financial implications. Required the owner exception approval workflow as a key decision point.

**Human adjustments**: Added the distinction between system-enforced standard policy and owner-approved exceptions. Added the professional notification step after every status change. Ensured the dashboard flow mentioned auto-refresh every 5 minutes for real-time data.

---

## 5. API Design

### Prompt 5.1: REST API Design
**Tool**: Claude (opencode)
**Phase**: API Specification

**Prompt**:
```
Design the REST API for ReservaPro based on the data model and user stories.
The API serves a Next.js 14 application with Hono for complex business logic
and Zod for request validation.

Design endpoints for these resource groups:
- Auth: signup, login, password reset, session management (via Clerk)
- Businesses: CRUD, settings, branding
- Professionals: CRUD, schedule management, service assignments
- Services: CRUD, categories, professional assignments
- Appointments: CRUD, status transitions, cancellation, rescheduling
- Availability: slot calculation, calendar views
- Payments: create intent, webhook handlers, refund processing
- Notifications: template management, delivery status
- Dashboard: metrics, reports, exports

For each endpoint provide: HTTP method, path, request body/params (with Zod
schema), response format, required permissions (role-based), and error codes.

All tenant-scoped endpoints must extract business_id from the authenticated
session (not from URL params). Use standard REST conventions: plural nouns,
nested resources for clear ownership, pagination with cursor-based paging.
```

**Guidance note**: Specified Hono + Zod as the API framework and validation layer. Required business_id extraction from session (not URL) for multitenancy security. Asked for role-based permission requirements per endpoint.

**Human adjustments**: Added rate limiting specifications (100 req/min for public, 1000 for authenticated). Added idempotency key requirement for payment endpoints. Added cursor-based pagination instead of offset-based for better performance on large appointment lists. Added webhook verification signatures for Stripe and MercadoPago callbacks.

### Prompt 5.2: Authentication and Webhook Handling
**Tool**: Claude (opencode)
**Phase**: Security & Integration

**Prompt**:
```
For ReservaPro's API, design the authentication flow and webhook handling
endpoints in detail.

Authentication:
- Clerk handles identity and JWT issuance
- Next.js middleware checks session on every request
- RBAC middleware checks role permissions (owner, admin, professional) at
  route level
- Professional role can only access own appointments, schedule, and clients
- Owner has full access including billing and team management

Webhook handling:
- POST /api/webhooks/stripe — handle payment_intent.succeeded,
  payment_intent.payment_failed, charge.refunded
- POST /api/webhooks/mercadopago — handle payment.created, payment.updated,
  payment.refunded
- Both must verify webhook signatures before processing
- Both must implement idempotency (deduplicate by event ID)
- Failed webhook processing retries with exponential backoff via BullMQ
- Webhook events update appointment payment status and trigger notifications

Provide the endpoint specifications, middleware chain, error handling strategy,
and the BullMQ job definitions for async webhook processing.
```

**Guidance note**: Required signature verification for both payment providers. Specified idempotency by event ID to handle duplicate webhook deliveries. Asked for BullMQ integration for retry logic on failed processing.

**Human adjustments**: Added Clerk webhook for organization membership changes (when a professional joins/leaves a business). Added dead-letter queue for webhooks that fail max retries. Added logging of raw webhook payloads for debugging payment discrepancies.

---

## 6. User Stories & Work Tickets

### Prompt 6.1: Story Decomposition into Work Tickets
**Tool**: Claude (opencode)
**Phase**: Sprint Planning

**Prompt**:
```
Take the ReservaPro PRD epics and break them into implementable work tickets
for a solo developer working in 2-week sprints. Each ticket should include:

- Title following convention: "[Module] Action — brief description"
- Parent epic reference
- Technical sub-tasks (database migrations, API endpoints, UI components,
  tests)
- Dependencies on other tickets
- Estimated effort in story points (1, 2, 3, 5, 8)
- Acceptance criteria from the PRD story

Organize tickets by the 6-phase release plan:
- Phase 0 (Weeks 1-4): Project setup, DB schema, auth, basic CRUD
- Phase 1 (Weeks 5-10): Availability engine, appointments, calendar
- Phase 2 (Weeks 11-14): Public booking page, client flow
- Phase 3 (Weeks 15-18): Stripe + MercadoPago integration
- Phase 4 (Weeks 19-22): WhatsApp + email notifications
- Phase 5 (Weeks 23-26): Dashboard, reports, polish

For Phase 0, create detailed tickets for: Next.js project setup with Tailwind
and shadcn/ui, Drizzle ORM schema with all 16 entities, Clerk authentication
setup, and CRUD endpoints for Business, Service, and Professional.
```

**Guidance note**: Required alignment with the 6-phase release plan from the PRD. Asked for technical sub-tasks (not just descriptions) to make tickets immediately actionable. Specified story point estimation for solo-dev velocity planning.

**Human adjustments**: Added integration test requirements to each Phase 1 ticket (especially double-booking prevention tests). Added a dedicated ticket for WhatsApp Business API template pre-approval (takes 1-3 days from Meta). Split the MercadoPago integration into separate tickets for PSE/Nequi and credit card flows due to different API endpoints. Added environment setup documentation ticket to Phase 0.

---

## Summary

### Tools Used
| Tool | Purpose | Sections |
|------|---------|----------|
| Claude (opencode) | PRD generation, architecture design, data modeling, use case analysis | All sections (1-6) |
| Claude (opencode) | Tech stack research and cost optimization | Architecture (Section 2) |
| Claude (opencode) | API design and security patterns | API Design (Section 5) |
| opencode skills (/prd-generator, /system-design, /data-model, /use-cases) | Structured document generation with domain-specific templates | Sections 1-4 |

### Key Learnings
- **Providing the idea analysis as context was essential**: The AI generated significantly more accurate and Colombia-specific output when given the full market research document, including correct competitor references (Fresha, Mindbody, AgendaPro) and realistic TAM/SAM/SOM numbers.
- **Explicit constraints produced better architecture decisions**: Asking for "modular monolith, not microservices" and "under $35/month MVP infrastructure" prevented the AI from over-engineering. Without these constraints, it initially suggested Kubernetes and microservices.
- **Iterative refinement was more effective than one-shot generation**: The first PRD draft was ~70% complete. Subsequent prompts to refine specific sections (acceptance criteria, NFRs, cancellation policies) produced much higher quality than trying to get everything perfect in one prompt.

### Comparative: Before vs After AI
| Aspect | AI Generated | Human Adjusted |
|--------|-------------|----------------|
| **Pricing tiers** | Generic $15-40/mo range | Refined to $19/35/59/mo based on competitive analysis and Colombia purchasing power |
| **Payment methods** | Stripe + generic "local payments" | Added specific Colombian methods: Nequi, Daviplata, PSE, MercadoPago with adapter pattern |
| **Data protection** | Generic GDPR reference | Replaced with Colombian Ley 1581/2012 specifics: consent flags, anonymized_at, data residency |
| **Architecture** | Initially suggested microservices on AWS | Changed to modular monolith on Vercel + Railway for solo-dev viability |
| **Infrastructure cost** | Estimated $200-400/mo for MVP | Reduced to $20-35/mo by aggressively leveraging free tiers (Neon, Upstash, Clerk, Resend, R2) |
| **Double-booking prevention** | Application-level optimistic locking | Upgraded to PostgreSQL EXCLUDE USING gist exclusion constraints at database level |
| **WhatsApp strategy** | Generic "send notifications" | Added pre-approved template constraints, email fallback, delivery failure logging, and Meta template approval timeline |
| **Entity model** | 12 entities, generic fields | Expanded to 16 entities with Colombian-specific fields (NIT tax_id, department, COP currency, consent fields) |
