# 🤖 AI Agent Guidelines & Operations Manual (RestoStock)

Welcome, Agent. This file is your operational contract. It defines the project context, technical stack, architecture patterns, and the mandatory execution workflows you must follow. Read this file first before performing any tasks to minimize token usage and ensure strict compliance with project quality standards.

---

## 🧭 1. Project Context & Stack

RestoStock is an intelligent real-time inventory and traceability system for restaurant kitchens, designed to reduce food waste using the FEFO (First Expired, First Out) method for open ingredients.

### Tech Stack:
- **Core:** Node.js, TypeScript, Express.js.
- **Database & Persistence:** PostgreSQL, Prisma ORM.
- **Validation:** Zod (compulsory for active input sanitization).
- **Aritmetic Precision:** `decimal.js` (mandatory for all physical quantities, stocks, and portions).
- **Testing:** Jest/Vitest (strict TDD approach).
- **Package Manager:** `pnpm` (monorepo workspaces).

---

## 🏗️ 2. Architectural Rules (Ports & Adapters + Vertical Slicing)

This project strictly enforces **Hexagonal Architecture** organized in **Vertical Slices** (Auth, Catalog, Stock, Kitchen, Reports). Layer dependencies must always be unidirectional, going from the outside in:

`Infrastructure (API/DB) ➔ Application (Use Cases) ➔ Domain (Entities/Value Objects)`

- **Domain Layer:** Pure TypeScript, zero external dependencies (no Prisma, no Express). Must use Value Objects (e.g., `Pin`, `DecimalQuantity`) and pure domain exceptions.
- **Application Layer:** Orchestrates use cases and DTOs. Communicates with external layers via ports (interfaces).
- **Infrastructure Layer:** Contains HTTP controllers (Express), input schemas (Zod), and database adapters (Prisma).

---

## 🔄 3. Operational Protocols (VSDD & Cascading Integration)

For any technical task or new feature request, you must follow the **Verified Spec-Driven Development (VSDD)** loop. Do not write code immediately.

### Architectural Decision Records (ADRs):
- Whenever a major architectural choice, framework selection, safety implementation, or design pattern is chosen, the agent must document it by creating a new **Architecture Decision Record (ADR)** inside `docs/02_architecture_design/adr/ADR-XXX-name.md`.
- All ADRs must follow a standardized structure: **Title**, **Status** (Proposed/Approved/Rejected/Superseded), **Context**, **Decision**, and **Consequences**.
- **Important:** Newly proposed ADRs must be explicitly presented to the USER (Specialist) for review and approved before the related code is implemented.

### Protocol for Modifying/Adding Features (Cascading Protocol):
Before coding, you must sequentially update the specifications in the following order (as guided by `.agents/nuevas_ideas_cascada.md`):
1. **Impact Assessment:** Answer what layers, files, databases, and APIs are affected.
2. **PRD & Design Docs:** Update `docs/01_product_definition/02_restostock_prd.md` and `docs/02_architecture_design/03_restostock_design.md` if business logic or systems change.
3. **Database Schema:** If database changes are needed, update `prisma/schema.prisma` and the logical model in `docs/04_persistence_and_api/09_restostock_database_schema.md`.
4. **API Contract:** Update the OpenAPI 3.0 specs in `docs/04_persistence_and_api/10_restostock_api_specification.md`.
5. **Agile Planning:** Create/update the corresponding User Story (`US-XXX.md`) and Technical Ticket (`TK-XXX.md`) in `docs/05_agile_planning/`.
6. **Traceability:** Update the traceability matrix in `docs/05_agile_planning/matriz_trazabilidad.md` and the backlog map in `docs/05_agile_planning/backlog_map.md`.

---

## 🧪 4. Coding & Quality Gates (DoD)

To mark a ticket as **Done**, you must guarantee:
1. **TDD Compliance:** Write a failing test (RED) asserting the requirements before writing production code. Achieve green status (GREEN), then refactor.
2. **InMemory Fakes:** Do not mock databases using complex mock libraries. Implement clean, memory-based fake implementations of your repository interfaces (e.g., `InMemoryUserRepository`).
3. **Safety & Sanitization:** Use Zod schemas in all controllers. No un-sanitized raw database inputs.
4. **Build & Lint Verification:** Always run `pnpm run build` and `pnpm run lint` before committing. There must be 0 errors and 0 warnings.

---

## 📂 5. Documentation Directory Map

For details, refer directly to the index at `docs/README.md`. Read only the files necessary for your current ticket to save context tokens:
- **Product Scope:** `docs/01_product_definition/`
- **Architecture & System Design:** `docs/02_architecture_design/`
- **Quality & Style Guides:** `docs/03_governance_and_quality/`
- **Database & API Specifications:** `docs/04_persistence_and_api/`
- **Agile Backlog & Tickets:** `docs/05_agile_planning/`
