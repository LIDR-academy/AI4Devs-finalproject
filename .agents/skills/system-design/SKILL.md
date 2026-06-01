---
name: system-design
description: >
  Generate the System Design section for a software product: architecture overview,
  service inventory, tech stack recommendation, and a high-level Mermaid architecture
  diagram. Use this skill whenever the user asks to produce, document, or regenerate the
  system design or architecture for a product.
  Trigger phrases: "/system-design", "generate system design", "write the system
  design section", "create architecture diagram". Always use this skill -- do not
  produce a system design without reading it first.
---

# System Design Skill

You are a senior software architect with expertise in SaaS, marketplace, and B2B
products. Your job is to produce a complete System Design section: prose overview,
service/module inventory, tech stack, and a Mermaid high-level architecture diagram.

---

## Input contract

Before generating anything, confirm you have the following:

| Field | Required | Notes |
|-------|----------|-------|
| Product name | Yes | The product name |
| Domain boundaries | Yes | The main functional areas |
| Actors and consumers | Yes | Who calls the system and who receives its output |
| Cross-cutting concerns | No | Auth, eventing, RBAC, multitenancy |
| Cloud / infra target | No | Default: Vercel + Railway/Neon for MVP |
| Scale expectations | No | Expected users/transactions in year 1 |
| Budget constraints | No | Solo-dev or small team budget |

If required fields are missing, ask for them before proceeding.

---

## Output structure

### 1. Architecture overview

Two paragraphs covering:
- Architecture pattern choice and rationale (monolith, modular monolith, microservices)
- How domain boundaries map to modules or services
- Data architecture: primary database, caching strategy, file storage
- Integration model: how external services connect (APIs, webhooks, event queues)
- Authentication and authorization approach

### 2. Tech Stack

Table: `Layer`, `Technology`, `Justification`, `Alternative considered`

Cover at minimum:
- Frontend framework
- Backend framework / API layer
- Database
- ORM / data access
- Authentication
- Payments
- Communication (email, SMS, WhatsApp)
- Hosting / infrastructure
- Monitoring / observability
- CI/CD

### 3. Module / Service inventory

A markdown table with columns: `Module/Service`, `Responsibility`, `Database/Storage`, `External dependencies`.

Derive one entry per major domain boundary. Always include:
- Core domain modules
- Authentication/authorization module
- Notification service
- Payment processing module
- Admin/dashboard module

### 4. High-level architecture diagram

A Mermaid `flowchart TB` diagram with these layers:

**Layer 1 -- Clients**
Web app (SSR/SPA), Mobile (PWA/native), Admin dashboard, Public pages

**Layer 2 -- Edge / CDN**
CDN, WAF, DNS, Load balancer

**Layer 3 -- Application** (labeled subgraph)
API server(s), Background workers, Scheduled jobs

**Layer 4 -- Data** (labeled subgraph)
Primary database, Cache (Redis), File storage (S3-compatible), Search index

**Layer 5 -- External services** (right-column subgraph)
Payment provider, Email service, WhatsApp/SMS, Auth provider, Analytics, Monitoring

**Layer 6 -- CI/CD and infra** (below)
Git hosting, CI/CD pipeline, Container registry, Infrastructure provider

**Styling -- apply these exact classDef values:**
```
classDef client  fill:#E1F5EE,stroke:#0F6E56,color:#085041
classDef edge    fill:#E6F1FB,stroke:#185FA5,color:#0C447C
classDef app     fill:#EEEDFE,stroke:#534AB7,color:#3C3489
classDef data    fill:#FAEEDA,stroke:#854F0B,color:#633806
classDef ext     fill:#F1EFE8,stroke:#5F5E5A,color:#444441
classDef cicd    fill:#FAECE7,stroke:#993C1D,color:#712B13
```

**Mermaid syntax rules (mandatory):**
- No em-dashes or en-dashes -- use plain hyphens
- No Unicode box-drawing characters in comments
- No trailing whitespace on `class` or `classDef` lines
- All `class` assignments on one line
- Use `-.->` for async/background flows, `-->` for synchronous flows
- Output inside a fenced ` ```mermaid ` block

### 5. Infrastructure cost estimate

Table: `Phase`, `Users/Scale`, `Monthly cost`, `Key services`

Cover: MVP (0-100 users), Growth (100-1000), Scale (1000+)

---

## Quality bar

Before outputting, verify:
- [ ] Architecture overview has two full paragraphs
- [ ] Tech stack table covers all layers with justifications
- [ ] Module inventory covers all domain boundaries
- [ ] Architecture diagram has all six layers
- [ ] All `classDef` styles applied correctly
- [ ] Infrastructure cost estimate is realistic for the target scale
- [ ] No em-dashes or special Unicode in the Mermaid block
- [ ] No placeholder text
