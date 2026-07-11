# 📝 Changelog (Historial de Cambios - RestoStock)

Todos los cambios notables en este proyecto de especificación técnica y diseño de software serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [SemVer (Semantic Versioning)](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

### Changed

---

## [0.2.0] - 2026-07-11

Esta versión marca la integración de la especificación de Reporte de Mermas (Dashboard) y el robustecimiento de las políticas de consistencia de la base de especificación tras la segunda auditoría.

### Added
*   **Especificación de Dashboard y Reporte de Mermas (US-009/TK-010):**
    *   Diseño funcional ([docs/user_stories/US-009.md](docs/user_stories/US-009.md)) y técnico ([docs/tickets/TK-010.md](docs/tickets/TK-010.md)) para permitir a los administradores visualizar pérdidas físicas consolidadas en cocina.
    *   Especificación del endpoint `GET /api/reports/waste` con soporte para agrupación por ingrediente y motivo en un rango de fechas ([docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)).
    *   Diseño estructural de la arquitectura hexagonal en el slice vertical de reportes (`reports/`) en [docs/03_restostock_design.md](docs/03_restostock_design.md) y [docs/06_restostock_folder_structure.md](docs/06_restostock_folder_structure.md).
*   **Gobernanza y Aseguramiento:**
    *   Creación de [docs/audit_report.md](docs/audit_report.md) para registrar los resultados de la auditoría de coherencia y resolver contradicciones entre la base de datos y la API.

### Changed
*   **Estandarización de Precisiones Decimales:**
    *   Actualización de los contratos API (`POST /api/stock/extraction` y `GET /api/kitchen/remanentes`) en [docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md) para exigir y retornar cantidades físicas serializadas como cadenas de texto (`string`), previniendo errores de precisión flotante.
*   **Gobernanza de Historial de Integraciones:**
    *   Actualización del instructivo de PRs en [.prompts/skills/SK-14_pull_requests.md](.prompts/skills/SK-14_pull_requests.md) para exigir la retención íntegra de metadatos (título y rama) recuperados de GitHub, impidiendo normalizaciones artificiales y permitiendo identificar de forma no destructiva las no conformidades.

---

## [0.1.0] - 2026-07-03

Esta versión marca la consolidación de la **Concepción del Producto (Discovery & Architecture Spec)** para la primera entrega del proyecto RestoStock, sentando las bases del monorepo y las operaciones básicas en cocina.

### Added
*   **Requerimientos del MVP (PRD):**
    *   Especificación de requerimientos core, alcance, modelo de usuarios y límites del MVP ([docs/02_restostock_prd.md](docs/02_restostock_prd.md)).
    *   Priorización MoSCoW del backlog de desarrollo.
*   **Arquitectura de Software y Diseño:**
    *   Diagrama de contenedores C4 y flujos de datos en Mermaid ([docs/04_restostock_architecture_diagram.md](docs/04_restostock_architecture_diagram.md)).
    *   Especificación detallada de la estructura de carpetas basada en Vertical Slicing e Hexagonal ([docs/06_restostock_folder_structure.md](docs/06_restostock_folder_structure.md)).
    *   Descripción de responsabilidades de componentes ([docs/05_restostock_components_description.md](docs/05_restostock_components_description.md)).
*   **Persistencia y Base de Datos:**
    *   Esquema inicial de base de datos en 3NF con PostgreSQL y Prisma ORM ([docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md)), incluyendo tipos Decimal de precisión y restricciones de integridad.
*   **Especificación de API REST Contract-First:**
    *   Contratos HTTP detallados con códigos de estado, esquemas de validación Zod y payloads de error ([docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)).
*   **Políticas de Gobernanza de Código:**
    *   Estrategia de seguridad Zero Trust y mitigación OWASP ([docs/07_restostock_security_strategy.md](docs/07_restostock_security_strategy.md)).
    *   Estrategia de testing con directivas estrictas de TDD e implementación de InMemory Fakes ([docs/08_restostock_testing_strategy.md](docs/08_restostock_testing_strategy.md)).
*   **Backlog Funcional y Técnico (Historias y Tickets):**
    *   Especificación de historias `US-001` a `US-008` en formato INVEST con criterios de aceptación BDD (Given-When-Then) en [docs/user_stories/](docs/user_stories/).
    *   Especificación de tickets técnicos `TK-001` a `TK-009` estimados en Story Points e integradas a la matriz de trazabilidad en [docs/tickets/](docs/tickets/).
*   **Especificación de Recetas y Consumo Rápido en Cascadas (FEFO):**
    *   Diseño del caso de uso para el consumo en cascada FEFO (`ConsumeRecipeUseCase`).
    *   Especificación de nuevos endpoints en el contrato API: `POST /api/catalog/recipes`, `GET /api/kitchen/recipes` y `POST /api/kitchen/recipes/:id/consume` ([docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)).
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`Recipe` y `RecipeIngredient`) en [docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md).
*   **Especificación de Cierre de Turno y Conciliación de Inventario:**
    *   Diseño lógico para el descarte masivo de remanentes vencidos (límite 24h TRR).
    *   Diseño del proceso de conciliación física y varianzas frente al stock teórico.
    *   Especificación del endpoint `POST /api/kitchen/shift-reconciliation` en el contrato API ([docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)).
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`ShiftReconciliation` y `ShiftReconciliationItem`) en [docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md).
