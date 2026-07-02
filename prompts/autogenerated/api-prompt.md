# Prompt: Generate API Specifications Documentation

## Role
You are a senior backend architect and API designer with deep expertise in RESTful API design, hexagonal/clean architecture, and translating business requirements into precise, implementation-ready technical specifications.

## Objective
Analyze the attached PRD (`Personal Training Management Platform`) and System Architecture document in full, and produce a single comprehensive Markdown file at `docs/api-specifications.md` that documents **every API endpoint required to implement the platform's full functionality**. This document is the direct precursor to a formal OpenAPI 3.1 specification (a later, separate step) — prioritize structural consistency and precision over prose.

## Reference Materials
Two documents are provided as full context and must both be reviewed before drafting:
1. **PRD** — user roles & permissions, business rules (levels, class types, capacity, overlap, recurrence, waiting lists, cancellation), functional requirements by screen, the 12-event notification catalog (Section 7), and the Security section (Section 10 — auth, RBAC, rate limiting, error envelope, response minimization).
2. **Architecture Document** — hexagonal architecture layers, component inventory, tech stack (Node.js/Express, Prisma/PostgreSQL, JWT auth, Google Calendar via Service Account, FCM for push), and the Entity-Relationship Diagram (Section 9).

## Instructions
1. Derive the complete set of endpoints needed to support, at minimum:
   - **Authentication & session management** (login, token refresh, logout).
   - **Class scheduling** for Admin/Coach: create/cancel Individual, Group, and Block classes; list/calendar view.
   - **Recurring class series**: create a series, cancel a single instance vs. the entire series.
   - **Available time slots** retrieval (backed by Google Calendar free/busy, server-side only).
   - **Coachee-facing calendar actions**: join/cancel a group class; join/leave a waiting list for both group and individual classes.
   - **Waiting list** status retrieval (a Coachee's active waiting lists).
   - **Coachee management**: CRUD, activate/deactivate, level assignment, filtering by status and level.
   - **Coach management** (Admin-only): CRUD, activate/deactivate, and a *dedicated, isolated* endpoint for financial data (bank account, SSN/DNI) per the PRD's response-minimization rule.
   - **Blocks**: create/cancel Personal and Gym-wide blocks.
   - **Notifications**: list (role-based visibility — Admin/Coach see only today's, Coachee sees full history), mark as read.
   - **Health check**.
2. For every endpoint, define:
   - HTTP method and path (versioned under `/api/v1/`)
   - Short description
   - Required role(s) / auth requirement
   - Path and query parameters
   - Request body shape (fields + types, aligned with the ER diagram's entities)
   - Success response shape + status code
   - Relevant error responses — both standard (401/403/404) and business-rule 4xx cases (capacity exceeded, overlap detected, waiting list full, level/reach mismatch, etc.)
3. Group endpoints by resource/domain using H2 headings: Auth, Classes, Blocks, Waiting Lists, Coachees, Coaches, Notifications, Health.
4. Cross-reference the business rules inline wherever they affect an endpoint's behavior — e.g., note capacity/overlap validation on class creation, simultaneous notification of all waitlisted Coachees when a spot opens, and the mutually-exclusive notification #4/#5 logic on group cancellation.
5. Do not invent endpoints or fields that aren't implied by the PRD or Architecture document, and do not omit any capability described in either. If something is genuinely ambiguous, flag it explicitly in that endpoint's notes rather than guessing silently.
6. Do not write actual OpenAPI YAML/JSON syntax in this pass — this document is the structured precursor. Keep it in Markdown, but make every endpoint entry follow an identical, predictable template so it converts cleanly into OpenAPI paths/operations in the next step.

## Output Format
Produce a single Markdown file saved at `docs/api-specifications.md`, structured as:

1. **H1 title** + one-paragraph purpose statement (this doc precedes the formal OpenAPI spec).
2. **Table of contents.**
3. **Global conventions** section: base path, auth header format, standard error envelope shape (`{ error: { code, message, ref } }`), any pagination/filtering conventions.
4. **One H2 section per resource domain** (Auth, Classes, Blocks, Waiting Lists, Coachees, Coaches, Notifications, Health).
5. **One consistent endpoint template**, repeated for every endpoint:

   ```
   ### METHOD /path

   - **Description:**
   - **Auth/Role:**
   - **Path Params:**
   - **Query Params:**
   - **Request Body:**
   - **Success Response:**
   - **Error Responses:**
   - **Business Rules Applied:**
   ```

6. **Closing summary table** listing every endpoint for at-a-glance review: `Method | Path | Role | Short Description`.

## Constraints
- Every endpoint must map back to a concrete capability described in the PRD or Architecture document — no speculative additions.
- Respect the security constraints already defined in PRD Section 10: no PII or sensitive identifiers in query parameters, Admin-only endpoints clearly marked, coach financial data isolated to its own endpoint, consistent error envelope across all responses.
- Keep language precise and technical; avoid marketing language or unnecessary prose.
- Do not generate the OpenAPI spec itself in this pass — that is an explicit next step, out of scope here.