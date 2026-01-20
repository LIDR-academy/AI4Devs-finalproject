
<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: Development Workflow, Source Priority, Agent Directives, CI/CD Gates
Added sections: Artifacts per Phase, Anti‑patterns, Cross‑file References, Compliance Checklist
Removed sections: N/A
Follow-up TODOs: Set RATIFICATION_DATE and OWNER team
-->

# Project Constitution — Hexagonal Microservices (SDD/Spec‑Kit + Copilot)

> **Scope**: Constitución operativa y normativa para el repositorio.  
> **Objetivo**: Alinear a personas y agentes (Spec‑Kit/Copilot) con arquitectura hexagonal, BDD y API‑First, garantizando calidad, trazabilidad y entregas repetibles.

---

## 1) Core Principles

1. **Specifications First (SDD)**: La especificación y el BDD son la fuente de verdad superior del comportamiento; el código solo materializa lo acordado.
2. **Arquitectura**: **Hexagonal + DDD + TDD + API‑First** (Java 21 + Spring Boot).
3. **Separación de capas**:
    - **Dominio**: reglas puras, VOs, entidades y **puertos** (sin frameworks).
    - **Aplicación**: **orquestación** de casos de uso (sin reglas de negocio).
    - **Infra**: adaptadores concretos (sin reglas de negocio).
    - **Controllers**: traducen protocolo ↔ comandos; validación superficial.
4. **Consistencia de API**: OpenAPI versionado y validado. Controllers **deben** cumplir el contrato.
5. **Calidad/Testing**: TDD en dominio, BDD real, integración e2e, contratos. CI/CD con **gates** obligatorios.
6. **Observabilidad y Seguridad**: logs estructurados, métricas y trazas mínimas; manejo estandarizado de errores.
7. **Evolutividad**: cambios empiezan en **BDD**, siguen por **API** y después **implementación**.

---

## 2) Prioridad de fuentes (orden absoluto)

1. **Historia de Usuario + BDD (.feature)**
2. **Delivery Playbook – Backend** (`/.specify/instructions/delivery-playbook-backend.md`)
3. **Engineering Guidelines** (`/.specify/instructions/engineering-guidelines.md`)
4. **Hexagonal Architecture Guide** (`/.specify/instructions/hexagonal-architecture-guide.md`)
5. **Copilot Repo Instructions** (`/.github/copilot-instructions.md` + `/.github/instructions/*.md`)
6. Convenciones del repo / framework

> Cualquier conflicto se resuelve por este orden. Si un comportamiento **no** está en BDD, **no** se implementa.

---

## 3) Development Workflow (orden **vinculante** por historia)

**Pipeline por historia (estricto):**  
**BDD → API First → Dominio → Aplicación → Infra → Controllers → Contratos → E2E**

### 3.1 BDD First
- `.feature` **declarativo**, lenguaje de negocio, **sin** detalles técnicos.
- Cucumber debe **correr en rojo** inicialmente (steps pending/skipped).

### 3.2 API First (mínimo necesario)
- YAML OpenAPI en `src/main/resources/openapi/`.
- **Lint obligatorio** (Redocly CLI). Cambios posteriores **rompen** si el contrato no valida.

### 3.3 Dominio (DDD + TDD)
- Entidades/VOs/Servicios/Reglas/**Puertos**.
- **Cero** dependencias de framework/transporte/JSON/IA.

### 3.4 Aplicación (Use Cases)
- Orquestación, comandos/queries/DTOs internos; **sin reglas** de negocio.

### 3.5 Infraestructura (Adapters)
- Implementaciones concretas de **puertos out** (DB, colas, IA…), tests de integración (Testcontainers cuando aplique).

### 3.6 Controllers (Adapters in)
- Cumplir **estrictamente** el contrato. Validación superficial. **Sin** lógica.

### 3.7 Contratos (Provider/Consumer)
- Verificar implementación contra OpenAPI (p.ej., Schemathesis).

### 3.8 E2E BDD
- Ejecutar `.feature` sobre artefacto real. **Verde** para DoD.

---

## 4) Artefactos por fase (Done = Deployable)

| Fase | Artefacto mínimo | Ubicación |
|---|---|---|
| BDD | `.feature` + glue pending | `tests/bdd/<context>/<feature>.feature` |
| API | OpenAPI YAML (lint OK) | `src/main/resources/openapi/<context>.yaml` |
| Dominio | Entidades/VOs/Puertos | `.../domain/{model|enums|ports/{in|out}}` |
| Aplicación | Use cases + tests | `.../application/usecases` |
| Infra | Adapters + IT | `.../infrastructure/{in|out}/...` |
| Controllers | Recursos HTTP sin lógica | `.../infrastructure/in/rest/controller` |
| Contratos | Tests provider/consumer | `tests/contract/**` (flexible) |
| E2E | Cucumber sobre artefacto | `tests/bdd/**` |

> **DoD global**: BDD verde, OpenAPI validado, tests de dominio/aplicación/infra en verde, contratos OK, e2e OK, observabilidad mínima y no‑funcionales clave (timeouts/retries) implementados.

---

## 5) Reglas para agentes (Spec‑Kit + Copilot)

1. **Al recibir una US**:
    1) Generar `specs/<us>/spec.md` con BDD declarativo.
    2) Generar `specs/<us>/plan.md` (paso a paso por pipeline).
    3) Generar `specs/<us>/tasks.md` (tickets por capa, con CA y artefactos).
2. **Prohibido** generar código **antes** de que:
    - Exista `.feature` y Cucumber ejecute en rojo (**BDD first**).
    - El YAML OpenAPI **valide** con lint.
3. **Ubicaciones/naming**: obedecer estrictamente `hexagonal-architecture-guide.md` y `engineering-guidelines.md`.
4. **Controllers**: ≤30 LOC por método; validación superficial; sin decisiones.
5. **Infra (HTTP)**: usar **RestClient** para sincronía; **WebClient** solo si se requiere streaming/reactivo; mapear errores `(AiTimeout/AiUnavailable/AiRateLimited → 503/429)`; no loguear prompts/respuestas IA.
6. **IA**: Las acciones de generación deben ser **explícitas** por parte del usuario en BDD (no llamadas automáticas).
7. **Spec‑Kit**: `/speckit.specify` → spec, `/speckit.plan` → plan, `/speckit.tasks` → tasks (sin saltarse fases).
8. **Copilot**: respetar `/.github/copilot-instructions.md` y `/.github/instructions/*.md` al sugerir código/archivos.

---

## 6) CI/CD Gates (orden y bloqueo)

1. **bdd** → Cucumber corre (rojo al inicio aceptable).
2. **api** → Lint OpenAPI (Redocly) **debe** pasar.
3. **unit** → Dominio + Aplicación.
4. **infra** → Integración (adapters; Testcontainers cuando aplique).
5. **contract** → Provider/consumer contra YAML (ej. Schemathesis).
6. **e2e** → BDD/e2e sobre artefacto.

> Cualquier fallo **bloquea** el merge (fast‑fail). “Build once, deploy many”.

---

## 7) Convenciones de arquitectura y naming (resumen)

- **Dominio**: `.../domain/{model|enums|ports/{in|out}}`
- **Aplicación**: `.../application/usecases`
- **Infra (in)**: `.../infrastructure/in/rest/{controller|dto|mapper}`
- **Infra (out)**: `.../infrastructure/out/{service|mongodb|kafka}/{impl|mapper|model|repository}`
- **OpenAPI**: `src/main/resources/openapi/`
- **Use cases**: `Generate<Recurso><Accion>UseCase`
- **Puertos out**: `<Recurso>Port` (p.ej., `TextGenerationPort`)
- **Adapters IA**: `<Recurso>AiAdapter`
- **DTOs**: `<Recurso><Accion>{Request|Response}`

> Detalle completo en `engineering-guidelines.md` y `hexagonal-architecture-guide.md`.

---

## 8) No funcionales mínimos

- **Performance**: objetivos por endpoint/caso de uso; latencia monitorizada; regresiones = bug crítico.
- **Confiabilidad**: timeouts y retries razonables en adaptadores; circuit breaker cuando aplique.
- **Observabilidad**: logs estructurados con correlación; métricas (lat/err), trazas.
- **Seguridad**: autenticación/autorización coherente con el contexto; datos sensibles **no** se registran.

---

## 9) Anti‑patterns (rechazar de plano)

- Tareas que mezclan varias capas a la vez.
- Lógica de negocio en **controllers** o **adapters**.
- Endpoints/campos no presentes en BDD.
- “Preparar para futuro” (sobrediseño) sin fundamento.
- Tests que dependen de servicios cloud reales (usar contenedores/mocks).
- Persistencia o side‑effects fuera del alcance de la US.

---

## 10) Referencias cruzadas (normativas)

- **Playbook**: `/.specify/instructions/delivery-playbook-backend.md`
- **Guía de Ingeniería**: `/.specify/instructions/engineering-guidelines.md`
- **Guía Hexagonal**: `/.specify/instructions/hexagonal-architecture-guide.md`
- **Copilot Repo Instructions**: `/.github/copilot-instructions.md`
- **Copilot Path‑Scoped**: `/.github/instructions/*.instructions.md`

> Esta constitución **no** duplica las guías; las **refuerza** y **manda** que sean obedecidas por humanos y agentes.

---

## 11) Cumplimiento (checklist)

- [ ] `.feature` en negocio, ejecuta (rojo al inicio).
- [ ] OpenAPI YAML válido (lint OK).
- [ ] Código por capas en ubicaciones correctas y naming conforme.
- [ ] Tests: dominio, aplicación, infra, contratos, e2e en verde.
- [ ] Observabilidad y no‑funcionales mínimos implementados.
- [ ] CI/CD gates en verde; **no** se permite merge con fallos.

---

## 12) Governance

- **Precedencia**: Esta constitución aplica a todo el repositorio y **prevalece** sobre prácticas locales.
- **Cambios**: Requieren PR con consenso del equipo y actualización de **semver**.
- **Versionado**: `MAJOR` (cambios incompatibles), `MINOR` (adiciones), `PATCH` (aclaraciones).
- **Revisión**: Auditoría de cumplimiento por historia y por release.

**Version**: 1.1.0  
**Ratified**: TODO(RATIFICATION_DATE)  
**Owner**: TODO(TEAM/AREA)
