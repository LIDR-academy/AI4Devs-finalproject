
# GitHub Copilot — Repository Custom Instructions
# Proyecto: Meditation Builder (Backend)
# Propósito: Que Copilot respete el pipeline BDD→API→Dominio→Aplicación→Infra→Controllers→Contratos→E2E,
# la arquitectura hexagonal y las guías de ingeniería al generar especificaciones, planes, tareas y código.

## 1) Principios operativos (obligatorios)
- Obedecer este orden por historia: **BDD → API First → Dominio → Aplicación → Infra → Controllers → Contratos → E2E**.
- **No** introducir endpoints, campos o reglas que no estén en BDD.
- Arquitectura: **Hexagonal + DDD + TDD + API First** (Java 21 + Spring Boot).
- Controllers sin lógica de negocio; dominio sin dependencias de framework.
- Tests: primero **Cucumber rojo** (BDD), luego unit/integration, contrato y e2e.
- OpenAPI **válido y versionado**; lint obligatorio (Redocly CLI).

> Fuente: `delivery-playbook-backend.md` + `engineering-guidelines.md` + `hexagonal-architecture-guide.md`.

## 2) Fases y entregables por historia (qué debe generar Copilot)
- **Especificación (spec.md)**: redacción de negocio; Gherkin declarativo (qué, no cómo).
- **Plan (plan.md)**: pasos del pipeline, sin saltos de fase; qué archivos y dónde van.
- **Tareas (tasks.md)**: tickets por capa (BDD/API/Domain/Application/Infra/Controller/Testing/CI), con criterios de aceptación y artefactos.

### Artefactos mínimos:
- BDD: `tests/bdd/<feature>.feature` + glue (pendiente al inicio).
- API First: `src/main/resources/openapi/<context>-openapi.yaml` (lint OK).
- Domain: entidades, VOs, puertos (`domain/.../ports/{in|out}`), **sin frameworks**.
- Application: casos de uso en `application/usecases`, **sin reglas de negocio**.
- Infra: adapters (salida/entrada) en `infrastructure/...`, **sin reglas de negocio**.
- Controllers: thin; validación superficial; cumplir el YAML.
- Contratos: provider/consumer contra YAML.
- E2E: Cucumber sobre artefacto real.

## 3) Árbol de carpetas y ubicaciones (hexagonal)
- Ubicar nuevas clases según:
    - **Domain**: `.../domain/{model|enums|ports/{in|out}}`
    - **Application**: `.../application/{usecases|mapper|validator}`
    - **Infrastructure (in)**: `.../infrastructure/in/{rest|kafka}/{controller|dto|mapper}`
    - **Infrastructure (out)**: `.../infrastructure/out/{mongodb|service|kafka}/{impl|mapper|model|repository}`
    - **Shared**: `.../shared/{errorhandler|observability|openapi|security|utils}`
- OpenAPI: `src/main/resources/openapi/` (carpetas por contexto).

> Fuente: `hexagonal-architecture-guide.md`.

## 4) Naming y convenciones (abreviado)
- Puertos out: `TextGenerationPort`, `MusicGenerationPort`, `ImageGenerationPort`.
- Use cases: `GenerateMeditationTextUseCase`, `GenerateMeditationMusicUseCase`, `GenerateMeditationImageUseCase`.
- Adapters IA (out): `TextGenerationAiAdapter`, `MusicGenerationAiAdapter`, `ImageGenerationAiAdapter`.
- Controllers: `MeditationBuilderController`.
- DTOs: `<Recurso><Accion>{Request|Response}`.
- Mappers: `<Origen>To<Destino>Mapper`.

> Fuente: `engineering-guidelines.md`.

## 5) Reglas de comportamiento del agente (Copilot / Agent Mode)
- Al recibir una US:
    1) Generar **`specs/<us>/spec.md`** con BDD declarativo.
    2) Generar **`specs/<us>/plan.md`** (pipeline por fases).
    3) Generar **`specs/<us>/tasks.md`** (tickets por capa).
- **No generar código** antes de:
    - `.feature` en rojo (BDD first).
    - OpenAPI **validado** (lint OK).
- Al escribir código:
    - Respetar **ubicaciones por capa** y **naming**.
    - En **Infra (HTTP)**: usar **RestClient** para llamadas síncronas; **WebClient** solo para streaming/reactivo.
    - Mapear errores de IA a HTTP: `AiTimeout/AiUnavailable/AiRateLimited → 503/429`.

> Referencias: Spring Boot RestClient/WebClient (imperativo vs reactivo), linters OpenAPI.

## 6) Testing y CI/CD (resumen)
- Orden de gates: **bdd → api → unit → infra → contract → e2e** (fast-fail).
- BDD: Cucumber + JUnit 5 (runner `@Suite` con `cucumber-junit-platform-engine`).
- OpenAPI: `redocly lint` obligatorio (fallo bloquea PR).
- Contratos: provider/consumer (puede integrarse Schemathesis).
- Integración Infra: usar Testcontainers cuando aplique.

## 7) Antipatrones (rechazar)
- Mezclar varias capas en una misma tarea.
- Lógica de negocio en controllers/adapters.
- Endpoints/campos no presentes en BDD.
- Persistencia o side‑effects no previstos en la US actual.
- “Preparar para futuro” sin justificación de negocio.

## 8) Declaraciones de propósito (constitución)
- Calidad: revisión y linters en cada PR.
- Testing: cobertura adecuada; TDD en dominio crítico.
- UX/API: consistencia de errores y OpenAPI actualizado.
- Performance: objetivos claros y monitorizados.

# Fin de instrucciones.
