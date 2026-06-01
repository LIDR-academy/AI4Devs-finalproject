# AI4Devs Final Project — ReservaPro

## Project Card

| Field | Value |
|-------|-------|
| **Student Name** | [Your Name] |
| **Project Name** | ReservaPro |
| **Description** | SaaS booking and management platform for barbershops and salons in Colombia |
| **Repository** | [repo URL] |
| **Deployed URL** | [deployment URL] |
| **Branch (Entrega 1)** | feature-entrega1-[initials] |

---

## 1. Product Description

### Objective

ReservaPro is a SaaS booking and management platform purpose-built for niche personal service businesses — starting with barbershops and salons in Colombia, with planned expansion across Latin America and Spain. The platform solves the critical operational gap faced by approximately 1.4 million service businesses in the region that still rely on WhatsApp messages, paper agendas, and manual cash tracking to manage appointments and client relationships.

Existing global solutions (Mindbody at $129–699/mo, Fresha with marketplace competition) are either prohibitively expensive or structurally misaligned with LATAM business practices. ReservaPro combines native WhatsApp integration, local payment methods (MercadoPago, Nequi), LATAM-adapted pricing ($19–59/mo), and Spanish-first UX to deliver a platform that understands how these businesses actually operate.

### Target Users

| Persona | Role | Goals | Frustrations |
|---------|------|-------|--------------|
| **Carlos — Business Owner** | Owner of a barbershop with 3 barbers | Reduce no-shows, know daily revenue, grow client base | Spends 45 min/day on WhatsApp scheduling; lost $800/month to no-shows; existing tools too expensive |
| **Andrés — Professional/Barber** | Senior barber building his own client base | See schedule clearly, know client preferences, get paid on time | Clients message him directly to book; doesn't know tomorrow's schedule until owner tells him |
| **Valentina — End Client** | 28-year-old professional visiting every 3 weeks | Book easily at any hour, get reminded, pay online | Has to call during business hours to book; forgot last appointment; can't see availability |

### Key Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Public Booking Page | SSR mobile-first page where clients book in under 60 seconds | Must |
| Availability Engine | Real-time slot calculation with buffers, schedules, and double-booking prevention | Must |
| Appointment Management | Full CRUD with status machine (pending → confirmed → completed/cancelled/no-show) | Must |
| WhatsApp Reminders | Automatic reminders at 24h and 2h before appointments via Twilio | Must |
| Email Notifications | Confirmations and reminders via Resend as fallback channel | Must |
| Online Payments | Stripe + MercadoPago integration with deposit configuration | Must |
| Dashboard & Reports | Today's overview, revenue summaries, service popularity, no-show tracking | Must |
| Business Management | Business hours, holidays, team management, service catalog | Must |
| Role-Based Access | Owner, admin, and professional roles with permission scoping | Must |
| Subscription Plans | 4-tier pricing with feature gating via Stripe | Must |

### Business Model

| Plan | Price | Key Features |
|------|-------|--------------|
| **Free** | $0/mo | 1 professional, 50 appointments/mo, basic booking page, email reminders |
| **Starter** | $19/mo | Up to 3 professionals, 200 appointments/mo, WhatsApp reminders, branded booking page |
| **Professional** | $35/mo | Up to 10 professionals, unlimited appointments, online payments, analytics dashboard |
| **Business** | $59/mo | Unlimited professionals, multi-location, priority support, advanced reports, API access |

---

## 2. Architecture

### Architecture Overview

ReservaPro adopts a **modular monolith** architecture, the pragmatic choice for a solo-developer SaaS targeting 0–100 barbershops in year one. Rather than splitting into microservices, the application organizes its nine domain boundaries (Business & Staff Management, Service Catalog, Calendar & Availability, Booking Engine, Public Booking Page, Payments, Notifications, Dashboard & Analytics, and Authentication & Authorization) into well-defined modules within a single deployable unit. Each module owns its database tables, exposes a clean internal API, and communicates with other modules through typed function calls or an in-process event bus. Multitenancy is implemented at the database level using a `business_id` foreign key on all tenant-scoped tables, enforced by middleware that injects the tenant context from the authenticated session.

The data architecture centers on **PostgreSQL via Neon** as the primary relational store, chosen for its ACID guarantees, JSONB flexibility, and Neon's serverless-friendly connection pooling. **Upstash Redis** provides a lightweight caching layer for availability slot calculations and session data, while also powering **BullMQ** — the background job queue that handles asynchronous tasks like notification dispatch, payment webhook processing, and reminder scheduling. External integrations follow an **adapter pattern**: a `PaymentAdapter` interface abstracts Stripe and MercadoPago behind a unified API. Authentication leverages **Clerk** for its excellent Next.js integration, pre-built UI components, and JWT-based sessions, with RBAC enforced through middleware that checks role permissions at the route level.

### Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["Layer 1 - Clients"]
        WebApp["Web App<br/>Next.js SSR"]:::client
        MobilePWA["Mobile PWA<br/>Service Worker"]:::client
        AdminDash["Admin Dashboard<br/>Next.js"]:::client
        PublicPage["Public Booking Page<br/>SSR + SEO"]:::client
    end

    subgraph Edge["Layer 2 - Edge / CDN"]
        VercelEdge["Vercel Edge Network"]:::edge
        WAF["WAF / Rate Limiting"]:::edge
        DNS["DNS<br/>Cloudflare"]:::edge
    end

    subgraph Application["Layer 3 - Application"]
        APIServer["Next.js API Routes<br/>+ Hono Server"]:::app
        BullWorkers["BullMQ Workers<br/>Notification + Payment"]:::app
        CronJobs["Cron Jobs<br/>Reminders + Analytics"]:::app
    end

    subgraph Data["Layer 4 - Data"]
        Postgres["PostgreSQL<br/>Neon Serverless"]:::data
        Redis["Redis<br/>Upstash"]:::data
        S3Storage["Object Storage<br/>Cloudflare R2"]:::data
    end

    subgraph External["Layer 5 - External Services"]
        Stripe["Stripe"]:::ext
        MercadoPago["MercadoPago"]:::ext
        Twilio["Twilio<br/>WhatsApp"]:::ext
        Resend["Resend<br/>Email"]:::ext
        ClerkAuth["Clerk<br/>Auth"]:::ext
        SentryMon["Sentry<br/>Monitoring"]:::ext
        PostHogAnalytics["PostHog<br/>Analytics"]:::ext
    end

    subgraph CICD["Layer 6 - CI/CD"]
        GitHub["GitHub Repository"]:::cicd
        GHActions["GitHub Actions<br/>CI Pipeline"]:::cicd
        VercelDeploy["Vercel Deploy<br/>Frontend"]:::cicd
        RailwayDeploy["Railway Deploy<br/>Workers"]:::cicd
    end

    WebApp --> VercelEdge
    MobilePWA --> VercelEdge
    AdminDash --> VercelEdge
    PublicPage --> VercelEdge

    VercelEdge --> WAF
    WAF --> APIServer
    DNS --> VercelEdge

    APIServer --> Postgres
    APIServer --> Redis
    APIServer --> S3Storage

    APIServer --> Stripe
    APIServer --> MercadoPago
    APIServer --> ClerkAuth

    APIServer -.-> BullWorkers
    BullWorkers --> Redis
    BullWorkers --> Postgres

    BullWorkers -.-> Twilio
    BullWorkers -.-> Resend

    CronJobs --> Redis
    CronJobs --> Postgres
    CronJobs -.-> BullWorkers

    APIServer -.-> SentryMon
    APIServer -.-> PostHogAnalytics
    PublicPage -.-> PostHogAnalytics

    GitHub --> GHActions
    GHActions --> VercelDeploy
    GHActions --> RailwayDeploy

    class WebApp,MobilePWA,AdminDash,PublicPage client
    class VercelEdge,WAF,DNS edge
    class APIServer,BullWorkers,CronJobs app
    class Postgres,Redis,S3Storage data
    class Stripe,MercadoPago,Twilio,Resend,ClerkAuth,SentryMon,PostHogAnalytics ext
    class GitHub,GHActions,VercelDeploy,RailwayDeploy cicd
```

### Tech Stack

| Layer | Technology | Justification | Alternative Considered |
|-------|-----------|---------------|----------------------|
| **Frontend** | Next.js 14 (App Router) | SSR for public booking page SEO, RSC for dashboard performance, unified full-stack framework | Remix, SvelteKit |
| **Backend / API** | Next.js API Routes + Hono | API Routes for simple endpoints, Hono for complex business logic with middleware chains and Zod validation | tRPC, Express |
| **Database** | PostgreSQL (Neon) | ACID transactions critical for bookings, Neon's branching for dev/staging, serverless connection pooling | Supabase, PlanetScale |
| **ORM** | Drizzle ORM | Type-safe queries, SQL-like syntax, excellent migration system, lightweight bundle size | Prisma, Kysely |
| **Authentication** | Clerk | Pre-built UI components, Next.js middleware integration, organization support maps to multitenancy | NextAuth, Lucia |
| **Payments** | Stripe + MercadoPago (adapter) | Stripe for international cards, MercadoPago for Colombian local payments (PSE, Nequi, Bancolombia) | Wompi, PayU |
| **WhatsApp** | Twilio | Official WhatsApp Business API, reliable delivery, webhook support for message status tracking | Meta Cloud API, 360dialog |
| **Email** | Resend | Developer-friendly API, React Email component support, generous free tier (3000/mo) | SendGrid, AWS SES |
| **Hosting (Frontend)** | Vercel | Zero-config Next.js deployment, edge functions, preview deployments per PR | Cloudflare Pages, Netlify |
| **Hosting (Workers)** | Railway | Simple Docker deployment for BullMQ workers, PostgreSQL integration, predictable pricing | Render, Fly.io |
| **Cache / Queue** | Upstash Redis | Serverless Redis with REST API fallback, BullMQ-compatible, pay-per-request pricing | Redis Cloud, Momento |
| **File Storage** | Cloudflare R2 | S3-compatible API, zero egress fees, generous free tier (10GB storage, 10M reads/mo) | AWS S3, Backblaze B2 |
| **Monitoring** | Sentry | Error tracking, performance monitoring, session replay, generous free tier | LogRocket, Datadog |
| **Analytics** | PostHog | Product analytics, feature flags, session recording, self-hostable, generous free tier | Mixpanel, Amplitude |
| **CI/CD** | GitHub Actions | Native GitHub integration, Vercel auto-deploy on push, reusable workflows | CircleCI, GitLab CI |
| **Testing** | Vitest + Playwright | Vitest for unit/integration (fast, native ESM), Playwright for E2E booking flow tests | Jest, Cypress |

### Module Inventory

| Module/Service | Responsibility | Database/Storage | External Dependencies |
|---------------|----------------|------------------|----------------------|
| **Auth Module** | User registration, login, session management, RBAC enforcement (Owner/Professional/Client/Admin roles) | `users`, `sessions`, `roles`, `permissions` tables | Clerk (identity provider, JWT issuance) |
| **Business & Staff Management** | CRUD for businesses, professional profiles, role assignments, business settings | `businesses`, `professionals`, `business_settings` tables | Cloudflare R2 (profile photos, logos) |
| **Service Catalog** | Service definitions with name, duration, price, category; service-professional assignments | `services`, `service_categories`, `service_professionals` tables | None |
| **Calendar & Availability** | Working hours per professional, time-off management, holiday calendars, real-time slot calculation | `working_hours`, `time_off`, `holidays` tables | Upstash Redis (slot cache, TTL 5min) |
| **Booking Engine** | Appointment lifecycle, double-booking prevention, status transitions, cancellation policies | `appointments`, `appointment_history` tables | BullMQ (reminder scheduling), Notification Service |
| **Public Booking Page** | SSR-rendered booking interface, business branding, service/professional selection, slot picker | Reads from Service Catalog + Calendar modules | None (read-only aggregation) |
| **Payment Module** | Payment intent creation, charge processing, refund handling, webhook receivers, adapter pattern | `payments`, `payment_intents`, `transactions` tables | Stripe API, MercadoPago API |
| **Notification Service** | Event-driven notification dispatch: confirmations, reminders, cancellations, payment receipts | `notification_templates`, `notification_log` tables | Twilio (WhatsApp), Resend (Email), BullMQ |
| **Dashboard & Analytics** | Business metrics, professional performance, service popularity, exportable reports | Materialized views, `analytics_snapshots` table | PostHog (event tracking) |
| **Admin Module** | Platform-wide administration, subscription management, support tools, audit log viewer | `subscriptions`, `audit_logs` tables | Clerk (admin role verification) |
| **Background Workers** | Async job processing: reminder scheduling, notification delivery, payment webhook retry | BullMQ job queues, `job_logs` table | Upstash Redis (BullMQ broker) |

---

## 3. Data Model

### Entity Overview

| Entity | Description |
|--------|-------------|
| **Business** | The tenant entity (barbershop/salon): name, slug, timezone, currency, settings, branding |
| **User** | Internal staff (owners, admins, professionals) who authenticate within a business |
| **Role** | Named permission set within a business (owner, admin, professional) with JSONB permissions |
| **UserRole** | Junction entity assigning roles to users, with audit trail of who granted the assignment |
| **Service** | Bookable service: name, duration, price (integer cents), category, active status |
| **ServiceProfessional** | Junction linking services to qualified professionals, with optional price/duration overrides |
| **Client** | End customers: name, phone, email, consent flags, visit history, PII anonymization support |
| **Subscription** | Business plan: tier, status, feature flags, billing cycle, appointment/professional limits |
| **Appointment** | Core booking: client, professional, service, time range, status, payment snapshot, booking channel |
| **AppointmentStatusHistory** | Append-only log of every status transition with actor type and metadata |
| **Payment** | Financial records: amount, method (cash/card/nequi/PSE), gateway, status, refund tracking |
| **Notification** | Sent messages: channel (WhatsApp/email), template, delivery status, provider response |
| **ProfessionalSchedule** | Weekly recurring availability per professional with split-shift and break support |
| **TimeOff** | Schedule exceptions: vacations, sick days, with approval workflow |
| **AuditLog** | Append-only audit trail with before/after state snapshots for compliance |
| **OutboxEvent** | Transactional outbox for reliable domain event publishing with retry logic |

### Entity Relationship Diagram

```mermaid
erDiagram
    Business {
        uuid id PK
        varchar name
        varchar slug UK
        varchar legal_name
        varchar tax_id
        varchar phone
        varchar email
        varchar city
        varchar timezone
        varchar currency
        boolean is_active
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    User {
        uuid id PK
        uuid business_id FK
        varchar email
        varchar password_hash
        varchar full_name
        varchar phone
        boolean is_active
        timestamptz last_login_at
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    Role {
        uuid id PK
        uuid business_id FK
        varchar name
        varchar display_name
        jsonb permissions
        boolean is_system
        timestamptz created_at
        timestamptz updated_at
    }

    UserRole {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        timestamptz granted_at
        uuid granted_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    Service {
        uuid id PK
        uuid business_id FK
        varchar name
        text description
        integer duration_minutes
        bigint price_cents
        varchar category
        boolean is_active
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    ServiceProfessional {
        uuid id PK
        uuid service_id FK
        uuid user_id FK
        bigint price_override_cents
        integer duration_override_minutes
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    Client {
        uuid id PK
        uuid business_id FK
        varchar full_name
        varchar email
        varchar phone
        boolean consent_marketing
        boolean consent_data_processing
        timestamptz last_visit_at
        integer total_visits
        timestamptz anonymized_at
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    Subscription {
        uuid id PK
        uuid business_id FK
        varchar plan_name
        varchar status
        integer max_professionals
        integer max_appointments_month
        jsonb features
        varchar billing_cycle
        bigint amount_cents
        date current_period_start
        date current_period_end
        timestamptz created_at
        timestamptz updated_at
    }

    Appointment {
        uuid id PK
        uuid business_id FK
        uuid client_id FK
        uuid user_id FK
        uuid service_id FK
        varchar status
        timestamptz starts_at
        timestamptz ends_at
        integer duration_minutes
        bigint price_cents
        varchar booking_channel
        timestamptz cancelled_at
        uuid cancelled_by FK
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    AppointmentStatusHistory {
        uuid id PK
        uuid appointment_id FK
        varchar from_status
        varchar to_status
        uuid changed_by FK
        varchar changed_by_type
        text reason
        jsonb metadata
        timestamptz created_at
    }

    Payment {
        uuid id PK
        uuid business_id FK
        uuid appointment_id FK
        uuid client_id FK
        bigint amount_cents
        varchar currency
        varchar method
        varchar status
        varchar reference
        varchar gateway
        jsonb gateway_response
        uuid collected_by FK
        timestamptz paid_at
        timestamptz refunded_at
        bigint refund_amount_cents
        timestamptz created_at
        timestamptz updated_at
    }

    Notification {
        uuid id PK
        uuid business_id FK
        uuid appointment_id FK
        varchar recipient_type
        uuid recipient_id FK
        varchar channel
        varchar template_name
        varchar status
        text body
        varchar provider_message_id
        jsonb provider_response
        timestamptz sent_at
        timestamptz delivered_at
        timestamptz created_at
        timestamptz updated_at
    }

    ProfessionalSchedule {
        uuid id PK
        uuid user_id FK
        uuid business_id FK
        smallint day_of_week
        time start_time
        time end_time
        time break_start
        time break_end
        boolean is_active
        date effective_from
        date effective_until
        timestamptz created_at
        timestamptz updated_at
    }

    TimeOff {
        uuid id PK
        uuid user_id FK
        uuid business_id FK
        varchar reason
        timestamptz starts_at
        timestamptz ends_at
        boolean is_full_day
        varchar status
        uuid approved_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    AuditLog {
        uuid id PK
        uuid business_id FK
        uuid actor_id FK
        varchar actor_type
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb before_state
        jsonb after_state
        jsonb changes
        inet ip_address
        varchar request_id
        timestamptz created_at
    }

    OutboxEvent {
        uuid id PK
        uuid business_id FK
        varchar event_type
        varchar aggregate_type
        uuid aggregate_id
        jsonb payload
        varchar status
        integer retry_count
        integer max_retries
        timestamptz published_at
        text error_message
        timestamptz created_at
        timestamptz updated_at
    }

    Business ||--o{ User : "employs"
    Business ||--o{ Role : "defines"
    Business ||--o{ Service : "offers"
    Business ||--o{ Client : "serves"
    Business ||--o{ Subscription : "subscribes to"
    Business ||--o{ Appointment : "hosts"
    Business ||--o{ Payment : "receives"
    Business ||--o{ Notification : "sends"
    Business ||--o{ ProfessionalSchedule : "configures"
    Business ||--o{ TimeOff : "approves"
    Business ||--o{ AuditLog : "records"
    Business ||--o{ OutboxEvent : "emits"

    User ||--o{ UserRole : "is assigned"
    User ||--o{ ServiceProfessional : "performs"
    User ||--o{ Appointment : "provides"
    User ||--o{ ProfessionalSchedule : "sets"
    User ||--o{ TimeOff : "requests"

    Role ||--o{ UserRole : "is assigned via"

    Service ||--o{ ServiceProfessional : "is offered by"
    Service ||--o{ Appointment : "is booked for"

    Client ||--o{ Appointment : "books"
    Client ||--o{ Payment : "makes"

    Appointment ||--o{ AppointmentStatusHistory : "tracks status of"
    Appointment ||--o{ Payment : "is paid via"
    Appointment ||--o{ Notification : "triggers"
```

### Key Design Decisions

1. **Double-booking prevention at DB level**: PostgreSQL exclusion constraint `EXCLUDE USING gist (user_id WITH =, tstzrange(starts_at, ends_at) WITH &&)` on the Appointment table prevents overlapping appointments for the same professional, even under concurrent requests.

2. **Integer cents for all monetary values**: All price fields use `bigint price_cents` to avoid floating-point rounding errors. For COP, this stores the exact peso amount.

3. **Append-only audit and status history**: `AppointmentStatusHistory` and `AuditLog` tables are append-only, enforced via database triggers that reject UPDATE/DELETE operations.

4. **Transactional outbox pattern**: `OutboxEvent` ensures domain events (appointment.created, payment.completed) are written in the same DB transaction as the domain operation, with a relay process for at-least-once delivery.

5. **Soft-delete with PII anonymization**: All tenant entities support soft-delete via `deleted_at`. The Client entity additionally supports PII anonymization (`anonymized_at`) per Colombian data protection law (Ley 1581 de 2012).

6. **Multitenancy via business_id**: Every tenant-scoped table has a `business_id` foreign key. Middleware injects tenant context from the authenticated session, ensuring data isolation.

7. **Schedule versioning**: `ProfessionalSchedule` uses `effective_from`/`effective_until` date ranges, allowing schedule changes without losing historical accuracy.

8. **JSONB for flexible configuration**: `permissions`, `features`, `settings`, `gateway_response`, and `metadata` fields use JSONB to avoid schema migrations for configuration knobs.

---

## 4. API Design

### API Endpoints (MVP)

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new business owner account | No |
| POST | `/api/auth/login` | Authenticate and receive session token | No |
| POST | `/api/auth/logout` | Invalidate current session | Yes |
| POST | `/api/auth/forgot-password` | Send password reset email | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/me` | Get current authenticated user profile | Yes |

#### Business Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/business` | Get current business profile | Yes (Owner/Admin) |
| PUT | `/api/business` | Update business profile (name, address, phone) | Yes (Owner) |
| PUT | `/api/business/hours` | Configure business hours per day of week | Yes (Owner/Admin) |
| PUT | `/api/business/holidays` | Manage holiday dates | Yes (Owner/Admin) |
| PUT | `/api/business/branding` | Update logo, colors, booking page customization | Yes (Owner) |
| PUT | `/api/business/settings` | Update cancellation policy, notification preferences | Yes (Owner) |

#### Service Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/services` | List all services (with category filter) | Yes |
| POST | `/api/services` | Create a new service | Yes (Owner/Admin) |
| GET | `/api/services/:id` | Get service details | Yes |
| PUT | `/api/services/:id` | Update service (name, duration, price) | Yes (Owner/Admin) |
| DELETE | `/api/services/:id` | Soft-delete a service | Yes (Owner) |
| PUT | `/api/services/:id/professionals` | Assign professionals to a service | Yes (Owner/Admin) |

#### Professional Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/professionals` | List all professionals | Yes |
| POST | `/api/professionals` | Add a new professional | Yes (Owner) |
| GET | `/api/professionals/:id` | Get professional profile and schedule | Yes |
| PUT | `/api/professionals/:id` | Update professional profile | Yes (Owner/Admin) |
| DELETE | `/api/professionals/:id` | Soft-delete a professional | Yes (Owner) |
| GET | `/api/professionals/:id/schedule` | Get professional's weekly schedule | Yes |
| PUT | `/api/professionals/:id/schedule` | Set professional's weekly schedule | Yes (Owner/Admin) |
| POST | `/api/professionals/:id/time-off` | Create time-off entry | Yes (Owner/Admin) |
| GET | `/api/professionals/:id/time-off` | List time-off entries | Yes |

#### Calendar & Availability

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/availability/slots` | Get available slots for a service/professional/date | No (public) |
| GET | `/api/calendar` | Get appointments for calendar view (day/week) | Yes |
| GET | `/api/calendar/professional/:id` | Get specific professional's calendar | Yes |

#### Appointments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appointments` | List appointments (filterable by date, status, professional) | Yes |
| POST | `/api/appointments` | Create appointment (manual booking) | Yes (Owner/Admin) |
| GET | `/api/appointments/:id` | Get appointment details | Yes |
| PUT | `/api/appointments/:id` | Update appointment (reschedule) | Yes (Owner/Admin) |
| PATCH | `/api/appointments/:id/status` | Transition appointment status | Yes (Owner/Admin) |
| DELETE | `/api/appointments/:id` | Cancel appointment | Yes (Owner/Admin) |
| POST | `/api/book` | Public booking endpoint (creates appointment from booking page) | No |
| GET | `/api/book/:token` | Get appointment details via management token | No |
| PUT | `/api/book/:token/reschedule` | Client self-service reschedule | No |
| PATCH | `/api/book/:token/cancel` | Client self-service cancel | No |

#### Clients

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/clients` | List clients (paginated, searchable) | Yes |
| POST | `/api/clients` | Create client profile | Yes (Owner/Admin) |
| GET | `/api/clients/:id` | Get client details and visit history | Yes |
| PUT | `/api/clients/:id` | Update client profile | Yes (Owner/Admin) |
| GET | `/api/clients/:id/appointments` | Get client's appointment history | Yes |

#### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/intent` | Create payment intent for an appointment | No (public booking) |
| GET | `/api/payments` | List payments (filterable by date, status) | Yes (Owner/Admin) |
| GET | `/api/payments/:id` | Get payment details | Yes |
| POST | `/api/payments/:id/refund` | Process full or partial refund | Yes (Owner) |
| POST | `/api/webhooks/stripe` | Stripe webhook receiver | No (signature verified) |
| POST | `/api/webhooks/mercadopago` | MercadoPago webhook receiver | No (signature verified) |

#### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | List sent notifications (paginated) | Yes (Owner/Admin) |
| GET | `/api/notifications/:id` | Get notification details and delivery status | Yes |
| POST | `/api/webhooks/twilio` | Twilio WhatsApp status webhook | No (signature verified) |

#### Dashboard

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/overview` | Today's appointments, expected revenue, upcoming | Yes |
| GET | `/api/dashboard/revenue` | Revenue summary (daily, weekly, monthly, custom range) | Yes (Owner/Admin) |
| GET | `/api/dashboard/services` | Service popularity ranking by bookings and revenue | Yes (Owner/Admin) |
| GET | `/api/dashboard/professionals` | Professional performance metrics | Yes (Owner/Admin) |
| GET | `/api/dashboard/no-shows` | No-show rate tracking and trends | Yes (Owner/Admin) |

#### Subscription & Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/subscription` | Get current subscription details | Yes (Owner) |
| POST | `/api/subscription/upgrade` | Initiate plan upgrade via Stripe | Yes (Owner) |
| GET | `/api/subscription/portal` | Get Stripe Customer Portal URL | Yes (Owner) |
| GET | `/api/admin/businesses` | List all businesses (platform admin) | Yes (Platform Admin) |
| GET | `/api/admin/audit-logs` | Query audit logs | Yes (Platform Admin) |

### API Authentication

Authentication is handled by **Clerk** with JWT-based sessions. The Next.js middleware validates the Clerk session token on every request and injects the user context. RBAC is enforced via middleware that checks the user's role permissions (Owner, Admin, Professional) against the requested resource. Public endpoints (booking page, webhooks) use either no authentication or signature verification for webhook payloads. Rate limiting is applied at 100 requests/minute for public endpoints and 1,000 for authenticated endpoints.

---

## 5. User Stories

### Epic Summary

| Epic | Stories Count | Priority |
|------|---------------|----------|
| 1. Authentication & Authorization | 3 | Must |
| 2. Business Management | 3 | Must |
| 3. Service Management | 3 | Must |
| 4. Calendar & Availability Engine | 3 | Must |
| 5. Public Booking Page | 4 | Must |
| 6. Appointment Management | 4 | Must |
| 7. Online Payments | 3 | Must |
| 8. WhatsApp Reminders | 3 | Must |
| 9. Email Reminders | 3 | Must |
| 10. Dashboard & Reporting | 3 | Must |
| **Total** | **32** | — |

### Must-Have Stories (MVP)

#### Epic 1: Authentication & Authorization

**Story 1.1 — Business Owner Signup**
- As a business owner, I want to sign up with my email and create my business profile, so I can start using the platform immediately.
- **Given** a user visits the signup page
- **When** they enter a valid email, password, and business name
- **Then** an account is created with "owner" role, a default business is created, and they are redirected to the onboarding flow
- **Priority**: Must

**Story 1.2 — Team Invitations**
- As a business owner, I want to invite my barbers/stylists with specific roles, so they can access only what they need.
- **Given** an owner is on the team management page
- **When** they invite a user with the "professional" role via email
- **Then** the invited user receives an email invitation, and upon acceptance can only view their own schedule and client notes (not revenue or settings)
- **Priority**: Must

**Story 1.3 — Professional Dashboard**
- As a professional, I want to log in and see only my appointments and profile, so I am not overwhelmed by business-level data.
- **Given** a user with "professional" role logs in
- **When** they access the dashboard
- **Then** they see only their own calendar, their client list, and their personal settings — not business revenue, other professionals' schedules, or admin settings
- **Priority**: Must

#### Epic 2: Business Management

**Story 2.1 — Business Hours & Holidays**
- As a business owner, I want to configure my business hours and holidays, so the booking page reflects my actual availability.
- **Given** an owner is on the business settings page
- **When** they set opening/closing hours per day of week and add holiday dates
- **Then** the booking page only shows available slots within those hours, and holidays show zero availability
- **Priority**: Must

**Story 2.2 — Team Management**
- As a business owner, I want to add and manage my team of professionals, so clients can book with specific people.
- **Given** an owner has a business with multiple barbers
- **When** they add a professional with name, photo, services offered, and individual schedule
- **Then** the booking page shows each professional as a selectable option with their specific availability
- **Priority**: Must

**Story 2.3 — Multi-Location (Future)**
- As a business owner, I want to set up multiple service locations, so I can manage branches from one account.
- **Given** an owner on the Business plan with multiple locations
- **When** they create a second location with its own hours and team
- **Then** each location has independent availability and the owner can switch between locations in the dashboard
- **Priority**: Must

#### Epic 3: Service Management

**Story 3.1 — Create Services**
- As a business owner, I want to create services with name, duration, and price, so clients know what is offered and how long it takes.
- **Given** an owner is on the services page
- **When** they create a service "Corte clásico" with 30 min duration and $25,000 COP price
- **Then** the service appears on the booking page and the availability engine accounts for the 30-minute block
- **Priority**: Must

**Story 3.2 — Service-Professional Assignment**
- As a business owner, I want to assign services to specific professionals, so clients can only book appropriate combinations.
- **Given** a service "Coloración" exists and only one professional is trained for it
- **When** the owner assigns that service exclusively to that professional
- **Then** the booking page only shows that professional as available when "Coloración" is selected
- **Priority**: Must

**Story 3.3 — Service Categories**
- As a business owner, I want to organize services into categories, so the booking page is clear and easy to navigate.
- **Given** an owner has 8+ services
- **When** they group them into categories (Cortes, Barba, Tratamientos)
- **Then** the booking page displays services organized by category with visual separation
- **Priority**: Must

#### Epic 4: Calendar & Availability Engine

**Story 4.1 — Calendar View**
- As a business owner, I want to see a calendar view of all appointments across all professionals, so I can understand the day at a glance.
- **Given** a business has 3 professionals and 15 appointments today
- **When** the owner opens the calendar view
- **Then** they see a day/week view with color-coded appointments per professional, including client name, service, and status
- **Priority**: Must

**Story 4.2 — Availability Slot Calculation**
- As a system, I want to calculate available slots based on professional schedules, existing appointments, and buffer times, so double-bookings are impossible.
- **Given** a professional works 9 AM–6 PM with a 30-min service and 15-min buffer
- **When** a client requests available slots for tomorrow
- **Then** the system returns only non-overlapping slots that respect existing bookings, buffer times, and the professional's schedule — using database-level exclusion constraints to prevent race conditions
- **Priority**: Must

**Story 4.3 — Buffer Time Configuration**
- As a business owner, I want to set buffer time between appointments and define slot intervals, so my team has transition time between clients.
- **Given** an owner sets a 15-minute buffer and 30-minute slot intervals
- **When** a 30-minute service is booked at 10:00 AM
- **Then** the next available slot is 10:45 AM (not 10:30 AM)
- **Priority**: Must

#### Epic 5: Public Booking Page

**Story 5.1 — Complete Booking Flow**
- As an end client, I want to visit a business's booking page and complete a reservation in under 60 seconds, so I can book without friction.
- **Given** a client visits `reservapro.com/barberia-el-clasico`
- **When** they select a service, professional, date, and time, then enter their name and phone
- **Then** the appointment is confirmed, a WhatsApp confirmation is sent, and the slot is removed from availability — all without page reload
- **Priority**: Must

**Story 5.2 — Real-Time Availability**
- As an end client, I want to see real-time availability for my chosen service and professional, so I can pick a time that works.
- **Given** a client has selected "Corte clásico" with Andrés
- **When** they navigate to the date picker
- **Then** they see only dates with available slots, and selecting a date shows specific available times (no manual refresh needed)
- **Priority**: Must

**Story 5.3 — Branded Booking Page**
- As a business owner, I want my booking page to be branded with my logo and colors, so it feels like part of my business.
- **Given** an owner on the Starter plan or above
- **When** they upload their logo and select brand colors in settings
- **Then** the public booking page reflects their branding (logo, primary color, business name)
- **Priority**: Must

**Story 5.4 — Mobile-First Booking**
- As an end client on mobile, I want the booking page to be fully responsive and fast, so I can book from my phone without issues.
- **Given** a client visits the booking page from a mobile browser
- **When** the page loads
- **Then** it renders correctly on screens 320px+, loads in under 2 seconds (LCP), and all interactions are touch-friendly (minimum 44px tap targets)
- **Priority**: Must

#### Epic 6: Appointment Management

**Story 6.1 — Manual Appointment Creation**
- As a business owner, I want to create appointments manually for walk-in or phone clients, so all bookings are in one system.
- **Given** an owner is on the calendar view
- **When** they click "New appointment", select client (or create new), service, professional, and time
- **Then** the appointment is created, the slot is blocked, and a confirmation is sent to the client
- **Priority**: Must

**Story 6.2 — Reschedule Appointment**
- As a business owner, I want to reschedule an existing appointment, so I can accommodate client changes without losing the booking.
- **Given** an existing confirmed appointment
- **When** the owner drags it to a new time slot or uses the reschedule action
- **Then** the old slot is freed, the new slot is blocked, and the client receives a WhatsApp notification with the new time
- **Priority**: Must

**Story 6.3 — Client Self-Service Cancel/Reschedule**
- As an end client, I want to cancel or reschedule my appointment via a link, so I don't need to call the business.
- **Given** a client received a confirmation message with a management link
- **When** they click the link and choose "Reschedule" or "Cancel"
- **Then** the appointment is updated/cancelled, the slot is freed, and the business receives a notification
- **Priority**: Must

**Story 6.4 — Cancellation Policy Enforcement**
- As a system, I want to enforce cancellation policies (e.g., no cancellation within 2 hours), so businesses are protected from last-minute losses.
- **Given** a business has a 2-hour cancellation policy configured
- **When** a client tries to cancel 1 hour before the appointment
- **Then** the system blocks the cancellation and shows a message explaining the policy
- **Priority**: Must

#### Epic 7: Online Payments

**Story 7.1 — Online Payment**
- As an end client, I want to pay for my appointment online via MercadoPago or card, so I can secure my booking and avoid cash.
- **Given** a business has online payments enabled
- **When** a client reaches the payment step in the booking flow
- **Then** they see payment options (MercadoPago, credit/debit card via Stripe), can complete payment securely, and receive a payment confirmation
- **Priority**: Must

**Story 7.2 — Deposit Configuration**
- As a business owner, I want to require a deposit or full prepayment for certain services, so I can reduce no-shows for high-value appointments.
- **Given** an owner configures a "Coloración" service to require 50% deposit
- **When** a client books that service
- **Then** the booking flow requires payment of the deposit before confirming the appointment
- **Priority**: Must

**Story 7.3 — Payment Status Tracking**
- As a business owner, I want to see payment status for each appointment, so I know what has been collected and what is pending.
- **Given** appointments with various payment states (paid, partial, pending, refunded)
- **When** the owner views the appointment list or calendar
- **Then** each appointment shows its payment status with a visual indicator, and the dashboard aggregates collected vs. pending amounts
- **Priority**: Must

#### Epic 8: WhatsApp Reminders

**Story 8.1 — Automatic Reminders**
- As a system, I want to send automatic WhatsApp reminders 24 hours and 2 hours before each appointment, so clients remember and no-shows decrease.
- **Given** an appointment is confirmed for tomorrow at 3 PM
- **When** the 24-hour mark is reached
- **Then** a WhatsApp message is sent using a pre-approved template with appointment details (date, time, service, professional) and a cancel/reschedule link
- **Priority**: Must

**Story 8.2 — Customizable Reminder Timing**
- As a business owner, I want to customize reminder timing and message content (within template constraints), so reminders match my brand voice.
- **Given** an owner on the Starter plan or above
- **When** they configure reminder timing (e.g., 48h, 24h, 2h) and select from approved template variations
- **Then** the system sends reminders at the configured intervals using the selected templates
- **Priority**: Must

**Story 8.3 — Delivery Failure Fallback**
- As a system, I want to handle WhatsApp delivery failures gracefully, so clients still receive reminders even if WhatsApp fails.
- **Given** a WhatsApp reminder fails to deliver (invalid number, API error, rate limit)
- **When** the failure is detected
- **Then** the system falls back to email reminder and logs the failure for the business owner to review
- **Priority**: Must

#### Epic 9: Email Reminders

**Story 9.1 — Booking Confirmation Email**
- As a system, I want to send a confirmation email immediately after booking, so the client has a written record.
- **Given** a new appointment is created (via booking page or manually)
- **When** the appointment status becomes "confirmed"
- **Then** an email is sent within 60 seconds containing: service, professional, date/time, location, and management link
- **Priority**: Must

**Story 9.2 — Email Reminders**
- As a system, I want to send email reminders at 24h and 2h before appointments, so clients who don't use WhatsApp are still reminded.
- **Given** an appointment exists with a valid client email
- **When** the reminder schedule triggers
- **Then** an email is sent with appointment details and cancel/reschedule link
- **Priority**: Must

**Story 9.3 — Branded Email Templates**
- As a business owner, I want to customize the email template with my branding, so communications feel professional and consistent.
- **Given** an owner has uploaded their logo and set brand colors
- **When** any email is sent to their clients
- **Then** the email includes their logo, brand colors, and business name in the header
- **Priority**: Must

#### Epic 10: Dashboard & Reporting

**Story 10.1 — Today's Overview**
- As a business owner, I want to see today's appointments and key metrics when I log in, so I know what's happening without navigating.
- **Given** an owner logs into the platform
- **When** the dashboard loads
- **Then** they see: today's appointment count, expected revenue, no-shows this week, and a list of upcoming appointments for the next 2 hours
- **Priority**: Must

**Story 10.2 — Revenue Reports**
- As a business owner, I want to see weekly and monthly revenue summaries, so I can track financial performance.
- **Given** an owner navigates to the reports section
- **When** they select a date range (this week, this month, custom)
- **Then** they see total revenue, revenue by service, revenue by professional, and comparison to previous period
- **Priority**: Must

**Story 10.3 — Service & Professional Analytics**
- As a business owner, I want to see which services and professionals are most popular, so I can make staffing and pricing decisions.
- **Given** an owner views the analytics dashboard
- **When** the data is loaded
- **Then** they see: top 5 services by bookings, top professionals by revenue, busiest hours of the day, and client retention rate (repeat vs. new)
- **Priority**: Must

### Should-Have Stories (Post-MVP)

| Story | Description | Priority |
|-------|-------------|----------|
| Social Login (Google) | Reduce signup friction for non-technical users | Should |
| Recurring Appointments | Weekly/biweekly recurring bookings for regular clients | Should |
| Calendar Views (Month) | Month view in addition to day/week views | Should |
| Google Calendar Sync | Bidirectional sync for professionals' personal calendars | Could |
| Refund Processing | Owner-initiated full and partial refunds from appointment detail | Should |
| Payment Reconciliation Dashboard | Daily/weekly collected vs. pending amounts | Should |
| Configurable Reminder Timing | Owner chooses custom intervals (48h, 24h, 2h, 1h) | Should |
| Owner Notification on New Booking | WhatsApp or email alert when a new booking arrives | Should |
| Service Popularity Ranking | Top 5 services with trend indicators | Should |
| Professional Performance Metrics | Revenue per professional, utilization rate, client ratings | Should |
| Audit Log | Immutable append-only log for critical actions | Should |
| Two-Factor Authentication | SMS or authenticator app for owner accounts | Could |

---

## 6. Work Tickets

### Sprint Planning

| Sprint | Scope | Stories | Timeline |
|--------|-------|---------|----------|
| **Sprint 1** | Foundation & Auth | 1.1, 1.2, 1.3, 2.1, 2.2 | Weeks 1–4 |
| **Sprint 2** | Services & Availability | 3.1, 3.2, 3.3, 4.2, 4.3 | Weeks 5–8 |
| **Sprint 3** | Booking Engine | 4.1, 6.1, 6.2, 6.3, 6.4 | Weeks 9–12 |
| **Sprint 4** | Public Booking Page | 5.1, 5.2, 5.3, 5.4 | Weeks 13–16 |
| **Sprint 5** | Payments | 7.1, 7.2, 7.3 | Weeks 17–20 |
| **Sprint 6** | Notifications | 8.1, 8.2, 8.3, 9.1, 9.2, 9.3 | Weeks 21–24 |
| **Sprint 7** | Dashboard & Polish | 10.1, 10.2, 10.3, 2.3 | Weeks 25–28 |

### Ticket Format

#### Sprint 1: Foundation & Auth

**RP-001 — Business Owner Signup & Onboarding**
- **User Story**: 1.1
- **Acceptance Criteria**: User can register with email/password, business is auto-created, redirected to onboarding flow
- **Technical Tasks**:
  - Set up Next.js 14 project with App Router, Tailwind, shadcn/ui
  - Configure Clerk authentication with Next.js middleware
  - Create Drizzle ORM schema for `businesses`, `users`, `roles`, `user_roles` tables
  - Set up Neon PostgreSQL database with initial migrations
  - Implement registration API route with business auto-creation
  - Build signup page with Clerk UI components
  - Implement onboarding flow (business name, hours, first service)
  - Seed system roles (owner, admin, professional) on business creation
- **Estimated Effort**: XL
- **Dependencies**: None

**RP-002 — Team Invitations & Role-Based Access**
- **User Story**: 1.2, 1.3
- **Acceptance Criteria**: Owner can invite professionals via email; professionals see only their own data after login
- **Technical Tasks**:
  - Implement invitation API (generate token, send email via Resend)
  - Build invitation acceptance flow
  - Implement RBAC middleware checking role permissions per route
  - Build team management page (list, invite, remove members)
  - Create professional-scoped dashboard layout
  - Add permission checks to all existing API routes
- **Estimated Effort**: L
- **Dependencies**: RP-001

**RP-003 — Business Hours & Holidays Configuration**
- **User Story**: 2.1
- **Acceptance Criteria**: Owner can set hours per day of week and holidays; booking page respects these settings
- **Technical Tasks**:
  - Create Drizzle schema for `professional_schedules`, `time_off` tables
  - Implement business hours CRUD API
  - Implement holiday management API
  - Build business settings UI (hours editor, holiday calendar)
  - Add split-shift support (morning + evening windows)
- **Estimated Effort**: M
- **Dependencies**: RP-001

**RP-004 — Professional/Staff Management**
- **User Story**: 2.2
- **Acceptance Criteria**: Owner can add professionals with name, photo, services, and individual schedule
- **Technical Tasks**:
  - Implement professional CRUD API with soft-delete
  - Build professional profile page with photo upload (Cloudflare R2)
  - Implement per-professional weekly schedule API
  - Build team list page with schedule overview
  - Add time-off request and approval workflow
- **Estimated Effort**: L
- **Dependencies**: RP-002, RP-003

#### Sprint 2: Services & Availability

**RP-005 — Service Catalog CRUD**
- **User Story**: 3.1, 3.3
- **Acceptance Criteria**: Owner can create services with name, duration, price; organize into categories
- **Technical Tasks**:
  - Create Drizzle schema for `services`, `service_professionals` tables
  - Implement service CRUD API with validation (duration in 5-min increments)
  - Implement service category management
  - Build service list page with category grouping and drag-and-drop ordering
  - Build service editor form (name, description, duration, price, category)
  - Use integer cents for all price fields
- **Estimated Effort**: M
- **Dependencies**: RP-001

**RP-006 — Service-Professional Assignment**
- **User Story**: 3.2
- **Acceptance Criteria**: Owner can assign services to specific professionals; booking page filters accordingly
- **Technical Tasks**:
  - Implement service-professional assignment API
  - Add price and duration override support per professional
  - Build service-professional assignment UI (checkbox matrix)
  - Add validation: at least one professional per active service
- **Estimated Effort**: S
- **Dependencies**: RP-004, RP-005

**RP-007 — Availability Engine**
- **User Story**: 4.2, 4.3
- **Acceptance Criteria**: System calculates free slots respecting schedules, bookings, buffers; no double-bookings possible
- **Technical Tasks**:
  - Implement slot calculation algorithm (schedule - bookings - buffers - time-off)
  - Add PostgreSQL exclusion constraint on appointments table for double-booking prevention
  - Implement availability API endpoint with Redis caching (5-min TTL)
  - Handle timezone conversion (UTC storage, America/Bogota display)
  - Write comprehensive integration tests for concurrent booking scenarios
  - Implement configurable buffer time (0–60 min)
- **Estimated Effort**: XL
- **Dependencies**: RP-003, RP-005

#### Sprint 3: Booking Engine

**RP-008 — Calendar View**
- **User Story**: 4.1
- **Acceptance Criteria**: Owner sees day/week view with color-coded appointments per professional
- **Technical Tasks**:
  - Build calendar component with day and week views
  - Implement calendar data API (appointments by date range)
  - Add color-coding per professional
  - Implement drag-and-drop rescheduling on calendar
  - Add responsive layout (day view default on mobile, week on desktop)
- **Estimated Effort**: L
- **Dependencies**: RP-007

**RP-009 — Appointment CRUD & Status Machine**
- **User Story**: 6.1, 6.2
- **Acceptance Criteria**: Owner can create, reschedule appointments; status transitions are validated
- **Technical Tasks**:
  - Create Drizzle schema for `appointments`, `appointment_status_history` tables
  - Implement appointment CRUD API with status transition validation
  - Implement appointment status machine (pending → confirmed → completed/cancelled/no-show)
  - Build appointment creation form (select client, service, professional, time)
  - Implement reschedule logic (free old slot, block new slot, notify client)
  - Add booking channel tracking (online, in_store, phone, whatsapp)
- **Estimated Effort**: L
- **Dependencies**: RP-007

**RP-010 — Client Self-Service & Cancellation Policy**
- **User Story**: 6.3, 6.4
- **Acceptance Criteria**: Client can cancel/reschedule via unique link; policy enforcement blocks last-minute cancellations
- **Technical Tasks**:
  - Generate unique management tokens per appointment
  - Build client-facing cancel/reschedule page (no auth required)
  - Implement cancellation policy enforcement API
  - Add configurable cancellation window per business (default 2 hours)
  - Send business notification on client cancellation/reschedule
- **Estimated Effort**: M
- **Dependencies**: RP-009

#### Sprint 4: Public Booking Page

**RP-011 — Public Booking Page (SSR)**
- **User Story**: 5.1, 5.2, 5.4
- **Acceptance Criteria**: Client completes booking in under 60 seconds; page loads in under 2s on mobile; real-time availability
- **Technical Tasks**:
  - Build SSR booking page with Next.js App Router (`/book/[slug]`)
  - Implement multi-step booking flow (service → professional → date/time → details → confirm)
  - Integrate availability API for real-time slot display
  - Implement client auto-creation on first booking (phone as unique identifier)
  - Add mobile-first responsive design (320px+ support, 44px tap targets)
  - Optimize LCP to under 2 seconds on 4G
  - Add loading states and error handling without page reload
- **Estimated Effort**: XL
- **Dependencies**: RP-007, RP-009

**RP-012 — Branded Booking Page**
- **User Story**: 5.3
- **Acceptance Criteria**: Booking page reflects business logo, colors, and name
- **Technical Tasks**:
  - Implement branding settings API (logo upload, color picker)
  - Apply dynamic theming to booking page based on business settings
  - Add logo upload with Cloudflare R2 integration
  - Implement color contrast validation for accessibility
- **Estimated Effort**: M
- **Dependencies**: RP-011

#### Sprint 5: Payments

**RP-013 — Payment Integration (Stripe + MercadoPago)**
- **User Story**: 7.1, 7.2, 7.3
- **Acceptance Criteria**: Client can pay online; deposits enforced per service; payment status visible in dashboard
- **Technical Tasks**:
  - Create Drizzle schema for `payments` table
  - Implement PaymentAdapter interface abstracting Stripe and MercadoPago
  - Implement Stripe payment intent creation and confirmation
  - Implement MercadoPago preference creation and payment processing
  - Build webhook handlers for both providers with idempotency
  - Add payment step to booking flow (conditional on service deposit config)
  - Implement payment status tracking and display in appointment list
  - Build refund API (full and partial)
  - Add price snapshot on appointment creation
- **Estimated Effort**: XL
- **Dependencies**: RP-011

#### Sprint 6: Notifications

**RP-014 — WhatsApp Reminder System**
- **User Story**: 8.1, 8.2, 8.3
- **Acceptance Criteria**: Reminders sent at 24h and 2h; customizable timing; email fallback on failure
- **Technical Tasks**:
  - Create Drizzle schema for `notifications` table
  - Set up BullMQ with Upstash Redis for job scheduling
  - Implement Twilio WhatsApp API integration with pre-approved templates
  - Build reminder scheduling jobs (triggered on appointment confirmation)
  - Implement delivery failure detection and email fallback
  - Add configurable reminder timing per business
  - Build notification log viewer for business owners
  - Handle Twilio webhook for message status updates
- **Estimated Effort**: XL
- **Dependencies**: RP-009

**RP-015 — Email Notifications**
- **User Story**: 9.1, 9.2, 9.3
- **Acceptance Criteria**: Confirmation email sent within 60 seconds; reminders at 24h/2h; branded templates
- **Technical Tasks**:
  - Set up Resend integration with React Email templates
  - Build confirmation email template with appointment details and management link
  - Build reminder email template with cancel/reschedule link
  - Implement email scheduling via BullMQ delayed jobs
  - Add business branding to email templates (logo, colors, name)
  - Implement email delivery tracking and status updates
- **Estimated Effort**: L
- **Dependencies**: RP-014

#### Sprint 7: Dashboard & Polish

**RP-016 — Dashboard & Reporting**
- **User Story**: 10.1, 10.2, 10.3
- **Acceptance Criteria**: Dashboard shows today's metrics; revenue reports functional; service/professional analytics available
- **Technical Tasks**:
  - Build dashboard overview page (today's appointments, expected revenue, upcoming)
  - Implement revenue report API with date range filtering
  - Build revenue charts (daily, weekly, monthly, comparison)
  - Implement service popularity ranking query
  - Implement professional performance metrics
  - Build analytics dashboard with charts and tables
  - Add auto-refresh (5-minute interval) for real-time dashboard
  - Implement no-show rate tracking with trend visualization
- **Estimated Effort**: XL
- **Dependencies**: RP-009, RP-013

**RP-017 — Multi-Location Support**
- **User Story**: 2.3
- **Acceptance Criteria**: Business plan users can create multiple locations with independent availability
- **Technical Tasks**:
  - Add location entity to data model
  - Implement location CRUD API
  - Add location switcher to dashboard
  - Scope availability and calendar queries by location
  - Implement location-aware booking page routing
- **Estimated Effort**: L
- **Dependencies**: RP-016

---

## 7. Pull Requests

| PR # | Title | Branch | Status | Description |
|------|-------|--------|--------|-------------|
| PR-001 | Project scaffolding and auth setup | `feature-entrega1-[initials]/scaffold` | Planned | Next.js 14 project setup, Clerk auth, Drizzle ORM, Neon DB, Tailwind, shadcn/ui |
| PR-002 | Database schema and migrations | `feature-entrega1-[initials]/db-schema` | Planned | Full Drizzle schema for all 16 entities, initial migrations, seed data |
| PR-003 | Auth module and RBAC middleware | `feature-entrega1-[initials]/auth-rbac` | Planned | Registration, login, team invitations, role-based access control middleware |
| PR-004 | Business and staff management APIs | `feature-entrega1-[initials]/biz-management` | Planned | Business CRUD, professional management, schedule configuration |
| PR-005 | Service catalog and assignments | `feature-entrega1-[initials]/services` | Planned | Service CRUD, categories, service-professional assignments |
| PR-006 | Availability engine and calendar | `feature-entrega1-[initials]/availability` | Planned | Slot calculation algorithm, exclusion constraints, Redis caching, calendar views |
| PR-007 | Booking engine and appointment management | `feature-entrega1-[initials]/booking` | Planned | Appointment CRUD, status machine, cancellation policies, client self-service |
| PR-008 | Public booking page (SSR) | `feature-entrega1-[initials]/booking-page` | Planned | Mobile-first SSR booking flow, real-time availability, branded page |
| PR-009 | Payment integration | `feature-entrega1-[initials]/payments` | Planned | Stripe + MercadoPago adapter, webhooks, deposits, refund processing |
| PR-010 | Notification system | `feature-entrega1-[initials]/notifications` | Planned | WhatsApp reminders (Twilio), email (Resend), BullMQ scheduling, fallback logic |
| PR-011 | Dashboard and analytics | `feature-entrega1-[initials]/dashboard` | Planned | Overview dashboard, revenue reports, service/professional analytics |
| PR-012 | E2E tests and deployment config | `feature-entrega1-[initials]/testing-deploy` | Planned | Playwright E2E tests, CI/CD pipeline, Vercel + Railway deployment |

---

## 8. Use of AI

### Tools Used

| Tool | Purpose | Phase |
|------|---------|-------|
| ChatGPT / Claude | PRD generation, user story creation, acceptance criteria writing | Product Design |
| ChatGPT / Claude | Data model design, entity analysis, ERD generation | Data Modeling |
| ChatGPT / Claude | System architecture design, tech stack selection, module inventory | Architecture |
| ChatGPT / Claude | Use case identification and Mermaid diagram generation | Use Cases |
| GitHub Copilot | Code generation, boilerplate, API route scaffolding | Development |
| Cursor / opencode | Code editing, refactoring, debugging | Development |
| Mermaid AI | Diagram rendering and validation | Documentation |

### Key Prompts

Detailed prompt documentation is maintained in `prompts.md` (to be created during development). Key prompts include:
- PRD generation prompt with product context and persona descriptions
- Data model prompt requesting entity analysis with field-level design decisions
- System design prompt specifying modular monolith architecture for solo-developer SaaS
- Use case prompt for identifying primary flows and generating Mermaid diagrams

### Human Adjustments

- Reviewed and validated all user stories against Colombian barbershop market research
- Adjusted pricing tiers ($19/35/59/mo) based on local market analysis
- Added Colombian-specific payment methods (Nequi, Daviplata, PSE) to payment module
- Refined data model to include Ley 1581/2012 compliance fields (consent, anonymization)
- Added transactional outbox pattern for reliable event publishing
- Adjusted architecture from microservices to modular monolith based on solo-developer constraints
- Validated WhatsApp Business API template constraints for reminder messages
- Added exclusion constraints for double-booking prevention at database level

---

## 9. Infrastructure and Deployment

### Hosting

| Component | Provider | Justification |
|-----------|----------|---------------|
| **Frontend** | Vercel | Zero-config Next.js deployment, edge functions, preview deployments per PR, automatic CDN |
| **Backend Workers** | Railway | Simple Docker deployment for BullMQ workers, predictable pricing, easy scaling |
| **Database** | Neon (PostgreSQL) | Serverless Postgres, branching for dev/staging, generous free tier, autoscaling |
| **Cache/Queue** | Upstash Redis | Serverless Redis, BullMQ-compatible, pay-per-request pricing |
| **File Storage** | Cloudflare R2 | S3-compatible, zero egress fees, generous free tier |
| **DNS** | Cloudflare | Free DNS management, DDoS protection, CDN integration |

### CI/CD Pipeline

The CI/CD pipeline uses **GitHub Actions** with the following stages:

1. **Lint & Type Check**: ESLint + TypeScript strict mode on every push
2. **Unit & Integration Tests**: Vitest with database test containers
3. **E2E Tests**: Playwright tests for critical booking flow paths
4. **Preview Deployment**: Vercel auto-deploys preview environment per PR
5. **Production Deployment**: Merge to `main` triggers Vercel production deploy + Railway worker deploy
6. **Database Migrations**: Drizzle Kit migrations run automatically on deploy via Railway

### Environment Variables

| Variable | Purpose | Example Format |
|----------|---------|----------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db` |
| `REDIS_URL` | Upstash Redis connection URL | `rediss://default:pass@xxx.upstash.io:6379` |
| `CLERK_SECRET_KEY` | Clerk API secret for auth | `sk_live_xxxxxxxxxxxx` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client-side) | `pk_live_xxxxxxxxxxxx` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_live_xxxxxxxxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxxxxxxxxxxx` |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago API access token | `APP_USR-xxxxxxxxxxxx` |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | `ACxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | `xxxxxxxxxxxx` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender number | `whatsapp:+14155238886` |
| `RESEND_API_KEY` | Resend email API key | `re_xxxxxxxxxxxx` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | `xxxxxxxxxxxx` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | `xxxxxxxxxxxx` |
| `R2_BUCKET_NAME` | R2 bucket for file storage | `reservapro-assets` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `POSTHOG_KEY` | PostHog analytics API key | `phc_xxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | Public application base URL | `https://reservapro.com` |

### Cost Estimate

| Phase | Users/Scale | Monthly Cost | Key Services |
|-------|-------------|--------------|--------------|
| **MVP** | 0–100 businesses, ~500 appts/day peak | $20–35 | Vercel Hobby ($0), Neon Free ($0), Upstash Free ($0), Railway Starter ($5), Clerk Free ($0 up to 10k MAU), Resend Free ($0), R2 Free ($0), Sentry Free ($0), PostHog Free ($0), Twilio WhatsApp (~$15–25 usage), MercadoPago/Stripe (transaction fees only) |
| **Growth** | 100–500 businesses, ~2500 appts/day | $80–150 | Vercel Pro ($20), Neon Launch ($19), Upstash Pay-as-you-go (~$10), Railway Pro ($20), Clerk Pro ($25), Resend Pro ($20), R2 ($5), Sentry Team ($26), Twilio (~$40–60), PostHog (free tier still sufficient) |
| **Scale** | 500+ businesses, ~10000 appts/day | $300–500 | Vercel Pro ($20), Neon Scale ($69), Upstash ($30), Railway Pro ($40), Clerk Business ($100), Resend Business ($50), R2 ($15), Sentry Business ($80), Twilio (~$100–150), PostHog ($0–50), Dedicated workers for BullMQ |

**Cost optimization strategies:**
- **MVP phase**: Leverage free tiers aggressively; Neon, Upstash, Clerk, Resend, R2, Sentry, and PostHog all offer generous free plans sufficient for initial traction
- **Growth phase**: Negotiate startup credits with Clerk and PostHog; use Neon's autoscaling to pay only for actual usage; batch WhatsApp notifications to reduce per-message costs
- **Scale phase**: Consider self-hosting PostHog; move to reserved capacity on Railway; implement read replicas on Neon for analytics queries; evaluate MercadoPago vs Stripe routing based on interchange fees per transaction type
