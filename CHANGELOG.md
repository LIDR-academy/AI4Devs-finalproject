# 📝 Changelog (Historial de Cambios - RestoStock)

Todos los cambios notables en este proyecto de especificación técnica y diseño de software serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [SemVer (Semantic Versioning)](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [0.4.0] - 2026-08-21

Esta versión cierra la "Entrega 2": endurecimiento de calidad/testing, dockerización DevSecOps completa, y las 3 funcionalidades priorizadas para completar el MVP (persistencia real, gestión mínima de personal, trazabilidad de movimientos), más el saneamiento de los artefactos ágiles y del propio framework `.agents/` que ese trabajo dejó pendiente.

### Added
* **Arquitectura de Testing y Gobernanza (TK-011 a TK-021):**
    * Estándar de Testing Architecture (co-ubicación híbrida: unit tests junto al dominio/casos de uso, integración en `tests/`, E2E Playwright con Page Object Model en `e2e/`) — Guard 21.
    * CI/CD actualizado a Node 24 LTS, GitHub Actions `@v5`, e infraestructura declarativa OpenTofu (`infrastructure/opentofu/`) — Guards 22/23.
* **Gates Automatizados de Calidad (TK-025 a TK-041):**
    * `docs/00_stack_manifest.md` como SSoT de stack aprobado por humano — Guard 24.
    * ESLint real instalado en ambos workspaces (antes `lint` era solo un alias de `tsc`), con gates de complejidad ciclomática/longitud de función y duplicación (`jscpd`) acotados al diff del ticket en curso, nunca retroactivos sobre deuda preexistente.
    * Capa `shared/` en frontend para eliminar duplicación entre features (servicios HTTP, hooks, Value Objects).
* **Dockerización y DevSecOps (TK-042 a TK-047):**
    * `Dockerfile` multi-stage (backend y frontend) con hardening de contenedores: usuario no-root, runtime pineado, cero secretos hardcodeados — Guard 25.
    * `gitleaks`/`trivy` wireados como gates bloqueantes reales en CI (antes declarados pero nunca ejecutados); 34+35 CVEs High/Critical eliminados en ambas imágenes.
    * `openapi.yaml` sincronizado con las rutas reales `/api/v1/...` verificadas en vivo contra el servidor.
* **Completitud del MVP — 3 funcionalidades priorizadas (TK-048 a TK-051):**
    * Persistencia real en producción para reportes, recetas y conciliación de turno (antes en memoria, se perdían en cada reinicio).
    * Gestión mínima de personal: alta y bloqueo/reactivación de operarios vía `POST /api/v1/auth/users` y `PATCH /api/v1/auth/users/{id}/status` (rol `ADMIN`).
    * Trazabilidad de movimientos de stock: `GET /api/v1/stock/movements` con filtros por insumo y rango de fechas, para auditoría.
    * Bootstrap idempotente del primer administrador en despliegues nuevos, corrigiendo además una vulnerabilidad crítica (el seed guardaba el PIN en texto plano, nunca ejecutado en producción hasta entonces).
* **Regularización de Artefactos Ágiles (TK-054):**
    * `US-010`/`US-011`, fichas técnicas `TK-048` a `TK-051` y `TK-049-FE`/`TK-050-FE`, índices, matriz de trazabilidad y mapa del backlog sincronizados con las funcionalidades ya implementadas — encontrados desactualizados en una auditoría posterior a su implementación.
    * Nuevo **Guard 26** en `.agents/AGENTS.md` (Spec-Before-Code Cascade): impide que un agente empiece a programar una funcionalidad nueva sin que su ticket técnico exista primero, evitando que este gap se repita.
* **Frontend de Gestión de Personal y Auditoría de Movimientos (TK-049-FE, TK-050-FE):**
    * Panel de gestión de personal (alta de operarios + bloqueo/reactivación por ID) y panel de auditoría de movimientos de stock, consumiendo la API real de `TK-049`/`TK-050`. Sin fallback a datos sintéticos ante error, a diferencia de otros paneles del proyecto — son acciones administrativas y registros de auditoría, nunca deben simular éxito o datos falsos.
    * Hallazgo durante la implementación: el backend no expone `GET /api/v1/auth/users` para listar operarios; el bloqueo/reactivación se hace por ID exacto, documentado como limitación conocida en `TK-049-FE.md`.
    * Componente `AccessDeniedState` extraído a `shared/components/` (antes duplicado entre `ReportsDashboard`, y a punto de triplicarse con los 2 paneles nuevos).

### Fixed
* **Auditoría de seguridad de código:** 5 hallazgos críticos cerrados (TK-029).
* **Gate de calidad ciego:** `lint` resolvía a `tsc --noEmit` sin ningún linter de estilo real instalado, dejando sin hacer cumplir reglas ya escritas en `frontend_rules.md` (TK-033).
* **Configuración validada pero no consumida:** `CORS_ALLOWED_ORIGINS`/`RATE_LIMIT_*` se validaban con Zod pero ningún middleware las leía (`app.use(cors())` sin argumentos) (TK-046).
* **Vulnerabilidad de PIN en texto plano** en `prisma/seed.ts`, nunca ejecutado en un flujo real hasta que la verificación en vivo de TK-048/TK-049 expuso que no existía forma de crear el primer administrador (TK-051).
* **Gap de sincronización de artefactos ágiles:** el código, los tests y `openapi.yaml` se mantenían sincronizados ticket a ticket, pero User Stories, fichas de ticket, PRD y `readme.md` no se actualizaban salvo que alguien lo auditara manualmente después (TK-054).

### Changed
* `readme.md` §4 (Especificación de la API): ejemplos de request/response corregidos para reflejar el contrato real (`/api/v1/...`, `accessToken` en vez de `token`, roles `KITCHEN_STAFF`/`ADMIN` en vez de `OPERATOR`, hash `scrypt` en vez de `bcrypt`) — habían quedado congelados desde el diseño inicial del MVP y nunca se resincronizaron con la implementación real.
* Nomenclatura y jerarquía de skills/workflows de `.agents/` estandarizada (TK-027).

## [0.3.0] - 2026-08-05

Esta versión marca la industrialización completa de la Gobernanza VSDD, el motor de habilidades agénticas y la auditoría formal de especificaciones.

### Added
* **Industrialización del Motor de Agentes y Gobernanza VSDD:**
    * Consolidación de los 7 archivos de reglas en `docs/03_governance_and_quality/rules/` (`domain_rules`, `backend_rules`, `database_rules`, `frontend_rules`, `testing_rules`, `security_rules`, `git_rules`) inyectando Pila Tecnológica Detectada, Principios SOLID, WCAG 2.1 AA/AAA, ergonomía táctil (48px) y sanitización Zod.
    * Extensión del catálogo a 23 Habilidades en `.agents/skills/`, agregando la habilidad de autorrecuperación de errores ([SK-22_agent_troubleshooting](.agents/skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md)) y seguridad de dependencias ([SK-23_dependency_security_guard](.agents/skills/development/05_quality_and_lint/SK-23_audit_dependency_security.md)).
    * Inclusión de plantillas agnósticas en pseudocódigo dentro de `.agents/examples/` ([00_few_shot_patterns.md](.agents/examples/00_few_shot_patterns.md)).
    * Creación y ejecución de la auditoría formal de especificaciones en [docs/audits/specs-2026-08-05.md](docs/audits/specs-2026-08-05.md) obteniendo el veredicto oficial **IMPLEMENTABLE**.
    * Optimización del prompt de auditoría de especificaciones VSDD en [.agents/workflows/03_spec_audit_workflow.md](.agents/workflows/03_spec_audit_workflow.md).

### Changed
*   **Sincronización de Contratos y Manuales:**
    * Sincronización del contrato maestro [AGENTS.md](AGENTS.md) con la directiva innegociable *Dynamic Rule Discovery*.
    * Actualización del manual de operaciones [.agents/README.md](.agents/README.md) con enlaces verificados hacia el catálogo completo de 23 habilidades.

----

## [0.2.0] - 2026-07-11

Esta versión marca la integración de la especificación de Reporte de Mermas (Dashboard) y el robustecimiento de las políticas de consistencia de la base de especificación tras la segunda auditoría.

### Added
*   **Especificación de Dashboard y Reporte de Mermas (US-009/TK-010):**
    *   Diseño funcional ([docs/05_agile_planning/user_stories/reports/US-009.md](docs/05_agile_planning/user_stories/reports/US-009.md)) y técnico ([docs/05_agile_planning/tickets/reports/backend/TK-010.md](docs/05_agile_planning/tickets/reports/backend/TK-010.md)) para permitir a los administradores visualizar pérdidas físicas consolidadas en cocina.
    *   Especificación del endpoint `GET /api/reports/waste` con soporte para agrupación por ingrediente y motivo en un rango de fechas ([docs/04_persistence_and_api/10_restostock_api_specification.md](docs/04_persistence_and_api/10_restostock_api_specification.md)).
    *   Diseño estructural de la arquitectura hexagonal en el slice vertical de reportes (`reports/`) en [docs/02_architecture_design/03_restostock_design.md](docs/02_architecture_design/03_restostock_design.md) y [docs/02_architecture_design/06_restostock_folder_structure.md](docs/02_architecture_design/06_restostock_folder_structure.md).
*   **Gobernanza y Aseguramiento:**
    *   Creación de [docs/audits/specs-2026-07-31.md](docs/audits/specs-2026-07-31.md) para registrar los resultados de la auditoría de coherencia y resolver contradicciones entre la base de datos y la API.

### Changed
*   **Estandarización de Precisiones Decimales:**
    *   Actualización de los contratos API (`POST /api/stock/extraction` y `GET /api/kitchen/remanentes`) en [docs/04_persistence_and_api/10_restostock_api_specification.md](docs/04_persistence_and_api/10_restostock_api_specification.md) para exigir y retornar cantidades físicas serializadas como cadenas de texto (`string`), previniendo errores de precisión flotante.
*   **Gobernanza de Historial de Integraciones:**
    *   Actualización del instructivo de PRs en [.agents/skills/specs/05_agile_planning/SK-14_pull_requests.md](.agents/skills/specs/05_agile_planning/SK-14_pull_requests.md) para exigir la retención íntegra de metadatos (título y rama) recuperados de GitHub, impidiendo normalizaciones artificiales y permitiendo identificar de forma no destructiva las no conformidades.

---

## [0.1.0] - 2026-07-03

Esta versión marca la consolidación de la **Concepción del Producto (Discovery & Architecture Spec)** para la primera entrega del proyecto RestoStock, sentando las bases del monorepo y las operaciones básicas en cocina.

### Added
*   **Requerimientos del MVP (PRD):**
    *   Especificación de requerimientos core, alcance, modelo de usuarios y límites del MVP ([docs/01_product_definition/03_restostock_prd.md](docs/01_product_definition/03_restostock_prd.md)).
    *   Priorización MoSCoW del backlog de desarrollo.
*   **Arquitectura de Software y Diseño:**
    *   Diagrama de contenedores C4 y flujos de datos en Mermaid ([docs/02_architecture_design/04_restostock_architecture_diagram.md](docs/02_architecture_design/04_restostock_architecture_diagram.md)).
    *   Especificación detallada de la estructura de carpetas basada en Vertical Slicing e Hexagonal ([docs/02_architecture_design/06_restostock_folder_structure.md](docs/02_architecture_design/06_restostock_folder_structure.md)).
    *   Descripción de responsabilidades de componentes ([docs/02_architecture_design/05_restostock_components_description.md](docs/02_architecture_design/05_restostock_components_description.md)).
*   **Persistencia y Base de Datos:**
    *   Esquema inicial de base de datos en 3NF con PostgreSQL y Prisma ORM ([docs/04_persistence_and_api/09_restostock_database_schema.md](docs/04_persistence_and_api/09_restostock_database_schema.md)), incluyendo tipos Decimal de precisión y restricciones de integridad.
*   **Especificación de API REST Contract-First:**
    *   Contratos HTTP detallados con códigos de estado, esquemas de validación Zod y payloads de error ([docs/04_persistence_and_api/10_restostock_api_specification.md](docs/04_persistence_and_api/10_restostock_api_specification.md)).
*   **Políticas de Gobernanza de Código:**
    *   Estrategia de seguridad Zero Trust y mitigación OWASP ([docs/03_governance_and_quality/07_restostock_security_strategy.md](docs/03_governance_and_quality/07_restostock_security_strategy.md)).
    *   Estrategia de testing con directivas estrictas de TDD e implementación de InMemory Fakes ([docs/03_governance_and_quality/08_restostock_testing_strategy.md](docs/03_governance_and_quality/08_restostock_testing_strategy.md)).
*   **Backlog Funcional y Técnico (Historias y Tickets):**
    *   Especificación de historias `US-001` a `US-008` en formato INVEST con criterios de aceptación BDD (Given-When-Then) en [docs/05_agile_planning/user_stories/](docs/05_agile_planning/user_stories/).
    *   Especificación de tickets técnicos `TK-001` a `TK-009` estimados en Story Points e integradas a la matriz de trazabilidad en [docs/05_agile_planning/tickets/](docs/05_agile_planning/tickets/).
*   **Especificación de Recetas y Consumo Rápido en Cascadas (FEFO):**
    *   Diseño del caso de uso para el consumo en cascada FEFO (`ConsumeRecipeUseCase`).
    *   Especificación de nuevos endpoints en el contrato API: `POST /api/catalog/recipes`, `GET /api/kitchen/recipes` y `POST /api/kitchen/recipes/:id/consume` ([docs/04_persistence_and_api/10_restostock_api_specification.md](docs/04_persistence_and_api/10_restostock_api_specification.md)).
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`Recipe` y `RecipeIngredient`) en [docs/04_persistence_and_api/09_restostock_database_schema.md](docs/04_persistence_and_api/09_restostock_database_schema.md).
*   **Especificación de Cierre de Turno y Conciliación de Inventario:**
    *   Diseño lógico para el descarte masivo de remanentes vencidos (límite 24h TRR).
    *   Diseño del proceso de conciliación física y varianzas frente al stock teórico.
    *   Especificación del endpoint `POST /api/kitchen/shift-reconciliation` en el contrato API ([docs/04_persistence_and_api/10_restostock_api_specification.md](docs/04_persistence_and_api/10_restostock_api_specification.md)).
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`ShiftReconciliation` y `ShiftReconciliationItem`) en [docs/04_persistence_and_api/09_restostock_database_schema.md](docs/04_persistence_and_api/09_restostock_database_schema.md).
