# 📝 Changelog (Historial de Cambios - RestoStock)

Todos los cambios notables en este proyecto de especificación técnica y diseño de software serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [SemVer (Semantic Versioning)](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
