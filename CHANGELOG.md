# 📝 Changelog (Historial de Cambios - RestoStock)

Todos los cambios notables en este proyecto serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [SemVer (Semantic Versioning)](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
*   **Especificación de Recetas y Consumo Rápido en Cascadas (FEFO):**
    *   Diseño del caso de uso para el consumo en cascada FEFO (`ConsumeRecipeUseCase`).
    *   Especificación de nuevos endpoints en el contrato API: `POST /api/catalog/recipes`, `GET /api/kitchen/recipes` y `POST /api/kitchen/recipes/:id/consume`.
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`Recipe` y `RecipeIngredient`).
    *   Historia de usuario `US-007` y ticket de trabajo `TK-008` agregados al backlog.
*   **Especificación de Cierre de Turno y Conciliación de Inventario:**
    *   Diseño lógico para el descarte masivo de remanentes vencidos (límite 24h TRR).
    *   Diseño del proceso de conciliación física y varianzas frente al stock teórico.
    *   Especificación del endpoint `POST /api/kitchen/shift-reconciliation` en el contrato API.
    *   Diseño de los modelos de datos en la especificación del esquema Prisma (`ShiftReconciliation` y `ShiftReconciliationItem`).
    *   Historia de usuario `US-008` y ticket de trabajo `TK-009` agregados al backlog.
*   **Gobernanza y Aseguramiento:**
    *   [docs/audit_report.md](docs/audit_report.md) para documentar la auditoría de consistencia de la base de especificación.
*   **Especificación de Dashboard y Reporte de Mermas Visibles (Opción A):**
    *   Especificación del endpoint `GET /api/reports/waste` para consulta y consolidación agregada de mermas físicas.
    *   Diseño de la estructura y arquitectura para el vertical slice de reportes (`reports/domain`, `reports/application`, `reports/infrastructure`).
    *   Historia de usuario `US-009` y ticket de trabajo `TK-010` agregados al backlog.
*   **Estandarización de Precisiones Decimales:**
    *   Actualización de especificación de contratos API (endpoints `POST /api/stock/extraction` y `GET /api/kitchen/remanentes`) para exigir y retornar cantidades físicas serializadas estrictamente como cadenas de texto (`string`) para evitar pérdida de precisión flotante.
*   **Gobernanza de Historial de Integraciones:**
    *   Actualización de la habilidad de PRs (`.prompts/skills/SK-14_pull_requests.md`) para forzar la preservación verbatim de metadatos históricos (título y rama de PR) recuperados de GitHub, señalando las no conformidades sin realizar normalizaciones artificiales.



---

## [0.1.0] - 2026-07-03

Esta versión marca la consolidación de la **Concepción del Producto (Discovery & Architecture Spec)** para la primera entrega del proyecto RestoStock.

### Added
*   **Arquitectura de Software y Diseño:**
    *   Diagrama de contenedores C4 y flujos de datos en Mermaid ([docs/04_restostock_architecture_diagram.md](docs/04_restostock_architecture_diagram.md)).
    *   Especificación detallada de la estructura de carpetas basada en Vertical Slicing e Hexagonal ([docs/06_restostock_folder_structure.md](docs/06_restostock_folder_structure.md)).
    *   Descripción de responsabilidades de componentes ([docs/05_restostock_components_description.md](docs/05_restostock_components_description.md)).
*   **Requerimientos del MVP (PRD):**
    *   Especificación de requerimientos core, alcance, modelo de usuarios y límites del MVP ([docs/02_restostock_prd.md](docs/02_restostock_prd.md)).
    *   Priorización MoSCoW del backlog de desarrollo.
*   **Persistencia y Base de Datos:**
    *   Esquema inicial de base de datos en 3NF con PostgreSQL y Prisma ORM ([docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md)), incluyendo tipos Decimal de precisión y restricciones de integridad.
*   **Especificación de API REST Contract-First:**
    *   Contratos HTTP detallados con códigos de estado, esquemas de validación Zod y payloads de error ([docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)).
*   **Políticas de Gobernanza de Código:**
    *   Estrategia de seguridad Zero Trust y mitigación OWASP ([docs/07_restostock_security_strategy.md](docs/07_restostock_security_strategy.md)).
    *   Estrategia de testing con directivas estrictas de TDD e implementación de InMemory Fakes ([docs/08_restostock_testing_strategy.md](docs/08_restostock_testing_strategy.md)).
*   **Backlog de Historias de Usuario (US):**
    *   Historias `US-001` a `US-006` en formato INVEST con criterios de aceptación BDD (Given-When-Then).
*   **Backlog de Desarrollo (Tickets de Trabajo):**
    *   Fichas técnicas `TK-001` a `TK-007` estimadas en Story Points e integradas a la matriz de trazabilidad.
