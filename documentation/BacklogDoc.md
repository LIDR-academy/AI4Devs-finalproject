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
| EPIC-09 | Infrastructure & DevOps | [EPIC-09-infrastructure.md](epics/EPIC-09-infrastructure.md) | 1 | ✅ Stories + tasks defined |
| EPIC-10 | Internationalisation (i18n) | [EPIC-10-i18n.md](epics/EPIC-10-i18n.md) | 1.5 | ✅ Stories + tasks defined |
| EPIC-11 | Audit Log | [EPIC-11-audit-log.md](epics/EPIC-11-audit-log.md) | 1.6 | ✅ Stories + tasks defined |
| EPIC-01 | Authentication & User Access | [EPIC-01-auth.md](epics/EPIC-01-auth.md) | 2 | ✅ Stories + tasks defined |
| EPIC-07 | Jira Integration: Outbound (Portal → Jira) | [EPIC-07-jira-outbound.md](epics/EPIC-07-jira-outbound.md) | 3 | ✅ Stories + tasks defined |
| EPIC-02 | Client Portal: Ticket Management | [EPIC-02-ticket-management.md](epics/EPIC-02-ticket-management.md) | 4 | ✅ Stories + tasks defined |
| EPIC-08 | Jira Integration: Inbound (Jira → Portal) | [EPIC-08-jira-inbound.md](epics/EPIC-08-jira-inbound.md) | 5 | ✅ Stories + tasks defined |
| EPIC-03 | Client Portal: Comments & Attachments | [EPIC-03-comments-attachments.md](epics/EPIC-03-comments-attachments.md) | 6 | ✅ Stories + tasks defined |
| EPIC-04 | Email Notifications (AWS SES) | [EPIC-04-email-notifications.md](epics/EPIC-04-email-notifications.md) | 7 | ✅ Stories + tasks defined |
| EPIC-05 | Admin: User & Client Management | [EPIC-05-user-management.md](epics/EPIC-05-user-management.md) | 8 | ✅ Stories + tasks defined |
| EPIC-05B | Admin: Jira Configuration | [EPIC-05B-jira-config.md](epics/EPIC-05B-jira-config.md) | 9 | ✅ Stories + tasks defined |
| EPIC-06 | Admin: Metrics Dashboard | [EPIC-06-metrics.md](epics/EPIC-06-metrics.md) | ⭐ Stretch | ⬜ Not started |

---

*Each epic file contains its own architecture note, user stories, and technical tasks.*
*New epics are added to this index when the po-agent defines their stories.*
