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

**Prompt 2:**

**Prompt 3:**

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
