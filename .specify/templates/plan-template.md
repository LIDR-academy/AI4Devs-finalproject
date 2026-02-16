# IMPL_PLAN Template — Generic Feature (v2)

**Para**: `speckit.plan`  
**Versión**: 2.0.0

# Implementation Plan: [Feature Title from spec.md]

**Branch**: `[<US-ID>-<kebab-case-title>]`  
**Spec**: ./spec.md

## Pipeline Overview

| Fase | Entregables (alto nivel) | Depende de |
|------|---------------------------|------------|
| 1. BDD First | `features/${boundedContext}/${userStoryId}.feature` | — |
| 2. API First | `openapi/${boundedContext}/${userStoryId}.yaml` (capacidades abstractas) | 1 |
| 3. Domain | `${basePackage}/${boundedContext}/domain/` (modelo, reglas, puertos) | 2 |
| 4. Application | `${basePackage}/${boundedContext}/application/` (use cases) | 3 |
| 5. Infrastructure | `${basePackage}/${boundedContext}/infrastructure/` (adapters) | 4 |
| 6. Controllers | `${basePackage}/${boundedContext}/infrastructure/in/rest/` | 5 |
| 7. Frontend | `/frontend/src/…` (si aplica) | 6 |
| 8. Contracts | `/backend/tests/contracts/` | 7 |
| 9. E2E | `/backend/tests/e2e/`, `/frontend/tests/e2e/` | 8 |
| 10. CI/CD | `.github/workflows/` | 9 |

> **NOTAS CRÍTICAS**
> - **No listar archivos concretos** (clases, DTOs, mappers, repos, etc.).  
> - Describir **capacidades** (qué hace la capa), no tecnología (HTTP, DB, S3, queries).
> - Naming: `feature = <US-ID>` (no usar el título funcional en nombres de artefactos).

---

## Fases Detalladas (alto nivel)

### Phase 1 — BDD First
- Derivar escenarios **exclusivamente** de `spec.md` (Given/When/Then).
- Entregable: `features/${boundedContext}/${userStoryId}.feature`
- Prohibido: implementar steps.

### Phase 2 — API First (abstracta)
- Derivar **capacidades** de los `When` del BDD.
- Entregable: `openapi/${boundedContext}/${userStoryId}.yaml` (sin paths/métodos concretos).
- Prohibido: endpoints, DTOs, esquemas.

### Phase 3 — Domain
- Modelo, reglas, **ports** in/out conforme a capacidades.
- Prohibido: dependencias de frameworks / infra.

### Phase 4 — Application
- **Use cases** que orquestan domain por ports.
- Prohibido: reglas de negocio en application.

### Phase 5 — Infrastructure
- **Adapters** que implementan ports out.
- Tests de integración a la capa (sin detallar tecnología aquí).

### Phase 6 — Controllers
- Adaptadores de entrada (REST, etc.) que honran OpenAPI.
- Prohibido: lógica de negocio.

### Phase 7 — Frontend (si aplica)
- Páginas, componentes, hooks alineados a capacidades.

### Phase 8 — Contracts
- Provider/consumer tests contra OpenAPI.

### Phase 9 — E2E
- Escenarios end‑to‑end basados en BDD.

### Phase 10 — CI/CD
- Gates en orden: bdd → api → unit → infra → contract → e2e → build.

---

## Definition of Done (alto nivel)
- BDD GREEN
- OpenAPI validado
- Domain TDD completo
- Gates CI/CD GREEN
- Sin deuda crítica