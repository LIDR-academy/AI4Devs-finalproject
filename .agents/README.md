# 🤖 Manual de Operaciones y Configuración del Agente de IA (.agents)

Este directorio contiene las meta-directivas, reglas de gobernanza y habilidades procedimentales que guían el comportamiento de los asistentes de desarrollo basados en Inteligencia Artificial (Google Antigravity, Gemini, etc.) en el proyecto.

> [!IMPORTANT]
> **✋ REGLA INNEGOCIABLE DE APROBACIÓN PREVIA (HUMAN-IN-THE-LOOP):**
> Antes de guardar cambios o crear cualquier archivo de especificación, diseño, sistema de color, arquitectura o código fuente, el Agente DEBE presentar primero su propuesta completa o borrador al Usuario (Especialista) y obtener su confirmación o aprobación explícita. Queda terminantemente prohibido modificar o crear archivos en disco sin previa autorización del usuario.

---

## 💡 1. Meta-Protocolos de Trabajo (Master Workflows)
Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir estrictamente estos flujos maestros y su mapa de trazabilidad:

*   **[Mapa y Trazo Maestro VSDD](workflows/00_master_vsdd_workflow.md):** Diagrama de secuencia y explicación end-to-end desde la idea inicial hasta el commit atómico en Git.
*   **[Protocolo de Especificación en Cascada (Nuevas Ideas / Specs)](workflows/01_cascading_spec_workflow.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial (`Idea ➔ docs/`).
*   **[Protocolo de Desarrollo en Cascada (Codificación / Tickets)](workflows/02_cascading_dev_workflow.md):** Guía paso a paso para ejecutar un ticket técnico desde la extracción de reglas, migraciones, TDD, verificación de linter, pruebas visuales y commit atómico (`TK-XXX ➔ apps/`).
*   **[Prompt de Auditoría de Especificaciones VSDD](workflows/03_spec_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para auditar la suficiencia de la documentación viva antes de codificar (`docs/`).
*   **[Prompt de Auditoría de Código y Calidad VSDD](workflows/04_dev_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para la revisión adversarial del Reviewer Independiente sobre el código antes de hacer commit (`apps/`).
*   **[Agente Autónomo de Testing](workflows/05_test_runner_agent.md):** Subagente especializado en el bucle autónomo TDD (Red-Green-Refactor).
*   **[Pipeline QA Completo SOTA v2.1](workflows/06_full_qa_pipeline.md):** Pipeline QA completo con Mutation Score >= 70% y veredicto JSON Schema.

---

## 🔴 2. Reglas y Estándares del Proyecto (Project Specifications)
Toda regla de arquitectura, base de datos, ciberseguridad, testing y frontend es **dinámica y agnóstica**, e inferida directamente por las habilidades a partir de la documentación viva del proyecto en `docs/`:

*   **Alcance y Producto:** `docs/01_product_definition/` (PRDs y Reglas de Negocio).
*   **Arquitectura y Diseño:** `docs/02_architecture_design/` (Capas, Mappers, ADRs y Estructura).
*   **Persistencia y APIs:** `docs/03_persistence_and_api/` (Esquemas de Base de Datos y OpenAPI 3.0).
*   **Gobernanza y Calidad:** `docs/04_governance_and_quality/` (Estrategias de prueba, seguridad e informes).
*   **Gestión Ágil:** `docs/05_agile_planning/` (User Stories INVEST y Tickets Técnicos).

---

## 🔵 3. Catálogo de Skills (Habilidades Procedimentales)
Las habilidades son runbooks especializados organizados por fases que la IA carga bajo demanda para la generación o edición guiada de componentes:

### Fase Documental (Specs)
*   **01_product_definition:** [SK-01 Descubrimiento de Producto](skills/specs/01_product_definition/SK-01_discover_product_vision.md) y [SK-02 Generación del PRD](skills/specs/01_product_definition/SK-02_generate_prd.md).
*   **02_architecture_design:** [SK-03 Modelo de Dominio](skills/specs/02_architecture_design/SK-03_design_domain_model.md), [SK-04 Diseño Técnico](skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) y [SK-05 Asistente de Diseño UI/UX](skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md).
*   **03_persistence_and_api:** [SK-06 Esquema de Base de Datos](skills/specs/03_persistence_and_api/SK-06_design_database_schema.md) y [SK-07 Especificación API REST](skills/specs/03_persistence_and_api/SK-07_design_api_specification.md).
*   **04_governance_and_quality:** [SK-08 Estrategia de Seguridad](skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md), [SK-09 Estrategia de Pruebas](skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md) y [SK-10 Pipeline CI/CD](skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md).
*   **05_agile_planning:** [SK-11 Historias de Usuario (INVEST)](skills/specs/05_agile_planning/SK-11_generate_user_stories.md), [SK-12 Planificación de Tickets](skills/specs/05_agile_planning/SK-12_generate_backlog_tickets.md), [SK-13 Matriz de Trazabilidad](skills/specs/05_agile_planning/SK-13_generate_traceability_matrix.md), [SK-14 Mapa del Backlog](skills/specs/05_agile_planning/SK-14_generate_backlog_map.md) y [SK-15 Registro de PRs](skills/specs/05_agile_planning/SK-15_document_pull_requests.md).

### Fase de Codificación (Development)
*   **01_rules_extraction:** [SK-27 Extracción de Reglas Legacy](skills/development/01_rules_extraction/SK-27_extract_project_rules.md).
*   **02_backend_development:** [SK-16 Desarrollo Backend & Entidades Secundarias](skills/development/02_backend_development/SK-16_develop_backend_ticket.md).
*   **03_frontend_development:** [SK-17 Desarrollo Frontend & Touch UI](skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md).
*   **04_persistence_and_db:** [SK-18 Migraciones, Seeds & Anti-Orfandad](skills/development/04_persistence_and_db/SK-18_execute_db_migration.md).
*   **05_quality_and_lint:** [SK-19 Refactor & Anti-N+1 / Anti-Mass-Assignment](skills/development/05_quality_and_lint/SK-19_refactor_and_lint.md), [SK-22 DBA Log Analysis & Troubleshooting](skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md), [SK-23 Seguridad en Dependencias Anti-Slopsquatting](skills/development/05_quality_and_lint/SK-23_audit_dependency_security.md), [SK-24 Characterization Testing](skills/development/05_quality_and_lint/SK-24_execute_characterization_testing.md), [SK-25 Auditoría de Validación de Contratos](skills/development/05_quality_and_lint/SK-25_audit_contract_validation.md) y [SK-26 Recuperador Dinámico Few-Shot](skills/development/05_quality_and_lint/SK-26_retrieve_few_shot_context.md).
*   **06_visual_qa:** [SK-20 Browser Visual QA](skills/development/06_visual_qa/SK-20_execute_browser_qa.md) y [SK-21 Auditoría Accesibilidad UI/a11y](skills/development/06_visual_qa/SK-21_audit_ui_accessibility.md).
*   **Patrones de Oro (Few-Shot):** [Plantillas y Ejemplos de Referencia](examples/FEW_SHOT_PATTERNS.md).
