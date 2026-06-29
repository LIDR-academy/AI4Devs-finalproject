> Detail in this section the main prompts used during the creation of the project, justifying the use of code assistants across all phases of the development life cycle. We expect a maximum of 3 per section, mainly the ones for initial creation or the ones for correcting or adding the functionalities you consider most relevant.
You may additionally add the full conversation as a link or attached file if you consider it appropriate.

> **Note (Delivery 2).** **Delivery 1** (documentation) was generated with an orchestrated **multi-agent system** (7 agents + 7 skills), master prompt in [prompt-sistema-multi-agente.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/prompt-sistema-multi-agente.md). **Delivery 2** (MVP) was developed with **Claude Code** in a **spec-driven (OpenSpec)** flow and one Linear ticket per unit of work. The full prompt log (Delivery 1 + Delivery 2, per area) is in the [project's prompts.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/prompts.md) and the decision log in [docs/Decisiones-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Decisiones-PeredaHR.md). Below, the key prompts of Delivery 1 are kept and the most relevant ones of Delivery 2 are added.

## Index

1. [Product overview](#1-product-overview)
2. [System architecture](#2-system-architecture)
3. [Data model](#3-data-model)
4. [API specification](#4-api-specification)
5. [User stories](#5-user-stories)
6. [Work tickets](#6-work-tickets)
7. [Pull requests](#7-pull-requests)

---

## 1. Product overview

**Prompt 1:**
"Create the agents needed to generate PeredaHR's documentation (Senior Product Manager with 12 years in HR and time-tracking products, use case expert, data modeling architect, systems design and C4 diagrams expert, orchestrator and quality reviewer) and the associated skills. For any uncertainty in a decision, consult me, the user."

**Prompt 2:**
"Generate PeredaHR's PRD strictly following the `Estructura PRD.md` template, using the already-existing software description as the primary source, enriching it only where it is ambiguous and explicitly flagging the inferences. The final artifacts must contain no reference to the product from which the initial information was extracted."

**Prompt 3:**
"I want all the detail of the functional modules (employee and administrator) to appear as captured in the software description, not summarized."

---

## 2. System Architecture

### **2.1. Architecture diagram:**

**Prompt 1:**
"Design PeredaHR's architecture with the C4 model (levels 1-3: Context, Container, Component) in Mermaid, justifying the chosen pattern, its benefits and trade-offs."

**Prompt 2:**
"Fix the technology stack: full-stack TypeScript (Next.js + NestJS + Prisma), PostgreSQL + pgvector and OpenAI (GPT-4o + text-embedding-3). Present it as a closed decision so as not to interrupt the later flow."

### **2.2. Description of the main components:**

**Prompt 1:**
"Split the solution into containers: web (Next.js/PWA), API (NestJS with RBAC), synchronization worker (ETL) and AI service (RAG + Text-to-SQL with guardrails)."

### **2.3. High-level project description and file structure**

**Prompt 1:**
"Physically create the agent and skill files before invoking them, since they must be inspectable as project delivery evidence; organize them under /agents, /skills and /docs."

### **2.4. Infrastructure and deployment**

**Prompt 1 (Delivery 2):**
"Deployment is on-premise on the internal Windows server (GDPR: BioStar biometrics and geolocation must stay on the company's infrastructure); the reviewer connects via RDP/Terminal Server. The corporate firewall blocks Docker Hub: always use `mirror.gcr.io`/`quay.io` for the base images, in Dockerfiles, compose and CI."

**Prompt 2 (Delivery 2):**
"Deployment via a one-command PowerShell script (`deploy.ps1`): `migrate deploy` (never `migrate dev`), idempotent seed, `up` and an E2E smoke acting as a gate; CI on GitHub Actions (typecheck, lint, tests, build) and backups with `pg_dump` + offsite copy."

### **2.5. Security**

**Prompt 1:**
"Apply security by design: OAuth2/OIDC, RBAC with 3 roles, encryption in transit and at rest, and exclusion of sensitive PII (DNI, NSS, geolocation) from Text-to-SQL via a whitelist; the RAG must answer 'not on record' if there is no evidence."

### **2.6. Tests**

**Prompt 1 (Delivery 2):**
"Do not consider a ticket done without green tests and, when it is a user flow, a hot verification against local Postgres+API; report the real result, not what should happen. Cover domain logic (clock-entry pairing, workday consolidation, balances) with unit tests and integration with real guards and RBAC."

---

## 3. Data Model

**Prompt 1:**
"Start from the 7 root entities (Employee, Center, Department, Schedule, WorkCalendar, LeaveType, CollectiveAgreement), derive those of the critical flows (ClockEntry, WorkDay, LeaveRequest, ApprovalLog, LeaveAllocation) and model them in Mermaid erDiagram with types, keys and cardinalities, plus a data dictionary with a PII indicator."

**Prompt 2:**
"Flag DNI, NSS and geolocation as sensitive PII and exclude them from the Text-to-SQL whitelist; document the exclusions."

**Prompt 3:**
"The Data Architect is the naming authority: consolidate the canonical names of entities and attributes in the glossary."

---

## 4. API Specification

**Prompt 1:**
"Include a high-level API contract outline per resource and role (e.g. POST /api/clock-entries, POST /api/leave-requests, GET /api/reports/monthly-journey); the formal OpenAPI detail is left for Delivery 2."

**Prompt 2 (Delivery 2):**
"Implement the REST endpoints in NestJS with global JWT+RBAC guards: clocking seals the `ts` on the server and is immutable for the employee; the report `GET /api/reports/monthly-journey` (ADMIN only) totals the frozen WorkDay records without recomputing and exports native CSV (RFC 4180) + client-side PDF, never with DNI/NSS."

---

## 5. User Stories

**Prompt 1:**
"Write the user stories in the format 'As a [role], I want [action], so that [benefit]' with acceptance criteria in Gherkin and MoSCoW prioritization, traceable to the software description."

**Prompt 2:**
"Correction: employees cannot confirm pending workdays; it must be a profile with an Administrator or HR role. The employee can only record clock in/out, without any possibility of modifying them (immutable clocking)."

---

## 6. Work Tickets

**Prompt 1:**
"Derive three development tickets from the E2E flow stories (one backend, one frontend and one database) with objective, detail, acceptance criteria and Definition of Done."

**Prompt 2 (Delivery 2):**
"Each ticket starts with `/opsx:propose 'PER-XX …'`: I want to review the intent (proposal/design/tasks) and the open decisions before generating code; then `/opsx:apply` and on closing `/opsx:archive`. Drive the cycle in Linear (In Progress → In Review → Done) without me asking."

---

## 7. Pull Requests

**Prompt 1:**
"Initialize the git repository, create the feature-entrega1-FSF branch and prepare the commit of the documentation artifacts, excluding the source material that contains the name of the replaced product."

**Prompt 2:**
"Complete the readme.md and the prompts.md of the course repository template, linking to the real artifacts of the project's private repository, and push them on the feature-entrega1-FSF branch."

**Prompt 3 (Delivery 2):**
"One PR per ticket into the delivery branch `feature-entrega2-FSF`, with `Closes PER-XX` in the body; at the end, group the MVP in a delivery PR (`feature-entrega2-FSF` → `main`, PR #12). In the course's public repo, update the readme.md to Delivery 2 pointing to the private one (branch `feature-entrega2-FSF`) and open the intra-fork PR against its own `main`."
