# 📚 Documentación Técnica de RestoStock

Este directorio contiene toda la documentación técnica, especificaciones de arquitectura, contratos de API, estrategias de seguridad, testing y gestión del backlog de RestoStock.

La documentación está organizada cronológicamente en 5 fases coincidentes con el catálogo de habilidades de IA (`.agents/skills/specs/`):

---

## 🧭 Índice por Fases de Desarrollo

### 01. Concepción y Alcance de Producto (`docs/01_product_definition/`)
* [01_product_discovery.md](01_product_definition/01_product_discovery.md): Documento inicial de descubrimiento, investigación de mercado y análisis Buy vs Build.
* [01_glosario_y_reglas_negocio.md](01_product_definition/01_glosario_y_reglas_negocio.md): Glosario de términos de dominio, acrónimos (FEFO, TRR) e invariantes innegociables.
* [02_prd.md](01_product_definition/02_prd.md): Documento de Requerimientos de Producto (PRD), épicas, historias preliminares y edge cases.

### 02. Diseño de Arquitectura y Sistema (`docs/02_architecture_design/`)
* [03_domain_model.md](02_architecture_design/03_domain_model.md): Modelo conceptual de dominio, agregados, Value Objects e invariantes puras.
* [04_technical_design.md](02_architecture_design/04_technical_design.md): Especificación técnica de arquitectura hexagonal, stack tecnológico y C4 diagrams.
* [05_ui_ux_design_system.md](02_architecture_design/05_ui_ux_design_system.md): Sistema de diseño UI/UX, tokens visuales, ergonomía táctil y accesibilidad.

### 03. Persistencia y Contratos API (`docs/03_persistence_and_api/`)
* [06_database_schema.md](03_persistence_and_api/06_database_schema.md): Esquema declarativo de base de datos en 3NF, diccionario de datos y seeds.
* [07_api_specification.md](03_persistence_and_api/07_api_specification.md): Especificación de contratos RESTful, JSON/Zod schemas, cabeceras y RFC 7807 error envelopes.
* [openapi.yaml](03_persistence_and_api/openapi.yaml): Contrato OpenAPI 3.1 ejecutable para mocking, linting con Spectral y Postman.

### 04. Gobernanza, Calidad y Ciberseguridad (`docs/04_governance_and_quality/`)
* [08_security_strategy.md](04_governance_and_quality/08_security_strategy.md): Estrategia de seguridad Zero Trust, cifrado PII, OWASP Top 10 y cumplimiento GDPR/EU AI Act.
* [09_testing_strategy.md](04_governance_and_quality/09_testing_strategy.md): Directiva innegociable de pruebas TDD Red-Green-Refactor, pirámide de testing y fakes InMemory.
* [10_cicd_pipeline.md](04_governance_and_quality/10_cicd_pipeline.md): Pipeline de CI/CD DevSecOps en GitHub Actions (`.github/workflows/ci.yml`).

### 05. Gestión Ágil y Planificación (`docs/05_agile_planning/`)
* [11_user_stories/indice_user_stories.md](05_agile_planning/11_user_stories/indice_user_stories.md): Historias de usuario INVEST con criterios BDD Gherkin.
* [12_tickets/indice_tickets.md](05_agile_planning/12_tickets/indice_tickets.md): Tickets técnicos atómicos con DoD y estimaciones (`TK-XXX`).
* [13_matriz_trazabilidad.md](05_agile_planning/13_matriz_trazabilidad.md): Matriz de trazabilidad Requerimiento → US → TK (Backend/Frontend).
* [14_backlog_map.md](05_agile_planning/14_backlog_map.md): Mapa jerárquico del backlog (Epic → US → TK) con diagrama Mermaid.
* [15_history.md](05_agile_planning/15_history.md): Bitácora cronológica de entregas e historial de progreso del proyecto.
