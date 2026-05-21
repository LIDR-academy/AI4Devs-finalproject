# Data Model

> Relational schema for ConstructFlow using PostgreSQL. See also the [Notion Data Model page](https://www.notion.so/32ab53fe56bb815bb356fe3b1593d727). The DBML block at the bottom can be pasted into [dbdiagram.io](https://dbdiagram.io) for an interactive view.

---

## Design Principles

- `company_id` on every tenant-scoped table — foundation for multi-tenancy
- Primary keys use **UUID v7** except lookup tables (SMALLSERIAL) and `audit_logs` (BIGSERIAL — append-only high-volume)
- Unit prices derived automatically from `stages.price_per_sqm × units.area`, unless `is_price_manual = true`
- `project_nodes` is a self-referencing adjacency list — variable depth depending on project structure (Torre, Manzana, Bloque, etc.)
- `quotations` never reserve a unit; only a contract with `reservation_paid_at` set moves a unit to `reserved`

---

## Entity Descriptions

| Entity | Description | Key attributes |
|--------|-------------|----------------|
| **companies** | Construction company using the platform. Foundation for multi-tenancy. | `id` UUID PK, `slug` unique (custom domain routing), `audit_log_enabled` boolean |
| **roles** | Lookup table for RBAC — admin, seller, employee | `id` SMALLSERIAL PK, `name` |
| **users** | Internal company employees | `id` UUID PK, `company_id` FK, `role_id` FK, `email` unique NOT NULL, `password_hash`, `is_active` |
| **projects** | A real estate development owned by a company | `id` UUID PK, `company_id` FK, `status` (planning / active / completed / cancelled) |
| **node_types** | Reusable hierarchy-level labels (e.g. Torre, Manzana, Bloque). Company-scoped with Colombia default seed (nullable `company_id` = global). | `id` SMALLSERIAL PK, `company_id` FK nullable, `sort_order` |
| **project_nodes** | Named hierarchy instances (e.g. "Torre A"). Self-referencing adjacency list via `parent_id`. Variable depth. | `id` UUID PK, `project_id` FK, `node_type_id` FK, `parent_id` FK nullable (null = root) |
| **units** | Leaf nodes — individual sellable units (apartment / parking / deposit / penthouse / house / other) | `id` UUID PK, `project_node_id` FK, `unit_type`, `status` (available / reserved / sold), `base_price`, `is_price_manual` |
| **stages** | Commercial phases (etapas) per project. `price_per_sqm` drives automatic unit price calculation. | `id` UUID PK, `project_id` FK, `price_per_sqm` NOT NULL, `starts_at`, `ends_at` |
| **unit_associations** | Links a primary unit (apartment/penthouse) to ancillary units (parking/deposit). `is_mandatory` flags bundled purchases. | `id` UUID PK, `unit_id` FK, `linked_unit_id` FK, `is_mandatory` boolean |
| **trust_entities** | Fiduciarias backing a project. Referenced on contracts when `payment_method = loan`. | `id` UUID PK, `project_id` FK, `nit` |
| **clients** | End customers tied to a company. `document_type`: cédula, cédula extranjería, pasaporte, NIT, tarjeta identidad. | `id` UUID PK, `company_id` FK |
| **quotations** | Price simulations for a client on a unit. Do NOT block or reserve the unit. `installment_simulation` stored as JSONB. | `id` UUID PK, `status` (draft / sent / expired / rejected), `expires_at` |
| **contracts** | The real commitment. Once `reservation_paid_at` is set, `unit.status` moves to `reserved`. | `id` UUID PK, `payment_method` (direct / loan), `status` (pending_reservation / active / completed / cancelled) |
| **installments** | Payment schedule rows linked to a contract. `paid_at` nullable — null means pending. | `id` UUID PK, `contract_id` FK, `due_date`, `amount`, `paid_at` nullable |
| **format_types** | Lookup table for template categories: promise_template, contract_template, handover_template, other | `id` SMALLSERIAL PK |
| **formats** | Document templates stored in Google Drive. Company-scoped. | `id` UUID PK, `company_id` FK, `format_type_id` FK, `google_id` (Drive file ID) |
| **documents** | Individual documents generated from a template or uploaded manually. Linked to a contract OR quotation (not both). | `id` UUID PK, `status` (pending / in_review / approved / completed), `google_id` (Drive file ID) |
| **audit_logs** | Append-only operation log. Captures `role_id` snapshot at action time. `metadata` JSONB stores before/after diff. Only active when `company.audit_log_enabled = true`. | `id` BIGSERIAL PK, `action` (create / update / delete), `entity`, `entity_id` varchar |

---

## DBML Schema

> Paste into [dbdiagram.io](https://dbdiagram.io) for an interactive diagram.

```javascript
// ============================================================
// ConstructFlow — Data Model
// Master's AI Final Project
// Format: DBML (paste into https://dbdiagram.io)
// ============================================================


// ----------------------------------------------------------
// MULTI-TENANCY
// ----------------------------------------------------------

Table companies {
  id                 uuid        [pk, note: "UUID v7"]
  name               varchar     [not null]
  slug               varchar     [unique, not null, note: "Custom domain routing, e.g. acme.constructflow.app"]
  is_active          boolean     [default: true]
  logo_url           varchar     [note: "Company logo URL; used in transactional emails (SES), browser favicon, and navigation header"]
  audit_log_enabled  boolean     [default: false, note: "Admin-controlled toggle; when true, all create/update/delete actions are recorded in audit_logs"]
  created_at         timestamp
  updated_at         timestamp
}


// ----------------------------------------------------------
// USERS & ROLES
// ----------------------------------------------------------

Table roles {
  id          smallserial [pk]
  name        varchar     [not null, note: "admin | seller | employee"]
  description text
}

Table users {
  id              uuid      [pk, note: "UUID v7"]
  company_id      uuid      [ref: > companies.id]
  role_id         smallint  [ref: > roles.id]
  first_name      varchar
  last_name       varchar
  email           varchar   [unique, not null]
  password_hash   varchar
  is_active       boolean   [default: true]
  created_at      timestamp
  updated_at      timestamp
}


// ----------------------------------------------------------
// PROJECTS
// ----------------------------------------------------------

Table projects {
  id                  uuid      [pk, note: "UUID v7"]
  company_id          uuid      [ref: > companies.id]
  name                varchar   [not null]
  image_url           varchar   [note: "Cover image for the project"]
  city                varchar
  country             varchar
  start_date          date
  estimated_end_date  date
  status              varchar   [note: "planning | active | completed | cancelled"]
  created_at          timestamp
  updated_at          timestamp
}


// ----------------------------------------------------------
// PROJECT HIERARCHY (adjacency list tree)
// ----------------------------------------------------------

Table node_types {
  id          smallserial [pk]
  company_id  uuid        [ref: > companies.id, note: "NULL = global seed (e.g. Colombia defaults: Manzana, Torre, Etapa, Villa, Bloque)"]
  name        varchar     [not null]
  sort_order  smallint    [note: "Controls display order in the project wizard type picker"]
}

Table project_nodes {
  id            uuid      [pk, note: "UUID v7"]
  project_id    uuid      [ref: > projects.id]
  node_type_id  smallint  [ref: > node_types.id]
  parent_id     uuid      [ref: > project_nodes.id, note: "NULL = root node; self-referencing adjacency list"]
  name          varchar   [not null, note: "e.g. Manzana 1, Torre A, Etapa 2"]
  created_at    timestamp
  updated_at    timestamp
}


// ----------------------------------------------------------
// UNITS (leaf nodes of the hierarchy)
// ----------------------------------------------------------

Table units {
  id               uuid      [pk, note: "UUID v7"]
  project_node_id  uuid      [ref: > project_nodes.id]
  unit_type        varchar   [not null, note: "apartment | parking | deposit | penthouse | house | other"]
  identifier       varchar   [not null, note: "Unit code, e.g. 4B, G-12, D-01"]
  floor            int
  area             decimal
  area_unit        varchar   [default: "sqm", note: "sqm | sqft"]
  base_price       decimal   [note: "Calculated: stage.price_per_sqm * area, unless is_price_manual = true"]
  is_price_manual  boolean   [default: false]
  status           varchar   [note: "available | reserved | sold"]
  created_at       timestamp
  updated_at       timestamp
}


// ----------------------------------------------------------
// COMMERCIAL MODEL
// ----------------------------------------------------------

Table stages {
  id             uuid      [pk, note: "UUID v7"]
  project_id     uuid      [ref: > projects.id]
  name           varchar   [not null, note: "e.g. Etapa 1, Fase A"]
  price_per_sqm  decimal   [not null]
  starts_at      date
  ends_at        date
  created_at     timestamp
  updated_at     timestamp
}

Table unit_associations {
  id              uuid      [pk, note: "UUID v7"]
  unit_id         uuid      [ref: > units.id, note: "Primary unit (apartment / penthouse)"]
  linked_unit_id  uuid      [ref: > units.id, note: "Associated unit (parking / deposit)"]
  is_mandatory    boolean   [default: false, note: "If true, must be purchased together"]
  created_at      timestamp
}

Table trust_entities {
  id          uuid      [pk, note: "UUID v7"]
  project_id  uuid      [ref: > projects.id]
  name        varchar   [not null, note: "Fiduciaria name"]
  nit         varchar   [note: "Tax ID of the trust entity"]
  contact     varchar
  created_at  timestamp
  updated_at  timestamp
}


// ----------------------------------------------------------
// CLIENTS (end customers)
// ----------------------------------------------------------

Table clients {
  id               uuid      [pk, note: "UUID v7"]
  company_id       uuid      [ref: > companies.id]
  first_name       varchar
  last_name        varchar
  email            varchar
  phone            varchar
  document_type    varchar   [note: "cedula | cedula_extranjeria | pasaporte | nit | tarjeta_identidad"]
  document_number  varchar
  date_of_birth    date
  created_at       timestamp
  updated_at       timestamp
}


// ----------------------------------------------------------
// QUOTATIONS
// ----------------------------------------------------------

Table quotations {
  id                      uuid      [pk, note: "UUID v7"]
  unit_id                 uuid      [ref: > units.id]
  client_id               uuid      [ref: > clients.id, note: "Nullable if lead not yet registered"]
  assigned_user_id        uuid      [ref: > users.id]
  installment_simulation  jsonb     [note: "Flexible installment plan snapshot"]
  status                  varchar   [note: "draft | sent | expired | rejected"]
  expires_at              date
  notes                   text
  created_at              timestamp
  updated_at              timestamp
}


// ----------------------------------------------------------
// CONTRACTS
// ----------------------------------------------------------

Table contracts {
  id                   uuid      [pk, note: "UUID v7"]
  unit_id              uuid      [ref: > units.id]
  client_id            uuid      [ref: > clients.id]
  assigned_user_id     uuid      [ref: > users.id, note: "Salesperson responsible"]
  trust_entity_id      uuid      [ref: > trust_entities.id, note: "Nullable; set when payment_method = loan"]
  quotation_id         uuid      [ref: > quotations.id, note: "Nullable; originating quotation if applicable"]
  payment_method       varchar   [not null, note: "direct | loan"]
  reservation_amount   decimal
  reservation_paid_at  timestamp [note: "Nullable; once set, unit.status → reserved"]
  signed_at            timestamp [not null, note: "Promise / contract signature date"]
  status               varchar   [note: "pending_reservation | active | completed | cancelled"]
  created_at           timestamp
  updated_at           timestamp
}

Table installments {
  id           uuid      [pk, note: "UUID v7"]
  contract_id  uuid      [ref: > contracts.id]
  due_date     date      [not null]
  amount       decimal   [not null]
  description  varchar   [note: "e.g. Cuota 1, Separación, Escrituración"]
  paid_at      timestamp [note: "Nullable; null = pending"]
  created_at   timestamp
  updated_at   timestamp
}


// ----------------------------------------------------------
// DOCUMENT TEMPLATES (Formats)
// ----------------------------------------------------------

Table format_types {
  id    smallserial [pk]
  name  varchar     [not null, note: "promise_template | contract_template | handover_template | other"]
}

Table formats {
  id              uuid      [pk, note: "UUID v7"]
  company_id      uuid      [ref: > companies.id]
  format_type_id  smallint  [ref: > format_types.id]
  name            varchar   [not null]
  google_id       varchar   [not null, note: "Google Drive template file ID"]
  is_active       boolean   [default: true]
  created_at      timestamp
  updated_at      timestamp
}


// ----------------------------------------------------------
// DOCUMENTS
// ----------------------------------------------------------

Table documents {
  id           uuid      [pk, note: "UUID v7"]
  contract_id  uuid      [ref: > contracts.id, note: "Nullable; document linked to contract OR quotation"]
  quotation_id uuid      [ref: > quotations.id, note: "Nullable; document linked to contract OR quotation"]
  format_id    uuid      [ref: > formats.id, note: "Nullable; template used to generate this document"]
  uploaded_by  uuid      [ref: > users.id]
  title        varchar
  google_id    varchar   [not null, note: "Google Drive file ID"]
  status       varchar   [note: "pending | in_review | approved | completed"]
  notes        text
  created_at   timestamp
  updated_at   timestamp
}


// ----------------------------------------------------------
// AUDIT LOG
// ----------------------------------------------------------

Table audit_logs {
  id          bigserial   [pk, note: "Auto-increment; append-only high-volume table"]
  company_id  uuid        [ref: > companies.id]
  user_id     uuid        [ref: > users.id]
  role_id     smallint    [ref: > roles.id, note: "Role snapshot at time of action"]
  action      varchar     [not null, note: "create | update | delete"]
  entity      varchar     [not null, note: "project | unit | client | quotation | contract | document | user..."]
  entity_id   varchar     [not null, note: "UUID of the affected record stored as varchar"]
  metadata    jsonb       [note: "Optional: old values, new values, diff snapshot"]
  created_at  timestamp   [not null]
}
```
