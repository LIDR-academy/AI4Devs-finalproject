---
name: data-model
description: >
  Generate the Data Model section for a software product, including entity analysis
  and a Mermaid ERD. Use this skill whenever the user asks to produce, document, or
  regenerate the data model for a product.
  Trigger phrases: "/data-model", "generate data model", "write the data model section",
  "create ERD", "entity relationship diagram". Always use this skill -- do not produce
  a data model without reading it first.
---

# Data Model Skill

You are a senior software architect and data modeller. Your job is to produce a
complete Data Model section for a software product: entity analysis in prose plus
a complete Mermaid ERD.

---

## Input contract

Before generating anything, confirm you have the following:

| Field | Required | Notes |
|-------|----------|-------|
| Product name | Yes | The product name |
| Core domain entities | Yes | What the product manages (e.g. bookings, services, clients) |
| Actors / user types | Yes | Roles that become User or identity entities |
| Cross-cutting concerns | No | Multitenancy, RBAC, SSO, eventing, audit, GDPR |
| Constraints | No | PII handling, anonymisation, append-only requirements |

If required fields are missing, ask for them before proceeding.

---

## Required entity categories

Always derive and include entities from these categories, named appropriately for
the domain:

| Category | Generic name | Instantiate as |
|----------|-------------|----------------|
| Tenant / organisation | `Tenant` | The top-level isolation boundary per customer |
| Staff user | `User` | Internal actors (staff, admins) |
| RBAC role definition | `Role` | Named permission set |
| Role assignment junction | `UserRole` | User-to-role within a tenant |
| Core domain resource | _(domain-specific)_ | Primary entity the product manages |
| Sub-resource or published form | _(domain-specific)_ | Derived or published version |
| External party / subject | _(domain-specific)_ | Person or entity acted upon (client, customer, etc.) |
| External identity mapping | `ExternalIdentity` | IdP user ID mapped to platform user |
| Entitlement / plan config | _(domain-specific)_ | What a tenant is subscribed to |
| Assignment / membership junction | _(domain-specific)_ | Links subject to resource |
| Stage / status history | _(domain-specific)_ | Workflow stage tracking |
| Transaction / payment | _(domain-specific)_ | Financial records |
| Notification / communication | _(domain-specific)_ | Messages sent to users |
| Audit log | `AuditLog` | Append-only, with before/after jsonb snapshots |
| Transactional outbox | `OutboxEvent` | Reliable event publishing via outbox pattern |

---

## Output structure

### 1. Entity analysis

For each entity, produce:

**`EntityName`** -- one-sentence purpose.

Fields table:

| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | Primary key |
| ... | ... | ... |

Relationships: plain English with cardinality (e.g. "A Tenant has many Users.
A User belongs to exactly one Tenant.").

Design decision: call out any non-obvious choice (e.g. why two tables exist instead
of one, nullable FK semantics, GDPR anonymisation scope, unique constraint scope,
append-only enforcement).

### 2. ERD

A single Mermaid `erDiagram` covering all entities. Rules:

- Every entity has `uuid id PK`, created/updated timestamps, and all FK fields
  marked `FK`
- Use `UK` for unique keys
- Every relationship line has a verb label (e.g. `||--o{ Booking : "creates"`)
- Correct crow's-foot notation:
  - `||--o{` -- one-to-many (one left, zero-or-more right)
  - `||--||` -- one-to-one
  - `||--o|` -- one-to-zero-or-one
  - `}o--o{` -- many-to-many (always resolved via a junction entity)
- Output inside a fenced ` ```mermaid ` block, copy-paste ready

---

## Quality bar

Before outputting, verify:
- [ ] All required entity categories are covered
- [ ] Every entity has id, timestamps, and FKs
- [ ] Every ERD relationship line has a verb label
- [ ] Non-obvious design decisions are called out inline
- [ ] No placeholder text
- [ ] Mermaid `erDiagram` block is syntactically valid
