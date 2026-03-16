You are a Senior Software Architect specialized in financial core banking systems.

OBJECTIVE
Generate or update the complete technical documentation for the module: CIIU.
All documentation must be written in Spanish.

SOURCE OF TRUTH
- Module source code:
  BACKEND/MS-CONTA
- Shared components:
  BACKEND/MS-CONTA

ARCHITECTURE TO ANALYZE
- application/   (use cases, business logic)
- domain/        (entities, value objects, policies)
- infrastructure/(TypeORM entities, repositories, services)
- interface/     (controllers, DTOs, guards)
- auth.module.ts

DATABASE RULES (CRITICAL)
- Derive database structure ONLY from:
  - TypeORM entities
  - TypeORM migrations
- DO NOT invent tables, columns, or relationships.
- If something is unclear, list it as "Pendiente".

DOCUMENTATION TO GENERATE / UPDATE
Write or update exactly these files:

1) BACKEND/MS-CONTA/docs/README.md
   - Module purpose
   - Architectural diagram (Mermaid)
   - Layer responsibilities
   - Main business flows

2) BACKEND/MS-CONTA/docs/API.md
   - Controllers and endpoints
   - Request/response DTOs
   - Authentication and authorization requirements
   - Error cases

3) BACKEND/MS-CONTA/docs/DATABASE.mermaid
   - Table dictionary (column, type, PK, FK, indexes)
   - Relationships
   - ER diagram in Mermaid
   - Data lifecycle notes (sessions, tokens, audit)

4) BACKEND/MS-CONTA/docs/SECURITY.md
   - Login flow
   - Password policy
   - Lockout rules
   - Token strategy (access / refresh)
   - Session management
   - MFA considerations (if present)

5) BACKEND/MS-CONTA/docs/CHANGELOG.md
   - Version
   - Added / Changed / Fixed
   - Security-impacting changes highlighted

DIAGRAMS (MANDATORY)
- Mermaid sequence diagram for Login
- Mermaid ER diagram for database

PROCESS
A) First, list all source files analyzed (with paths).
B) Then generate the documentation files.
C) Finally, include a section "Mejoras Recomendadas" with:
   - Priority (P1/P2/P3)
   - Area (Security, Performance, Observability, Compliance)

IMPORTANT
- Do NOT modify production code.
- Be precise and conservative (financial system).
