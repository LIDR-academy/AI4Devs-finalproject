---
framework: ".agents / VSDD Governance Framework"
version: "2.3.0 (SOTA Enterprise 2026 Edition)"
author: "Jose Lacruz <lacruzjd@gmail.com>"
program: "AI4Devs - Final Project"
methodology: "Verified Spec-Driven Development (VSDD)"
transparency: "EU AI Act Compliant / Synthetic AI-Driven Architecture"
license: "MIT"
---

# 🤖 Manual de Operaciones y Configuración del Agente de IA (.agents)

Este directorio contiene las meta-directivas, reglas de gobernanza y habilidades procedimentales que guían el comportamiento de los asistentes de desarrollo basados en Inteligencia Artificial (Google Antigravity, Gemini, etc.) en el proyecto.

> [!IMPORTANT]
> **✋ REGLA INNEGOCIABLE DE APROBACIÓN PREVIA (HUMAN-IN-THE-LOOP):**
> Antes de guardar cambios o crear cualquier archivo de especificación, diseño, sistema de color, arquitectura o código fuente, el Agente DEBE presentar primero su propuesta completa o borrador al Usuario (Especialista) y obtener su confirmación o aprobación explícita. Queda terminantemente prohibido modificar o crear archivos en disco sin previa autorización del usuario.

> [!IMPORTANT]
> **📦 FASE 0 OBLIGATORIA — LECTURA DEL STACK MANIFEST (Guard 24):**
> Antes de ejecutar cualquier Skill que genere código, configuración o infraestructura, el agente DEBE leer `docs/00_stack_manifest.md` como **Fase 0**. Este archivo es la **Fuente Única de Verdad (SSoT)** del stack tecnológico aprobado por el humano. Si una herramienta, versión o comando no aparece en ese manifiesto → **DETENERSE e informar al humano**. Nunca asumir ni inventar decisiones tecnológicas.


---

## 🗺️ 1. Arquitectura del Arnés .agents

El marco opera bajo una arquitectura desacoplada en 3 capas de responsabilidad:

```mermaid
flowchart TD
    subgraph CAPA1 ["1. CAPA DE ORQUESTACION (Workflows 00..06)"]
        W01["01_cascading_spec_workflow.md"]
        W02["02_cascading_dev_workflow.md"]
        W06["06_full_qa_pipeline.md"]
    end

    subgraph CAPA2 ["2. CAPA DE HABILIDADES PROCEDIMENTALES (Skills SK-01..27)"]
        S_Spec["Skills de Specs (SK-01 a SK-15)"]
        S_Dev["Skills de Dev (SK-16 a SK-27)"]
    end

    subgraph CAPA3 ["3. CAPA DE GOBERNANZA VIVA (docs/ & AGENTS.md)"]
        AGENTS["AGENTS.md (Comandos CLI)"]
        Rules["docs/04_governance_and_quality/rules/"]
    end

    W01 --> S_Spec
    W02 --> S_Dev
    S_Dev --> AGENTS
    S_Dev --> Rules
```

---

## ⚡ 2. Guía de Invocación Rápida (Cheatsheet de Prompts)

| Deseo / Tarea | Prompt de Invocación Recomendado |
|:---|:---|
| **Diseñar Nueva Idea / Feature:** | `@.agents/workflows/01_cascading_spec_workflow.md Analiza e integra esta nueva idea: [descripción]` |
| **Desarrollar Ticket Técnico:** | `@.agents/workflows/02_cascading_dev_workflow.md Implementa el ticket TK-XXX` |
| **Auditar Especificaciones (Docs):** | `@.agents/workflows/03_spec_audit_prompt.md Audita las especificaciones en docs/` |
| **Revisión por Reviewer Independiente:** | `@.agents/workflows/04_dev_audit_prompt.md Actúa como Reviewer y audita el ticket TK-XXX` |
| **Ejecutar Bucle Autónomo TDD:** | `@.agents/workflows/05_test_runner_agent.md Corre la suite TDD para el ticket TK-XXX` |
| **Ejecutar Pipeline QA SOTA:** | `@.agents/workflows/06_full_qa_pipeline.md Ejecuta la verificación completa de QA` |
| **Incidencia Producción → Ticket:** | `@.agents/workflows/07_production_observability_agent.md Analiza esta incidencia de producción: [stacktrace]` |
| **Validar Despliegue Post-Deploy:** | `@.agents/workflows/08_smoke_test_deploy_validation.md Valida el despliegue en: [URL]` |

---

## 💡 3. Meta-Protocolos de Trabajo (Master Workflows)

Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir estrictamente estos flujos maestros:

*   **[Mapa y Trazo Maestro VSDD](workflows/00_master_vsdd_workflow.md):** Diagrama de secuencia y explicación end-to-end desde la idea inicial hasta el commit atómico en Git.
*   **[Protocolo de Especificación en Cascada (Nuevas Ideas / Specs)](workflows/01_cascading_spec_workflow.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial (`Idea ➔ docs/`).
*   **[Protocolo de Desarrollo en Cascada (Codificación / Tickets)](workflows/02_cascading_dev_workflow.md):** Guía paso a paso para ejecutar un ticket técnico desde la extracción de reglas, migraciones, TDD, verificación de linter, pruebas visuales y commit atómico (`TK-XXX ➔ apps/`).
*   **[Prompt de Auditoría de Especificaciones VSDD](workflows/03_spec_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para auditar la suficiencia de la documentación viva antes de codificar (`docs/`).
*   **[Prompt de Auditoría de Código y Calidad VSDD](workflows/04_dev_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para la revisión adversarial del Reviewer Independiente sobre el código antes de hacer commit (`apps/`).
*   **[Agente Autónomo de Testing](workflows/05_test_runner_agent.md):** Subagente especializado en el bucle autónomo TDD (Red-Green-Refactor).
*   **[Pipeline QA Completo SOTA v2.1](workflows/06_full_qa_pipeline.md):** Pipeline QA completo con Mutation Score >= 70% y veredicto JSON Schema.
*   **[Observabilidad en Producción Shift-Right v2.0](workflows/07_production_observability_agent.md):** Captura logs/stacktraces de producción, genera BDD Gherkin, pruebas de regresión y cierra el bucle convirtiendo incidencias en tickets `TK-XXX` del backlog (Paso 4 nuevo).
*   **[Smoke Test & Deploy Validation](workflows/08_smoke_test_deploy_validation.md):** Valida post-despliegue ejecutando health checks, smoke tests de contratos HTTP (3 Oráculos) y verifica seguridad de cabeceras. Emite veredicto PASS/FAIL con rollback automático OpenTofu si falla.

---

## 🔴 4. Reglas y Estándares del Proyecto (Project Specifications)

Toda regla de arquitectura, base de datos, ciberseguridad, testing e infraestructura IaC es **dinámica y agnóstica**, e inferida directamente por las habilidades a partir de la documentación viva del proyecto en `docs/`:

*   **Alcance y Producto:** `docs/01_product_definition/` (PRDs y Reglas de Negocio).
*   **Arquitectura y Diseño:** `docs/02_architecture_design/` (Capas, Mappers, ADRs y Estructura).
*   **Persistencia y APIs:** `docs/03_persistence_and_api/` (Esquemas de Base de Datos y OpenAPI 3.0).
*   **Gobernanza y Calidad:** `docs/04_governance_and_quality/` (Estrategias de prueba, seguridad, CI/CD e informes).
*   **Gestión Ágil:** `docs/05_agile_planning/` (User Stories INVEST y Tickets Técnicos).

---

## 🔵 5. Catálogo de Skills por Fase y Rol Técnico

Las 34 habilidades son runbooks especializados organizados por fases y roles técnicos que la IA carga bajo demanda:

### Fase Documental (Product Owner & Architect Roles)
*   **01_product_definition:** [SK-01 Descubrimiento de Producto](skills/specs/01_product_definition/SK-01_discover_product_vision.md) y [SK-02 Generación del PRD](skills/specs/01_product_definition/SK-02_generate_prd.md).
*   **02_architecture_design:** [SK-03 Modelo de Dominio](skills/specs/02_architecture_design/SK-03_design_domain_model.md), [SK-04 Diseño Técnico](skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) y [SK-05 Asistente de Diseño UI/UX](skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md).
*   **03_persistence_and_api:** [SK-06 Esquema de Base de Datos](skills/specs/03_persistence_and_api/SK-06_design_database_schema.md) y [SK-07 Especificación API REST](skills/specs/03_persistence_and_api/SK-07_design_api_specification.md).
*   **04_governance_and_quality:** [SK-08 Estrategia de Seguridad](skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md), [SK-09 Estrategia de Pruebas](skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md) y [SK-10 Pipeline CI/CD & OpenTofu IaC](skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md).
*   **05_agile_planning:** [SK-11 Historias de Usuario (INVEST)](skills/specs/05_agile_planning/SK-11_generate_user_stories.md), [SK-12 Planificación de Tickets](skills/specs/05_agile_planning/SK-12_generate_backlog_tickets.md), [SK-13 Matriz de Trazabilidad](skills/specs/05_agile_planning/SK-13_generate_traceability_matrix.md), [SK-14 Mapa del Backlog](skills/specs/05_agile_planning/SK-14_generate_backlog_map.md) y [SK-15 Registro de PRs](skills/specs/05_agile_planning/SK-15_document_pull_requests.md).

### Fase DevSecOps & Gobernanza de Seguridad (DevSecOps Lead & Auditor Roles)
*   **Seguridad Shift-Left & CI/CD:** [SK-08 Estrategia de Seguridad](skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md), [SK-10 Pipeline CI/CD Node 24 & OpenTofu IaC](skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md), [SK-23 Seguridad en Dependencias Anti-Slopsquatting](skills/development/05_quality_and_lint/SK-23_audit_dependency_security.md) y [SK-25 Auditoría de Validación de Contratos](skills/development/05_quality_and_lint/SK-25_audit_contract_validation.md).
*   **Workflows de Auditoría Adversarial:** [Workflow 03 Auditoría de Especificaciones](workflows/03_spec_audit_prompt.md), [Workflow 04 Auditoría Adversarial DevSecOps](workflows/04_dev_audit_prompt.md) y [Workflow 07 Observabilidad en Producción Shift-Right](workflows/07_production_observability_agent.md).

### Fase de Codificación y Calidad (Developer, QA & Automation Roles)
*   **01_rules_extraction:** [SK-27 Extracción de Reglas Legacy](skills/development/01_rules_extraction/SK-27_extract_project_rules.md), [SK-30 Extractor de Diagramas Legacy (C4/ERD)](skills/development/01_rules_extraction/SK-30_legacy_diagram_extractor.md), [SK-31 Indexador de Deuda Técnica](skills/development/01_rules_extraction/SK-31_technical_debt_indexer.md) y [SK-33 Auditoría de Configuración de Entorno Fail-Fast](skills/development/01_rules_extraction/SK-33_environment_configuration_auditor.md).
*   **02_backend_development:** [SK-16 Desarrollo Backend & Entidades Secundarias](skills/development/02_backend_development/SK-16_develop_backend_ticket.md).
*   **03_frontend_development:** [SK-17 Desarrollo Frontend & Touch UI](skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md).
*   **04_persistence_and_db:** [SK-18 Migraciones, Seeds & Anti-Orfandad](skills/development/04_persistence_and_db/SK-18_execute_db_migration.md) y [SK-28 Seeding Profesional Idempotente](skills/development/04_persistence_and_db/SK-28_manage_database_seeding.md).
*   **05_quality_and_lint:** [SK-19 Refactor & Anti-N+1 / Anti-Mass-Assignment](skills/development/05_quality_and_lint/SK-19_refactor_and_lint.md), [SK-22 DBA Log Analysis & Troubleshooting](skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md), [SK-24 Characterization Testing](skills/development/05_quality_and_lint/SK-24_execute_characterization_testing.md), [SK-26 Recuperador Dinámico Few-Shot](skills/development/05_quality_and_lint/SK-26_retrieve_few_shot_context.md) y [SK-32 Test Fixture Builder (Object Mother)](skills/development/05_quality_and_lint/SK-32_test_fixture_builder.md).
*   **06_visual_qa:** [SK-20 Browser Visual QA](skills/development/06_visual_qa/SK-20_execute_browser_qa.md) y [SK-21 Auditoría Accesibilidad UI/a11y](skills/development/06_visual_qa/SK-21_audit_ui_accessibility.md).
*   **07_performance_and_observability:** [SK-29 Load & Performance Testing](skills/development/07_performance_and_observability/SK-29_load_and_performance_testing.md).
*   **quality/01_testing:** [SK-34 Model-Based Testing Designer (MBT & Oracles)](skills/quality/01_testing/SK-34_model_based_testing_designer.md).
*   **Patrones de Oro (Few-Shot):** [Plantillas y Ejemplos de Referencia](examples/FEW_SHOT_PATTERNS.md).


---

## 🧹 6. Mantenimiento y Verificación de Integridad

Para verificar autónomamente que el arnés `.agents/` no contenga enlaces rotos ni colisiones tras modificar o añadir habilidades:

```bash
bash .agents/scripts/validate_agents.sh
```

---

## 📜 7. Licencia y Reutilización

Este marco de gobernanza y habilidades (`.agents/`) se distribuye bajo la **Licencia MIT**. Es 100% abierto, portátil y reutilizable en cualquier proyecto o repositorio comercial o privado sin restricciones de tipo Copyleft / GPL.
