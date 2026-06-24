# SupportHub — Backlog Index
> Version 0.2
> Status: In progress

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API (controller-based) |
| Auth | ASP.NET Core Identity + OpenIddict (OIDC server in `identity` repo) + JWT Bearer validation in `api` |
| ORM | EF Core + Npgsql (PostgreSQL 17) |
| Frontend | React 19 + TypeScript + Vite |
| UI Components | shadcn/ui |
| State / Data Fetching | TanStack Query (React Query) |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Database | PostgreSQL 17 |
| File Storage | AWS S3 (AWSSDK.S3) |
| Email | AWS SES v2 (AWSSDK.SimpleEmailServiceV2) |
| Jira Integration | Jira REST API (Jira Cloud) |
| Audit Log | Audit.NET + Audit.EntityFramework.Core |
| Infrastructure | Docker Compose (local), AWS S3 + SES |

---

## 2. Architecture Decisions

- Backend follows **Clean Architecture**: `API` → `Application` → `Domain` → `Infrastructure`
  - `identity` repo: **2-project structure** (`Identity.Infrastructure` + `Identity.API`) — thin OIDC service, no domain business logic
  - `api` repo: **4-project structure** (`Api.Domain` / `Api.Application` / `Api.Infrastructure` / `Api.API`) — full business domain
- API style: **controller-based** (not Minimal API)
- Auth: OpenIddict OIDC server in `identity`; `api` validates JWTs via JWKS discovery (`IDENTITY_AUTHORITY`). No shared secret. SPA clients use authorization_code + PKCE.
- Database: one PostgreSQL 17 instance, two schemas — `public` for `api` (business data + `AuditLogs`), `identity` for `identity` (OpenIddict + ASP.NET Identity + `AuditLogs`). Each service owns its own `AuditLogs` table; there is no shared audit schema (see EPIC-11)
- **Jira is the system of record**: ticket content (title, description, status, priority, comments, attachments) lives exclusively in Jira. `api` stores only a minimal `Ticket` anchor record (`Id`, `JiraIssueKey`, `ClientId`, `CreatedAt`). SupportHub is a UI layer over Jira — no local duplication of ticket data.
- **Jira project key is tenant-configured**: every Jira API call resolves the `JiraProjectKey` from the `ClientProject` entity (admin-configured per tenant in EPIC-05B). It is never hardcoded and never caller-supplied.
- **Tenant identity via `client_id` JWT claim**: `ApplicationUser.ClientId` (nullable `Guid?`) is stored in `identity` and emitted as a `client_id` claim by `ClientIdClaimHandler` (EPIC-00). Client-role JWTs always carry this claim; Admin-role JWTs do not. All `api` tenant-scoped endpoints read `client_id` from the JWT — no DB lookup at request time. The `Client`, `ClientUser`, and `ClientProject` tables are created in EPIC-00 (priority 1.1) to unblock EPIC-01 through EPIC-08 development.
- **Jira write operations are synchronous and user-facing**: if a Jira call fails, the portal returns an error and nothing is saved locally. No background queues, no partial state.
- AWS: S3 + SES live in `api` only. `identity` has no AWS dependency.
- All secrets via environment variables. No hardcoded credentials anywhere.
- Result pattern: `FluentResults` (`Result<T>`) across all use cases
- Validation: FluentValidation, injected into use cases — not invoked by ASP.NET Core pipeline
- Logging: Serilog structured JSON (`CompactJsonFormatter`) in all backend services
- **Audit log**: automatic, library-driven audit trail. `api` records all EF Core writes (INSERT/UPDATE/DELETE) to `public.AuditLogs`. `identity` records auth events (LOGIN, LOGIN_FAILED, PASSWORD_RESET, ACCOUNT_ACTIVATION) to `identity.AuditLogs`. Identical column structure; each service owns its own table and migration. Records: timestamp, operation, entity name, entity ID, old/new data (JSON), user ID, IP address. Sensitive fields (passwords, tokens) are redacted. Powered by `Audit.NET`. No UI in v1 — DB-queryable only (see EPIC-11).
- Task format: **openspec-ready** — one concern per task, constraints not code, DoD verifiable by AI

---

## 3. Guideline Files

| File | Purpose |
|---|---|
| [`ai-specs/backend-guidelines.md`](../ai-specs/backend-guidelines.md) | Clean Architecture rules, use case shape, Result pattern, EF Core, OpenIddict, logging, testing, security, Docker |
| [`ai-specs/api-conventions.md`](../ai-specs/api-conventions.md) | Controller rules, error envelope, routing, pagination, auth, CORS, DTOs, env vars |

---

## 4. Epics

| # | Epic | File | Priority | Status |
|---|---|---|---|---|
| EPIC-09 | Infrastructure & DevOps | [EPIC-09-infrastructure.md](epics/EPIC-09-infrastructure.md) | 1 | ✅ Done |
| **EPIC-00** | **Foundation Data & Tenant Identity** | [**EPIC-00-foundation-data.md**](epics/EPIC-00-foundation-data.md) | **1.1** | ✅ Done |
| EPIC-10 | Internationalisation (i18n) — `client-portal` & backend | [EPIC-10-i18n.md](epics/EPIC-10-i18n.md) | 1.5 | ✅ Done |
| EPIC-10B | Internationalisation (i18n) — `backoffice` | [EPIC-10B-i18n-backoffice.md](epics/EPIC-10B-i18n-backoffice.md) | 1.6 | ✅ Done |
| EPIC-11 | Audit Log | [EPIC-11-audit-log.md](epics/EPIC-11-audit-log.md) | 1.7 | ✅ Done |
| EPIC-01 | Authentication & User Access | [EPIC-01-auth.md](epics/EPIC-01-auth.md) | 2 | ✅ Done |
| EPIC-07 | Jira Integration: Outbound (Portal → Jira) | [EPIC-07-jira-outbound.md](epics/EPIC-07-jira-outbound.md) | 3 | ✅ Stories + tasks defined |
| EPIC-02 | Client Portal: Ticket Management | [EPIC-02-ticket-management.md](epics/EPIC-02-ticket-management.md) | 4 | ✅ Stories + tasks defined |
| EPIC-03 | Client Portal: Comments & Attachments | [EPIC-03-comments-attachments.md](epics/EPIC-03-comments-attachments.md) | 5 | ✅ Stories + tasks defined |
| EPIC-08 | Jira Integration: Inbound (Jira → Portal) | [EPIC-08-jira-inbound.md](epics/EPIC-08-jira-inbound.md) | 6 | ✅ Stories + tasks defined |
| EPIC-04 | Email Notifications (AWS SES) | [EPIC-04-email-notifications.md](epics/EPIC-04-email-notifications.md) | 7 | ✅ Stories + tasks defined |
| EPIC-05 | Admin: User & Client Management | [EPIC-05-user-management.md](epics/EPIC-05-user-management.md) | 8 | ✅ Stories + tasks defined |
| EPIC-05B | Admin: Jira Configuration | [EPIC-05B-jira-config.md](epics/EPIC-05B-jira-config.md) | 9 | ✅ Stories + tasks defined |
| EPIC-06 | Admin: Metrics Dashboard | [EPIC-06-metrics.md](epics/EPIC-06-metrics.md) | ⭐ Stretch | ⬜ Not started |

---

## 5. Execution Waves

> **Context:** Jira already contains real ticket data. The goal is to show the client-facing ticket list and detail first, before building the outbound write path. Tasks within each epic have been merged to maximise AI-assisted development throughput (one developer + AI tools).

| Wave | Epics | Goal | Gate |
|---|---|---|---|
| **Wave 1** ✅ | EPIC-09, EPIC-00, EPIC-10, EPIC-10B, EPIC-11, EPIC-01 | Infrastructure, i18n, audit, auth | Done |
| **Wave 2** | **EPIC-07 Task A** → **EPIC-02 Tasks A + B** | `IJiraClient` read foundation → ticket list + detail live against Jira | EPIC-07-A must finish before EPIC-02-A starts |
| **Wave 3** | **EPIC-07 Task B** → **EPIC-02 Task C** → **EPIC-03** | Ticket creation, comments, file attachments | EPIC-07-B must finish before EPIC-02-C and EPIC-03 |
| **Wave 4** | **EPIC-08** | Webhook events + in-app notifications | Needs Wave 3 complete |
| **Wave 5** | **EPIC-04** + **EPIC-05** + **EPIC-05B** | Email, admin panel | EPIC-04 can start alongside Wave 4; EPIC-05/05B are largely independent |
| **Stretch** | **EPIC-06** | Metrics dashboard | Last |

---

*Each epic file contains its own architecture note, user stories, and technical tasks.*
*New epics are added to this index when the po-agent defines their stories.*
