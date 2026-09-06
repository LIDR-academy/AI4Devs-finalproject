# Sport ITSM — Product Requirements Document (PRD)

| Field             | Value                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| Product           | **Sport IT Service Management ("Sport ITSM")**                                        |
| Supported service | **Sports Competition Management System (SCMS)**                                       |
| Document type     | Product Requirements Document — business & functional, technology-agnostic            |
| Owner             | Product Owner, Sport ITSM                                                             |
| Status            | Draft for backlog grooming                                                            |
| Source of truth   | `readme.md` §0.3, §1.1, §1.2 — this PRD elaborates, never contradicts, those sections |
| Language standard | Technical English, standard Service Desk / ITSM terminology                           |

> **Scope of this document.** This PRD defines _what_ the product must do and _why_. It contains no stack, architecture, or implementation detail; those are owned by engineering and live in the architecture skills and in each change's `design.md`. Once approved, requirements here are translated into OpenSpec capability specs and change proposals.

---

## Table of Contents

1. [Product Vision & Value Proposition](#1-product-vision--value-proposition)
2. [Problem Statement](#2-problem-statement)
3. [Scope](#3-scope)
4. [Personas & Roles](#4-personas--roles)
5. [Capability Breakdown](#5-capability-breakdown)
6. [High-Level User Journeys](#6-high-level-user-journeys)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements (behavioral)](#8-non-functional-requirements-behavioral)
9. [Success Metrics & KPIs](#9-success-metrics--kpis)
10. [Assumptions](#10-assumptions)
11. [Constraints](#11-constraints)
12. [Dependencies & Integrations](#12-dependencies--integrations)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Phased Release Plan & MVP Definition](#14-phased-release-plan--mvp-definition)
15. [Definition of Ready / Definition of Done](#15-definition-of-ready--definition-of-done)
16. [Glossary](#16-glossary)

---

## 1. Product Vision & Value Proposition

### 1.1 Vision statement

> **For** the users and operators of the Sports Competition Management System — players, team managers, tournament organizers, match officials and league administrators on the demand side; Service Desk Agents, Application Support Analysts, Change/Release Managers and Service Owners on the supply side — **who** need the competition platform to stay available and correct precisely when competitions are live, **Sport ITSM** is an **IT Service Management platform** dedicated to supporting the SCMS platform. **It** provides a single, centralized environment to manage Incidents, Service Requests, Problems, Changes, Releases, Assets and operational processes under measurable SLAs, acting as the **Single Point of Contact (SPOC)** for platform users and as the governance layer for platform evolution. **Unlike** generic ticketing tools and fragmented ad-hoc support channels, Sport ITSM is **competition-context aware**: the agent handling a ticket can record that it affects a competition in progress, which raises the assessed Impact and therefore the Priority under the standard Impact × Urgency matrix — keeping prioritization a deliberate, justified and auditable human judgment rather than an opaque automatism.

### 1.2 Value proposition

| Value driver | Business outcome |
| --- | --- |
| **Operational consistency** | Every interaction follows one controlled lifecycle: logging → categorization → prioritization → assignment → investigation → resolution → closure. No ticket is lost, no lifecycle is improvised. |
| **Event protection** | Major Incident Management, agent-assessed competition impact and tiered escalation compress time-to-restore for failures that disrupt a competition in progress (scoring outage during finals, standings frozen at league close). |
| **Controlled platform evolution** | Change Management and Release & Deployment Management deliver SCMS changes with risk assessment, authorization, CMDB impact analysis and change/release scheduling deconfliction — reducing change-induced Incidents. |
| **Accountability** | SLA/OLA timers, breach warnings and tiered escalation make response and resolution commitments measurable and enforceable per service and priority. |
| **Efficiency** | Automated categorization, routing and assignment plus Knowledge-Base self-service deflection reduce manual handling effort and MTTR. |
| **Experience** | A Self-Service Portal gives requesters transparency: submit, track, respond, confirm and rate — without chasing an agent. |
| **Traceability & decision support** | An immutable audit trail plus operational and management dashboards (FCR, MTTR, MTTA, SLA Compliance, Change Success Rate, CSAT, backlog) drive Continual Service Improvement (CSI). |

### 1.3 Product principles

1. **The platform is the subject, the sport is the context.** Sport ITSM manages the SCMS _service_; competition entities are the affected subject of tickets, never tickets themselves.
2. **Competition impact is a human judgment, not an automatism.** Priority always comes from the Impact × Urgency matrix. When an agent assesses that a ticket affects a competition in progress, they record that assessment and the Impact rises accordingly — explicitly, with justification, and fully audited.
3. **One record, one lifecycle, one audit trail.** Every ticket, Problem, Change and Release is uniquely referenced and fully reconstructable from its history.
4. **Deflect before you resolve; resolve before you escalate.** Knowledge and self-service first, L1 resolution next, escalation only when justified.
5. **Nothing changes production without authorization.** Every modification to the SCMS platform is a Change record with an approval decision and a CMDB linkage.
6. **Configuration over hard-coding.** Catalog items, categories, priority matrices, SLA policies, workflows, approval chains and notification rules are administratively configurable, not fixed by design.

---

## 2. Problem Statement

### 2.1 Business context

Competition platforms carry an unusually harsh failure profile: an application failure — standings not updating, brackets not rendering, scores not saving, registrations rejected, payments not processed, notifications not delivered — does not merely inconvenience a user; when it strikes a competition that is under way, it **disrupts an event in progress** in front of participants and officials, with no possibility of "handling it tomorrow". At the same time, uncontrolled platform changes are a leading cause of the very failures that must be avoided. Support therefore needs a prioritization model that lets a trained agent recognise competition impact and act on it, and a change governance model that never lets a modification reach production unassessed and unauthorized.

### 2.2 Pain points (AS-IS)

| # | Pain point | Business consequence |
| --- | --- | --- |
| P1 | Issues arrive through fragmented, informal channels (personal email, chat, phone calls to whoever is known) | No single queue, no reference number, duplicated and lost work, no demand visibility |
| P2 | No consistent ticket lifecycle or categorization taxonomy | Cannot distinguish a defect from an entitled service request; no reliable reporting; inconsistent handling quality |
| P3 | No prioritization model at all — no Impact × Urgency assessment, no way to record competition impact | A cosmetic issue and a scoring outage during a final compete for the same attention |
| P4 | No formal escalation or Major Incident procedure | Time-to-restore depends on individual heroics; stakeholders are uninformed during outages |
| P5 | No controlled path for platform changes and releases | Change-induced Incidents; unassessed, unauthorized deployments; no rollback plan; no impact analysis |
| P6 | No CMDB / configuration baseline | Impact of a failing component on services and competitions is unknown at triage time |
| P7 | Recurring Incidents are re-solved from scratch each time | No Problem records, no RCA, no Known Error Database, no workarounds published |
| P8 | No measurable SLA accountability, no KPIs | Service quality is anecdotal; no basis for staffing, improvement or stakeholder commitments |
| P9 | No self-service, no Knowledge Base | Avoidable contact volume consumes L1 capacity that should be protecting competitions in progress |

### 2.3 Target state (TO-BE)

A **standardized, auditable and metric-driven service operation** covering both **support** (Incident, Service Request, Problem) and **platform evolution** (Change, Release, Asset & Configuration), aligned with ITIL-based practices, in which:

- Every demand enters through a normalized omnichannel intake and receives a unique reference.
- Priority is derived from a configurable **Impact × Urgency** matrix, where the agent's assessment of competition impact raises Impact.
- SLA targets are automatically applied, monitored, warned upon and escalated.
- Failures disrupting a competition in progress are declared Major Incidents and driven by a dedicated communication and escalation protocol.
- Recurring failures become Problems with RCA, Known Errors and published workarounds.
- Every platform modification is an authorized Change, delivered by a planned Release, linked to Configuration Items.
- Every action is auditable and every commitment is measurable.

---

## 3. Scope

### 3.1 Scope rule (non-negotiable)

> **Sport ITSM supports the SCMS _platform_, not the sporting operation itself.**

### 3.2 In scope

| Area | Included |
| --- | --- |
| **Incidents** | Defects, failures, degradations and unavailability of the SCMS platform (login failure, standings not updating, bracket not rendering, score not saving, payment not processed, notification not delivered, export failing, performance degradation). |
| **Service Requests** | Standard, pre-approved platform services the requester is **entitled** to: account creation, role/entitlement and organizer-access provisioning, password reset / account recovery / unlock, data export (fixtures, standings, rosters, results), billing & registration-payment support, reactivation of a suspended account or competition workspace. |
| **Problems** | Root cause investigation of recurring or high-impact platform Incidents; Known Error records; workaround publication. |
| **Changes** | Controlled modifications of the SCMS platform itself — new versions, features, configuration changes, hotfixes — as standard, normal or emergency Changes. |
| **Releases** | Planning, packaging, scheduling, deployment and rollback of SCMS versions, linked to the Changes and CIs they deliver. |
| **Assets & Configuration Items** | The SCMS platform's services, environments and components, and their relationships, tracked in the CMDB for impact analysis. |
| **Service Level Management** | SLA and OLA definition, timers, warnings, breaches and escalation, with targets differentiated by service and priority. |
| **Service Catalog & Knowledge** | Published Service Offerings with request forms and eligibility rules; Knowledge Articles for deflection and agent guidance. |
| **Identity & Access** | Authentication and role-based authorization for all Sport ITSM personas, least-privilege enforcement. |
| **Audit & Reporting** | Immutable activity history; operational and management dashboards and KPIs. |

### 3.3 Out of scope

| Excluded | Rationale / correct owner |
| --- | --- |
| **In-application sport decisions** — match reschedules, roster changes, result disputes, sanctions, seeding decisions, walkovers | Made by organizers and officials **inside SCMS**. They reach Sport ITSM only if they surface as a platform defect ("the reschedule I saved was not applied") or as an entitled Service Request. |
| **Competition entities as ticket types** | Tournament, League, Group/Division, Bracket, Fixture/Match, Standings/Ranking, Registration, Roster, Team, Player Account, Schedule, Result are the **affected subject** of a ticket only. |
| **Building or operating SCMS functionality** | Sport ITSM governs SCMS Changes and Releases; it does not implement SCMS competition features. |
| **Financial settlement / payment processing** | Sport ITSM records and supports payment-related Incidents and Requests; the payment subsystem executes transactions. |
| **Support for the general public / anonymous spectators** | Sport ITSM serves identified SCMS users only (players/competitors, team managers, organizers, officials, league administrators) plus the service organization. There is no public or anonymous support entitlement and no public Knowledge Base. |
| **Competition calendar management and time-based service policies** | Sport ITSM does not maintain, import or reason over a competition calendar. It defines no "live window", no event-driven SLA modulation and no deployment freeze period. Competition impact is assessed by the agent on the ticket. |
| **HR/Facilities/other enterprise service domains (ESM)** | Sport ITSM is scoped to the SCMS IT service. |

### 3.4 Reframing rule for out-of-scope demand

When a request models an in-application sport decision as a ticket, the Service Desk MUST reframe it:

| Raw demand | Correct classification |
| --- | --- |
| "Move the match to Sunday" | **Out of scope** — organizer action inside SCMS. Deflect with a Knowledge Article. |
| "I rescheduled the match but the fixture still shows the old date" | **Incident** — affected subject `Fixture / Match`. |
| "The result is wrong, we actually won" | **Out of scope** unless the platform mis-computed it → then **Incident**, affected subject `Result` / `Standings`. |
| "Give my assistant organizer access to the Spring League" | **Service Request** — organizer-access provisioning, with approval. |
| "Add a seeding rule to the bracket engine" | **Change** (platform enhancement) via demand intake, not an Incident. |

---

## 4. Personas & Roles

### 4.1 Demand-side personas (platform users)

| Persona | Description | Primary needs |
| --- | --- | --- |
| **Player / Competitor** | End user of SCMS; reports application issues and requests account services | Simple intake, status transparency, fast account recovery |
| **Team Manager / Captain** | Manages a team's participation; raises team-level support | Roster/registration issues resolved before deadlines |
| **Tournament Organizer / Admin** | Power user configuring competitions; higher entitlement tier | Priority handling for their competitions; organizer-access provisioning; data export |
| **Referee / Match Official** | Enters scores and results; reports scoring/result-entry issues | Immediate response while officiating; workarounds to keep officiating |
| **League Administrator** | Oversees multiple competitions; escalation contact | Cross-competition visibility; Major Incident communication |

### 4.2 Supply-side personas (service organization)

| Persona | Description | Primary needs |
| --- | --- | --- |
| **Service Desk Agent (L1)** | First-line operator: logs, triages, resolves or routes | Prioritized work list, guided categorization, knowledge at hand, low-friction escalation |
| **Application Support Analyst (L2/L3)** | Platform specialist / engineering resolver group | Rich diagnostic context, CI linkage, Problem creation, technical work notes |
| **Change / Release Manager** | Governs Changes; coordinates SCMS Releases and deployments | Risk assessment, CAB approvals, change/release schedule deconfliction, rollback plans |
| **Service Owner / Service Manager** | Accountable for SCMS service quality, SLAs, CSI | KPI dashboards, SLA compliance, backlog and trend analysis |
| **System Administrator** | Configures catalog, categories, workflows, SLAs, CMDB, RBAC | Safe, auditable configuration without code changes |

### 4.3 Role / permission model (indicative)

| Role | Key permissions |
| --- | --- |
| Requester (Player/Competitor, Team Manager, Referee/Match Official) | Create and view **own** tickets; add comments; read requester-facing Knowledge Articles; confirm resolution; submit CSAT |
| Organizer / League Admin | Requester permissions **plus** visibility of tickets affecting **their** competitions; raise entitled organizer requests; act as approver where configured |
| Agent (L1) | Full ticket queue access; categorize, prioritize, assign, resolve, close; create Knowledge Article drafts; declare Major Incident candidates |
| Analyst (L2/L3) | Agent permissions on assigned queues; create/manage Problems and Known Errors; link CIs; request Changes |
| Change/Release Manager | Create, assess, authorize and schedule Changes and Releases; manage the change/release schedule |
| Approver | Approve/reject items routed to them; delegate |
| Service Manager | Read-all; dashboards and reports; SLA policy review; Major Incident command |
| System Administrator | Configuration of catalog, taxonomy, SLA policies, workflows, notifications, roles and CMDB schema; no privileged bypass of audit |

---

## 5. Capability Breakdown

Capabilities map 1:1 to the capability list in `readme.md` §1.2 and to future OpenSpec capability folders.

| # | Capability | OpenSpec capability (target) | Purpose |
| --- | --- | --- | --- |
| C1 | **Incident Management** | `incident-management` | Restore normal service operation as quickly as possible after a platform failure, minimizing impact on competitions. |
| C2 | **Service Request Management** | `service-request-management` | Fulfill standard, entitled platform services predictably and with approval where required. |
| C3 | **Problem Management** | `problem-management` | Eliminate recurring platform Incidents through RCA, Known Errors and workarounds. |
| C4 | **Change Management** | `change-management` | Authorize, assess and schedule modifications to the SCMS platform with controlled risk. |
| C5 | **Release & Deployment Management** | `release-management` | Plan, package and deploy SCMS versions with rollout/rollback plans and schedule deconfliction. |
| C6 | **Asset & Configuration Management (CMDB)** | `asset-configuration-management` | Maintain the configuration baseline and relationships enabling impact analysis. |
| C7 | **SLA Management & Escalation** | `sla-management` | Apply, monitor and enforce response/resolution commitments per service and priority. |
| C8 | **Service Catalog Management** | `service-catalog` | Publish Service Offerings with forms, eligibility rules and fulfillment workflows. |
| C9 | **Knowledge Management & Self-Service Portal** | `knowledge` | Deflect demand and standardize resolution through curated Knowledge Articles. |
| C10 | **Identity & Access Management (RBAC)** | `identity-access` | Authenticate users and enforce least-privilege, persona-aligned authorization. |
| C11 | **Omnichannel Intake** | cross-cutting (`incident`/`service-request`) | Normalize demand from portal, email, in-app and phone into one ticket model. |
| C12 | **Workflow & Automation Engine** | cross-cutting | Automated categorization, routing, assignment and task orchestration. |
| C13 | **Major Incident Management** | `incident-management` (sub-capability) | Command, escalate and communicate high-impact failures disrupting competitions in progress. |
| C14 | **Assignment & Queue Management** | cross-cutting | Support groups, queues and prioritized agent work lists. |
| C15 | **Approval Engine** | cross-cutting | Multi-level, delegable approvals for Requests, Changes and Releases. |
| C16 | **Notification Framework** | cross-cutting | Event-driven notifications to requesters, agents, approvers and stakeholders. |
| C17 | **Reporting, Dashboards & Analytics** | cross-cutting | Operational and management KPI visibility for CSI. |
| C18 | **Audit Trail & Activity History** | cross-cutting | Immutable, reconstructable history of all records. |

---

## 6. High-Level User Journeys

### J1 — Referee reports a scoring failure while officiating (Incident → Major Incident)

1. While officiating a match, the Referee cannot save a score. He opens the Self-Service Portal (or in-app help) and searches; no article resolves it.
2. He submits an Incident, selecting affected subject `Result` and the affected competition, and describes that the match is under way.
3. The system assigns a unique reference and the Incident reaches L1 triage. The Agent categorizes it (Scoring & Results) and, applying professional judgment, flags **"affects a competition in progress"** with a justification. That flag raises the assessed **Impact**; combined with Urgency in the standard **Impact × Urgency** matrix, the derived **Priority** is **P1**.
4. The SLA policy for P1 on the Scoring service is attached and its response/resolution targets start; the ticket is routed to the Scoring resolver queue and L2 is notified.
5. L1 verifies scope; multiple similar Incidents arrive → L1 proposes **Major Incident**; the Service Manager declares it.
6. Major Incident protocol starts: resolver bridge engaged, stakeholder communication cadence begins, League Administrators receive status updates; child Incidents are linked to the Major Incident.
7. L2 identifies a failing component via CMDB relationships; a workaround (manual result entry path) is published as a Knowledge Article and communicated.
8. Service is restored; the Major Incident is resolved; all linked child Incidents are resolved with the same resolution code.
9. A **Problem** record is opened automatically for RCA; the Referee receives resolution notification and a CSAT survey.

### J2 — Team Manager requests organizer access (Service Request with approval)

1. The Team Manager browses the Service Catalog and selects "Organizer access provisioning".
2. Eligibility rules determine the request is allowed but requires approval by the League Administrator.
3. He submits the dynamic request form (competition, role level, justification, effective period).
4. The Approval Engine routes the approval task; the approver receives a notification and approves (or rejects with a reason, closing the Request).
5. Fulfillment tasks are generated and assigned; the entitlement is provisioned and verified.
6. The Request is fulfilled and closed; the requester is notified; the audit trail records requester, approver, decision timestamp and fulfiller.

### J3 — Player recovers a locked account (self-service deflection)

1. The Player cannot log in and opens the portal.
2. Knowledge search surfaces the "Account locked / password reset" article with a self-service action.
3. The Player completes the self-service flow and regains access; a lightweight Service Request record is created and auto-closed for traceability and deflection measurement.
4. If self-service fails, the flow converts into a standard Service Request routed to L1 — no context is lost.

### J4 — Hotfix for a recurring standings defect (Problem → Change → Release)

1. A Problem record from a recurring standings defect reaches a confirmed root cause; a Known Error is documented with a workaround.
2. The Application Support Analyst raises a **Change** (type: normal) referencing the Problem and the affected CIs.
3. Risk and impact assessment runs against the CMDB: affected services, CI criticality and rollback feasibility produce a risk level. The **change schedule** is checked and a conflict with another Change touching the same CIs is flagged, so the Change Manager reschedules.
4. The Change is authorized by the CAB (or by emergency authority for an emergency Change) via the Approval Engine.
5. The Change is attached to a **Release** with rollout and rollback plans, scheduled in the release schedule.
6. Deployment is executed and recorded; CI versions in the CMDB are updated; the Change is closed with a post-implementation review outcome (successful / successful with issues / failed / backed out).
7. The Problem and its linked Incidents are closed; the Known Error is retired or updated; Change Success Rate is updated.

### J5 — Service Owner reviews service performance (reporting & CSI)

1. The Service Owner opens the management dashboard for the last period.
2. She reviews SLA Compliance by priority, MTTA/MTTR trends, FCR, Reopen Rate, backlog ageing, CSAT and Change Success Rate, plus domain KPIs (time-to-restore for competition-impacting Incidents, share of Incidents flagged as affecting a competition in progress, deflection rate).
3. She identifies a hot spot (registration/payment requests breaching their fulfillment target), raises a CSI action, and sponsors a catalog/knowledge improvement or an SLA policy adjustment.

---

## 7. Functional Requirements

**Notation.** `FR-<CAP>-<n>`. Priority uses MoSCoW: **M** = Must (MVP), **S** = Should, **C** = Could, **W** = Won't (this release). Every requirement is behavior-only.

### 7.1 C1 — Incident Management (`incident-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-INC-01 | The system MUST allow an authenticated requester or an agent to log an Incident capturing: reporter, contact channel, short description, detailed description, affected service, **affected competition subject** (Tournament, League, Group/Division, Bracket, Fixture/Match, Standings/Ranking, Registration, Roster, Team, Player Account, Schedule, Result), affected competition instance, and optional attachments. The requester MAY describe competition context in free text, but MUST NOT be able to set priority-bearing fields directly. | M |
| FR-INC-02 | The system MUST assign every Incident a unique, human-readable reference number at creation and never reuse it. | M |
| FR-INC-03 | The system MUST support a configurable categorization taxonomy (Category → Subcategory → Item) and MUST require a category before an Incident can leave the `New` state. | M |
| FR-INC-04 | The system MUST derive **Priority** from a configurable **Impact × Urgency** matrix, and MUST allow an authorized agent to override the derived Priority with a mandatory justification recorded in the audit trail. | M |
| FR-INC-05 | The system MUST allow an agent, at logging or triage, to flag that the Incident **affects a competition in progress**, with a mandatory justification. Setting the flag MUST raise the assessed **Impact** by a configurable amount, which re-derives Priority through the Impact × Urgency matrix. The flag MUST be set, changed and cleared **only by explicit agent action** — never automatically, and never by the requester — and every change MUST be recorded in the audit trail. | M |
| FR-INC-06 | The system MUST manage the Incident lifecycle through the states: `New → Assigned → In Progress → Pending (customer / third party / change) → Resolved → Closed`, plus `Cancelled`, with configurable allowed transitions. | M |
| FR-INC-07 | The system MUST prevent transition to `Resolved` unless a resolution code and resolution notes are provided. | M |
| FR-INC-08 | The system MUST stop SLA resolution clocks while an Incident is in a `Pending` state whose pause behavior is configured as clock-stopping, and MUST resume them on exit. | M |
| FR-INC-09 | The system MUST auto-close a `Resolved` Incident after a configurable confirmation period if the requester does not respond, and MUST allow the requester to reject the resolution within that period, returning the Incident to `In Progress` (counted as a reopen). | M |
| FR-INC-10 | The system MUST allow linking an Incident to: other Incidents (duplicate / related), a parent Major Incident, a Problem, a Change, a Release and one or more Configuration Items. | M |
| FR-INC-11 | The system MUST record public comments (visible to the requester) and internal work notes (agents only) as distinct entry types. | M |
| FR-INC-12 | The system MUST support reassignment between Resolver Groups and individual agents, preserving full assignment history. | M |
| FR-INC-13 | The system MUST support **functional escalation** (to a higher support tier) and **hierarchical escalation** (to management) triggered manually or automatically by SLA thresholds. | M |
| FR-INC-14 | The system MUST allow an agent to convert a mis-classified record between Incident and Service Request, preserving the original reference, history and audit trail. | S |
| FR-INC-15 | The system MUST reject or flag Incident submissions that describe in-application sport decisions, offering the correct path (Knowledge Article or Service Catalog item) before submission. | S |
| FR-INC-16 | The system SHOULD suggest relevant Knowledge Articles at intake time based on the description and category, and MUST record when a suggestion led to abandonment of the submission (deflection). | S |
| FR-INC-17 | The system SHOULD detect and propose duplicate/related Incidents affecting the same service and competition subject within a configurable time window. | S |
| FR-INC-18 | The system MUST record First Contact Resolution when an Incident is resolved by L1 within the first interaction without reassignment. | M |

#### 7.1.1 C13 — Major Incident Management (sub-capability)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-MIM-01 | The system MUST allow an authorized role (Service Manager, or Agent with proposal rights) to declare an Incident a **Major Incident**, capturing declaration time, declarer and justification. | M |
| FR-MIM-02 | Declaration MUST apply the Major Incident protocol: accelerated SLA targets, immediate notification of the Major Incident stakeholder list, and engagement of the designated resolver groups. | M |
| FR-MIM-03 | The system MUST support linking child Incidents to a parent Major Incident, and MUST propagate resolution and closure from parent to linked children with a shared resolution code. | M |
| FR-MIM-04 | The system MUST enforce a configurable **stakeholder communication cadence** during a Major Incident and record every communication issued in the audit trail. | S |
| FR-MIM-05 | The system MUST require a post-Major-Incident review record and MUST create (or link) a Problem record before the Major Incident can be closed. | S |
| FR-MIM-06 | The system SHOULD publish a service status message visible on the Self-Service Portal for the duration of a Major Incident. | C |

### 7.2 C2 — Service Request Management (`service-request-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-SRQ-01 | The system MUST allow a requester to raise a Service Request only from a published Service Offering in the Service Catalog. | M |
| FR-SRQ-02 | The system MUST enforce **eligibility rules** per Service Offering based on the requester's role, entitlement tier and relationship to the affected competition; ineligible offerings MUST NOT be requestable. | M |
| FR-SRQ-03 | The system MUST render the offering's dynamic request form and MUST validate mandatory fields before submission. | M |
| FR-SRQ-04 | The system MUST route Service Requests requiring authorization to the Approval Engine, and MUST NOT start fulfillment before an approval decision is recorded. | M |
| FR-SRQ-05 | The system MUST manage the Service Request lifecycle: `New → Approval Pending → Approved / Rejected → In Fulfillment → Fulfilled → Closed`, plus `Cancelled`. | M |
| FR-SRQ-06 | The system MUST support fulfillment decomposition into ordered or parallel **fulfillment tasks** assigned to different groups, with the parent Request closing only when all mandatory tasks complete. | M |
| FR-SRQ-07 | The system MUST apply the SLA policy defined on the Service Offering (fulfillment target), distinct from Incident SLA policies. | M |
| FR-SRQ-08 | The system MUST allow the requester to cancel a Service Request before fulfillment starts. | M |
| FR-SRQ-09 | The system MUST support the MVP catalog request types: account creation; role/entitlement and organizer-access provisioning; password reset / account recovery / unlock; data export (fixtures, standings, rosters, results); billing & registration-payment support; reactivation of a suspended account or competition workspace. | M |
| FR-SRQ-10 | The system SHOULD support fully automated fulfillment for designated offerings (e.g., password reset) with no human task, recording the automated action in the audit trail. | S |
| FR-SRQ-11 | Rejected Service Requests MUST be closed with a mandatory rejection reason communicated to the requester. | M |

### 7.3 C3 — Problem Management (`problem-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-PRB-01 | The system MUST allow creation of a Problem record manually, from an Incident, or from a Major Incident closure. | M |
| FR-PRB-02 | The system MUST support linking multiple Incidents to a Problem and MUST display the aggregated Incident count and impact. | M |
| FR-PRB-03 | The system MUST manage the Problem lifecycle: `New → Investigation → Root Cause Identified → Known Error → Resolved → Closed`. | M |
| FR-PRB-04 | The system MUST capture a structured **Root Cause Analysis** (symptom, investigation, root cause, corrective action, preventive action) before a Problem can reach `Root Cause Identified`. | M |
| FR-PRB-05 | The system MUST maintain a **Known Error Database (KEDB)** of Known Errors with a documented workaround, searchable by agents and linkable to Incidents. | M |
| FR-PRB-06 | The system MUST allow publishing a workaround as a Knowledge Article visible to agents and, optionally, to requesters. | M |
| FR-PRB-07 | The system MUST allow a Problem to raise a Change as its permanent fix, and MUST prevent closing the Problem until the linked Change is closed or explicitly de-linked with justification. | S |
| FR-PRB-08 | The system SHOULD detect Incident recurrence patterns (same category + affected subject above a configurable threshold in a period) and propose Problem creation. | S |
| FR-PRB-09 | The system MUST support proactive Problem records created from trend analysis without a triggering Incident. | C |

### 7.4 C4 — Change Management (`change-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-CHG-01 | The system MUST support three Change types with distinct workflows: **Standard** (pre-authorized, low risk), **Normal** (assessed and CAB-authorized) and **Emergency** (expedited authorization, retrospective review). | M |
| FR-CHG-02 | A Change record MUST capture: requester, change type, description, business justification, affected Configuration Items, affected services, planned start and end date/time, implementation plan, test plan, **rollback plan**, and risk & impact assessment. | M |
| FR-CHG-03 | The system MUST NOT allow a Normal or Emergency Change to move to `Scheduled` without a recorded authorization decision from the configured approver(s)/CAB. | M |
| FR-CHG-04 | The system MUST manage the Change lifecycle: `Draft → Assessment → Authorization → Scheduled → Implementation → Review → Closed`, plus `Rejected` and `Cancelled`. | M |
| FR-CHG-05 | The system MUST compute a **risk level** from a configurable assessment (impact scope, number and criticality of affected CIs, rollback feasibility, complexity, past failure history of the affected CIs). | M |
| FR-CHG-06 | The system MUST maintain a **change schedule** displaying planned and scheduled Changes and Releases over time, filterable by service, environment and Configuration Item. | M |
| FR-CHG-07 | _(Retired — deployment freeze windows are out of scope; see §3.3. ID retained for traceability and not reused.)_ | — |
| FR-CHG-08 | The system MUST detect and warn about **scheduling conflicts** between Changes affecting the same Configuration Items. | S |
| FR-CHG-09 | The system MUST require a **Post-Implementation Review** outcome (`Successful`, `Successful with issues`, `Failed`, `Backed out`) before a Change can be closed. | M |
| FR-CHG-10 | The system MUST allow linking a Change to originating Incidents/Problems and to the Release that delivers it. | M |
| FR-CHG-11 | The system MUST record any Incident attributed to a Change (change-induced Incident) to feed the Change Success Rate KPI. | S |
| FR-CHG-12 | The system SHOULD support a catalog of pre-approved **Standard Change templates** that skip CAB authorization. | S |

### 7.5 C5 — Release & Deployment Management (`release-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-REL-01 | The system MUST allow creation of a Release record capturing: version identifier, release type (major, minor, patch, hotfix), scope description, target environments, planned deployment date/time, rollout plan and rollback plan. | M |
| FR-REL-02 | The system MUST support associating one or more authorized Changes to a Release; a Release MUST NOT be approved for deployment while it contains unauthorized Changes. | M |
| FR-REL-03 | The system MUST manage the Release lifecycle: `Planned → Build/Package → Ready for Deployment → Deploying → Deployed → Verified → Closed`, plus `Rolled Back` and `Cancelled`. | M |
| FR-REL-04 | The system MUST maintain a **release schedule** integrated with the change schedule (FR-CHG-06), and MUST warn when two Releases target the same environment in overlapping periods. | M |
| FR-REL-05 | The system MUST record deployment execution per environment (who, when, outcome) and MUST update the version of the affected Configuration Items on successful deployment. | M |
| FR-REL-06 | The system MUST support recording a rollback, including trigger reason and post-rollback CI state. | M |
| FR-REL-07 | The system MUST capture release verification results before a Release can be closed. | S |
| FR-REL-08 | The system SHOULD compute **release lead time** (from first linked Change authorization to successful deployment). | S |

### 7.6 C6 — Asset & Configuration Management (`asset-configuration-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-CMD-01 | The system MUST maintain a CMDB of Configuration Items representing the SCMS platform: services, environments, application components, integrations and data stores. | M |
| FR-CMD-02 | Each CI MUST record: unique identifier, name, CI type, criticality, environment, owner, operational status and current version. | M |
| FR-CMD-03 | The system MUST support typed **relationships** between CIs (`depends on`, `runs on`, `part of`, `connects to`) with direction. | M |
| FR-CMD-04 | The system MUST provide **impact analysis**: given a CI, list the services, competitions and open records (Incidents, Problems, Changes, Releases) affected through its relationships. | M |
| FR-CMD-05 | The system MUST allow linking CIs to Incidents, Problems, Changes and Releases. | M |
| FR-CMD-06 | The system MUST maintain CI change history (who changed what, when) as part of the audit trail. | M |
| FR-CMD-07 | The system SHOULD flag CIs whose actual deployed version diverges from the CMDB record (configuration drift indicator). | C |
| FR-CMD-08 | The system SHOULD support Asset lifecycle states (`Planned`, `In Use`, `Deprecated`, `Retired`) for non-service assets. | C |

### 7.7 C7 — SLA Management & Escalation (`sla-management`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-SLA-01 | The system MUST allow definition of SLA policies with **response** and **resolution/fulfillment** targets per record type, service, Service Offering and priority. | M |
| FR-SLA-02 | The system MUST attach exactly one applicable SLA policy to each ticket at creation, re-evaluating on priority or service change. | M |
| FR-SLA-03 | The system MUST run SLA timers against a configurable **support schedule** (business hours or 24×7) with holiday support, defined per SLA policy. | M |
| FR-SLA-04 | When an agent raises Priority — including through the competition-in-progress Impact flag (FR-INC-05) — the system MUST re-evaluate the applicable SLA policy and recalculate response and resolution targets from the ticket's original creation time, preserving the previous target values in the audit trail. | M |
| FR-SLA-05 | The system MUST emit configurable **breach warnings** at defined percentages of target consumption (e.g., 50%, 75%, 90%). | M |
| FR-SLA-06 | The system MUST record an SLA **breach** with timestamp and elapsed time when a target is exceeded, and MUST NOT allow retroactive silent modification of breach records. | M |
| FR-SLA-07 | The system MUST support automatic **escalation rules** (functional and hierarchical) triggered by warning or breach events. | M |
| FR-SLA-08 | The system MUST support clock pause/resume semantics tied to configured pending states. | M |
| FR-SLA-09 | The system SHOULD support **OLA** targets for internal resolver groups and supplier/underpinning-contract targets, measured separately from the customer-facing SLA. | S |
| FR-SLA-10 | The system MUST expose remaining time to target on the agent work list and ticket view. | M |

### 7.8 C8 — Service Catalog Management (`service-catalog`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-CAT-01 | The system MUST allow a System Administrator to define **Services** and their **Service Offerings**, organized into browsable categories. | M |
| FR-CAT-02 | Each Service Offering MUST define: description, request form definition, eligibility rules, approval requirements, fulfillment workflow, assignment target and SLA policy. | M |
| FR-CAT-03 | Offerings MUST have a publication lifecycle (`Draft`, `Published`, `Retired`); only `Published` offerings are visible to requesters. | M |
| FR-CAT-04 | The catalog MUST present to each requester **only** the offerings they are eligible for, based on role and entitlement tier. | M |
| FR-CAT-05 | The system MUST support searching and filtering the catalog. | M |
| FR-CAT-06 | The system SHOULD support offering-level cost/effort metadata and expected fulfillment time displayed to the requester. | C |

### 7.9 C9 — Knowledge Management & Self-Service Portal (`knowledge`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-KNW-01 | The system MUST support Knowledge Articles typed as `How-to`, `Known Issue`, `Workaround`, `FAQ` and `Policy`. | M |
| FR-KNW-02 | Articles MUST follow an authoring lifecycle: `Draft → Review → Published → Retired`, with an approver role for publication. | M |
| FR-KNW-03 | Articles MUST carry an audience visibility setting (requester-facing vs. internal/agent-only). No article is accessible without authentication; there is no public/anonymous Knowledge Base. | M |
| FR-KNW-04 | The system MUST provide full-text search over published articles for both requesters and agents, filtered by the authenticated user's visibility entitlement. | M |
| FR-KNW-05 | The system MUST allow attaching a Knowledge Article to a ticket as the resolution source, and MUST count that as knowledge-assisted resolution. | M |
| FR-KNW-06 | The system MUST measure **self-service deflection**: sessions where an article was viewed and no ticket was subsequently submitted within a configurable window. | S |
| FR-KNW-07 | The system MUST allow readers to rate article usefulness and MUST surface low-rated and stale articles for review. | S |
| FR-KNW-08 | The Self-Service Portal MUST allow a requester to: search knowledge, submit an Incident, request a catalog offering, view own tickets and their status/SLA, add comments and attachments, confirm or reject a resolution, and submit CSAT. | M |
| FR-KNW-09 | The portal MUST allow Organizers and League Administrators to view tickets affecting the competitions they own. | S |
| FR-KNW-10 | The system SHOULD allow creating an article draft directly from a resolved Incident or a Problem workaround. | S |

### 7.10 C10 — Identity & Access Management (`identity-access`)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-IAM-01 | The system MUST authenticate every user before granting access to any function. Sport ITSM exposes no anonymous or public surface — including the Knowledge Base and the Self-Service Portal. | M |
| FR-IAM-02 | The system MUST implement **role-based access control** aligned with the personas in §4, enforcing **least privilege** by default. | M |
| FR-IAM-03 | A requester MUST only be able to view and act on their **own** tickets, except where an explicit competition-scoped visibility rule grants broader access (Organizer, League Administrator). | M |
| FR-IAM-04 | The system MUST support integration with the SCMS platform's identity provider / SSO for user authentication and profile attributes. | S |
| FR-IAM-05 | The system MUST support role assignment and revocation by a System Administrator, fully audited. | M |
| FR-IAM-06 | The system MUST terminate sessions after a configurable inactivity period and MUST require re-authentication for privileged administrative actions. | S |
| FR-IAM-07 | Every authorization decision that denies access MUST be recorded when it concerns privileged operations. | C |

### 7.11 C11 — Omnichannel Intake (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-OMN-01 | The system MUST accept demand from the Self-Service Portal, email-to-ticket, in-app help and agent-logged (phone/chat) entries, normalizing all into a single ticket model with a unique reference. | M (portal + agent-logged) / S (email, in-app) |
| FR-OMN-02 | Every ticket MUST record its **origin channel** for reporting. | M |
| FR-OMN-03 | Email replies to a ticket notification MUST be appended as public comments to the originating ticket rather than creating a new ticket. | S |
| FR-OMN-04 | Intake MUST capture the requester identity; anonymous submissions are not permitted. | M |

### 7.12 C12 — Workflow & Automation Engine (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-WFL-01 | The system MUST allow a System Administrator to configure lifecycle state models and allowed transitions per record type without code changes. | M |
| FR-WFL-02 | The system MUST support **business rules** evaluated on record events (create, update, state change) that can set fields, assign, notify, escalate or create tasks. | M |
| FR-WFL-03 | The system MUST support **automatic categorization and routing** rules mapping category/affected subject/channel to a Resolver Group or queue. | M |
| FR-WFL-04 | The system MUST support assignment strategies: manual, round-robin within a group, and skill/competency-based. | S |
| FR-WFL-05 | The system MUST support scheduled/time-based rules (e.g., auto-close after confirmation period, SLA warnings, stale-ticket reminders). | M |
| FR-WFL-06 | Rule execution MUST be recorded in the record's activity history (which rule fired, when, with what effect). | M |

### 7.13 C14 — Assignment & Queue Management (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-QUE-01 | The system MUST support Resolver Groups (support groups) with members, group manager and coverage schedule. | M |
| FR-QUE-02 | The system MUST provide each agent a **prioritized work list** ordered by priority, SLA time remaining and age, filterable by group, state and affected competition. | M |
| FR-QUE-03 | The system MUST allow an agent to take (self-assign) an unassigned ticket from a queue they belong to. | M |
| FR-QUE-04 | The system MUST prevent assignment of a ticket to a group not entitled to the record's category, or MUST warn on such assignment. | C |
| FR-QUE-05 | The system SHOULD expose group workload distribution and per-agent open-ticket counts to group managers. | S |

### 7.14 C15 — Approval Engine (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-APR-01 | The system MUST support configurable approval workflows with one or more sequential and/or parallel approval stages. | M |
| FR-APR-02 | Approvers MUST be resolvable by role, group, competition ownership or named user. | M |
| FR-APR-03 | An approval decision MUST be `Approved` or `Rejected`, with a mandatory comment on rejection, recorded with approver identity and timestamp. | M |
| FR-APR-04 | The system MUST support approval **delegation** for a defined period, recording both the delegate and the original approver. | S |
| FR-APR-05 | The system MUST support approval reminders and configurable escalation on non-response. | S |
| FR-APR-06 | The system MUST support quorum rules for CAB authorization (e.g., majority of assigned approvers). | C |
| FR-APR-07 | Approval records MUST be immutable once a decision is registered. | M |

### 7.15 C16 — Notification Framework (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-NOT-01 | The system MUST notify the requester on: ticket creation acknowledgment (with reference number), assignment, request for information, resolution, and closure. | M |
| FR-NOT-02 | The system MUST notify agents/groups on assignment, escalation and SLA warning/breach. | M |
| FR-NOT-03 | The system MUST notify approvers on pending approval tasks and reminders. | M |
| FR-NOT-04 | The system MUST notify the Major Incident stakeholder list on declaration, status updates and resolution. | M |
| FR-NOT-05 | Notification templates MUST be configurable per event type and localizable. | M |
| FR-NOT-06 | The system MUST support in-app notifications and email; push is optional. | M (in-app) / S (email) / C (push) |
| FR-NOT-07 | Users SHOULD be able to manage their notification preferences within policy-defined limits (mandatory notifications cannot be disabled). | C |
| FR-NOT-08 | Every notification dispatched MUST be recorded against the source record. | M |

### 7.16 C17 — Reporting, Dashboards & Analytics (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-RPT-01 | The system MUST provide an **operational dashboard** for agents and group managers: open tickets by priority and state, tickets approaching SLA breach, unassigned queue depth, my work list. | M |
| FR-RPT-02 | The system MUST provide a **management dashboard** for the Service Owner: FCR, MTTA, MTTR, SLA Compliance Rate, Reopen Rate, Backlog Volume and ageing, CSAT, ticket volume by category/channel/service. | M |
| FR-RPT-03 | The system MUST provide **process dashboards** for Change and Release: Change Success Rate, change-induced Incident rate, emergency change ratio, release frequency and lead time. | S |
| FR-RPT-04 | The system MUST provide **domain KPIs**: time-to-restore for Incidents flagged as affecting a competition in progress, volume and share of such Incidents, Major Incident rate, registration/payment request resolution time, self-service deflection rate. | S |
| FR-RPT-05 | Reports MUST be filterable by period, service, category, competition, priority and Resolver Group. | M |
| FR-RPT-06 | The system SHOULD allow exporting report data for offline analysis. | S |
| FR-RPT-07 | Reported figures MUST be reproducible: the same filters over the same period MUST return the same values. | M |

### 7.17 C18 — Audit Trail & Activity History (cross-cutting)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-AUD-01 | The system MUST record an immutable entry for every state transition, field change, assignment, comment, approval, notification and automated rule execution on every record type. | M |
| FR-AUD-02 | Each audit entry MUST capture: actor (user or system rule), timestamp, record reference, action, previous value and new value. | M |
| FR-AUD-03 | Audit entries MUST NOT be editable or deletable by any role, including System Administrator. | M |
| FR-AUD-04 | The full activity history of a record MUST be viewable by authorized roles, with requester-visible entries separated from internal entries. | M |
| FR-AUD-05 | The system MUST record administrative configuration changes (catalog, SLA policy, workflow, role assignment) in the audit trail. | M |
| FR-AUD-06 | Audit history MUST be retained for a configurable retention period not shorter than the record's own retention. | S |

---

## 8. Non-Functional Requirements (behavioral)

> Expressed as observable behavior and service expectations only; no technology or architecture.

### 8.1 Availability & continuity

| ID | Requirement |
| --- | --- |
| NFR-AVL-01 | Sport ITSM MUST be available to log and view tickets **24×7**, since competitions run outside business hours. Target service availability: **99.5% monthly**, excluding announced maintenance. |
| NFR-AVL-02 | Sport ITSM MUST be treated as a critical service in its own right: an outage of Sport ITSM removes the only governed channel through which platform failures can be reported, so its own availability target is not subordinate to SCMS activity levels. |
| NFR-AVL-03 | Ticket intake MUST remain functional in a degraded mode if optional subsystems (knowledge search, reporting, notifications) are unavailable: no user must be prevented from logging an Incident. |
| NFR-AVL-04 | Planned maintenance MUST be announced in advance via the Self-Service Portal and notification channels, with a stated start, expected duration and affected functionality. |
| NFR-AVL-05 | SLA timers MUST remain accurate across system restarts; no elapsed time may be lost or double-counted. |

### 8.2 Performance & responsiveness (behavioral expectations)

| ID | Requirement |
| --- | --- |
| NFR-PRF-01 | Ticket submission from the Self-Service Portal MUST complete within a perceived time acceptable to an end user under normal load (target: under 3 seconds to acknowledgment with reference number). |
| NFR-PRF-02 | The agent work list and ticket view MUST load fast enough to sustain first-line handling during peak match-day volume (target: under 2 seconds). |
| NFR-PRF-03 | The system MUST sustain demand surges without rejecting intake; queuing and graceful degradation are acceptable, data loss is not. |
| NFR-PRF-04 | SLA warning and breach events MUST be raised within one minute of the threshold being crossed. |

### 8.3 Security & access

| ID | Requirement |
| --- | --- |
| NFR-SEC-01 | All access MUST be authenticated; there is no anonymous ticket submission. |
| NFR-SEC-02 | Authorization MUST be enforced on every operation server-side; UI concealment alone is not sufficient. |
| NFR-SEC-03 | Requesters MUST NOT be able to read tickets, comments or personal data belonging to other requesters. |
| NFR-SEC-04 | Internal work notes MUST never be exposed to requesters through any channel, including notifications and exports. |
| NFR-SEC-05 | Credentials and secrets MUST never be stored or transmitted in readable form, and MUST never appear in tickets, comments or the audit trail. |
| NFR-SEC-06 | Privileged administrative operations MUST be restricted to System Administrator and MUST be fully audited. |
| NFR-SEC-07 | Personal data of players and officials MUST be limited to what is necessary for support, and MUST be subject to deletion/anonymization on a lawful request, without destroying the integrity of the audit trail (pseudonymization is acceptable). |

### 8.4 Auditability & compliance

| ID | Requirement |
| --- | --- |
| NFR-AUD-01 | Every record MUST be fully reconstructable: what happened, when, by whom, in what order. |
| NFR-AUD-02 | No role may alter or erase history; corrections are made by new entries, never by mutation. |
| NFR-AUD-03 | SLA breach, approval and Change authorization records MUST be tamper-evident and retained for the defined retention period. |
| NFR-AUD-04 | The system MUST be able to produce, for any competition, the complete list of Incidents, Changes and Releases that affected it in a period. |

### 8.5 Internationalization & localization

| ID | Requirement |
| --- | --- |
| NFR-I18N-01 | All user-facing text MUST be localizable; no user-facing string may be hardcoded in a single language. |
| NFR-I18N-02 | The system MUST support at least English and Spanish at launch, with the language selected from the user's preference or request context. |
| NFR-I18N-03 | Dates, times and durations MUST be presented in the user's locale and time zone, while being stored and computed unambiguously; SLA calculations MUST be time-zone correct for competitions in different regions. |
| NFR-I18N-04 | Notification templates and Knowledge Articles MUST support per-language variants, with a defined fallback language. |
| NFR-I18N-05 | Reference data (categories, priorities, states, catalog offerings) MUST be translatable without changing its stable identifier. |

### 8.6 Usability & accessibility

| ID | Requirement |
| --- | --- |
| NFR-USE-01 | A requester with no ITSM knowledge MUST be able to submit a correctly categorized ticket without training; ITSM vocabulary MUST be hidden or explained on requester-facing surfaces. |
| NFR-USE-02 | An agent MUST be able to log a phone-reported Incident in a single, uninterrupted flow. |
| NFR-USE-03 | User interfaces MUST meet WCAG 2.1 level AA. |
| NFR-USE-04 | Requester-facing surfaces MUST be usable on mobile devices, since officials and organizers operate from venues. |
| NFR-USE-05 | Every error presented to a user MUST state what happened and what to do next; silent failures are not acceptable. |

### 8.7 Data quality, retention & scalability

| ID | Requirement |
| --- | --- |
| NFR-DAT-01 | Ticket reference numbers MUST be unique, immutable and never reused. |
| NFR-DAT-02 | Records MUST be retained for a configurable retention period (default: 24 months of operational access, longer for Change/Release authorization evidence). |
| NFR-DAT-03 | Reference data changes (e.g., renaming a category) MUST NOT retroactively alter historical reporting semantics. |
| NFR-DAT-04 | The system MUST support growth in competitions, users and ticket volume without change to the functional model — season-over-season growth is expected and seasonal peaks are the norm. |
| NFR-DAT-05 | Bulk operations by agents/administrators MUST be transactional and fully audited. |

### 8.8 Configurability & operability

| ID | Requirement |
| --- | --- |
| NFR-CFG-01 | Categories, the Impact × Urgency priority matrix, SLA policies, catalog offerings, workflows, approval chains, notification templates and roles MUST be configurable by a System Administrator without a software release. |
| NFR-CFG-02 | Configuration changes MUST take effect on new records without corrupting in-flight records governed by the previous configuration. |
| NFR-CFG-03 | The system MUST expose its own operational health so that Sport ITSM outages are detectable independently of user reports. |

---

## 9. Success Metrics & KPIs

### 9.1 Standard ITSM KPIs

| KPI | Definition | Baseline | Target (12 months post-launch) |
| --- | --- | --- | --- |
| **FCR — First Contact Resolution** | % of Incidents resolved by L1 at first interaction without reassignment | n/a (no measurement today) | ≥ 60% |
| **MTTA — Mean Time to Acknowledge/Respond** | Mean elapsed time from ticket creation to first agent response | n/a | ≤ 15 min (P1), ≤ 4 h (P3/P4) |
| **MTTR — Mean Time to Resolution** | Mean elapsed time from creation to `Resolved`, net of clock-stopping pending states | n/a | ≤ 4 h (P1), ≤ 3 business days (P3) |
| **SLA Compliance Rate** | % of tickets meeting both response and resolution targets | n/a | ≥ 95% overall; ≥ 98% for P1 |
| **Reopen Rate** | % of resolved tickets rejected/reopened within the confirmation period | n/a | ≤ 5% |
| **Backlog Volume & Ageing** | Open tickets and % older than target age | n/a | ≤ 10% of backlog older than 2× resolution target |
| **CSAT** | Mean post-closure satisfaction score | n/a | ≥ 4.2 / 5 with ≥ 25% response rate |
| **Agent Productivity** | Tickets resolved per agent per period, contextualized by complexity | n/a | Trend-monitored, not target-driven |
| **Knowledge-assisted resolution** | % of resolutions citing a Knowledge Article | n/a | ≥ 40% |

### 9.2 Domain KPIs (competition-specific)

| KPI | Definition | Target |
| --- | --- | --- |
| **Time-to-restore for competition-impacting Incidents** | MTTR restricted to Incidents flagged by an agent as affecting a competition in progress (FR-INC-05) | ≤ 60 min |
| **Competition-impacting Incident share** | % of Incidents flagged as affecting a competition in progress, and their SLA Compliance Rate | Downward volume trend; ≥ 98% SLA Compliance on this subset |
| **Major Incident rate** | Major Incidents declared per 1,000 Incidents | Downward trend |
| **Registration / payment request resolution time** | MTTR for the billing & registration-payment offering | ≤ 8 h |
| **Self-service deflection rate** | % of portal sessions resolved by knowledge without ticket submission | ≥ 25% |
| **Change Success Rate** | % of implemented Changes closed as `Successful` or `Successful with issues` | ≥ 95% |
| **Change-induced Incident rate** | % of Incidents attributed to a recent Change | ≤ 5% |
| **Emergency change ratio** | % of Changes of type Emergency | ≤ 10% |
| **Unauthorized change rate** | Changes/Releases implemented without a recorded authorization decision | **0** |
| **Release lead time** | Mean elapsed time from first linked Change authorization to verified deployment | Downward trend |
| **Repeat Incident rate** | % of Incidents matching an existing Known Error | ≤ 15%, downward |

### 9.3 Product adoption metrics

| Metric                                                                     | Target                  |
| -------------------------------------------------------------------------- | ----------------------- |
| % of support demand entering through governed channels (vs. informal)      | ≥ 90% within 2 quarters |
| % of tickets with a valid category and affected subject at closure         | ≥ 98%                   |
| % of platform Changes executed through a Change record                     | **100%**                |
| Portal active requesters as % of active SCMS users in the reporting period | ≥ 30%                   |

---

## 10. Assumptions

| # | Assumption | Impact if false |
| --- | --- | --- |
| A1 | Service Desk Agents are trained and competent to assess competition impact from the ticket description and the affected subject, and to apply the competition-in-progress Impact flag consistently. | Prioritization quality degrades and the flag becomes noise; mitigated by justification capture, audit and periodic calibration review (see R8). |
| A2 | An identity provider / SSO exists for SCMS users and can supply identity and basic profile attributes. | Sport ITSM must own local accounts; onboarding friction and duplicate identity management. |
| A3 | Personas and entitlement tiers used by SCMS (Player/Competitor, Team Manager, Tournament Organizer, Referee/Match Official, League Administrator) are available to drive catalog eligibility and ticket visibility. | Eligibility rules must be maintained manually in Sport ITSM. |
| A4 | A support organization exists with at least an L1 Service Desk function and an L2/L3 application support group with defined coverage. | SLA targets cannot be underpinned by OLAs; targets become aspirational. |
| A5 | The SCMS engineering organization is willing to route **all** platform modifications through Change Management. | Change Success Rate and change-induced Incident metrics become unreliable; the governance value proposition weakens. |
| A6 | Deployment tooling can report deployment outcomes for Release and CMDB version updates (manually at first, automated later). | CMDB drift; manual reconciliation effort. |
| A7 | The service organization provides coverage consistent with the support schedule declared in its P1/P2 SLA policies (24×7 or on-call). | P1 response and resolution targets cannot be met and must be renegotiated downward. |
| A8 | Competitions may span multiple time zones and languages. | i18n and time-zone requirements are already accounted for (§8.5). |
| A9 | Historical support data is not migrated; Sport ITSM starts from a clean baseline. | Baselines in §9 must be established during the first operating quarter. |

---

## 11. Constraints

| # | Constraint |
| --- | --- |
| K1 | **Scope constraint:** Sport ITSM must not implement or replicate SCMS competition functionality; the sporting operation stays inside SCMS (§3). |
| K2 | **Terminology constraint:** all artifacts and user-facing agent surfaces use standard ITSM terminology; requester-facing surfaces simplify without contradicting it. |
| K3 | **Specification constraint:** product behavior is specified in OpenSpec capability specs; behavior is never defined in operational or engineering documents. |
| K4 | **Auditability constraint:** no capability may be designed in a way that allows history to be altered or deleted. |
| K5 | **Authorization constraint:** no Change or Release may be implemented without a recorded authorization decision and a rollback plan. Sport ITSM defines no time-based deployment prohibition (no freeze windows). |
| K6 | **Entitlement constraint:** Service Requests exist only for offerings published in the Service Catalog with defined eligibility; there is no free-form "request anything" path. |
| K7 | **Single-tenant assumption for MVP:** one service organization supporting one SCMS platform instance; multi-tenant/multi-customer support is out of scope for the initial releases. |
| K8 | **Delivery constraint:** the initial delivery is an academic/portfolio-scale project with limited capacity; MVP scope must be defensible and demonstrable end to end rather than broad and shallow. |
| K9 | **Compliance constraint:** processing of personal data of players and officials must respect applicable data protection law (lawful basis, minimization, erasure/pseudonymization rights). |

---

## 12. Dependencies & Integrations

| # | Dependency | Purpose | Criticality |
| --- | --- | --- | --- |
| D1 | **SCMS identity provider / SSO** | Authentication and persona/entitlement attributes | High |
| D2 | **SCMS competition reference data** | Read-only lookup of competition instances (Tournament, League, Fixture…) so a ticket can name its affected subject accurately. Sport ITSM consumes identifiers and labels only — it does **not** consume or maintain a competition calendar and derives no time-based service policy from it. | Medium (free-text fallback acceptable) |
| D3 | **SCMS ranking / standings engine** | Affected-subject context and impact analysis for standings Incidents | Medium |
| D4 | **Payment & registration subsystem** | Context for billing/registration-payment Incidents and Requests | Medium |
| D5 | **Participant notification channels (email, push, in-app)** | Delivery of Sport ITSM notifications through channels users already use | High |
| D6 | **CI/CD pipeline and environment tooling** | Feeding Change, Release and CMDB records with deployment facts | Medium (manual fallback acceptable in MVP) |
| D7 | **Email gateway** | Email-to-ticket intake and email notifications | Medium |
| D8 | **Service organization operating model** | Resolver groups, coverage schedules, on-call rota underpinning OLAs | High |

---

## 13. Risks & Mitigations

| # | Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | **Scope creep into sport operations** — stakeholders ask Sport ITSM to manage reschedules, disputes or rosters | High | High | Enforce the scope rule at intake (FR-INC-15); PO rejects/reframes such demand; publish deflection Knowledge Articles. |
| R2 | **P1 targets unachievable outside business hours** — no on-call coverage underpins the published SLA | Medium | High | Confirm A4/A7 with the service organization; define OLAs before publishing SLA targets; degrade the declared support schedule transparently rather than breaching. |
| R3 | **Change bypass** — engineering deploys without a Change record | Medium | High | 100% Change coverage KPI; unauthorized change rate with zero tolerance; deployment evidence reconciliation via CMDB. |
| R4 | **CMDB decay** — configuration data becomes stale and impact analysis misleads triage | High | Medium | Keep the MVP CI model deliberately small; update CI versions on Release deployment (FR-REL-05); drift flagging (FR-CMD-07). |
| R5 | **Low portal adoption** — users keep using informal channels | Medium | High | Make the portal the fastest path; omnichannel intake so informal channels are captured as tickets; adoption KPI in §9.3; stakeholder communication. |
| R6 | **Knowledge Base neglect** — articles go stale, deflection never materializes | Medium | Medium | Article rating and stale-article review (FR-KNW-07); create-from-resolution flow (FR-KNW-10); deflection KPI. |
| R7 | **Over-configuration complexity** — the configurability requirement produces an unusable admin surface | Medium | Medium | Ship opinionated defaults; expose configuration progressively across phases. |
| R8 | **Priority inflation** — every requester claims P1, or agents apply the competition-in-progress flag indiscriminately | High | Medium | Priority derived from the Impact × Urgency matrix, never from requester choice; the flag is agent-only, requires justification and is audited (FR-INC-05); the flag's usage share is itself a monitored KPI (§9.2) and is reviewed periodically for calibration. |
| R9 | **Metric gaming / unreliable KPIs** — premature closure to protect SLA | Medium | Medium | Reopen Rate and CSAT as counterweights; auto-close only after a confirmation period; immutable breach records. |
| R10 | **Competition reference data unavailable from SCMS** — the affected subject cannot be selected from a controlled list | Medium | Low | Free-text capture of the affected competition instance as an MVP fallback; controlled lookup introduced later without changing the ticket model. |
| R11 | **Time-zone and locale errors distort SLA measurement** | Medium | Medium | Explicit NFR-I18N-03; time-zone correctness treated as an acceptance criterion for SLA stories. |
| R12 | **Personal data exposure across requesters** | Low | High | NFR-SEC-03/04 enforced server-side; tested explicitly as acceptance criteria. |

---

## 14. Phased Release Plan & MVP Definition

### 14.1 Prioritization method

Backlog ordering uses **WSJF-style value/effort reasoning** (Cost of Delay = business value + risk reduction + time criticality, divided by effort), with **MoSCoW** applied inside each phase. Explicit ordering criteria, in precedence order:

1. **Event protection** — does it reduce time-to-restore for Incidents affecting a competition in progress, or prevent such failures occurring at all?
2. **Lifecycle integrity** — is it required for a ticket to have a complete, auditable lifecycle?
3. **Accountability** — does it make a commitment measurable (SLA, approval, audit)?
4. **Deflection & efficiency** — does it reduce avoidable demand or manual handling?
5. **Insight** — does it produce the KPIs required to steer the service?
6. **Effort and dependency risk** — lower effort and fewer external dependencies break ties.

### 14.2 Phase 0 — Foundations (enabler, no standalone user value)

Identity & Access (FR-IAM-01/02/03/05), core ticket record and reference numbering, categorization taxonomy, Resolver Groups, audit trail (FR-AUD-01/02/03/04), localization foundation (NFR-I18N-01/02).

_Exit criterion:_ an authenticated user with a role exists, and every action taken is auditable.

### 14.3 Phase 1 — **MVP: "Log it, prioritize it, resolve it, prove it"**

**Goal:** replace fragmented support with one governed, measurable Incident and Service Request operation in which competition impact is deliberately assessed and reflected in Priority.

| Capability | MVP inclusion |
| --- | --- |
| **Incident Management** | Full lifecycle FR-INC-01 → 13, FR-INC-18. Portal + agent-logged intake. |
| **Major Incident Management** | FR-MIM-01, 02, 03 (declaration, protocol, child linking). |
| **Service Request Management** | FR-SRQ-01 → 09, 11, for the six MVP catalog offerings. |
| **Service Catalog** | FR-CAT-01 → 05. |
| **SLA Management** | FR-SLA-01 → 08, 10, with targets per service and priority and recalculation on agent-driven Priority change (FR-SLA-04). |
| **Approval Engine** | FR-APR-01, 02, 03, 07. |
| **Knowledge & Portal** | FR-KNW-01 → 05, 08. |
| **Workflow & Automation** | FR-WFL-01, 02, 03, 05, 06. |
| **Assignment & Queues** | FR-QUE-01, 02, 03. |
| **Notifications** | FR-NOT-01 → 05, 08 (in-app mandatory, email if available). |
| **Reporting** | FR-RPT-01, 02, 05, 07. |
| **Audit** | FR-AUD-01 → 05. |

**Explicitly excluded from MVP:** Problem, Change, Release, CMDB, email-to-ticket, skill-based assignment, delegation, deflection measurement, CSAT automation beyond basic capture.

**MVP acceptance (definition of "MVP is done"):**

- A referee can report a scoring failure while officiating; an agent flags it as affecting a competition in progress with justification, the Impact × Urgency matrix yields P1, the P1 SLA targets are recalculated and start, the ticket escalates on the SLA warning, and the referee receives resolution and confirms it — end to end, audited.
- A team manager can request organizer access, get it approved and fulfilled, and see the approval trail.
- A service owner can read SLA Compliance, MTTA, MTTR, FCR, Reopen Rate and backlog for a period.
- 100% of MVP tickets carry a category, affected subject, priority, SLA policy and complete history.

### 14.4 Phase 2 — Platform evolution governance

**Goal:** bring SCMS changes under control and stop change-induced Incidents.

- **Change Management** (FR-CHG-01 → 06, 08 → 10, 12; FR-CHG-07 retired) including risk assessment, CAB authorization, the change schedule and CI-level conflict detection.
- **Release & Deployment Management** (FR-REL-01 → 06).
- **Asset & Configuration Management** (FR-CMD-01 → 06) with the minimum viable CI model and impact analysis.
- **Problem Management** (FR-PRB-01 → 07) with RCA and KEDB.
- Process dashboards (FR-RPT-03).
- Approval delegation and reminders (FR-APR-04, 05).

_Exit criterion:_ no SCMS deployment reaches production without an authorized Change and a Release record; recurring Incidents converge on Problems.

### 14.5 Phase 3 — Scale, deflection & experience

- Omnichannel expansion: email-to-ticket and in-app intake (FR-OMN-01 email/in-app, FR-OMN-03).
- Knowledge maturity: deflection measurement, ratings, stale-article review, create-from-resolution (FR-KNW-06, 07, 10).
- Automation depth: skill-based and round-robin assignment (FR-WFL-04), automated fulfillment (FR-SRQ-10), duplicate detection (FR-INC-17), recurrence-based Problem proposal (FR-PRB-08).
- Domain KPI dashboards (FR-RPT-04), export (FR-RPT-06).
- Major Incident maturity: communication cadence, post-review gate, portal status page (FR-MIM-04, 05, 06).
- Ticket type conversion (FR-INC-14), OLAs and underpinning targets (FR-SLA-09), competition-scoped portal visibility (FR-KNW-09).

### 14.6 Phase 4 — Continual Service Improvement (candidate, not committed)

Proactive Problem Management (FR-PRB-09), configuration drift detection (FR-CMD-07), asset lifecycle (FR-CMD-08), CAB quorum rules (FR-APR-06), notification preferences (FR-NOT-07), CSAT/NPS programme, multi-tenant support.

### 14.7 Traceability

| Phase | Business objective served | Primary KPIs moved |
| --- | --- | --- |
| Phase 1 (MVP) | Operational consistency, event protection, accountability, experience | FCR, MTTA, MTTR, SLA Compliance, Reopen Rate, time-to-restore for competition-impacting Incidents |
| Phase 2 | Controlled platform evolution, repeat-failure elimination | Change Success Rate, change-induced Incident rate, unauthorized change rate, repeat Incident rate |
| Phase 3 | Efficiency, deflection, experience at scale | Self-service deflection rate, agent productivity, CSAT, Major Incident rate |
| Phase 4 | Continual Service Improvement | All trends; predictive risk reduction |

---

## 15. Definition of Ready / Definition of Done

### 15.1 Definition of Ready (a story may enter a Sprint when…)

1. It states a **persona**, a **goal** and a **business value** in the form `As a <persona> / I want <goal> / So that <business value>`.
2. It is traceable to a **business objective** (§1, §2) and to a **capability** (§5) and a functional requirement ID (§7).
3. It has **testable Gherkin acceptance criteria** covering the happy path, at least one alternative path and at least one negative/edge case.
4. Business rules, validation rules and required data attributes are stated.
5. Its respect of the **scope rule** (§3) is explicit — it does not model an in-application sport decision.
6. Non-functional expectations that apply (audit, i18n, access, availability) are named.
7. Dependencies (other stories, external systems in §12) are identified and not blocking.
8. It is sized by the team and small enough to complete within one Sprint.
9. Localization needs (user-facing strings, notification templates) are identified.
10. No open clarifying question remains with the Product Owner.

### 15.2 Definition of Done (a story is accepted when…)

1. All acceptance criteria pass, verified by automated tests where the criteria are automatable.
2. Behavior matches the approved OpenSpec spec delta; the delta is behavior-only and validates.
3. Access control is enforced and verified for every role touched by the story.
4. All state transitions and field changes produced by the story are recorded in the audit trail.
5. No user-facing string is hardcoded; all strings are localizable and translated into the launch languages.
6. SLA, notification and approval side effects (where applicable) are correct and observable.
7. Error and empty states are defined and implemented; no silent failure.
8. Accessibility (WCAG 2.1 AA) is verified on new user-facing surfaces.
9. Documentation is updated: capability spec, and Knowledge Article where the story changes user-visible behavior.
10. The Product Owner has reviewed the behavior against the acceptance criteria and accepted it.

---

## 16. Glossary

| Term | Definition |
| --- | --- |
| **CAB** | Change Advisory Board — the authorizing body for Normal Changes. |
| **CI / Configuration Item** | A component of the SCMS platform tracked in the CMDB. |
| **CMDB** | Configuration Management Database — CIs and their relationships. |
| **CSAT** | Customer Satisfaction score, captured post-closure. |
| **CSI** | Continual Service Improvement. |
| **FCR** | First Contact Resolution — resolved by L1 at first interaction. |
| **Competition-in-progress flag** | An agent-set indicator, with mandatory justification, that a ticket affects a competition currently under way; raises the assessed Impact. |
| **Incident** | An unplanned interruption or reduction in quality of the SCMS platform. |
| **KEDB** | Known Error Database. |
| **Known Error** | A Problem with a documented root cause and/or workaround. |
| **Major Incident** | A high-impact Incident, typically disrupting a competition in progress, handled under an accelerated escalation and communication protocol. |
| **MTTA** | Mean Time to Acknowledge / first response. |
| **MTTR** | Mean Time to Resolution. |
| **OLA** | Operational Level Agreement — internal target underpinning an SLA. |
| **Problem** | The underlying cause of one or more Incidents. |
| **RCA** | Root Cause Analysis. |
| **Release** | A packaged, deployable set of authorized Changes to the SCMS platform. |
| **Resolver Group** | A support group responsible for a category of work. |
| **SCMS** | Sports Competition Management System — the supported service. |
| **Service Offering** | A concrete, requestable variant of a Service published in the catalog. |
| **Service Request** | A request for a standard, pre-approved, entitled platform service. |
| **SLA** | Service Level Agreement — response/resolution commitment. |
| **SPOC** | Single Point of Contact — the Service Desk's role for platform users. |
