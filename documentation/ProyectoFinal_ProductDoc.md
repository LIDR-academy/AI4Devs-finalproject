# SupportHub — Product Document
> Version 0.2  
> Status: In progress

---

## 1. Product Description

### What is SupportHub?

SupportHub is a **customer support web portal** designed for software consultancies that manage incidents and requests from their clients through Jira internally, but lack a structured and transparent channel toward the end client.

SupportHub acts as a **customer experience layer on top of Jira**: the technical team continues working in Jira as usual, while the client has their own portal where they can create tickets, track them in real time and communicate with the team, completely eliminating the dependency on email and WhatsApp as support channels.

---

### Added Value

| Current problem | How SupportHub solves it |
|---|---|
| The client has no visibility into their tickets | Dedicated portal with real-time updated status |
| Communication scattered across email and WhatsApp | Centralized channel: everything happens in the portal |
| A "bridge" person manually translating emails into Jira | Direct integration: the ticket is created in Jira automatically |
| The client constantly asks about ticket status | Automatic email notifications on any change |
| Tickets lost or forgotten without a response | Centralized, traceable, and auditable record |
| No support metrics | Dashboard with basic KPIs for the administrator |

---

### Competitive Advantages

- **Zero friction for the technical team**: the internal workflow doesn't change, Jira remains the source of truth.
- **Built to measure**: no per-user licensing costs (Zendesk, Freshdesk, Jira Service Management).
- **Full product ownership**: adaptable to the consultancy's specific needs without depending on third parties.
- **AWS deployment**: scalable, secure, and aligned with modern cloud infrastructure. (For the Master's project it can be deployed locally with Docker, only using AWS services such as S3 and SES).
- **Foundation for AI evolution**: architecture ready to incorporate automatic classification, intelligent triage, and response suggestions in future versions.

---

## 2. Main Features

### Module 1 — Client Portal

Web interface accessible to the client's end users: people who report, consult, and track their incidents.

| # | Feature | Description |
|---|---|---|
| 1.1 | Registration and login | Access via invitation sent by the administrator. Secure login with email and password. |
| 1.2 | Ticket creation | Form to report incidents: title, description, type, priority, and attachments. |
| 1.3 | Attachments in tickets and comments | Support for uploading files (screenshots, logs, documents) stored in Amazon S3. |
| 1.4 | Ticket listing | View of all client tickets with current status, read directly from Jira on each request. |
| 1.5 | Ticket detail | Full thread view: description, team comments, and attachments — all read from Jira. |
| 1.6 | Ticket comments | The client can add comments; they are written directly to Jira via API and displayed when read from Jira. |
| 1.7 | Email notifications | The client receives an email when the team comments or changes the status of their ticket, with a direct link to the portal. |

---

### Module 2 — Admin Panel

Restricted interface for consultancy administrators. Allows managing client access and obtaining visibility into portal usage.

| # | Feature | Description |
|---|---|---|
| 2.1 | Client user management | Create, edit, activate, and deactivate portal user accounts. |
| 2.2 | Invitation sending | Send invitation email with account activation link. |
| 2.3 | User ↔ Jira project association | Link each user (or client company) to their corresponding project or board in Jira. |
| 2.4 | Metrics dashboard | Visual summary: tickets created, open/closed, average response time, activity per client. |

---

### Module 3 — Jira Integration

**Jira is the ticket database.** SupportHub acts as an experience layer: it reads and writes directly to Jira via REST API. No local copy of titles, descriptions, statuses, or comments exists — Jira is the single source of truth for ticket content. SupportHub only stores a minimal `Ticket` record (`Id`, `JiraIssueKey`, `ClientId`, `CreatedAt`) to link the portal identity with Jira data.

| # | Feature | Description |
|---|---|---|
| 3.1 | Ticket creation in Jira | When the client creates a ticket in the portal, it is created in real time in the client's corresponding Jira project. If Jira fails, the client receives the error and nothing is saved locally. |
| 3.2 | Status and detail query | The ticket's status, description, and priority are read directly from Jira on each request — no cache or local copy. |
| 3.3 | Bidirectional comments | Client comments are written to Jira via API; team comments in Jira are read directly from Jira. |
| 3.4 | Jira Webhook (notifications) | Jira notifies SupportHub of status changes or new comments. SupportHub generates a notification to the client (in-app and/or email) but does not sync data locally. |

---

## 3. Business Model — Lean Canvas

| Block | Content |
|---|---|
| **🔴 Problem** | 1. Clients with no visibility into their incidents · 2. Fragmented communication via email/WhatsApp · 3. A "bridge" person manually loading tickets into Jira · 4. No support metrics |
| **🟡 Solution** | Web portal where the client creates tickets, tracks them, and communicates with the team. Automatic Jira integration. Email notifications. Attachments via S3. |
| **⭐ Unique Value Proposition** | *"Your team in Jira. Your client in SupportHub."* The client has full visibility into their incidents without the team changing their workflow. |
| **🏆 Unfair Advantage** | Built to measure with no licensing costs. Full code ownership. Native integration with existing Jira. Architecture ready for AI in v2. |
| **👥 Customer Segments** | Software consultancies with clients who have contracted technical support. Phase 1: internal use. Phase 2: other consultancies in the market. |
| **📊 Key Metrics** | Tickets created via portal vs email · Average time to first response · % reduction in follow-up emails · Customer satisfaction (CSAT) |
| **📣 Channels** | Internal deployment at the consultancy. |
| **💰 Costs** | Initial development · AWS infrastructure · Product maintenance and evolution |

---

*Living document — will be updated progressively throughout the project.*
