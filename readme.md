## Table of Contents

0. [Project Overview](#0-project-overview)
1. [General Product Description](#1-general-product-description)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Specification](#4-api-specification)
5. [User Stories](#5-user-stories)
6. [Work Tickets](#6-work-tickets)
7. [Pull Requests](#7-pull-requests)

---

## 0. Project Overview

### **0.1. Full name:**

Elvis Manuel Marques Pita

### **0.2. Project name:**

SupportHub

### **0.3. Brief project description:**

SupportHub is a **customer support web portal** designed for software consultancies that manage incidents and requests from their clients through Jira internally, but lack a structured and transparent channel toward the end client.

SupportHub acts as a **customer experience layer on top of Jira**: the technical team continues working in Jira as usual, while the client has their own portal where they can create tickets, track them in real time and communicate with the team, completely eliminating the dependency on email and WhatsApp as support channels.

### **0.4. Project URL:**

> TBD — pending deployment.

### 0.5. Repository URL or compressed file

https://github.com/emarques-7/support-hub

---

## 1. General Product Description

> Full product document: [documentation/ProyectoFinal_ProductDoc.md](documentation/ProyectoFinal_ProductDoc.md)

### **1.1. Objective:**

SupportHub solves a common problem in software consultancies: the technical team manages client incidents in Jira, but the end client has no visibility or structured communication channel, forcing them to exchange emails and WhatsApp messages for any status inquiry.

The product offers a **support web portal** where the client can create tickets, view them, add comments and receive automatic notifications on any change — all synchronized in real time with Jira. The technical team does not change their workflow: Jira remains the source of truth.

**For whom?** Software consultancies with clients who have contracted technical support and manage their work internally in Jira.

**Unique value proposition:** *"Your team in Jira. Your client in SupportHub."*

### **1.2. Main features and functionality:**

| Module | Features |
|---|---|
| **Client Portal** | Invitation-based registration · Ticket creation with WYSIWYG editor · Attachments (S3) · Paginated and filterable listing · Detail view with comment thread · Email notifications |
| **Admin Panel** | Client and user management · Invitation sending · Jira integration configuration · Metrics dashboard |
| **Jira Integration** | Real-time issue creation · Direct read from Jira (no local cache) · Bidirectional comments · Inbound webhooks for notifications |

### **1.3. Design and user experience:**

> TBD — screenshots and/or video tutorial will be added when the frontend is implemented.

### **1.4. Installation instructions:**

> TBD — will be documented when the final code is available.

---

## 2. System Architecture

> Detailed diagrams in [documentation/diagrams/architecture/](documentation/diagrams/architecture/).

### **2.1. Architecture diagram:**

The system is composed of four services deployed in Docker: an OIDC server (`identity`), a main backend (`api`), and two SPAs (`client-portal` and `backoffice`). In production they are deployed on EC2 behind an ALB, with RDS PostgreSQL in a private subnet, S3 for attachments, and SES for email.

- [01-aws-infrastructure.md](documentation/diagrams/architecture/01-aws-infrastructure.md) — AWS topology: VPC, subnets, ALB, EC2, RDS.
- [02-request-flow.md](documentation/diagrams/architecture/02-request-flow.md) — request flow from the browser to services and external systems.
- [03-auth-flow.md](documentation/diagrams/architecture/03-auth-flow.md) — OIDC authorization_code + PKCE flow between SPA, identity, and api.
- [04-jira-integration.md](documentation/diagrams/architecture/04-jira-integration.md) — Jira integration: outbound (portal → Jira) and inbound (webhook → notifications).

### **2.2. Description of main components:**

| Component | Technology | Responsibility |
|---|---|---|
| `identity` | .NET 10 · ASP.NET Core Identity · OpenIddict | OIDC server. Authentication, JWT token issuance, session management. |
| `api` | .NET 10 · ASP.NET Core · EF Core · Npgsql | Main backend (Clean Architecture). Business logic, Jira integration, S3, SES. |
| `client-portal` | React 19 · TypeScript · Vite · shadcn/ui | SPA for client users. Tickets, comments, notifications. |
| `backoffice` | React 19 · TypeScript · Vite · shadcn/ui | SPA for administrators. User management, Jira configuration, metrics. |
| PostgreSQL 17 | RDS / Docker | Single instance, two schemas: `public` (api) and `identity`. |
| AWS S3 | AWSSDK.S3 | Attachment storage. |
| AWS SES | AWSSDK.SimpleEmailServiceV2 | Transactional email: invitations, notifications. |
| Jira Cloud | REST API v3 | Ticket registration system — source of truth for all ticket content. |

### **2.3. High-level project description and file structure**

The project follows a multi-repository structure (4 repos). The `api` backend applies Clean Architecture in 4 layers (`Domain` / `Application` / `Infrastructure` / `API`). The `identity` service uses a 2-project structure (infrastructure service, with no own domain logic). The SPAs follow a feature-first organization.

> Detailed technical conventions: [ai-specs/backend-guidelines.md](ai-specs/backend-guidelines.md) · [ai-specs/api-conventions.md](ai-specs/api-conventions.md)

### **2.4. Infrastructure and deployment**

> TBD — will be documented when deployment is operational.

### **2.5. Security**

Main practices implemented:

- **OIDC authorization_code + PKCE** for SPAs — no implicit flow, no client secrets in the browser.
- **Access token in memory, refresh token in HttpOnly cookie** — never in `localStorage` (OWASP).
- **JWKS discovery** — the `api` validates JWTs without a shared secret with `identity`.
- **Account lockout** — 5 failed attempts → 15-minute lockout (ASP.NET Core Identity).
- **Session revocation** on password reset (`RevokeBySubjectAsync`).
- **HMAC-SHA256** to validate inbound Jira webhooks.
- **Rate limiting** on the webhook endpoint (60 req/min per IP).
- **Ownership check** on every ticket access — the `api` verifies the ticket belongs to the JWT's client.
- **Automatic audit log** with Audit.NET — all EF Core writes and auth events are recorded with redaction of sensitive fields.
- **Anti-enumeration** on password recovery — always responds `200 OK` regardless of whether the email exists.
- **No credentials in logs** — Serilog configured to exclude tokens, API keys, and passwords at any log level.

### **2.6. Tests**

> TBD — the project is in development phase. Tests will be added as implementation progresses.

---

## 3. Data Model

> Full diagrams in [documentation/diagrams/database/](documentation/diagrams/database/).
>
> - [cross-schema-overview.mmd](documentation/diagrams/database/cross-schema-overview.mmd) — overview of both schemas and cross-schema relationships.
> - [public-schema.mmd](documentation/diagrams/database/public-schema.mmd) — `public` schema (`api` service): Clients, ClientUsers, Projects, Tickets, Notifications, NotificationReadReceipts, AuditLogs.
> - [identity-schema.mmd](documentation/diagrams/database/identity-schema.mmd) — `identity` schema: ApplicationUser, ASP.NET Identity tables, OpenIddict tables, AuditLogs.

### **3.1. Data model diagram:**

A single PostgreSQL 17 instance with two independent schemas:

- **`identity`:** manages users, credentials, roles, session tokens (OpenIddict), and authentication event log.
- **`public`:** manages the business domain — clients, portal users, projects, tickets (minimal anchor record — content lives in Jira), notifications, and operations audit log.

Cross-schema relationships are **soft FKs** (UUID without DB constraint) to maintain decoupling between services.

### **3.2. Description of main entities:**

| Entity | Schema | Description |
|---|---|---|
| `ApplicationUser` | identity | System user (Admin or Client). Extends `IdentityUser`. Includes `Role` and `PreferredLanguage` as JWT claims. |
| `Clients` | public | Consultancy's client company. Tenant root entity. Soft-delete. |
| `ClientUsers` | public | Portal user linked to a client. Lifecycle: PendingActivation → Active → Inactive. Soft FK to `ApplicationUser`. |
| `Projects` | public | Client ↔ Jira integration configuration. Stores `JiraProjectKey` and the HMAC secret hash for webhooks. |
| `Tickets` | public | Minimal anchor record: `JiraIssueKey` + `ProjectId`. No title, description, status, or priority — all lives in Jira. |
| `Notifications` | public | Event generated by inbound Jira webhook (StatusChanged, CommentAdded). One notification per event. |
| `NotificationReadReceipts` | public | Read status per user. Absence of row = unread. |
| `AuditLogs` | public / identity | Automatic operations log. In `public`: EF Core INSERT/UPDATE/DELETE. In `identity`: auth events (LOGIN, LOGIN_FAILED, etc.). |

---

## 4. API Specification

> Full API conventions: [ai-specs/api-conventions.md](ai-specs/api-conventions.md)

The three main endpoints:

### `POST /api/tickets` — Create ticket

Creates a new support ticket and the corresponding Jira issue in real time. Accepts `multipart/form-data`.

```yaml
POST /api/tickets
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request:
  title: string        # required, max 200 chars
  description: string  # required, HTML (converted to ADF before sending to Jira), max 5000 chars
  type: string         # required — "Bug" | "Question" | "Feature Request"
  priority: string     # required — "Low" | "Medium" | "High" | "Critical"
  files[]: File[]      # optional, max 10 files, max 10 MB each

Responses:
  201 Created:
    { "id": "uuid", "jiraIssueKey": "ACME-42", "attachments": [{ "fileName": "...", "success": true }] }
  401 Unauthorized
  422 Unprocessable Entity:
    { "code": "VALIDATION_ERROR", "message": "...", "details": ["..."] }
  502 Bad Gateway  # Jira unavailable — ticket is not created
```

---

### `GET /api/tickets` — List client tickets

Paginated list of the authenticated client's tickets, read in real time from Jira. The `clientId` is extracted from the JWT.

```yaml
GET /api/tickets
Authorization: Bearer {access_token}

Query Parameters:
  page: integer            # default 1
  pageSize: integer        # 10 | 20 | 50, default 20
  sortBy: string           # "created" | "resolutiondate" | "priority" | "status" | "summary"
  sortDir: string          # "asc" | "desc"
  status: string[]         # multi-value, optional
  dateRange: string        # "today" | "yesterday" | "last7days" | "thisMonth" | "lastMonth" | "custom"
  dateFrom / dateTo: string # ISO date, only if dateRange=custom, maximum 184-day range

Responses:
  200 OK:
    { "items": [...], "totalCount": 47, "page": 1, "pageSize": 20, "totalPages": 3 }
  401 Unauthorized
  422 Unprocessable Entity  # range > 184 days or invalid sortBy
  502 Bad Gateway
```

---

### `POST /api/webhooks/jira` — Inbound Jira webhook

Receives Jira events (status changes, new comments) and generates notifications for the client. Authenticated exclusively via HMAC-SHA256 signature.

```yaml
POST /api/webhooks/jira
X-Hub-Signature: sha256={hmac_signature}
Content-Type: application/json

Request Body:
  { "webhookEvent": "jira:issue_updated", "issue": { "key": "ACME-42", ... } }

Responses:
  200 OK       # always (avoids unnecessary Jira retries)
  401          # invalid or missing HMAC signature
  429          # rate limit exceeded (60 req/min per IP)
```

---

## 5. User Stories

> Full backlog: [documentation/BacklogDoc.md](documentation/BacklogDoc.md)  
> Epics with detailed stories and tasks: [documentation/epics/](documentation/epics/)

---

## 6. Work Tickets

> All technical tickets with full detail in [documentation/epics/](documentation/epics/).

---

## 7. Pull Requests

- [Pull Request #1](https://github.com/emarques-7/support-hub/pull/1)
- [Pull Request #2](https://github.com/emarques-7/support-hub/pull/2)
- [Pull Request #3](https://github.com/emarques-7/support-hub/pull/3)
- [Pull Request #4](https://github.com/emarques-7/support-hub/pull/4)
- [Pull Request #5](https://github.com/emarques-7/support-hub/pull/5)
- [Pull Request #6](https://github.com/emarques-7/support-hub/pull/6)
