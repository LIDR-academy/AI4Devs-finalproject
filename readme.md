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

> **Note on this delivery (Final Delivery – complete product).** This `readme.md` summarizes the **PeredaHR** project and links to the project's **private repository**, where all the code, documentation and evidence live: [github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — branch **`finalproject-FSF`**, release tag **`v1.0-final-FSF`**. As it is private, access for the evaluation team has been granted (see 0.6).
>
> **What the Final Delivery adds over the Delivery 2 MVP:** the complete **AI block** working against the real APIs — collective-agreement **RAG assistant with mandatory citations** (PER-13/21, Claude + Voyage embeddings + pgvector) and **conversational Text-to-SQL reporting with privacy guardrails** (PER-14) —, a **Playwright E2E suite** covering the primary flow in CI (PER-24), and a full **corporate brand redesign** of the UI with zero functional changes (PER-25). Evidence of everything running: [docs/evidencia-final.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/evidencia-final.md).

## 0. Project summary

### **0.1. Your full name:**

Fran Sales Folch (FSF)

### **0.2. Project name:**

PeredaHR

### **0.3. Brief project description:**

PeredaHR is an internal time, presence and HR operations management platform. It replaces the current time-tracking SaaS, removing the licensing cost, integrates via **direct access to the SQL databases** of the clocking terminals (BioStar) and the ERP (SAGE), and incorporates **generative AI verticalized to the real domain**: a RAG assistant over the collective agreement with citations and conversational reporting (Text-to-SQL) with privacy guardrails.

### **0.4. Project URL:**

**There is no public URL.** Due to **GDPR + LOPDGDD** requirements (BioStar biometric data and geolocation must stay on infrastructure controlled by the company), PeredaHR is deployed **on-premise** on an internal Windows server that cannot be exposed to third parties, so the delivery is **evidence-based**: **[docs/evidencia-final.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/evidencia-final.md)** contains 18 screenshots of the final system running (desktop and mobile, including both AI features answering against the real Anthropic/Voyage APIs), captured by driving the real UI. The application also runs **locally in one command** (see 1.4), and the whole primary flow is asserted by the **Playwright E2E suite** on every CI run.

> Private repository: access to the code is granted to the evaluation team (see 0.6). For additional credentials, they can be shared securely with [alvaro@lidr.co](mailto:alvaro@lidr.co) via [onetimesecret](https://onetimesecret.com/).

### 0.5. Repository URL or compressed archive

Project's **private** repository: [https://github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — delivery branch: **`finalproject-FSF`** · release tag: **`v1.0-final-FSF`** · Final Delivery PRs: [#16](https://github.com/franpereda/PeredaHR/pull/16)–[#20](https://github.com/franpereda/PeredaHR/pull/20).

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

Full detail in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/PRD-PeredaHR.md) (§01).

### **1.2. Main features and functionalities:**

Implemented in the final product:

| Module | Feature | Status |
|---|---|---|
| Clocking | Web clock in/out with optional geolocation and center IP restriction; **immutable for the employee** | ✅ MVP |
| Presence | My Presence (read-only), **workday confirmation** and **anomaly validation (exclusive to Admin/HR)** | ✅ MVP |
| Requests/Leave | Creation, balances, calendar and **individual/bulk approval** with a 2-level tree | ✅ MVP |
| Reports | **RD-Ley 8/2019 monthly workday register** (CSV/PDF export) | ✅ MVP |
| Auth | OIDC SSO (Keycloak) + 3-role RBAC; per-role demo login for evaluation | ✅ MVP |
| AI | **RAG assistant over the agreement with BOCM citations** (Claude + Voyage + pgvector) + **Text-to-SQL reporting** with schema whitelist, PII exclusion and read-only guardrails | ✅ Final |
| Quality | **Playwright E2E suite** of the primary flow (clock → request → approval → register), green in CI | ✅ Final |
| UX | **Corporate brand redesign (#014D88)**: desktop sidebar, mobile home hub, full recolor — zero functional changes | ✅ Final |

Full functional catalog in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/PRD-PeredaHR.md) (§03).

### **1.3. Design and user experience:**

The design is **mobile-first** (daily clocking happens mostly on mobile), with **WCAG 2.1 AA** accessibility. The user flows, wireframes and design system are in [UX-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/UX-PeredaHR.md).

For the Final Delivery the whole web app was reskinned to the corporate brand (**#014D88**) from a hi-fi design handoff — persistent desktop sidebar with role-based navigation, mobile home hub with access tiles, corporate login — with **zero functional changes** (the E2E suite passed unmodified). Handoff versioned in [docs/Claude Design/](https://github.com/franpereda/PeredaHR/tree/finalproject-FSF/docs/Claude%20Design/design_handoff_peredahr_ui).

**Screenshots of the final product running** (login → clocking with live session → leave request + approval with modal → admin queues → RD-Ley register → RAG assistant and Text-to-SQL answering for real → mobile hub): **[docs/evidencia-final.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/evidencia-final.md)**. Historical MVP evidence: [docs/evidencia-entrega2.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/evidencia-entrega2.md).

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

Full instructions (local and on-premise deployment) in the [project's readme.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/readme.md).

---

## 2. System Architecture

### **2.1. Architecture diagram:**

The full diagram in the **C4 model (levels 1-3)** is in [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/Arquitectura-PeredaHR.md).

**Pattern and rationale.** Architecture by **containers**: web application (Next.js/PWA), business API (NestJS with RBAC), a **synchronization worker** (ETL with direct reads of the BioStar and SAGE SQL DBs) and an **AI service** (RAG + Text-to-SQL with guardrails).

- **Why:** the single TypeScript stack reduces cognitive cost and accelerates the MVP; PostgreSQL + pgvector covers production data and vector search in **a single engine**, favoring **data sovereignty** (company hosting, required by GDPR).
- **Benefits:** fewer moving parts, simple deployment, data under own control, integrated AI.
- **Trade-offs:** direct access to the BioStar/SAGE DBs couples to the provider's schema (mitigated with an adaptation layer and contract tests); pgvector is sufficient for the current volume.

> In the final product, web, API, database, authentication and the **AI service** (RAG + Text-to-SQL) are implemented and verified against the real providers. The **ETL worker** (BioStar/SAGE) is **descoped from the Final Delivery**: both integrations depend on read-only credentials to the client's production databases, which were not granted in time; their architecture is fully specified and the data model already accommodates them (`ClockEntry.source=BIOSTAR`, SAGE-sourced master data).

### **2.2. Description of the main components:**

- **Web App** — Next.js 15 (React), mobile-first PWA. Employee, manager and administrator interface. ✅
- **API** — NestJS 11 (Node/TypeScript), REST with OIDC authentication and RBAC authorization (3 roles). ✅
- **Database** — PostgreSQL 16 + pgvector (Prisma 6). ✅
- **IdP** — Keycloak (OIDC) for real SSO; per-role demo login for evaluation. ✅
- **AI service** — RAG over the collective agreement (**Voyage `voyage-3.5` embeddings + pgvector + Anthropic Claude**, answers always cite article + BOCM page, similarity threshold against hallucination) and **Text-to-SQL** with a 12-table whitelist without PII, deterministic SQL guardrails and `READ ONLY` execution. ✅ Final.
- **Synchronization worker** — direct read of the BioStar and SAGE SQL DBs. ⏸ Descoped (client credentials not granted); architecture specified, post-delivery work.

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
- **CI:** GitHub Actions ([.github/workflows/ci.yml](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/.github/workflows/ci.yml)) runs on every push/PR: `db:generate` → typecheck → lint → tests → build over a Postgres+pgvector service.
- **Deployment (CD):** on-premise on an internal Windows server with a **one-command script** (`deploy.ps1`): `git pull` → build → `prisma migrate deploy` (never `migrate dev`) → idempotent `db seed` → `up` → **E2E smoke as a gate**. Backups with `pg_dump -Fc` + offsite copy (`backup.ps1`); documented rollback.
- **Reviewer access:** the internal server cannot be exposed to third parties (GDPR: data on the company's infrastructure), so the delivery is evidence-based ([docs/evidencia-final.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/evidencia-final.md)) plus one-command local reproduction (see 1.4).

Full runbook: [docs/despliegue-entrega2.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/despliegue-entrega2.md).

### **2.5. Security**

- **Authentication** OIDC/SSO (Keycloak) and **RBAC authorization** with 3 roles (Employee, Manager, Admin/HR); the role is the **source of truth in the DB**, not the IdP claim. Global guards on the API.
- **Session:** own JWT in an `httpOnly` cookie, `sameSite=lax`, configurable `secure` (`COOKIE_SECURE`).
- **Clocking:** server-side sealing, **immutable for the employee**, center IP restriction; every correction is by Admin/HR and is audited.
- **Privacy by design:** sensitive PII (`dni`, `nss`, geolocation, biometrics) excluded from Text-to-SQL; `/api/me` without PII.
- **Auditing (`AuditLog`):** login, clock entries/anomalies, workday confirmations and validations, corrections, approvals and report generation, with authorship and timestamp.
- **Data sovereignty:** on-premise hosting controlled by the company (GDPR/LOPDGDD).

Detail in [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/PRD-PeredaHR.md) §06 and [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/Arquitectura-PeredaHR.md) §8.

### **2.6. Tests**

- **API:** **263 tests** (Jest) — unit (domain logic: clock-entry pairing, workday consolidation, balances, working days, RAG chunking, SQL guardrails…) and **integration** with real guards and RBAC over the API (AI SDKs mocked).
- **Web:** tests of the leave calendar helper.
- **E2E (Playwright, PER-24):** dedicated `apps/e2e` workspace exercising the real web + API + Postgres in a browser — US-01 clocking → US-04 request → US-06 approval → US-08 register + CSV download — with idempotent demo data; **runs as a separate `e2e` job in CI** on every PR to the delivery branches.
- **Smoke as deployment gate:** `scripts/smoke.mjs` walks the critical path; `deploy.ps1` aborts if it fails.
- **Quality in CI:** monorepo typecheck and `next build` on every push/PR.

---

## 3. Data Model

### **3.1. Data model diagram:**

The full entity-relationship diagram in **Mermaid `erDiagram`** (types, PK/FK and cardinalities) is in [ModeloDatos-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/ModeloDatos-PeredaHR.md) (§1). The implemented schema lives in [packages/db/prisma/schema.prisma](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/packages/db/prisma/schema.prisma).

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

Main MVP endpoints (full contract outline per resource and role in [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/Arquitectura-PeredaHR.md) §7):

```yaml
openapi: 3.0.3
info: { title: PeredaHR API, version: "1.0.0 (Final Delivery)" }
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
  /api/ai/report-chat:
    post:
      summary: Conversational Text-to-SQL reporting (Admin/HR role)
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [question]
              properties:
                question: { type: string, example: "¿Cuántas jornadas hay por estado en 2026?" }
      responses:
        "200": { description: "Result table + generated SQL (inspectable); PII requests answered with a warning" }
        "422": { description: Out-of-scope question or query rejected by the SQL guardrails }
```

---

## 5. User Stories

> Document 3 of the main user stories used during development, taking into account product best practices in this regard.

The full 10 stories with Gherkin criteria are in the [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/docs/PRD-PeredaHR.md) (§04). The 3 of the priority E2E flow, already implemented:

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

Real tickets (managed in Linear `PER-XX`, spec-driven development with OpenSpec; full index — including the Final Delivery tickets PER-21/13/14/24/25 — in the [project's readme.md](https://github.com/franpereda/PeredaHR/blob/finalproject-FSF/readme.md) §8 and §8b):

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

The whole project was built with **one PR per ticket** on the private repo [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR): 12 PRs for the Delivery 2 MVP (#1–#13, grouped in the delivery PR [#12](https://github.com/franpereda/PeredaHR/pull/12)) and 5 PRs for the Final Delivery (#16–#20, targeting `finalproject-FSF`). Three representative ones from the Final:

**Pull Request 1** · [#17](https://github.com/franpereda/PeredaHR/pull/17) — PER-13 · Collective-agreement RAG assistant
Retrieval with Voyage embeddings over pgvector + Claude generation with **mandatory article/BOCM-page citations**, similarity threshold against hallucination, chat UI. (Its ingestion pipeline is PR [#16](https://github.com/franpereda/PeredaHR/pull/16), PER-21.)

**Pull Request 2** · [#18](https://github.com/franpereda/PeredaHR/pull/18) — PER-14 · Conversational Text-to-SQL reporting
Whitelisted PII-free schema, deterministic SQL guardrails (deny-by-default, forced LIMIT, `READ ONLY` transaction), inspectable generated SQL, full auditing — including rejections.

**Pull Request 3** · [#20](https://github.com/franpereda/PeredaHR/pull/20) — PER-25 · Corporate brand UI redesign
Design tokens + desktop sidebar + mobile home hub + full recolor of the 11 screens from a hi-fi design handoff, with **zero functional changes** (E2E suite green without touching the test specs). The E2E suite itself is PR [#19](https://github.com/franpereda/PeredaHR/pull/19) (PER-24).

> Additionally, in **this repository** (`AI4Devs-finalproject`), the `finalproject-FSF` branch updates `readme.md` and `prompts.md` with the Final Delivery documentation.
