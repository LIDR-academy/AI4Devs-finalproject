---
description: "Task list template for feature implementation (v2)"
---

# Tasks: [FEATURE NAME] ([<US-ID>])

**Inputs**: ./plan.md, ./spec.md  
**Organization**: Tareas agrupadas por **capas** y/o **user stories** (si hay varias).

## Formato de tarea
`[ID] [P?] [US-ID?] Título — Descripción (criterios de aceptación, dependencias, paths)`

- **[P]** = puede ejecutarse en paralelo (no depende de otra tarea).
- Referenciar **paths** SOLO a nivel de **plantillas** (p. ej. `features/${boundedContext}/${userStoryId}.feature`).
- No listar archivos concretos (clases/DTOs/mappers/repos/etc.).

## Reglas de Granularidad (OBLIGATORIAS)

1. **Prohibido** generar tareas por archivo/clase (DTO, mapper, excepción, entity…).  
2. **Una tarea por capa** (o **dos** si la capa es grande):  
   - BDD → 1  
   - API → 1  
   - Domain → 1  
   - Application → 1  
   - Infrastructure → 1 (máximo 2 si hay múltiples adaptadores)  
   - Controllers → 1  
   - Frontend → 1 (máximo 2 si hay páginas + player)  
   - Contracts → 1  
   - E2E → 1  
   - CI/CD → 1  
3. **Rango de tareas objetivo** por feature:
   - **Simple**: 10–20  
   - **Media**: 20–35  
   - **Compleja**: 35–60  
   - Si excede el rango, **fusionar** tareas relacionadas.  
4. **Tareas de test** se agregan por tipo (una para Contract, una para E2E, etc.), **no** por cada endpoint/escenario.  
5. **Naming obligatorio** (ports, use cases, adapters, controllers, DTOs) se menciona en la **descripción de la tarea**, **no** como tareas separadas.

## Path Conventions (plantillas, NO literales)
- BDD: `features/${boundedContext}/${userStoryId}.feature`
- OpenAPI: `openapi/${boundedContext}/${userStoryId}.yaml`
- Back: `${basePackage}/${boundedContext}/{domain|application|infrastructure/...}`
- Front: `/frontend/src/{api,components,pages,hooks,state}/`

---

## Ejemplo de Estructura (US simple)

### Phase 1 — BDD
- [ ] T001 [<US-ID>] BDD — Definir `features/${boundedContext}/${userStoryId}.feature` (escenarios de spec.md)

### Phase 2 — API
- [ ] T002 [<US-ID>] API — Definir capacidades en `openapi/${boundedContext}/${userStoryId}.yaml`

### Phase 3 — Domain
- [ ] T003 [<US-ID>] Domain — Modelo/VO/reglas + puertos (tests + código)

### Phase 4 — Application
- [ ] T004 [<US-ID>] Application — Use cases (tests + código)

### Phase 5 — Infrastructure
- [ ] T005 [<US-ID>] Infra — Adapters out + tests integración (unificar en UNA tarea)

### Phase 6 — Controllers
- [ ] T006 [<US-ID>] Controllers — Adaptadores in/rest + mapeos + tests

### Phase 7 — Frontend (si aplica)
- [ ] T007 [P] [<US-ID>] Frontend — Páginas/Componentes/Hooks + tests

### Phase 8 — Contracts
- [ ] T008 [<US-ID>] Contracts — Provider/consumer tests

### Phase 9 — E2E
- [ ] T009 [<US-ID>] E2E — Escenarios end‑to‑end (backend y/o frontend)

### Phase 10 — CI/CD
- [ ] T010 [<US-ID>] CI/CD — Gates y pipelines (actualizar workflows)

---

## Criterios de aceptación por tarea (guía)
- Qué **capacidad observable** aporta.
- Qué **artefacto nivel‑plantilla** toca (no archivos).
- Cómo se valida (tests agregados por tipo).
- Dependencias con otras tareas/capas.

## Notas
- Si el plan es muy detallado, **agrupar** en tareas de capa.  
- Si el feature es complejo (p. ej. múltiples adaptadores, múltiples páginas), **permitido** dividir 1→2 tareas por capa, respetando el rango.