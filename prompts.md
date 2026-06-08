> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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

**Prompt 1:**
You are a product strategy analist.
Please improve my prompt.
I want to start a new project and I would like to create a PRD document based on this text:
Aura Planning – Project Overview for PRD Discussion
Aura Planning is a SaaS platform for digital invitations and real-time event storytelling, launching with weddings but built to scale to any celebration (birthdays, corporate events, baptisms). Its slogan: "Design your event's narrative, manage the logistics effortlessly."

Core Product (MVP)
Three main components:

Host Management Panel – Template editor (colors, typography, photos), guest manager with CSV/Excel import and category segmentation, and a control dashboard tracking RSVPs, dietary needs, transport, and allergens.
Guest Microsite (Mobile-First, JAMstack) – Static HTML/JS/CSS served via CDN for ultra-fast loads. Smart RSVP forms capture dietary requirements and bus attendance. Integrated Google Maps/Waze links and calendar sync.
Communication System – Multichannel invitations (email + WhatsApp), automated reminders for non-responders, and post-event thank-you cards with optional links to external photo galleries (Drive, Pixieset – no native hosting in V1).
Killer Feature: Live Guest Journey
Real-time narrative notifications sent throughout the event day via WhatsApp Business API. A trusted "accomplice" (best man/bridesmaid) gets secure magic-link access (no password) to a simplified remote panel with pre-configured, swipe-to-send buttons: "The bride is leaving," "They said yes!", "Dancing begins!" This differentiates from competitors (Zankyou, Bodas.net) by focusing on hype and immediacy for Millennial/Gen Z audiences, while keeping the couple distraction-free.

Business Model: "Try-Before-You-Buy" (IKEA Effect)
Free tier: Full design tool access, but event stays in "Draft Mode" – max 5 test guests, no public URL, no live RSVP.
Paid tier: One-time payment to publish (unlock public URL + RSVP system). High switching friction after users invest time designing.
Future revenue stream (under evaluation): Gift registry / cash fund via Stripe Connect – money flows guest → host directly; Aura takes 1.5–2% platform fee, never touches funds (avoids KYC/AML).
Technical Architecture & Cost Optimization
JAMstack: Guest sites are static (CDN-served), zero DB hits per visit.
Transactional backend only for admin panel and data I/O.
No photo uploads in V1 – avoids storage/egress costs and GDPR complexity.
30-day auto-deletion of all sensitive data post-event.
Cost Structure
Infrastructure (admin + DB): Low/Medium
WhatsApp Business API (per conversation) + AWS SES: Variable
Stripe fees (~3%): Proportional to sales
Google Maps API: Low (free quota)
Operations/support: Medium (human time)
Roadmap
V1 (MVP): Weddings, pay-per-publish, basic RSVP
V2 (Live): WhatsApp API + Accomplice Mode
V3 (Diversify): Corporate, birthdays, baptisms under "Aura" brand


==============================================================================


Act as a Senior Product Manager creating a comprehensive PRD (20-30 pages) for internal team alignment (engineering, design, stakeholders). The PRD will serve as the single source of truth for building the MVP.

Project: Aura Planning – SaaS for digital invitations + real-time event storytelling (weddings first, scalable to celebrations).

Source Material: [paste your overview text here]

Required PRD Structure:

Executive Summary (1 page)
Problem Statement & Opportunity — Articulate the core problem for couples and guests. Why now? Market size (TAM/SAM/SOM) for wedding tech.
User Personas (3-4 detailed) — Primary: Couple (host). Secondary: Guest. Tertiary: Accomplice. Quaternary: Vendor/Planner (future). Include jobs-to-be-done, pain points, success criteria.
Product Vision & Strategy — North star, MVP scope boundaries, differentiation vs. Zankyou/Bodas.net/WithJoy/Joy.
MVP Feature Specification — For each of the 3 core components + Live Guest Journey:
User stories (As a [persona], I want to [action], so that [outcome])
Acceptance criteria (Given/When/Then format)
Edge cases & error states
Priority (MoSCoW)
Technical Architecture & Non-Functional Requirements
System diagram (refine your existing one)
Data model (expand your entities with field types, constraints, indexes)
API contracts (expand your 10 endpoints with request/response schemas, auth, rate limits)
NFRs: Performance (p95 < 200ms API, < 1s static page), Security (OWASP Top 10, encryption, 30-day auto-delete), Scalability (10k concurrent guests), Observability (logging, metrics, tracing), Accessibility (WCAG 2.1 AA)
Integration specs: WhatsApp (template approval flow, webhook handling), SES (bounce/complaint processing), Stripe (webhook idempotency), Google Maps (quota management)
UX/UI Requirements — Key flows (wireframe references), design system tokens, responsive breakpoints, mobile-first constraints
Success Metrics & KPIs — Leading/lagging indicators for MVP (activation rate, publish conversion, RSVP completion, WhatsApp delivery rate, NPS)
Risks, Assumptions & Dependencies — Technical (WhatsApp API approval), Business (pricing validation), Operational (support load)
Rollout Plan — Phased launch (alpha → beta → GA), feature flags, rollback criteria
Appendix — Glossary, research links, competitive matrix, open questions
Tone: Precise, unambiguous, developer-ready. Use tables, mermaid diagrams, and structured lists. Flag open decisions with ⚠️ DECISION NEEDED.



**Prompt 2:**

refine the tone => I do not want to have a super detailed definition for the technical details as they must be refined later. But it should provide a clear idea on what is the work that we have to do in the different areas (UX, UI, Frontend, Backend, etc)

============================================================================================

Act as a Senior Product Manager creating a comprehensive PRD (20-30 pages) for internal team alignment. This PRD defines what we're building and why — technical implementation details will be refined in separate design docs.

Project: Aura Planning – SaaS for digital invitations + real-time event storytelling (weddings first, scalable to celebrations).

Source Material: [paste your overview text here]

Required PRD Structure:

Executive Summary (1 page)
Problem Statement & Opportunity — Core problem for couples & guests. Why now? TAM/SAM/SOM for wedding tech.
User Personas (3-4 detailed) — Couple (host), Guest, Accomplice, Vendor/Planner (future). Jobs-to-be-done, pain points, success criteria.
Product Vision & Strategy — North star, MVP scope boundaries, differentiation vs. Zankyou/Bodas.net/WithJoy/Joy.
Registration & Onboarding (NEW)
Two-step flow: Register account → Create event
Registration: Email capture → magic link verification → profile setup (name, timezone, locale) → Terms/Privacy acceptance → Marketing opt-in
Onboarding wizard: Template selection → Event basics (name, date, venue) → Guided to dashboard
Account recovery: "Resend magic link" flow, email change with re-verification
User stories, acceptance criteria, edge cases
MVP Feature Specification — For each component:
Host Management Panel: Template editor, guest manager (CSV/import, categories), control dashboard (RSVPs, dietary, transport, allergens)
Guest Microsite: Static JAMstack site, smart RSVP forms, Maps/Waze links, calendar sync
Communication System: Email + WhatsApp invitations, automated reminders, post-event thank-you cards (external gallery links)
Live Guest Journey (Killer Feature): Accomplice magic-link panel, pre-configured swipe-to-send narrative buttons, WhatsApp Business API delivery
For each: User stories, acceptance criteria (Given/When/Then), edge cases, MoSCoW priority
Work Breakdown by Discipline
Area	Key Workstreams	Open Questions
UX	User flows for 4 personas, RSVP form optimization, accomplice panel simplicity, mobile-first guest journey, registration/onboarding flows	⚠️ Accomplice onboarding flow
UI	Design system (tokens, components), template editor builder, responsive breakpoints, accessibility (WCAG 2.1 AA), onboarding wizard screens	⚠️ Template customization depth
Frontend (Angular 22)	Host dashboard SPA, accomplice panel SPA, static site generator for guest microsites, typed forms, signals state, auth/registration forms	⚠️ Static site build pipeline
Backend (.NET 10)	Auth (magic links + JWT), Registration endpoint, profile management, Events/Guests/Invitations/RSVPs CRUD, CSV import, payment webhook, background jobs (30-day deletion)	⚠️ WhatsApp template management
Database (SQLite/EF Core)	Schema for all entities, Users table with profile fields, soft deletes, indexes for query patterns, migrations	⚠️ Encryption at rest approach
Integrations	WhatsApp Business API (templates, webhooks, rate limits), AWS SES (templates, bounce handling), Stripe Connect (publish payment, future gift registry), Google Maps (embed, geocoding, directions)	⚠️ WhatsApp API approval timeline
Infrastructure/DevOps	CDN for static sites, CI/CD, environments, observability (logs/metrics/traces), secrets management	⚠️ Hosting provider decision
Security/Compliance	AuthZ policies, rate limiting, PII handling, 30-day auto-delete job, GDPR rights endpoints, consent tracking	⚠️ SQLCipher vs app-level encryption
Success Metrics & KPIs — Activation rate, registration completion rate, publish conversion, RSVP completion, WhatsApp delivery rate, NPS
Risks, Assumptions & Dependencies — Technical, business, operational
Rollout Plan — Alpha → beta → GA, feature flags, rollback criteria
Appendix — Glossary, competitive matrix, open decisions log
Tone: Precise, unambiguous, team-ready. Use tables, mermaid diagrams for flows. Flag open decisions with ⚠️ DECISION NEEDED. Technical depth: architectural intent only — no implementation specs.


**Prompt 3:**

As a UI/UX design expert, generate the complete brand identity and platform UI for "Aura Events" (Aura Planning) in this .pen file.

CONTEXT:
Aura Events is a SaaS platform for digital event invitations and real-time event storytelling. Initial market: weddings, scalable to any celebration. Slogan: "Design your event's narrative, manage the logistics effortlessly." The interface must be minimalist, elegant, and convey peace.

IMPORTANT: Design the Aura company platform itself (where users land, sign up, and manage events), NOT the guest-facing wedding microsites.

---

PART 1: BRAND STYLES & DESIGN TOKENS

Update the document variables with a cohesive design system:

Colors:
- Primary: elegant sage/warm tone reflecting "Aura" serenity
- Accent: refined gold for CTAs and premium feel
- Backgrounds: warm cream/ivory surfaces
- Text hierarchy: dark charcoal (primary), warm gray (secondary), muted (tertiary)
- Semantic colors: success (green), warning (amber), error (rose), info (blue) - all muted/elegant
- Borders and dividers: subtle warm tones

Typography:
- Headings: Playfair Display (serif, elegant)
- Body: Inter (sans-serif, clean, readable)

Spacing scale: 4px base unit (4, 8, 12, 16, 24, 32, 40, 48, 64)
Border radius: sm=8, md=12, lg=16, full=999
Shadows: subtle, warm-toned (sm, md, lg)

---

PART 2: LOGO

Create an "Aura Events" logo as a reusable component:
- Minimalist wordmark or icon + wordmark
- Should evoke: elegance, warmth, celebration, light/aura
- Two variants: full logo (icon + text) and icon-only (for nav/favicons)
- Use the brand color palette

---

PART 3: REUSABLE COMPONENTS

Build these as reusable components:
- Button (Primary, Secondary, Ghost, Danger)
- Input field with label and error state
- Card container
- Navigation bar (with logo, nav links, user avatar)
- Badge (Pending, Confirmed, Cancelled)
- Event card (with image placeholder, title, date, status, guest count)
- Stats/metric card
- Empty state illustration + text
- Avatar component

---

PART 4: SCREENS

Design these screens as top-level frames:

A) LANDING PAGE (what users see after searching Google)
- Hero section: headline "Design your event's narrative, manage the logistics effortlessly" + CTA "Start designing — it's free"
- Value proposition section (3 columns: Template Editor, Guest Manager, Live Updates)
- Social proof / trust indicators
- Feature highlights with visuals
- Pricing teaser ("Free to design, pay to publish")
- Footer with links

B) SIGN UP / MAGIC LINK REQUEST
- Clean, centered card
- Aura logo
- "Create your account" heading
- Email input field
- "Continue with Magic Link" button
- Link to sign in
- Minimal, distraction-free

C) SIGN IN (Magic Link)
- Similar to sign up
- "Welcome back" heading
- Email input
- "Send magic link" button
- Link to sign up

D) HOST DASHBOARD (after authentication)
- Navigation bar with logo, nav items (Dashboard, Events, Guests, Settings), user menu
- Welcome section with user name
- Stats row: Total Events, Active Guests, Pending RSVPs, Published Events
- "Create New Event" CTA button
- Events list/table with: Event name, date, status (draft/published), guest count, RSVP rate, actions
- Empty state if no events exist
- Sidebar or top nav for navigation

E) EVENT CONFIGURATION SCREEN
- Event details form: Name, Date, Venue, Template selector
- Color and typography customization preview
- Guest import section (CSV upload area)
- Publish button (with paywall indicator)
- Progress indicator showing setup completion

---

DESIGN PRINCIPLES:
- Minimalist and elegant — convey the peace suggested by "Aura"
- Mobile-first thinking but design desktop views
- Use the existing color palette in the .pen file as a starting point
- Warm, inviting, premium feel
- Clear visual hierarchy
- Generous whitespace
- No excessive shadows, gradients, or decorations
- Conversion-focused on landing page
- Functional and clear on dashboard

Generate all screens with placeholder content where needed. Use the existing variables in the .pen file and extend them as necessary.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

as a expert software architect I want you to define the section 2 of the @readme.md for @business-documentation\prd 
I want you define the architecture documentation we need for the project and place it in a /technial-documentation/{subfolder}
The extended documentation should live in /technial-documentation/{subfolder} and then explain it in @readme.md by filling the section items

==========================================================================

Plan: Section 2 - Arquitectura del Sistema
Based on my analysis of the PRD, technical conventions, and existing architecture analysis, here's what I'll create:

Structure to create:
technical-documentation/
└── architecture/
    ├── 01-architecture-diagram.md      (2.1 - Diagramas de arquitectura)
    ├── 02-components.md                 (2.2 - Componentes principales)
    ├── 03-project-structure.md          (2.3 - Estructura de ficheros)
    ├── 04-infrastructure-deployment.md  (2.4 - Infraestructura y despliegue)
    ├── 05-security.md                   (2.5 - Seguridad)
    └── 06-testing.md                    (2.6 - Tests)
Content for each file:
01-architecture-diagram.md (2.1):

C4 Context Diagram (Mermaid)
C4 Container Diagram (Mermaid)
Guest Microsite Flow (Sequence Diagram)
Live Guest Journey Flow (Sequence Diagram)
Architecture pattern justification (JAMstack Hybrid + Clean Architecture)
Benefits and trade-offs table
02-components.md (2.2):

Host Dashboard (Angular 22, Signals, Typed Forms)
Guest Microsite (Static HTML/JS/CSS, CDN)
Accomplice Panel (Angular 22, Touch gestures)
API Server (.NET 10, Minimal APIs, EF Core)
Static Site Generator (Razor templates)
Email Dispatcher (AWS SES, BackgroundService)
WhatsApp Dispatcher (Meta Cloud API, retry logic)
Data Retention Service (30-day auto-delete)
Reminder Scheduler
03-project-structure.md (2.3):

Backend folder structure (Aura.Api, Aura.Core, Aura.Infrastructure)
Frontend folder structure (app/core, app/features, app/shared)
Explanation of Clean Architecture pattern
Purpose of each major folder
04-infrastructure-deployment.md (2.4):

CDN Architecture diagram (Mermaid)
CI/CD Pipeline diagram (Mermaid)
Environments table (Local, Staging, Production)
Environment variables
Observability (Serilog, OpenTelemetry, Sentry)
Backup strategy
05-security.md (2.5):

Authentication architecture (Magic links + JWT)
Token specifications table
Authorization policies table
Rate limiting table
PII handling and encryption
GDPR compliance table
30-day auto-delete flow (Mermaid)
Infrastructure security measures
06-testing.md (2.6):

Unit testing strategy (xUnit for backend, Jasmine/Karma for Angular)
Integration testing approach
Test categories and examples
Testing pyramid

**Prompt 2:**

I would like to change the arquitecture.
I do not want to use azure, instead I would like to go for a full Kubernetes solution.
What would that change in the project?

================================




**Prompt 3:**


Cluster management: Do you want managed Kubernetes (GKE, EKS, DOKS) or self-hosted (k3s, k0s on your own VMs)?
use rancher desktop for local environment
I do not know at the moment which will be the final cluster for deployments

Email provider => can we just use a SMTP of a gmail free accout?
Replace database with Postgres.
use tradicional pipelines by the moment 
Use miniIO



### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
you are an expert on data engieniering and i would like you to improve this prompt
I need to define the data model for @business-documentation\prd 
important notes to keep in mid:
- we are storing sensitive data so because of the GDPR we should be able to deelete/anonimize the users data if they request but the data inside the app have to be consistent for audit purpose
- I wnat you to generate the documentaion in a subdolder of the technical-documentation and fill the readme section 3 (at the moment it is containing pplaceholders)

=================================================================

Act as a senior data engineer. Define the complete data model for the Aura Planning application based on the PRD documentation located at `business-documentation/prd/`.

## Context
Aura Planning is a wedding/event invitation platform with:
- Host dashboard (Angular SPA) for creating events, managing guests, tracking RSVPs
- Guest microsites (JAMstack static sites) served via CDN
- Accomplice panel for live event updates via WhatsApp
- Multi-channel communication (email via Gmail SMTP, WhatsApp via Meta API)
- Stripe payments for event publishing
- 30-day automated data deletion after event end date

Key PRD files to review:
- `business-documentation/prd/04-vision-strategy.md` — scope, roadmap
- `business-documentation/prd/05-registration-onboarding.md` — auth flow, user lifecycle
- `business-documentation/prd/06-mvp-features.md` — all MVP features and user stories

## Technical Stack
- Database: PostgreSQL 16 with Entity Framework Core
- Backend: .NET 10 (ASP.NET Core Web API)
- Existing conventions: `conventions/technical-conventions.md`

## Critical Requirements

### 1. GDPR Compliance with Audit Integrity
We store sensitive PII (names, emails, phones, dietary restrictions, messages). The model must support:
- **Right to Erasure**: When a user/guest requests deletion, their PII must be anonymized or deleted
- **Audit Consistency**: Business data (RSVP counts, payment records, message delivery logs) must remain consistent for audit purposes even after PII removal
- **Design pattern**: Consider separating PII columns from audit/reference data, using soft deletes with anonymization flags, or a two-table approach (identity + anonymized records)
- **Data Retention**: All event data is hard-deleted 30 days after EventEndDate via `DataRetentionJob`

### 2. Multi-tenant by Event
Each event is isolated — guests, invitations, RSVPs, accomplices, and messages are scoped to a specific event.

### 3. Token-based Access
Magic links (users, accomplices) and invitation tokens must be unique, time-bound, and stored securely (hashed tokens, not plaintext).

## Deliverables

Create the documentation in a new subfolder `technical-documentation/data-model/` with the following files:

### `technical-documentation/data-model/README.md`
Fill in Section 3 (Data Model) with:
1. **Entity Relationship Diagram** (Mermaid `erDiagram` syntax)
2. **Entity Definitions Table** — each entity with: columns, types, constraints, indexes, nullability, default values, and GDPR classification (PII / Audit / Reference)
3. **Key Relationships** — cardinality and cascade rules
4. **GDPR Strategy** — how erasure requests are handled per entity, what gets anonymized vs deleted, how audit integrity is maintained
5. **Soft Delete Pattern** — which entities use `IsDeleted`/`DeletedAt` and why
6. **Token Security** — how magic link and invitation tokens are stored and validated
7. **Indexing Strategy** — indexes for common query patterns (lookups by slug, token, event, status)
8. **Migration Notes** — any considerations for EF Core migrations (seed data, computed columns, etc.)

### `technical-documentation/data-model/entities.md`
Detailed specification for each entity including:
- Full column list with types and constraints
- Business rules (e.g., "Event.Slug must be URL-safe and unique")
- Lifecycle states (e.g., Event: draft -> published -> completed -> archived)
- GDPR handling per field

## Reference: Existing Entity List (from technical-conventions.md)
Users, Events, Templates, Guests, Invitations, RSVPs, Accomplices, MessageTemplates, LiveMessages, Payments, DataRetentionJobs

Extend, refine, or restructure these as needed based on the PRD requirements. Ensure all MVP features are covered by the data model.

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

as an expert in managing projects and defining technical tasks for developers. Can you improve this prompt?
I want you create the required tickets to implement the MVP versions for our project @business-documentation\prd following @technical-documentation data
the team for this project is one single person

**Prompt 2:**
Here's the improved prompt in plain text:

You are an expert technical project manager and lead developer. Create a complete, actionable set of work tickets to implement the Aura Planning MVP, and write each ticket as a markdown file inside a tickets/ folder at the project root.

Context
Project: Aura Planning — a SaaS platform replacing paper wedding invitations with interactive digital ones, featuring a "Live Guest Journey" (WhatsApp real-time storytelling via an accomplice panel)
Team: 1 solo developer (full-stack: .NET 10 backend + Angular 22 frontend + PostgreSQL + Kubernetes)
Timeline: 8 weeks
Tech Stack: .NET 10 (ASP.NET Core Web API), Angular 22 (standalone components, signals, typed forms), PostgreSQL 16 (EF Core), DragonflyDB (Redis-compatible queue/cache), MinIO (S3-compatible object storage), Gmail SMTP, Meta WhatsApp Business API, Stripe Connect, Google Maps API, Kubernetes with Kustomize, GitHub Container Registry
Source Documents
These are the single source of truth. Read and reference them precisely:

PRD: business-documentation/prd/ — especially 01-executive-summary.md, 06-mvp-features.md, 07-work-breakdown.md, 08-success-metrics.md
Architecture: technical-documentation/architecture/ — 01-architecture-diagram.md through 06-testing.md
Data Model: technical-documentation/data-model/ — README.md and entities.md
Conventions: conventions/technical-conventions.md (tech stack, architecture, code style, project structure) and conventions/git-conventions.md (branch naming, commit messages, PR format)
File Structure
Create a tickets/ folder at the project root. Each ticket is a separate .md file named with this convention:

tickets/W{week}-PSRP-{number}-{short-description}.md
Example: tickets/W1-PSRP-001-project-scaffolding.md

Files should be flat inside tickets/, ordered by week prefix for easy scanning.

Ticket Content Format
Each markdown file must follow this exact structure, aligned with our .github/ISSUE_TEMPLATE/feature-request.md template:

## PSRP-XXX: <type>(<scope>): <short-title>

**Type:** feat | chore | refactor
**Priority:** P0 (Must) | P1 (Should) | P2 (Could)
**Estimated Effort:** XS (≤0.5d) | S (1d) | M (2-3d) | L (4-5d) | XL (1w+)
**Sprint Week:** W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8
**Dependencies:** PSRP-XXX, PSRP-XXX (or "None")

## Feature Summary
2-3 sentences explaining what needs to be built and why, tied to a specific user story from the PRD.

## Requirements
- [ ] Specific, testable requirement 1
- [ ] Specific, testable requirement 2
- [ ] Specific, testable requirement 3

## Technical Notes
- **Backend:** <endpoints, services, repositories needed>
- **Frontend:** <components, routes, services needed>
- **Database:** <entities, migrations, indexes>
- **Integrations:** <external APIs if applicable>
- **Key files:** <expected file paths based on project structure in technical-conventions.md>

## Acceptance Criteria
- [ ] AC1: <specific, testable criterion with Given/When/Then format when applicable>
- [ ] AC2: <specific, testable criterion>
- [ ] AC3: <specific, testable criterion>

## Related Items
- **PRD section:** <reference to specific section in 06-mvp-features.md>
- **Architecture:** <reference to relevant architecture doc>
- **Data model:** <reference to relevant entities in data-model/>

## Blockers
None / Blocked by: PSRP-XXX

## Branch Name
`feature/PSRP-XXX-short-description`
Dependency & Ordering Rules
Tickets must be sequenced so that every ticket is implementable in order without circular dependencies or missing prerequisites. Apply these rules strictly:

Infrastructure before code: Project scaffolding, solution structure, Dockerfiles, K8s base manifests, and CI/CD pipeline must come first. Nothing else can be built without the project skeleton.
Database before business logic: All entity models, EF Core configurations, and initial migrations must exist before any CRUD endpoints or services that query them.
Auth before protected features: Magic link + JWT auth must be complete before any endpoint that requires authentication (events, guests, dashboard, accomplice panel).
Core entities before dependent features: Events must exist before Guests, Guests before Invitations, Invitations before RSVPs. Build in dependency order.
Backend before frontend for the same feature: When a ticket includes both backend and frontend, the backend API must be listed as a sub-requirement that is implemented first within that ticket.
Integrations before features that depend on them: Email service abstraction must exist before email invitations. Stripe setup must exist before payment flow. WhatsApp service abstraction must exist before live messages.
Workers after queue infrastructure: Dragonfly queue service must be implemented before Email Dispatcher, WhatsApp Dispatcher, and Static Site Generator workers can dequeue and process messages.
Static site generator after event publishing: The SSG worker depends on published event data, templates, and MinIO — all of which must exist first.
Accomplice feature after auth and live messages: The accomplice panel depends on magic link auth (reused pattern), message templates, and the live message delivery pipeline.
Data retention after all entities exist: The retention CronJob must be last because it needs to know all entity types and their FK relationships to delete in the correct order.
No ticket should depend on a ticket scheduled for a later week. If a dependency would push a ticket past its week, move it to the later week instead.
Each ticket's Dependencies field must list every other PSRP ticket it cannot start without. Be explicit — do not write "None" if there is a real prerequisite.
Sequencing — 8-Week Plan
Week 1-2: Foundation

Project scaffolding (solution structure, Dockerfiles, K8s base manifests, CI/CD pipeline)
Database schema and EF Core migrations (all entities from data model)
Authentication system (magic link generation, email delivery, JWT verification, session management)
Base API structure (health checks, error handling middleware, CORS, rate limiting, security headers)
Shared Angular components (design system: buttons, inputs, cards, navbar, empty states)
Auth UI (login page, magic link form, verify page, auth guard, auth interceptor)
Week 3-4: Core Features

Event CRUD (create, read, update, delete with slug generation)
Template editor (3 preset templates, color/font customization, hero image upload to MinIO, real-time preview, auto-save)
Guest management (manual entry, CSV import with validation, deduplication, categorization, search/filter, soft delete)
Control dashboard (RSVP statistics, dietary restrictions list, transport needs, guest list with RSVP status, CSV export)
Week 5-6: Communication & Publishing

Email service abstraction + Email Dispatcher worker (Dragonfly queue, Gmail SMTP, template rendering, delivery tracking)
Email invitations (personalized templates with RSVP link, send from dashboard, delivery status)
WhatsApp service abstraction + WhatsApp Dispatcher worker (Dragonfly queue, Meta API, retry logic, email fallback)
Stripe payment flow (payment intent creation, webhook handling, event publish on success, tier pricing)
RSVP public form (token-based access, attendance/dietary/transport/plus-one/message, deadline enforcement, confirmation page)
Static site generator worker (Razor templates, MinIO upload, CDN cache invalidation, triggered on event publish)
Week 7-8: Killer Feature + Polish

Accomplice management (grant access via email, magic link, permissions JSON, revoke, resend)
Accomplice panel (swipe-to-send UI, message templates, delivery status, RSVP summary view, mobile-first)
Live messages (queue via Dragonfly, WhatsApp dispatch, delivery tracking, webhook handling)
Automated reminders (CronJob, configurable schedule, same-channel delivery, Dragonfly enqueue)
Thank you cards (post-event, automated, personalized, same-channel delivery)
Data retention job (CronJob, 30-day hard delete, FK-safe order, GDPR compliance)
Testing suite (unit tests for Core services, integration tests with Testcontainers for PostgreSQL + Dragonfly, E2E critical paths)
Bug fixes, performance tuning, final documentation
Constraints
Each ticket must be small enough for a solo developer to complete within the estimated effort
Backend and frontend work for the same feature should be in the SAME ticket unless it would exceed L effort
Include infrastructure/DevOps tickets (CI/CD, K8s manifests, Dockerfiles, environment config)
Include testing as its own tickets where appropriate, but also embed test requirements inside feature tickets
Include security tickets (rate limiting, CORS, input validation, PII encryption, CSRF, security headers)
MVP scope only — focus on "Must have" items from the PRD. Include "Should have" only if they are blockers for Must items. Defer "Could have" to post-MVP
Follow branch naming conventions from git-conventions.md: feature/PSRP-XXX-short-description
Reference specific data model entities, API endpoints, and architecture docs in each ticket
Account for all 11+ entities in the data model and all core API endpoints defined in the architecture
Each ticket's acceptance criteria must be directly traceable to a user story or acceptance criterion in 06-mvp-features.md
Output
Create the tickets/ directory at the project root
Write one .md file per ticket, named W{week}-PSRP-{number}-{short-description}.md, flat inside tickets/
At the end, produce a summary table in the console output with columns: PSRP#, Title, Type, Priority, Effort, Week, Dependencies, File Name
Add a risk notes section flagging tickets with external dependencies (WhatsApp API approval, Stripe webhook setup, Google Maps API key, Gmail SMTP app password) that need early action

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
