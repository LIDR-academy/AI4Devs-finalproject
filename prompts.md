# ReservaPro — AI Prompts Documentation

> Documentación de los prompts principales utilizados durante la creación de ReservaPro para la Entrega 1.

---

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1: Generación de PRD inicial**

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

**Guidance:** Proporcioné el documento completo de idea analysis como contexto. Pedí 10 epics con Given/When/Then acceptance criteria. Especifiqué MoSCoW prioritization. Requesté referencias regulatorias colombianas específicas y métodos de pago locales.

**Human adjustments:** Ajusté los tiers de precio del rango inicial $15-40 a $19/35/59/mes basado en análisis competitivo. Añadí el target específico de reducción de no-shows de 40% basado en benchmarks de la industria.

---

**Prompt 2: Refinamiento de User Stories**

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

**Guidance:** Pedí a la IA fortalecer específicamente los criterios de aceptación técnicos en los epics de calendar, payments y notifications. Requirió que la prevención de double-booking mencionara PostgreSQL exclusion constraints, no solo checks a nivel de aplicación.

---

**Prompt 3: Non-Functional Requirements y Release Planning**

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

**Guidance:** Especifiqué la ley de protección de datos colombiana por nombre (Ley 1581/2012). Solicité targets numéricos específicos (e.g., <2s LCP on 4G, p95 <300ms API). Pedí límite claro de MVP para evitar scope creep.

**Human adjustments:** Cambié SLA de uptime de 99.9% a 99.5% como más realista para un MVP de solo-dev. Añadí RPO <1 hora y RTO <4 horas para disaster recovery.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura**

**Prompt 1:**

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

**Guidance:** Solicité explícitamente modular monolith sobre microservices dada la restricción de solo-dev. Especifiqué los 9 límites de dominio desde el inicio. Requirió el adapter pattern para pagos para abstraer Stripe y MercadoPago.

**Human adjustments:** Elegí Hono sobre NestJS por ser más ligero. Cambié de AWS S3 a Cloudflare R2 por egress fees cero.

---

### **2.2. Descripción de componentes principales**

**Prompt 2:**

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

**Guidance:** Requirió alternativas consideradas para cada elección para documentar rationale de decisión. Emphasized free tier availability y solo-dev operational simplicity como primary selection criteria.

**Human adjustments:** Reemplacé PlanetScale con Neon para PostgreSQL (mejor free tier y branching para dev/staging). Elegí Drizzle ORM sobre Prisma por lighter bundle size y SQL-like syntax.

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 3:**

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

---

### **2.4. Infraestructura y despliegue**

*(Ver Prompt 2.1 y 2.2)*

---

### **2.5. Seguridad**

**Prompt 4:**

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

**Guidance:** Requirió signature verification para ambos payment providers. Especifiqué idempotency por event ID para manejar duplicate webhook deliveries.

---

### **2.6. Tests**

**Prompt 5:**

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

---

## 3. Modelo de Datos

**Prompt 1:**

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

**Guidance:** Proporcioné la lista completa de entities desde el inicio para asegurar nada fue omitido. Especifiqué UUID PKs, timestamptz timestamps, y integer cents como convenciones no negociables.

**Human adjustments:** Añadí campos específicos de Colombia a Business entity (tax_id para NIT/RUT, department para estados colombianos). Añadí consent_marketing y consent_data_processing boolean flags a Client para compliance con Ley 1581/2012.

---

**Prompt 2:**

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

**Guidance:** Específicamente solicité PostgreSQL-level exclusion constraints en lugar de application-level locking. Requirió UTC storage con display-timezone conversion.

---

**Prompt 3:**

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

---

## 4. Especificación de la API

**Prompt 1:**

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

**Guidance:** Especifiqué Hono + Zod como API framework y validation layer. Requirió business_id extraction from session (no URL) para multitenancy security.

**Human adjustments:** Añadí rate limiting specifications (100 req/min for public, 1000 for authenticated). Añadí idempotency key requirement para payment endpoints.

---

## 5. Historias de Usuario

**Prompt 1:**

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

**Guidance:** Dirigí a la IA a enfocarse en los 3 use cases que representan el core value proposition. Requirí Mermaid flowcharts (no sequence diagrams) para mejor legibilidad.

---

**Prompt 2:**

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

---

## 6. Tickets de Trabajo

*(Ver sección 2.6 para prompts relacionados con tickets)*

---

## 7. Pull Requests

*(Los PRs se documentan en readme.md - sección 7)*

---

## Summary

### Tools Used

| Tool | Purpose | Sections |
|------|---------|----------|
| Claude (opencode) | PRD generation, architecture design, data modeling, use case analysis | All sections |
| opencode skills | /prd-generator, /system-design, /data-model, /use-cases | Structured document generation |

### Key Learnings

- **Providing the idea analysis as context was essential**: The AI generated significantly more accurate and Colombia-specific output when given the full market research document.
- **Explicit constraints produced better architecture decisions**: Asking for "modular monolith, not microservices" and "under $35/month MVP infrastructure" prevented the AI from over-engineering.
- **Iterative refinement was more effective than one-shot generation**: Subsequent prompts to refine specific sections produced much higher quality than trying to get everything perfect in one prompt.

### Comparative: Before vs After AI

| Aspect | AI Generated | Human Adjusted |
|--------|-------------|----------------|
| **Pricing tiers** | Generic $15-40/mo range | Refined to $19/35/59/mo based on competitive analysis |
| **Payment methods** | Stripe + generic "local payments" | Added specific Colombian methods: Nequi, Daviplata, PSE, MercadoPago with adapter pattern |
| **Data protection** | Generic GDPR reference | Replaced with Colombian Ley 1581/2012 specifics |
| **Architecture** | Initially suggested microservices | Changed to modular monolith for solo-dev viability |
| **Infrastructure cost** | Estimated $200-400/mo for MVP | Reduced to $20-35/mo by leveraging free tiers |
| **Double-booking prevention** | Application-level optimistic locking | Upgraded to PostgreSQL EXCLUDE USING gist exclusion constraints |
