# IMPL_PLAN Template — Generic Feature
**Para**: `speckit.plan`  
**Versión**: 1.0.0

---

# Implementation Plan: [Feature Title from spec.md]

**Branch**: `[BRANCH_NAME]`  
**Spec**: [spec.md](./spec.md)

## Pipeline Overview

| Fase | Artefactos | Dependencias |
|------|------------|--------------|
| 1. BDD First | `/backend/tests/bdd/[boundedContext]/[feature].feature` | Ninguna |
| 2. API First | `/backend/src/main/resources/openapi/[boundedContext]/[feature].yaml` | 1.BDD |
| 3. Domain | `/backend/src/main/java/com/hexagonal/[boundedContext]/domain/` | 2.API |
| 4. Application | `/backend/src/main/java/com/hexagonal/[boundedContext]/application/` | 3.Domain |
| 5. Infrastructure | `/backend/src/main/java/com/hexagonal/[boundedContext]/infrastructure/` | 4.Application |
| 6. Controllers | `/backend/src/main/java/com/hexagonal/[boundedContext]/infrastructure/in/rest/` | 5.Infrastructure |
| 7. Frontend | `/frontend/src/{api,components,pages,hooks,state}/` | 6.Controllers |
| 8. Contracts | `/backend/tests/contracts/` | 7.Frontend |
| 9. E2E | `/backend/tests/e2e/ + /frontend/tests/e2e/` | 8.Contracts |
| 10. CI/CD | `.github/workflows/` | 9.E2E |

## Fases Detalladas

### Phase 1: BDD First
**Artefactos**:
- `/backend/tests/bdd/[boundedContext]/[feature].feature`

**Herramientas**: Cucumber

**Criterios**:
- Escenarios Given/When/Then extraídos de spec.md
- Steps pending (Cucumber YELLOW)
- Lenguaje 100% negocio

**Prohibido**:
- Implementar steps
- Términos técnicos (HTTP, JSON, DB)

### Phase 2: API First
**Artefactos**:
- `/backend/src/main/resources/openapi/[boundedContext]/[feature].yaml`

**Capacidades** (SOLO derivadas de BDD When):
1. [Capacidad 1] ← Scenario X spec.md
2. [Capacidad 2] ← Scenario Y spec.md  
   [... completar según BDD]

**Criterios**:
- Cada When clause = 1 capacidad abstracta
- Sin paths HTTP, métodos ni DTOs

**Prohibido**:
- Endpoints no derivados de BDD
- Campos/esquemas concretos

### Phase 3: Domain
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/[boundedContext]/domain/{model/,ports/in/,ports/out/}`

**Herramientas**: JUnit 5

**Criterios**:
- Entidades/VOs/puertos según capacidades de Phase 2
- TDD: tests primero
- Sin Spring ni infra dependencies

**Prohibido**:
- Lógica de infra (HTTP, DB)
- Frameworks en domain

### Phase 4: Application
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/[boundedContext]/application/{service/,mapper/,validator/}`

**Herramientas**: JUnit 5, Mockito

**Criterios**:
- Use cases que orquestan domain a través de ports
- Sin reglas de negocio

**Prohibido**:
- Lógica de negocio
- Acceso directo a infra

### Phase 5: Infrastructure
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/[boundedContext]/infrastructure/{in/,out/}`

**Herramientas**: Spring RestClient, Testcontainers

**Criterios**:
- Adapters implementan ports out
- Tests de integración

**Prohibido**:
- Lógica de negocio en adapters
- Servicios reales en tests

### Phase 6: Controllers
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/[boundedContext]/infrastructure/in/rest/{controller/,dto/,mapper/}`

**Herramientas**: Spring MVC, MockMvc

**Criterios**:
- Cumplen OpenAPI exactamente
- Delegan a use cases

**Prohibido**:
- Lógica de negocio
- Desviarse de OpenAPI

### Phase 7: Frontend
**Artefactos**:
- `/frontend/src/{api,components,pages,hooks,state}/`

**Herramientas**: React Query, Zustand, Jest/RTL

**Criterios**:
- Cliente OpenAPI autogenerado
- React Query para server-state
- Zustand para UI-state

**Prohibido**:
- Lógica de negocio en UI
- Fetch manual

### Phase 8: Contracts
**Artefactos**:
- `/backend/tests/contracts/`

**Herramientas**: Contract testing tools

**Criterios**:
- Valida backend contra OpenAPI

**Prohibido**:
- Permitir drift de OpenAPI

### Phase 9: E2E
**Artefactos**:
- `/backend/tests/e2e/`
- `/frontend/tests/e2e/`

**Herramientas**: Cucumber, Playwright

**Criterios**:
- BDD escenarios contra backend real
- Flujos críticos en Playwright

**Prohibido**:
- Servicios reales en E2E

### Phase 10: CI/CD
**Artefactos**:
- `.github/workflows/`

**Herramientas**: GitHub Actions

**Criterios**:
- Gates: bdd → api → unit → infra → contract → e2e → build

**Prohibido**:
- Saltar gates

---

## Definition of Done

- [ ] BDD verde
- [ ] OpenAPI validado
- [ ] Domain TDD 100%
- [ ] Pipeline CI/CD gates verde
- [ ] No deuda técnica

**Plan Status**: READY FOR TASKS