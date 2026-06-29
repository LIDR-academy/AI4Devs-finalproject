## Index

0. [Project summary](#0-project-summary)
1. [Product overview](#1-product-overview)
2. [System architecture](#2-system-architecture)
3. [Data model](#3-data-model)
4. [API specification](#4-api-specification)
5. [User stories](#5-user-stories)
6. [Work tickets](#6-work-tickets)
7. [Pull requests](#7-pull-requests)

---

> **Note on this delivery (Delivery 2 – First executable MVP).** This `readme.md` summarizes the **PeredaHR** project and links to the project's **private repository**, where all the code, documentation and evidence live: [github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — branch **`feature-entrega2-FSF`** (delivery PR: [#12](https://github.com/franpereda/PeredaHR/pull/12)). As it is private, access for the evaluation team has been granted (see 0.6). The AI components (collective-agreement RAG + Text-to-SQL) are in scope for the Final Delivery.

## 0. Project summary

### **0.1. Your full name:**

Fran Sales Folch (FSF)

### **0.2. Project name:**

PeredaHR

### **0.3. Brief project description:**

PeredaHR is an internal time, presence and HR operations management platform. It replaces the current time-tracking SaaS, removing the licensing cost, integrates via **direct access to the SQL databases** of the clocking terminals (BioStar) and the ERP (SAGE), and incorporates **generative AI verticalized to the real domain**: a RAG assistant over the collective agreement with citations and conversational reporting (Text-to-SQL) with privacy guardrails.

### **0.4. Project URL:**

**There is no public URL.** Due to **GDPR + LOPDGDD** requirements (BioStar biometric data and geolocation must stay on infrastructure controlled by the company), PeredaHR is deployed **on-premise** on an internal Windows server; the reviewer's access is granted via **Terminal Server/RDP** ("private with granted access"). The application also runs **locally in one command** (see 1.4).

As evidence of the running MVP, **screenshots of the full E2E flow** are provided in [docs/evidencia-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/evidencia-entrega2.md).

> Private repository: access to the code is granted to the evaluation team (see 0.6). For additional credentials, they can be shared securely with [alvaro@lidr.co](mailto:alvaro@lidr.co) via [onetimesecret](https://onetimesecret.com/).

### 0.5. Repository URL or compressed archive

Project's **private** repository: [https://github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — delivery branch: **`feature-entrega2-FSF`** · delivery PR: [#12](https://github.com/franpereda/PeredaHR/pull/12).

> As this is a private repository, access is shared with the evaluation team (see 0.6).

### 0.6. Access granted to the private repository (evaluation team)

Access to the private repository [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) is granted to the following profiles:

| Role | Person | GitHub profile |
|---|---|---|
| Teaching Assistant | Vick | [@Vick-lidr](https://github.com/Vick-lidr) |
| Mentor | Jorge Pilo | [@soyJorgePilo](https://github.com/soyJorgePilo) |

---

## 1. Product overview

> Describe the following aspects of the product in detail:

### **1.1. Objective:**

PeredaHR unifies clocking, presence, leave, legal-compliance reports and HR configuration in a **single source of truth**, removing the fragmentation between terminals, ERP and leave SaaS, and the recurring licensing cost.

- **Value it provides:** eliminates the licensing cost (target −85%, from €8,000-12,000 to ~€1,500/year of infrastructure), frees up HR team capacity (request handling from ~10 h/week to <4 h/week) and guarantees compliance of the time register (RD-Ley 8/2019).
- **What it solves:** fragmentation of sources of truth, administrative overload (peaks of 73 simultaneous requests and 5,201 records/month) and the market's "cosmetic AI".
- **For whom:** employees (own scope), managers (team scope) and administrators/HR (company scope) of the client company.

**North Star Metric:** HR hours freed up per week.

Full detail in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§01).

### **1.2. Main features and functionalities:**

Implemented in the MVP (Delivery 2):

| Module | Feature | Status |
|---|---|---|
| Clocking | Web clock in/out with optional geolocation and center IP restriction; **immutable for the employee** | ✅ MVP |
| Presence | My Presence (read-only), **workday confirmation** and **anomaly validation (exclusive to Admin/HR)** | ✅ MVP |
| Requests/Leave | Creation, balances, calendar and **individual/bulk approval** with a 2-level tree | ✅ MVP |
| Reports | **RD-Ley 8/2019 monthly workday register** (CSV/PDF export) | ✅ MVP |
| Auth | OIDC SSO (Keycloak) + 3-role RBAC; per-role demo login for evaluation | ✅ MVP |
| AI | RAG assistant over the agreement + Text-to-SQL reporting with guardrails | ⏳ Final |

Full functional catalog in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§03).

### **1.3. Design and user experience:**

The design is **mobile-first** (daily clocking happens mostly on mobile), with **WCAG 2.1 AA** accessibility. The user flows, wireframes and design system are in [UX-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/UX-PeredaHR.md).

**Screenshots of the running MVP** (login with per-role access → employee/admin clocking → My Presence → request/view leave → confirm/validate workdays → RD-Ley register with export → approval): **[docs/evidencia-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/evidencia-entrega2.md)**.

### **1.4. Installation instructions:**

**Turborepo + pnpm** monorepo: `apps/web` (Next.js 15), `apps/api` (NestJS 11), `packages/db` (Prisma 6 + PostgreSQL 16 + pgvector). Requirements: Node 20+, pnpm 10, Docker with Compose v2.

```bash
# 1. Dependencies
pnpm install

# 2. Configuration
cp .env.example .env

# 3. Supporting services (PostgreSQL+pgvector and Keycloak)
docker compose up -d

# 4. Database: Prisma client + migrations + seeds
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# 5. Start API (:3001) and Web (:3000)
pnpm dev
```

Open **http://localhost:3000**. For the **per-role demo login** at `/login`: set `DEMO_LOGIN_ENABLED="true"` in the root `.env` and `NEXT_PUBLIC_DEMO_LOGIN=true` in `apps/web/.env.local` (Next.js reads the `NEXT_PUBLIC_*` variables from `apps/web/`). For **realistic demo data** (clock entries, workdays and requests): `pnpm --filter @peredahr/api seed:demo`.

Full instructions (local and on-premise deployment) in the [project's readme.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/readme.md).

---

## 2. System Architecture

### **2.1. Architecture diagram:**

The full diagram in the **C4 model (levels 1-3)** is in [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md).

**Pattern and rationale.** Architecture by **containers**: web application (Next.js/PWA), business API (NestJS with RBAC), a **synchronization worker** (ETL with direct reads of the BioStar and SAGE SQL DBs) and an **AI service** (RAG + Text-to-SQL with guardrails).

- **Why:** the single TypeScript stack reduces cognitive cost and accelerates the MVP; PostgreSQL + pgvector covers production data and vector search in **a single engine**, favoring **data sovereignty** (company hosting, required by GDPR).
- **Benefits:** fewer moving parts, simple deployment, data under own control, integrated AI.
- **Trade-offs:** direct access to the BioStar/SAGE DBs couples to the provider's schema (mitigated with an adaptation layer and contract tests); pgvector is sufficient for the current volume.

> In the MVP (Delivery 2), web, API, database and authentication are implemented. The **ETL worker** (BioStar/SAGE) and the **AI service** are deferred to the Final Delivery (they require client credentials and weigh more on the AI phase).

### **2.2. Description of the main components:**

- **Web App** — Next.js 15 (React), mobile-first PWA. Employee, manager and administrator interface. ✅
- **API** — NestJS 11 (Node/TypeScript), REST with OIDC authentication and RBAC authorization (3 roles). ✅
- **Database** — PostgreSQL 16 + pgvector (Prisma 6). ✅
- **IdP** — Keycloak (OIDC) for real SSO; per-role demo login for evaluation. ✅
- **Synchronization worker** — direct read of the BioStar and SAGE SQL DBs. ⏳ Final Delivery.
- **AI service** — RAG (text-embedding-3 + pgvector + GPT-4o with citation) and Text-to-SQL with whitelist and PII exclusion. ⏳ Final Delivery.

### **2.3. High-level project description and file structure**

Monorepo with modular organization by domain:

```
apps/web/                  · Next.js 15 frontend (App Router, mobile-first PWA)
apps/api/                  · NestJS 11 backend (REST + RBAC + OIDC)
packages/db/               · Prisma 6 (schema, migrations, seed) over PostgreSQL+pgvector
docs/                      · PRD, UX, Use cases, Data model, Architecture,
                             deployment runbook and evidence (screenshots)
openspec/                  · Spec-driven specifications (changes + living specs)
.github/workflows/ci.yml   · CI pipeline (typecheck, lint, tests, build)
docker-compose*.yml        · Local and production orchestration (db, keycloak, api, web)
deploy.ps1 / backup.ps1    · On-premise deployment and backups
```

### **2.4. Infrastructure and deployment**

- **Runtime:** 4 Docker containers — `db` (PostgreSQL+pgvector), `keycloak` (IdP), `api` (NestJS), `web` (Next.js) — orchestrated by `docker-compose.prod.yml`. The base images are pulled from `mirror.gcr.io`/`quay.io` (the corporate network blocks Docker Hub).
- **CI:** GitHub Actions ([.github/workflows/ci.yml](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/.github/workflows/ci.yml)) runs on every push/PR: `db:generate` → typecheck → lint → tests → build over a Postgres+pgvector service.
- **Deployment (CD):** on-premise on an internal Windows server with a **one-command script** (`deploy.ps1`): `git pull` → build → `prisma migrate deploy` (never `migrate dev`) → idempotent `db seed` → `up` → **E2E smoke as a gate**. Backups with `pg_dump -Fc` + offsite copy (`backup.ps1`); documented rollback.
- **Reviewer access:** Terminal Server/RDP to the internal server (GDPR: data on the company's infrastructure).

Full runbook: [docs/despliegue-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/despliegue-entrega2.md).

### **2.5. Security**

- **Authentication** OIDC/SSO (Keycloak) and **RBAC authorization** with 3 roles (Employee, Manager, Admin/HR); the role is the **source of truth in the DB**, not the IdP claim. Global guards on the API.
- **Session:** own JWT in an `httpOnly` cookie, `sameSite=lax`, configurable `secure` (`COOKIE_SECURE`).
- **Clocking:** server-side sealing, **immutable for the employee**, center IP restriction; every correction is by Admin/HR and is audited.
- **Privacy by design:** sensitive PII (`dni`, `nss`, geolocation, biometrics) excluded from Text-to-SQL; `/api/me` without PII.
- **Auditing (`AuditLog`):** login, clock entries/anomalies, workday confirmations and validations, corrections, approvals and report generation, with authorship and timestamp.
- **Data sovereignty:** on-premise hosting controlled by the company (GDPR/LOPDGDD).

Detail in [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) §06 and [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md) §8.

### **2.6. Tests**

- **API:** **212 tests** (Jest) — unit (domain logic: clock-entry pairing, workday consolidation, balances, working days…) and **integration** with real guards and RBAC over the API.
- **Web:** tests of the leave calendar helper.
- **E2E / smoke:** `scripts/smoke.mjs` signs a JWT and walks the critical path (US-01/04/06/08); acts as the **deployment gate** (`deploy.ps1` aborts if it fails).
- **Quality in CI:** monorepo typecheck and `next build` on every push/PR.

---

## 3. Data Model

### **3.1. Data model diagram:**

The full entity-relationship diagram in **Mermaid `erDiagram`** (types, PK/FK and cardinalities) is in [ModeloDatos-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/ModeloDatos-PeredaHR.md) (§1). The implemented schema lives in [packages/db/prisma/schema.prisma](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/packages/db/prisma/schema.prisma).

### **3.2. Description of the main entities:**

**Root entities (7):** `Employee`, `Center`, `Department`, `Schedule`, `WorkCalendar`, `LeaveType`, `CollectiveAgreement`.

**Entities derived from the critical flows:** `ClockEntry`, `WorkDay`, `LeaveRequest`, `ApprovalLog`, `LeaveAllocation`.

**Supporting entities:** `Site`, `Position`, `Role`, `Contract`, `Holiday`, `AgreementChunk` (fragments of the agreement with an embedding for the RAG), `Document`, `AuditLog`.

Examples of attributes and constraints (full dictionary with PII indicator in the linked artifact):

- **`Employee`** — `id` (uuid, PK), `first_name`/`last_name`, `email` (unique), `dni` (unique, **sensitive PII**), `nss` (unique, **sensitive PII**), `department_id`/`position_id`/`role_id`/`schedule_id` (FK), `manager_l1_id`/`manager_l2_id` (FK self), `active` (bool).
- **`ClockEntry`** — `id` (PK), `employee_id` (FK), `center_id` (FK), `ts` (timestamptz), `type` (IN/OUT), `geo_lat`/`geo_lng` (decimal, nullable, **optional PII**), `source` (PEREDAHR/BIOSTAR), `immutable_for_employee` (bool).
- **`WorkDay`** — `status` (PENDING/CONFIRMED/INCIDENT/VALIDATED), `confirmed_by`/`validated_by` (FK, Admin/HR), `confirmed_at`/`validated_at`, `@@unique([employee_id, day])`.
- **`LeaveRequest` / `LeaveAllocation` / `ApprovalLog`** — request cycle with balance reservation and 1st/2nd-level approval.

---

## 4. API Specification

> If your backend communicates through an API, describe the main endpoints (maximum 3) in OpenAPI format. Optionally, you can add a request and response example for clarity.

Main MVP endpoints (full contract outline per resource and role in [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md) §7):

```yaml
openapi: 3.0.3
info: { title: PeredaHR API, version: "0.2.0 (Delivery 2)" }
paths:
  /api/clock-entries:
    post:
      summary: Record a clock in/out entry (Employee role)
      security: [{ cookieAuth: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [type]
              properties:
                type: { type: string, enum: [IN, OUT] }
                geoLat: { type: number, nullable: true }
                geoLng: { type: number, nullable: true }
      responses:
        "201": { description: Clock entry created (ts sealed on the server) }
        "403": { description: Unauthorized center IP }
  /api/leave-requests:
    post:
      summary: Create a leave request (self-service)
      responses:
        "201": { description: Request created (PENDING, balance reserved) }
        "409": { description: Overlap with another request }
  /api/reports/monthly-journey:
    get:
      summary: RD-Ley 8/2019 monthly workday register (Admin/HR role)
      parameters:
        - { name: month, in: query, required: true, schema: { type: string, example: "2026-06" } }
      responses:
        "200": { description: Report totaled per employee (JSON/CSV) }
```

---

## 5. User Stories

> Document 3 of the main user stories used during development, taking into account product best practices in this regard.

The full 10 stories with Gherkin criteria are in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§04). The 3 of the priority E2E flow, already implemented:

**User Story 1** · US-01 — Clock in/out
**As an** employee, **I want** to clock my entry and exit from the web, **so that** I record my workday and comply with the legal time register.
*Key criteria:* `ClockEntry` with timestamp, type and center; optional geolocation; rejection from an unauthorized IP; **immutable for the employee** (correction only by Admin/HR, audited).

**User Story 2** · US-06 — Manage requests (Admin/HR)
**As an** HR administrator, **I want** to approve or reject requests individually and in bulk with comments, **so that** I manage the peak of 73 requests without a bottleneck.
*Key criteria:* individual and bulk approval; each action generates an `ApprovalLog`, updates the balance (with a refund on rejection) and supports **2nd level**.

**User Story 3** · US-08 — Generate the monthly workday register (Admin/HR)
**As an** administrator, **I want** to generate the official monthly workday register report, **so that** I comply with RD-Ley 8/2019 and respond to an Inspection on-demand.
*Key criteria:* selection of month and scope (employee/center/company); totals per employee + daily detail; exportable (CSV/PDF).

---

## 6. Work Tickets

> Document 3 of the main work tickets of the development: one for backend, one for frontend, and one for databases.

Real tickets from Delivery 2 (managed in Linear `PER-XX`, spec-driven development with OpenSpec; full index in the [project's readme.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/readme.md) §8):

**Ticket 1 · Backend** — PER-5 · Clocking endpoint (US-01)
- **Objective:** `POST /api/clock-entries` in NestJS.
- **Detail:** authenticated employee with an assigned center; `ClockEntry` (ts sealed on the server, type, channel, optional geo, `source=PEREDAHR`); center IP restriction; **immutable for the employee**; invalid sequence → audited anomaly.
- **Acceptance:** Gherkin scenarios of US-01; 201 with the resource; 403 if the IP is not authorized. **DoD:** unit + integration tests and auditing. ✅ (PR #1)

**Ticket 2 · Frontend** — PER-5 · Clocking screen (US-01)
- **Objective:** clocking UI in Next.js, mobile-first.
- **Detail:** persistent Clock in/out button with state and day counter; optional geolocation permission; success/error feedback (incl. IP rejection); no edit actions on clock entries.
- **Acceptance:** WCAG 2.1 AA accessibility; no horizontal scroll on desktop (PER-23). **DoD:** responsive verification. ✅ (PR #1, #13)

**Ticket 3 · Database** — PER-16 · Presence schema
- **Objective:** model and migrate `ClockEntry` and `WorkDay` with Prisma over PostgreSQL.
- **Detail:** types, FKs and status enums (`PENDING/CONFIRMED/INCIDENT/VALIDATED`); auditing (`confirmed_by/at`, `validated_by/at`); `@@unique([employee_id, day])`; HNSW index for the RAG.
- **Acceptance:** reproducible migration (`migrate deploy`) + seeds; confirmation as a competence of Admin/HR. **DoD:** migration applied in a clean environment. ✅

---

## 7. Pull Requests

> Document 3 of the Pull Requests made during the project's execution.

The MVP was built with **one PR per ticket** on the private repo [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) (12 PRs, #1–#13), integrated into the delivery branch and grouped in the delivery PR **[#12](https://github.com/franpereda/PeredaHR/pull/12)** (`feature-entrega2-FSF` → `main`). Three representative ones:

**Pull Request 1** · [#1](https://github.com/franpereda/PeredaHR/pull/1) — PER-5 · UC-01 web clock in/out
Backend (immutable endpoint + IP restriction) and frontend (clocking widget) of the legal time-tracking core.

**Pull Request 2** · [#8](https://github.com/franpereda/PeredaHR/pull/8) — PER-10 · Manage requests (individual and bulk approval)
2-level approval workflow with `ApprovalLog` and balance refund on rejection.

**Pull Request 3** · [#5](https://github.com/franpereda/PeredaHR/pull/5) — PER-12 · RD-Ley 8/2019 monthly workday register
Legal report totaled per employee with daily detail and CSV/PDF export (the delivery's no-go criterion).

> Additionally, in **this repository** (`AI4Devs-finalproject`), the `feature-entrega2-FSF` branch updates `readme.md` with the Delivery 2 documentation.
