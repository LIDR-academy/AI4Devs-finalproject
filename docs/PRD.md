# Personal Training Management Platform

## 1\. Document Overview

**Product Name:** TBD ("Personal Training Management Platform")  

**Purpose:** Define actionable requirements for a unified web application for personal training business management, combining coach/admin operations with coachee access. This document captures all business rules, UI/UX details, and system constraints for actionable engineering and design work.

**Intended Audience:** Product managers, engineers, designers, QA/testers, and stakeholders directly involved in developing, testing, and deploying the application.

---

## 2\. Problem Statement & Goals

The Coach and their team require a single, web-based solution for scheduling, managing, and tracking both individual and group coaching sessions at a physical gym with strict space and time constraints. The solution must streamline class creation, attendee tracking, level management, waiting lists, coach staffing, and notifications, while providing a mobile-first user experience for coachees and leveraging Google Calendar as the internal scheduling engine (accessed server-side via a private Service Account calendar, never exposed to users).

---

## 3\. User Roles & Permissions

| Role | Capabilities / Permissions |
| --- | --- |
| Admin | Add/activate/deactivate Users (Coachees); create/schedule all class types; block gym-wide time; block own calendar time; add/activate/deactivate Coaches; full navigation access |
| Coach | Create/schedule all class types (can assign self or another Coach); cancel own or assigned classes; block own calendar time; view all classes from all Coaches on the calendar; access to all non-admin-only screens |
| Coachee | View calendar (per visibility rules); join/cancel group classes (if available/in scope); join/leave waiting lists for both group and individual classes; receive notifications; mobile navigation |

---

## 4\. Glossary of Key Terms

* **Coach:** User who delivers training sessions; can create and schedule classes. The Coach who creates a class is its assigned Coach by default; a different Coach may be selected at creation time.
* **Coachee:** Client who attends classes and interacts with the system mainly via mobile.
* **Admin:** Admin-level user who manages Coaches, Coachees, classes, and blocked time.
* **Individual Class:** 1-hour session with a single Coachee; up to 2 such classes may occur simultaneously.
* **Group Class:** 1-hour session with a group (min 3, max 4) of Coachees at a defined level; only 1 group class can occur at a time.
* **Block (Calendar — Personal):** Time blocked by a Coach or Admin on their own calendar; no classes assigned to that person during the block.
* **Block (Calendar — Gym-wide):** Time blocked by an Admin for the entire gym; no classes of any kind may be scheduled during a gym-wide block.
* **Level:** One of 5 named tiers assigned to Coachees by a Coach/Admin, representing skill or experience. The levels are: **Principiante, Básico, Intermedio, Avanzado, Experto**. Each maps to a specific color (to be defined by design).
* **Warning:** Informational push notification sent to a coachee when a spot opens up in a class they are waitlisted for. No penalty associated.
* **Waiting List:** Queue for a class at full capacity (group) or for a specific time slot (individual). Coachees may join if a spot is not immediately available. Maximum size: 4. First-come, first-serve with no hold time. When one or more spots open, all waitlisted coachees are notified simultaneously.
* **Status:** User or Coach activation state (Active/Inactive).
* **Reach:** A class is within a Coachee’s reach if it matches their level, one above, or one below.
* **Weekly recurrence:** A class may be created as a one-off or as a weekly recurring series (same day, time, level, and assigned Coach every week).

---

## 5\. Business Rules & Constraints

### Levels & Categories

* Each Coachee is assigned one of 5 defined levels: **Principiante, Básico, Intermedio, Avanzado, Experto** (in ascending order). Each level is mapped to a distinct color (to be defined by design).
* Levels are assigned and can be changed at any time by a Coach or Admin.
* A class is within a Coachee's **reach** if it matches their level, one above, or one below.

### Class Types & Capacity Rules

* **Individual Class:** 1 Coachee only. Max 2 concurrent at any given time. A Coach creates the class and assigns the Coachee.
* **Group Class:** Min 3, max 4 Coachees from the same level (or reach); only 1 group class at a time.
* An **assigned Coach** is set at class creation (defaults to the creating Coach; a different Coach may be selected).

### Gym/Venue Capacity

* At most 2 individual classes and 1 group class may run simultaneously (per hour).

### Class Duration Rules

* All classes (individual/group) are always 1-hour fixed duration; no modification allowed.

### Class Overlap Rules

* A Coachee cannot be scheduled in two classes (individual + group, or two individuals) that overlap in time, even partially.

### Recurring Classes

* A class may be created as a one-off or as a weekly recurring series. When weekly recurrence is selected, the system generates a class instance for the same day and time every week with the same level, assigned Coach, and class type. Recurrence starts on the selected date and has no automatic end date (Coach can delete individual instances or cancel the entire series).

### Waiting List Logic

* **Group classes:** When a group class is full (4/4), additional eligible Coachees may join its waiting list.
* **Individual classes:** When an individual class time slot is already occupied, other Coachees may click the gray busy block on the calendar to join a waiting list for that specific time slot.
* **Maximum size:** Waiting list is capped at 4 Coachees per class.
* **Notifications:** When one or more spots open (due to cancellation), **all Coachees on the waiting list are notified simultaneously**. The spot is claimed on a first-come, first-served basis with no hold time.
* **Multiple waiting lists:** A Coachee may be on any number of waiting lists simultaneously (both group and individual).
* **Leaving:** A Coachee may voluntarily leave a waiting list at any time.

### Class Cancellation Rules

* **Coachee cancels own attendance:** No restrictions or penalties. If the class is full or has a waiting list, the system processes the waiting list automatically.
* **Coach cancels a class entirely:** All enrolled Coachees receive a push notification. The class is marked as "Canceled" and shown in gray in the calendar.
* **Coach cancels an individual class:** If the class has a waiting list, the first person to claim from the waiting list gets the newly freed slot.
* **No-show tracking:** Not implemented in v1. Reserved for future.

---

## 6\. Functional Requirements by Screen

### 6.1 Shared Architecture Notes

* Single web application with conditional UI rendering based on authenticated user’s role.
* Backed by a single application backend handling all business logic/rules.
* **Google Calendar API serves as the scheduling engine, accessed exclusively server-side via a private Service Account calendar.** No user ever interacts with Google Calendar directly — all calendar views are rendered as a custom UI by the frontend.
* All notification and scheduling events synchronize with Google Calendar as the single source of scheduling truth. The private calendar is owned by the system; no human user has visibility or edit access to it.

### 6.2 Admin & Coach Screens

**Layout & Navigation:**

* Desktop & mobile responsive design.
* Left sidebar: sections for Today, Calendar, Coachees, Coaches (Admin only).
* **Notifications bell icon** (top-right): opens a dropdown showing only current day’s notifications.

Today Page

* Vertical list of scheduled classes for the day (chronological order).
  * Each block: Coachee name(s), start time.
  * Visual distinction: Individual and group classes use two distinct background colors.
  * Canceled classes: shown in gray, with visible "Canceled" tag.

Calendar Page

* Contextual toolbar at top; includes an "Add Class" button.
* Calendar rendered as a custom UI component backed by the backend's Google Calendar integration (the Google Calendar API is never called directly from the browser).
* Calendar shows all classes from all Coaches (no Coach-specific filtering in v1).
* **Add Class Modal**
  * Fields:
    * Class type: Individual / Group / Block
    * Assigned Coach: defaults to the creating Coach; dropdown to select any other Coach (hidden when Block is selected).
    * Coachee(s): single-select for Individual, multi-select for Group (as per type rules). For Individual, only one Coachee can be assigned.
    * Description (visible to all users who can see the class).
    * Level: 5-level selector (hidden when Block or Individual is chosen).
    * Date
    * Recurrence: toggle to enable weekly recurrence. When enabled, the class repeats weekly from the selected date.
    * Block type: selector with two options — "Personal" (block own/assigned Coach's calendar) or "Gym-wide" (block entire gym, Admin only). Only shown when Class type is Block.
    * Available time slots: surfaced to user (implementation detail to be decided).
    * Save button.
  * **Validation**:
    * If Individual: exactly 1 Coachee required.
    * If Group: min 3, max 4 Coachees required.
    * If Block: hide Coachee, Level, and Assigned Coach fields. Show Block type selector instead.
    * Assigned Coach: required for Individual and Group.

Coachees Page

* Table: columns for Name, Email, Phone, Class Type (Individual/Group/Both), Status.
* Actions column: vertical three-dot icon → menu: Activate/Deactivate.
* Top-right: "Add Coachee" (Admin only): modal collects First/Last name, Email, Mobile, Class type (multi-select), Additional info, Level selector, Save (records current date).
* Top-left:
  * Active/Inactive filter: multi-select w/ checkboxes.
  * Level filter: multi-select w/ checkboxes.

### 6.3 Admin-Only Screens

Coaches Page

* Table: Name, Email, Phone, Bank account, Social Security Number, DNI, Status.
* Actions: vertical three-dot icon → menu:
  * View details (opens modal "Additional info").
  * Activate / Deactivate.
* Top-right: "Add Coach" (modal: all above fields + Additional info); Save closes modal.
* Top-left: Active/Inactive multi-select checkbox filter.

### 6.4 Coachee Screens (Mobile-First)

* **Home Screen**
  * Top: Date/time of Coachee’s next class. If no class is scheduled, shows "No upcoming classes".
  * Upcoming group classes to join (within 10-day window).
* **Bottom navigation bar** with three items:
  * Home
  * Calendar (1-week window, with color-coded visibility per rules)
  * Notifications (bell, dropdown panel)

**Calendar Visibility Logic for Coachees**

* Individual classes of other users: shown as gray busy/blocked (no detail). **Tapping a gray block opens an option to join the waiting list** for that specific time slot.
* Own scheduled classes (individual/group): blue, option to cancel.
* Group classes within reach and not already joined: green, option to join. If full, Join button is replaced with "Join waiting list".
* Group classes outside reach: gray busy/blocked (same as above).

**Waiting List Management**

* **View:** The Home screen or a dedicated section (to be defined in design) shows all active waiting lists the Coachee is on, including the class name, date/time, and position (if applicable — since notification is simultaneous, position doesn't guarantee priority).
* **Join:**
  * **Group:** Tap "Join waiting list" on a full green group class card.
  * **Individual:** Tap a gray busy/blocked individual class slot → "Join waiting list for this time slot".
* **Leave:** Each waiting list entry includes a "Leave" option. Leaving does not notify the Coach.
* **Notifications:** When a spot opens, the Coachee receives a push notification (see Section 7). Tapping the notification opens the class details for direct booking.

---

## 7\. Notifications & Push Notification Rules

All notifications are push notifications delivered to the relevant user's device. Notifications are also visible in-app in the Notifications panel (bell icon). Below is the complete catalog of notification events:

| # | Trigger Event | Recipient(s) | Push Content |
|---|--------------|--------------|--------------|
| 1 | Spot(s) open in a class with a waiting list (group or individual) | All Coachees on that waiting list | "¡Hay hueco(s) libre(s) en [clase/nivel]! Corre a reservarlo." |
| 2 | New group class created within reach with at least one open spot | All Coachees in reach of that class's level | "Nueva clase de [nivel] disponible el [fecha/hora]" |
| 3 | Coachee cancels their **individual** class | Assigned Coach | "[Coachee nombre] canceló su clase individual de las [hora]" |
| 4 | Coachee cancels their spot in a **group** class — waiting list exists | Assigned Coach | "[Coachee nombre] canceló. Se ha notificado a [N] coache(s) en waiting list." |
| 5 | Coachee cancels their spot in a **group** class — no waiting list | Assigned Coach | "[Coachee nombre] canceló. El hueco está libre." |
| 6 | Waitlisted Coachee claims a newly opened spot (group or individual) | Assigned Coach | "[Coachee nombre] ha ocupado el hueco libre en [clase/hora]" |
| 7 | Coach cancels an entire class (group or individual) | All enrolled Coachees | "La clase de [nivel] del [fecha/hora] ha sido cancelada." |
| 8 | Coach creates an individual class and assigns a Coachee | Assigned Coachee | "Tienes una clase individual con [Coach nombre] el [fecha/hora]" |
| 9 | Coachee joins a waiting list | The Coachee who joined | "Te has apuntado a la waiting list de [clase/hora]. Te avisaremos cuando haya hueco." |
| 10 | Coachee leaves a waiting list voluntarily | The Coachee who left | "Has salido de la waiting list de [clase/hora]" |
| 11 | Coachee's level is changed by a Coach or Admin | The affected Coachee | "Tu nivel ha sido actualizado a [nuevo nivel]" |
| 12 | A Coach is assigned to a class they did not create | The newly assigned Coach | "Has sido asignado a [clase/tipo] el [fecha/hora]" |

**Notes:**
* When multiple spots open simultaneously, all waitlisted Coachees are notified together (#1). The spots are claimed first-come, first-served. There is no hold time or per-user expiry.
* Notifications #4 and #5 are mutually exclusive: the system checks whether a waiting list exists and sends the appropriate variant.
* Notification #1 is not sent if a spot opens but the waiting list is empty; instead, the Coach is notified (#4 or #5 depending on context).
* The in-app Notifications panel (bell icon) shows only the **current day's** notifications for Admin and Coach roles. Coachees see a full chronological history.

---

## 8\. Technical Requirements

* Web app, supporting push notifications.
* Must implement "Add to Home Screen" (PWA support) for installable mobile experience.
* **All calendar functionality must use Google Calendar API, accessed exclusively server-side via a Google Service Account with a private system calendar.** No calendar API calls originate from the browser.
* Back-end and front-end must observe Clean/Hexagonal Architecture principles.
* Performance: fast load/interactions expected for all workflows.
* UX: accessible, responsive, and clear, especially for mobile-first Coachee experience.

---

## 9\. Open Questions / Clarifications Needed

### Resolved
The following items from earlier versions have been clarified and are now reflected in the sections above:

* **Block types:** Personal (Coach/Admin) vs Gym-wide (Admin only). Notifications not required for blocks.
* **Max classes per Coachee per week/day:** No limit. Coachees may join any class within reach as long as times don't overlap.
* **Waiting list mechanics:** First-come, first-served with no hold time. All waitlisted Coachees notified simultaneously when spots open. Max 4 per class.
* **Individual class waiting list:** Works like group. Coachees tap a gray busy block to join the waiting list for that time slot.
* **Coach-Coachee assignment:** Coach is assigned to the class (not to the Coachee). Coach creates the class and is the default assigned Coach, but any other Coach can be selected at creation.
* **Multiple coaches:** Yes, all Coaches see all classes in the calendar.
* **Recurring classes:** Weekly recurrence supported via toggle in the Add Class modal.
* **Coach cancels class:** All enrolled Coachees receive a push notification.
* **Class reminders:** Not in scope for v1.

### Still Pending

* **Available time slots UI/UX:** How "Available time slots" are programmatically surfaced in the Add Class modal. The backend will query Google Calendar free/busy via the Service Account and return available slots to the frontend, but the specific UI/UX for displaying and selecting slots needs design input.
* **Level color mapping:** The 5 levels (Principiante, Básico, Intermedio, Avanzado, Experto) need specific hex color codes assigned. Design input required.
* **Waiting list placement feedback:** When a Coachee joins a waiting list with 0 spots open and no prior members, the concept of "position" is moot (all notified simultaneously). Design decision needed on whether to display a simple "You're on the list" confirmation vs a numbered position.

### Resolved (additions)
* **Google Calendar visibility:** Google Calendar is accessed exclusively server-side via a Service Account with a private system calendar. No user ever sees or interacts with Google Calendar directly — all calendar views are rendered as a custom frontend UI.

## 10\. Security

Security controls in this platform are grounded in the OWASP Top 10 (2025) and are tailored to the specific threat surface of a multi-role scheduling application that holds PII (coachee contact data, coach financial details) and depends on Google Calendar as its single source of truth for availability. The approach is pragmatic — every control is a deliberate trade-off, not a checklist item.

### 10.1 Authentication & Authorization

* **Auth mechanism**: Stateless JWT access tokens (15 min TTL) with refresh tokens (7 day TTL, rotate on use). Both are signed with a server-side secret (`JWT_SECRET`) and transmitted only over TLS via `Authorization: Bearer` header.
* **Password storage**: bcrypt with cost factor 12. Plaintext passwords are never logged, transmitted in responses, or stored — not even temporarily.
* **Server-side RBAC**: Every protected endpoint enforces its required role (Admin / Coach / Coachee) in an Express middleware guard after JWT verification. The frontend conditionally renders UI by role for UX, but the backend is the authoritative gate — a Coachee cannot schedule a class or view coach financial data even by crafting a direct API call.
* **Service Account isolation**: The Google Service Account is the only credential with write access to the system calendar. No human user's JWT or session can create, update, or delete calendar events — all scheduling mutations go through the domain layer, which in turn calls the `GoogleCalendarAdapter`. This eliminates the risk of calendar manipulation via stolen user tokens.
* **Token lifecycle**: Access tokens are short-lived (15 min) to limit exposure if leaked. Refresh tokens are stored server-side (hashed) and invalidated on password change or explicit logout. No refresh token rotation on every use — rotation on use is a future improvement (v1.1).

### 10.2 Input Validation & Sanitisation

* **Server-side validation**: Every incoming request body is validated against a Zod schema before reaching any application or domain logic. Schemas are defined in shared DTOs and co-located with their controller or use case — not duplicated across layers. Malformed input is rejected with a 400 response before any database or API call.
* **SQL injection prevention**: All database access goes through Prisma's parameterized client. Raw SQL queries are forbidden — enforced by a Biome lint rule and code review.
* **NoSQL / command injection**: Not applicable — this project has no NoSQL databases and no server-side command execution from user input.
* **XSS prevention**: User-provided data rendered in the frontend (coachee names, class descriptions, notification text) is output-encoded by React's JSX escaping. For any `dangerouslySetInnerHTML` usage (none expected in v1), a dedicated code review gate is required.
* **Class-specific business validation**: Beyond schema validation, domain services (`CapacityValidator`, `OverlapChecker`, `ReachCalculator`) enforce business rules — e.g., max 2 individual + 1 group simultaneous, level reach constraints, waiting list max size 4. These are pure domain functions, tested in isolation.

### 10.3 API Security

* **Authentication on every endpoint**: All endpoints except `POST /auth/login` and `GET /health` require a valid JWT. No unauthenticated data access.
* **Rate limiting**: `express-rate-limit` is applied globally (100 req/min per IP) and more strictly on auth endpoints (10 req/min per IP for `/auth/login`) to mitigate brute-force and enumeration.
* **CORS**: Restricted to the single production frontend origin. No wildcard origins, no `Access-Control-Allow-Credentials: true` unless explicitly paired with a specific origin.
* **No sensitive data in URLs**: All identifiers (class IDs, user IDs) are passed in the request body or path — never as query parameters that could appear in server logs or referrer headers.
* **API versioning**: The API is mounted under `/api/v1/`. Version bumps (v2, etc.) allow breaking changes without affecting existing clients.
* **Response minimisation**: API responses return only the fields the client needs for that view. Coach financial data is never included in list endpoints — only in a dedicated `GET /api/v1/coaches/:id/financial` endpoint guarded by an Admin-only middleware.

### 10.4 Data Protection

* **In transit**: All client-server traffic uses TLS 1.3. External API calls to Google Calendar (REST) and Firebase Cloud Messaging (HTTP v1) use HTTPS with full certificate chain validation. No unencrypted outbound calls are permitted.
* **At rest**: PostgreSQL is encrypted at rest (managed hosting — Neon / Supabase / Render). Coach financial data (bank account, SSN/DNI) is encrypted at the application layer using `crypto.createCipheriv` with AES-256-GCM before storage — the encryption key is separate from the database credentials and injected via `COACH_FINANCIAL_ENCRYPTION_KEY` env var.
* **Secrets management**: All secrets (Service Account private key, DB URL, FCM server key, JWT secret, encryption key) are injected via environment variables — never committed, never in code, never in build artifacts. A `.env.example` file documents required vars with placeholder values.
* **PII minimisation**: The system stores only the fields listed in the PRD (Section 6). No analytics, tracking cookies, or profiling data are collected. No third-party analytics SDK is loaded in the frontend.
* **Google Calendar payload minimisation**: Event titles sent to Google Calendar identify the participants and category as follows: individual classes use the coachee name + their level (e.g., "Juan Pérez - Intermedio"); group classes use "Group class" + the class level (e.g., "Group class - Intermedio"). The event description includes the assigned coach name, whether the class is recurring, the user-added notes, and for group classes the list of enrolled coachees. The association between calendar events and people lives in PostgreSQL.

### 10.5 Dependency & Supply Chain Security

* **Exact version pinning**: All npm dependencies are pinned to exact versions in `package.json` (no `^` or `~` ranges). The lockfile (`package-lock.json` or `pnpm-lock.yaml`) is committed to version control.
* **Automated auditing**: CI runs `npm audit --audit-level=high` (or `pnpm audit`) on every PR and before every merge to `main`. A failing audit blocks the merge.
* **Dependabot / Renovate**: Automated PRs for dependency updates are enabled on the repository, configured to group non-breaking updates weekly to reduce noise.
* **Trusted sources only**: All npm packages are installed from the public npm registry only — no vendored tarballs, git dependencies, or unpublished packages. Google Calendar integration uses `google-auth-library` (Google-published), FCM uses `firebase-admin` (Google-published). Prisma is the sole ORM dependency.
* **SBOM readiness**: A `package.json` + lockfile is sufficient for v1. Consider generating a CycloneDX SBOM via `npm sbom` or `syft` before launching production.

### 10.6 Infrastructure & Deployment Security

* **Docker hardening**: Containers run as a non-root user (`USER node` in Dockerfile). The Node.js process uses `--help`-minimum permissions — no `--privileged` flag, no exposed Docker socket. Health checks (`GET /health`) return a minimal 200 OK with no internal state.
* **Least-privilege PostgreSQL**: The database user used by the application has only the permissions it needs — `SELECT`, `INSERT`, `UPDATE`, `DELETE` on application tables. Schema migrations run under a separate admin user that is not used at runtime.
* **Environment isolation**: Staging and production are separate Render services. Each has its own database instance, env vars, and secrets. No production data is used in staging.
* **Service Account key rotation**: The Google Service Account private key has a rotation policy (annual, or on any suspected leak). A new key pair is generated in Google Cloud Console, the old one is revoked, and the env var is updated. The deployment uses a single active key at any time.
* **No hardcoded config**: Every environment-specific value (database URL, API base URLs, FCM sender ID, allowed origins) comes from environment variables. The Docker Compose file for local development uses a separate Firebase project and a test Service Account.

### 10.7 Security Headers & CSP

The Express backend sets the following HTTP response headers (via a `helmet` middleware or manual `res.set()` in a global middleware):

| Header | Value | Rationale |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Enforces TLS for 2 years — covers the production domain and any subdomains |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking — this app is never embedded in a frame |
| `Content-Security-Policy` | See CSP policy below | Restricts script/style sources to known origins |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Leaks only the origin on cross-origin requests |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser features |

**CSP policy** (production):

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' https://fcm.googleapis.com;
font-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

Justification: `style-src 'unsafe-inline'` is required for TailwindCSS (utility classes are inline). No external CDN scripts are loaded. The only external `connect-src` is FCM for push notification registration. No Google API calls originate from the browser — the Service Account pattern eliminates that CSP concern.

### 10.8 Logging, Monitoring & Alerting

* **Security event log**: Every security-relevant action is logged in structured JSON with timestamp, actor ID (or unauthenticated IP), action, resource, and outcome. Events logged:
  * Authentication attempts (success and failure, with reason)
  * Class creation / cancellation (who, which class, when)
  * Waiting list joins / leaves (coachee ID, class ID)
  * Role assignment changes (Admin changes a user's role or level)
  * Access to coach financial data (`GET /api/v1/coaches/:id/financial`)
  * Token refresh and revocation
* **No secrets in logs**: Passwords, tokens, and PII are explicitly excluded from all log output. Structured logging (`pino` recommended) with a custom serialiser that redacts `req.headers.authorization`, `req.body.password`, and similar fields.
* **Anomaly detection alerts**:
  * >5 failed logins from the same IP in 5 minutes → alert
  * API calls from unexpected origins (not matching the frontend origin or known Render IPs) → alert
  * Rapid booking / cancellation cycle (>10 actions in 1 minute by one user) → alert (potential waiting list abuse)
* **Google Calendar health monitoring**: The Calendar adapter logs every request duration, status code, and error. An alert fires if >5% of Calendar API calls fail in a 5-minute window, since the system is inoperable without calendar availability.
* **Incident response**: v1 uses the hosting platform's built-in alerting (Render email/Slack notifications). A formal on-call rotation and runbook are out of scope until the team exceeds 3 people.

### 10.9 Error Handling

* **Consistent error envelope**: Every API error returns `{ error: { code, message, ref } }` where `ref` is a unique ID that maps to the server-side error log. No stack traces, no internal paths, no database error messages reach the client.
* **Domain errors are 4xx, not 500**: Business rule violations (capacity exceeded, overlap detected, level mismatch, waiting list full) return structured 4xx responses with an actionable `message` field. The frontend uses this to display inline validation or toast messages.
* **External dependency failures**: Google Calendar API timeouts, FCM failures, and database connection drops are caught by a global Express error handler that returns `503 Service Unavailable` with a user-friendly message. The full error detail (including the original error and the `ref` ID) is logged server-side.
* **No information leakage**: Error messages never reveal whether an email exists in the system (consistent "Invalid credentials" on login failure), never expose database schema details, and never include raw error output from external APIs.

### 10.10 OWASP Top 10 2025 Coverage

| OWASP 2025 Risk | Relevance to This App | Mitigation |
|-----------------|-----------------------|------------|
| **A01 — Broken Access Control** | **HIGH** — Multi-role app (Admin/Coach/Coachee) with class scheduling, financial data, and user management | Server-side RBAC middleware on every endpoint; Service Account isolation for Calendar writes; frontend is never trusted for authorisation |
| **A02 — Security Misconfiguration** | **MEDIUM** — Express + Docker + Render deployment has many config points | `helmet` for headers; CORS restricted to single origin; Docker as non-root; env vars for all config; Biome lint enforces secure defaults |
| **A03 — Software Supply Chain Failures** | **HIGH** — 100+ npm dependencies including Google and Firebase SDKs | Exact version pinning; `npm audit` in CI; Dependabot alerts; lockfile committed; no untrusted packages |
| **A04 — Cryptographic Failures** | **MEDIUM** — Coach financial data encrypted at rest | AES-256-GCM for sensitive coach data; TLS 1.3 for all traffic; bcrypt cost 12 for passwords; encryption key separate from DB creds |
| **A05 — Injection** | **LOW** — Prisma parameterised queries, Zod validation, no raw SQL, no eval | Prisma ORM eliminates SQL injection; Zod rejects malformed input before domain logic; React JSX escaping prevents XSS |
| **A06 — Insecure Design** | **MEDIUM** — Complex domain rules (capacity, waiting lists, overlapping) | Hexagonal Architecture isolates pure domain logic; domain services are unit-tested without infrastructure; business rules are enforced in domain, not in controllers |
| **A07 — Authentication Failures** | **HIGH** — JWT lifecycle management, password storage, brute-force protection | Short-lived access tokens (15 min); refresh tokens with server-side tracking; bcrypt cost 12; rate limiting on `/auth/login` (10 req/min) |
| **A08 — Software & Data Integrity Failures** | **LOW** — No CI/CD pipeline tampering vector in v1; no auto-update mechanism | Lockfile committed; signed commits encouraged (not enforced); CI runs on GitHub Actions with pinned action versions |
| **A09 — Security Logging & Alerting Failures** | **MEDIUM** — No dedicated SIEM; host-level alerting only | Structured JSON logging (pino); anomaly detection rules for auth failures and abuse patterns; Google Calendar error rate alerts |
| **A10 — Mishandling of Exceptional Conditions** | **MEDIUM** — Google Calendar API is a critical external dependency | Global error handler returns 503 with generic message; stack traces never exposed; unique error ref ID for traceability; Calendar adapter logs every failure |

### 10.11 Out of Current Scope

The following measures are deliberately deferred to v1.1+ or until the product scales past its initial deployment:

* **Web Application Firewall (WAF)**: Not justified at v1 scale. The combination of rate limiting, Zod validation, and restricted CORS covers the same ground. Revisit if the app faces targeted attacks.
* **Penetration testing cadence**: No scheduled pentests for v1. A one-time security review by a colleague or external contractor is recommended before the first production data load. Regular cadence (quarterly/half-yearly) should be planned when revenue justifies it.
* **SOC2 / ISO 27001 compliance**: Not applicable at this stage. If the platform processes payment data or expands to enterprise clients, revisit.
* **Bug bounty program**: Premature for a pre-revenue product. The team should fix reported vulnerabilities via direct channels instead.
* **Formal SIEM / SOAR**: Host-level alerting (Render + GitHub notifications) is sufficient for v1. Dedicated security monitoring tools (Splunk, Sentinel, Wazuh) are overhead without a dedicated security person.
* **Refresh token rotation on use**: Deferred to v1.1. Current implementation validates refresh tokens server-side but does not rotate them on each use. Rotation adds complexity without meaningful benefit until the app sees thousands of concurrent users.
* **Hardware security keys (WebAuthn / passkeys)**: The current password + JWT model is appropriate for this user base. Passkeys can be added as a progressive enhancement later, but would not replace the primary auth flow in v1.

---