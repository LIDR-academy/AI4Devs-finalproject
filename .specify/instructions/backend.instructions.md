
# Backend Instructions — Meditation Builder
## Version 2.0.0

These instructions operationalize the Backend Delivery Playbook by defining concrete rules for agents (human or AI) when implementing backend features under `/backend`.

---
# 1. Scope
Applies to all backend tasks involving Java 21, Spring Boot, Hexagonal Architecture, DDD, TDD, and API First.

---
# 2. Mandatory Folder Locations
```
/backend/src/main/java/com/hexagonal/<bc>/application/
/backend/src/main/java/com/hexagonal/<bc>/domain/
/backend/src/main/java/com/hexagonal/<bc>/infrastructure/
/backend/src/main/resources/openapi/<bc>/
/backend/src/test/resources/features/<bc>/
/backend/src/test/java/com/hexagonal/<bc>/bdd/
/backend/src/test/java/com/hexagonal/<bc>/e2e/
/backend/src/test/contracts/
```

**Note**: Contract tests folder exists but is currently empty (tests not yet implemented).

---
# 3. Rules by Layer
## 3.1 Domain
- No Spring annotations
- No infrastructure types
- Only business rules: entities, VOs, ports
- **Java 21 Records obligatorios** (ver `java21-best-practices.md`):
  - Value Objects → `record` con validación en compact constructor
  - Entities → `record` con API inmutable (`withX()` methods)
  - IDs → `UUID`, nunca `String`
  - Timestamps → `Clock` inyectado, nunca `Instant.now()`
  - Campos nullable → accessors `Optional` (`xOpt()`)

## 3.2 Application
- Use cases orchestrate domain
- No business rules
- No DB/HTTP/infra access

## 3.3 Infrastructure
- Implement ports out
- Map infra errors → domain exceptions
- Use RestClient/WebClient only here

## 3.4 Controllers
- Must match OpenAPI exactly
- No business rules or branching logic
- Only validation + mapping

---
# 4. API First
- Every endpoint must originate in BDD
- YAML must validate using Redocly
- No adding fields not defined in BDD

---
# 5. Testing
- Domain: JUnit 5 pure unit tests
- Application: unit tests with mocks
- Infra: Testcontainers integration
- BDD: Cucumber tests must pass
- Contract: OpenAPI-based validation

---
# 6. CI/CD Rules
- Gates: bdd → api → unit → infra → contract → e2e
- Any failure blocks merge
- Build once, deploy many

---
# 7. Anti-Patterns
- Mixing layers in one task
- Lógica de negocio en controllers
- Endpoints sin BDD
- Usar servicios externos reales en tests

---
# 8. Agent Execution Rules
- Tasks must target exactly one layer
- Files generated must match folder structure
- Never generate domain classes before BDD + API
- No code generation unless requested explicitly

FIN DEL DOCUMENTO
