# 📚 Documentación Técnica de RestoStock

Este directorio contiene toda la documentación técnica, especificaciones de arquitectura, contratos de API, estrategias de seguridad, testing y gestión del backlog de RestoStock.

La documentación está organizada cronológicamente en 5 fases coincidentes con el catálogo de habilidades de IA (`.agents/skills/specs/`):

---

## 🧭 Índice por Fases de Desarrollo

### 01. Concepción y Alcance de Producto (`docs/01_product_definition/`)
* [01_idea_inicial.md](01_product_definition/01_idea_inicial.md): Documento inicial de descubrimiento y análisis del problema de negocio.
* [02_restostock_prd.md](01_product_definition/02_restostock_prd.md): Documento de Requerimientos de Producto (PRD), épicas, historias preliminares y edge cases.
* [03_glosario_y_reglas_negocio.md](01_product_definition/03_glosario_y_reglas_negocio.md): Glosario de términos de dominio, acrónimos (FEFO, TRR) e invariantes innegociables.

### 02. Diseño de Arquitectura y Sistema (`docs/02_architecture_design/`)
* [03_restostock_design.md](02_architecture_design/03_restostock_design.md): Especificación técnica de arquitectura hexagonal y modelo conceptual de persistencia 3NF.
* [04_restostock_architecture_diagram.md](02_architecture_design/04_restostock_architecture_diagram.md): Diagrama C4 de contenedores de arquitectura física y lógica en Mermaid.
* [05_restostock_components_description.md](02_architecture_design/05_restostock_components_description.md): Descripción de responsabilidades e inyección de dependencias por capas.
* [06_restostock_folder_structure.md](02_architecture_design/06_restostock_folder_structure.md): Jerarquía física de directorios combinando Vertical Slices y Arquitectura Hexagonal.
* [adr/](02_architecture_design/adr): Registro de Decisiones de Arquitectura (ADR - Architecture Decision Records) tomadas durante el ciclo de vida del proyecto.

### 03. Gobernanza, Calidad y Seguridad (`docs/03_governance_and_quality/`)
* [07_restostock_security_strategy.md](03_governance_and_quality/07_restostock_security_strategy.md): Estrategia de seguridad OWASP Top 10, sanitización, JWT y cumplimiento regulatorio.
* [08_restostock_testing_strategy.md](03_governance_and_quality/08_restostock_testing_strategy.md): Directiva de testing TDD (Red-Green-Refactor) y cobertura obligatoria.
* [09_restostock_technical_writing_guide.md](03_governance_and_quality/09_restostock_technical_writing_guide.md): Guía de estilo, convenciones de nomenclatura y redacción técnica para IA.
* [audits/](audits): Directorio de reportes de auditoría integral y hallazgos.

### 04. Modelo Físico y Contratos API (`docs/04_persistence_and_api/`)
* [09_restostock_database_schema.md](04_persistence_and_api/09_restostock_database_schema.md): Esquema declarativo de base de datos Prisma (`schema.prisma`) en 3NF.
* [10_restostock_api_specification.md](04_persistence_and_api/10_restostock_api_specification.md): Especificación OpenAPI 3.0 de endpoints REST, esquemas Zod y códigos HTTP.

### 05. Gestión Agile, Backlog y PRs (`docs/05_agile_planning/`)
* [matriz_trazabilidad.md](05_agile_planning/matriz_trazabilidad.md): Matriz de trazabilidad End-to-End VSDD conectando REQ $\rightarrow$ API $\rightarrow$ US $\rightarrow$ TK.
* [backlog_map.md](05_agile_planning/backlog_map.md): Mapa del backlog y relaciones visuales entre Épicas, User Stories y Tickets.
* [user_stories/](05_agile_planning/user_stories/indice_user_stories.md): Historias de usuario INVEST con criterios BDD Gherkin.
* [tickets/](05_agile_planning/tickets/indice_tickets.md): Tickets técnicos atómicos con DoD y estimaciones.
