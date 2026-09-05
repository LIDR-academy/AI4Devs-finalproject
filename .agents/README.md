---
framework: ".agents / VSDD Governance Framework"
version: "2.13.0 (SOTA Enterprise 2026 Edition)"
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
> Antes de guardar cambios o crear cualquier archivo de especificación, diseño, sistema de color, arquitectura o código fuente, el Agente DEBE presentar primero su propuesta completa o borrador al Usuario (Especialista) y obtener su confirmación o aprobación explícita. Queda terminantemente prohibido modificar o crear archivos en disco sin previa autorización del usuario. **Esta regla cubre también al propio `.agents/`** — un cambio a `rules/`, `skills/` o `workflows/` (propuesto por el agente, o recibido vía PR externo tras instalar/actualizar el framework) no gobierna ninguna invocación hasta que el humano confirmó explícitamente ese diff ([`rules/03_untrusted_content_standard.md`](rules/03_untrusted_content_standard.md), Regla 5).

> [!IMPORTANT]
> **📦 FASE 0 OBLIGATORIA — LECTURA DEL STACK MANIFEST (Guard 24):**
> Antes de ejecutar cualquier Skill que genere código, configuración o infraestructura, el agente DEBE leer `docs/00_stack_manifest.md` como **Fase 0**. Este archivo es la **Fuente Única de Verdad (SSoT)** del stack tecnológico aprobado por el humano. Si una herramienta, versión o comando no aparece en ese manifiesto → **DETENERSE e informar al humano**. Nunca asumir ni inventar decisiones tecnológicas.


---

## 📥 0. Instalación en un Proyecto Nuevo

Desde un repositorio que ya tenga `.agents/` (como este), instala una copia en otro proyecto:
```bash
bash .agents/scripts/install.sh /ruta/al/proyecto/destino
```
Copia `.agents/` completo y genera `AGENTS.md` (stub de arranque, no el contrato final), `CLAUDE.md` y `GEMINI.md` en el destino — sin sobrescribir nada si el destino ya tiene un `.agents/` o entrypoints propios. El stub de `AGENTS.md` indica al agente qué workflow de bootstrap invocar (`00_greenfield_bootstrap_workflow.md` o `00_brownfield_adoption_workflow.md`); ese workflow, vía `SK-35`, reemplaza el stub por el contrato operativo real. También genera `.agents/INSTALLED_FROM.md` (`TK-065`) con la ruta/remote/commit de origen y la versión copiada, para poder diferenciar esta instalación contra el origen más adelante si se sospecha de drift.

Si no tienes acceso a un repo con `.agents/` ya instalado, copia manualmente la carpeta `.agents/` completa al proyecto destino y crea a mano los 3 archivos de entrypoint con el contenido que genera `install.sh` — no hay dependencia de build ni paquete que instalar, son archivos markdown planos.

### 🚀 Primeros Pasos (Quickstart)

`.agents/` no genera nada por sí solo — guía a un agente de IA a través de un flujo progresivo, con aprobación humana explícita en cada paso (ver banner HITL arriba):

1. **Instala** (arriba) y abre el proyecto destino con tu asistente de IA; pídele que lea `AGENTS.md` — el stub generado te dirige al workflow de bootstrap correcto.
2. **Bootstrap, una única vez por proyecto:** `00_greenfield_bootstrap_workflow.md` si el proyecto está vacío, o `00_brownfield_adoption_workflow.md` si ya hay código. Decide el stack contigo y genera `docs/00_stack_manifest.md` (Guard 24) + el esqueleto mínimo de `docs/`.
3. **Por cada idea/feature nueva:** `01_cascading_spec_workflow.md` — cascada de specs (PRD → dominio → schema de BD → contrato API → tickets `TK-XXX`) **antes** de escribir una sola línea de código (Guard 26).
4. **Por cada ticket, uno a la vez:** `02_cascading_dev_workflow.md Implementa el ticket TK-XXX` — TDD real, migraciones, linter, commit atómico.
5. **Según haga falta:** los workflows `03`-`09` cubren auditoría de specs/código, QA, observabilidad de producción y validación de despliegue — ver la tabla completa en la sección 2 y el mapa end-to-end en [`00_master_vsdd_workflow.md`](workflows/00_master_vsdd_workflow.md).

---

## 🗺️ 1. Arquitectura del Arnés .agents

El marco opera bajo una arquitectura desacoplada en 3 capas de responsabilidad:

```mermaid
flowchart TD
    subgraph CAPA1 ["1. CAPA DE ORQUESTACION (12 Workflows)"]
        W00["00_* Bootstrap/Adopción (una sola vez): master, greenfield, brownfield"]
        W01["01_cascading_spec_workflow.md"]
        W02["02_cascading_dev_workflow.md"]
        W0X["03..08: Auditoría, TDD, QA, Observabilidad, Deploy"]
    end

    subgraph CAPA2 ["2. CAPA DE HABILIDADES PROCEDIMENTALES (35 Skills)"]
        S_Spec["Skills de Specs (SK-01 a SK-15, SK-35)"]
        S_Dev["Skills de Dev (SK-16 a SK-34)"]
    end

    subgraph CAPA3 ["3. CAPA DE GOBERNANZA VIVA (docs/ & AGENTS.md)"]
        AGENTS["AGENTS.md (generado por SK-35, nunca a mano)"]
        StackManifest["docs/00_stack_manifest.md (Guard 24, generado por SK-04)"]
        Rules["docs/04_governance_and_quality/rules/ (generado por SK-27)"]
    end

    W00 --> S_Spec
    W01 --> S_Spec
    W02 --> S_Dev
    S_Spec --> AGENTS
    S_Spec --> StackManifest
    S_Dev --> AGENTS
    S_Dev --> Rules
```

---

## ⚡ 2. Guía de Invocación Rápida (Cheatsheet de Prompts)

| Deseo / Tarea | Prompt de Invocación Recomendado |
|:---|:---|
| **Arrancar Proyecto Nuevo desde Cero (Greenfield):** | `@.agents/workflows/00_greenfield_bootstrap_workflow.md Arranca un proyecto nuevo a partir de esta idea: [descripción]` |
| **Adoptar `.agents/` en Proyecto Existente (Brownfield):** | `@.agents/workflows/00_brownfield_adoption_workflow.md Adopta .agents/ en este código existente: [ruta]` |
| **Diseñar Nueva Idea / Feature:** | `@.agents/workflows/01_cascading_spec_workflow.md Analiza e integra esta nueva idea: [descripción]` |
| **Desarrollar Ticket Técnico:** | `@.agents/workflows/02_cascading_dev_workflow.md Implementa el ticket TK-XXX` |
| **Auditar Especificaciones (Docs):** | `@.agents/workflows/03_spec_audit_workflow.md Audita las especificaciones en docs/` |
| **Revisión por Reviewer Independiente:** | `@.agents/workflows/04_dev_audit_workflow.md Actúa como Reviewer y audita el ticket TK-XXX` |
| **Ejecutar Bucle Autónomo TDD:** | `@.agents/workflows/05_test_runner_workflow.md Corre la suite TDD para el ticket TK-XXX` |
| **Ejecutar Pipeline QA SOTA:** | `@.agents/workflows/06_full_qa_pipeline.md Ejecuta la verificación completa de QA` |
| **Incidencia Producción → Ticket:** | `@.agents/workflows/07_production_observability_workflow.md Analiza esta incidencia de producción: [stacktrace]` |
| **Validar Despliegue Post-Deploy:** | `@.agents/workflows/08_smoke_test_deploy_validation.md Valida el despliegue en: [URL]` |
| **Probar la App de Punta a Punta (Local, Navegador Real):** | `@.agents/workflows/09_live_stack_verification_workflow.md Prueba la app: [flujo de usuario]` |

---

## 💡 3. Meta-Protocolos de Trabajo (Master Workflows)

Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir strictly estos flujos maestros:

*   **[Mapa y Trazo Maestro VSDD](workflows/00_master_vsdd_workflow.md):** Diagrama de secuencia y explicación end-to-end desde la idea inicial hasta el commit atómico en Git.
*   **[Bootstrap de Proyecto Greenfield](workflows/00_greenfield_bootstrap_workflow.md):** Se ejecuta **una única vez por proyecto**, antes que cualquier otro workflow: decide el stack tecnológico con el humano, genera `docs/00_stack_manifest.md`, scaffoldea el repositorio y el esqueleto mínimo de `docs/` para que el resto de la cascada pueda operar (`Idea ➔ Repositorio Operativo`).
*   **[Adopción de Proyecto Brownfield](workflows/00_brownfield_adoption_workflow.md):** El equivalente para código existente sin `docs/` previo — se ejecuta **una única vez por proyecto**: reconstruye producto, dominio y stack por ingeniería inversa + entrevista humana obligatoria (nunca por inferencia silenciosa), descubre (no decide) el stack real vía `SK-04`, y cataloga deuda técnica (`Código Existente ➔ .agents/ Operativo`).
*   **[Protocolo de Especificación en Cascada (Nuevas Ideas / Specs)](workflows/01_cascading_spec_workflow.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial (`Idea ➔ docs/`).
*   **[Protocolo de Desarrollo en Cascada (Codificación / Tickets)](workflows/02_cascading_dev_workflow.md):** Guía paso a paso para ejecutar un ticket técnico desde la extracción de reglas, migraciones, TDD, verificación de linter, pruebas visuales y commit atómico (`TK-XXX ➔ apps/`).
*   **[Auditoría de Especificaciones VSDD Workflow](workflows/03_spec_audit_workflow.md):** Meta-prompt de auditoría en 7 fases para auditar la suficiencia de la documentación viva antes de codificar (`docs/`).
*   **[Auditoría de Código y Calidad VSDD Workflow](workflows/04_dev_audit_workflow.md):** Meta-prompt de auditoría en 7 fases para la revisión adversarial del Reviewer Independiente sobre el código antes de hacer commit (`apps/`).
*   **[Agente Autónomo de Testing Workflow](workflows/05_test_runner_workflow.md):** Subagente especializado en el bucle autónomo TDD (Red-Green-Refactor).
*   **[Pipeline QA Completo SOTA v2.1 Workflow](workflows/06_full_qa_pipeline.md):** Pipeline QA completo con Mutation Score >= 70% y veredicto JSON Schema.
*   **[Observabilidad en Producción Shift-Right Workflow v2.0](workflows/07_production_observability_workflow.md):** Captura logs/stacktraces de producción, genera BDD Gherkin, pruebas de regresión y cierra el bucle convirtiendo incidencias en tickets `TK-XXX` del backlog.
*   **[Smoke Test & Deploy Validation Workflow](workflows/08_smoke_test_deploy_validation.md):** Valida post-despliegue ejecutando health checks, smoke tests de contratos HTTP (3 Oráculos) y verifica seguridad de cabeceras. Emite veredicto PASS/FAIL con rollback automático OpenTofu si falla.
*   **[Verificación en Vivo del Stack Completo Workflow](workflows/09_live_stack_verification_workflow.md):** Levanta la infraestructura real declarada en `docs/00_stack_manifest.md` (nunca asumida), recorre el flujo crítico del ticket con el motor E2E declarado, captura evidencia, y limpia el entorno de prueba por completo al terminar — el procedimiento accionable detrás del Antipatrón B de `rules/04_verified_implementation_standard.md`.

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

Las 35 habilidades son runbooks especializados organizados por fases y roles técnicos que la IA carga bajo demanda:

### Fase Documental (Product Owner & Architect Roles)
*   **01_product_definition:** [SK-01 Descubrimiento de Producto](skills/specs/01_product_definition/SK-01_discover_product_vision.md) y [SK-02 Generación del PRD](skills/specs/01_product_definition/SK-02_generate_prd.md).
*   **02_architecture_design:** [SK-03 Modelo de Dominio](skills/specs/02_architecture_design/SK-03_design_domain_model.md), [SK-04 Diseño Técnico](skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) y [SK-05 Asistente de Diseño UI/UX](skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md).
*   **03_persistence_and_api:** [SK-06 Esquema de Base de Datos](skills/specs/03_persistence_and_api/SK-06_design_database_schema.md) y [SK-07 Especificación API REST](skills/specs/03_persistence_and_api/SK-07_design_api_specification.md).
*   **04_governance_and_quality:** [SK-08 Estrategia de Seguridad](skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md), [SK-09 Estrategia de Pruebas](skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md), [SK-10 Pipeline CI/CD & OpenTofu IaC](skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md) y [SK-35 Generación del Contrato Operativo Raíz (AGENTS.md)](skills/specs/04_governance_and_quality/SK-35_generate_root_contract.md).
*   **05_agile_planning:** [SK-11 Historias de Usuario (INVEST)](skills/specs/05_agile_planning/SK-11_generate_user_stories.md), [SK-12 Planificación de Tickets](skills/specs/05_agile_planning/SK-12_generate_backlog_tickets.md), [SK-13 Matriz de Trazabilidad](skills/specs/05_agile_planning/SK-13_generate_traceability_matrix.md), [SK-14 Mapa del Backlog](skills/specs/05_agile_planning/SK-14_generate_backlog_map.md) y [SK-15 Registro de PRs](skills/specs/05_agile_planning/SK-15_document_pull_requests.md).

### Fase DevSecOps & Gobernanza de Seguridad (DevSecOps Lead & Auditor Roles)
*   **Seguridad Shift-Left & CI/CD:** [SK-08 Estrategia de Seguridad](skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md), [SK-10 Pipeline CI/CD Node 24 & OpenTofu IaC](skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md), [SK-23 Seguridad en Dependencias Anti-Slopsquatting](skills/development/05_quality_and_lint/SK-23_audit_dependency_security.md) y [SK-25 Auditoría de Validación de Contratos](skills/development/05_quality_and_lint/SK-25_audit_contract_validation.md).
*   **Workflows de Auditoría Adversarial:** [Workflow 03 Auditoría de Especificaciones](workflows/03_spec_audit_workflow.md), [Workflow 04 Auditoría Adversarial DevSecOps](workflows/04_dev_audit_workflow.md) y [Workflow 07 Observabilidad en Producción Shift-Right](workflows/07_production_observability_workflow.md).

### Fase de Codificación y Calidad (Developer, QA & Automation Roles)
*   **01_rules_extraction:** [SK-27 Extracción de Reglas Legacy](skills/development/01_rules_extraction/SK-27_extract_project_rules.md), [SK-30 Extractor de Diagramas Legacy (C4/ERD)](skills/development/01_rules_extraction/SK-30_legacy_diagram_extractor.md), [SK-31 Indexador de Deuda Técnica](skills/development/01_rules_extraction/SK-31_technical_debt_indexer.md) y [SK-33 Auditoría de Configuración de Entorno Fail-Fast](skills/development/01_rules_extraction/SK-33_environment_configuration_auditor.md).
*   **02_backend_development:** [SK-16 Desarrollo Backend & Entidades Secundarias](skills/development/02_backend_development/SK-16_develop_backend_ticket.md).
*   **03_frontend_development:** [SK-17 Desarrollo Frontend & Touch UI](skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md).
*   **04_persistence_and_db:** [SK-18 Migraciones, Seeds & Anti-Orfandad](skills/development/04_persistence_and_db/SK-18_execute_db_migration.md) y [SK-28 Seeding Profesional Idempotente](skills/development/04_persistence_and_db/SK-28_manage_database_seeding.md).
*   **05_quality_and_lint:** [SK-19 Refactor & Anti-N+1 / Anti-Mass-Assignment](skills/development/05_quality_and_lint/SK-19_refactor_and_lint.md), [SK-22 DBA Log Analysis & Troubleshooting](skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md), [SK-24 Characterization Testing](skills/development/05_quality_and_lint/SK-24_execute_characterization_testing.md), [SK-26 Recuperador Dinámico Few-Shot](skills/development/05_quality_and_lint/SK-26_retrieve_few_shot_context.md) y [SK-32 Test Fixture Builder (Object Mother)](skills/development/05_quality_and_lint/SK-32_test_fixture_builder.md).
*   **06_visual_qa:** [SK-20 Browser Visual QA](skills/development/06_visual_qa/SK-20_execute_browser_qa.md) y [SK-21 Auditoría Accesibilidad UI/a11y](skills/development/06_visual_qa/SK-21_audit_ui_accessibility.md).
*   **07_performance_and_observability:** [SK-29 Load & Performance Testing](skills/development/07_performance_and_observability/SK-29_load_and_performance_testing.md).
*   **08_testing:** [SK-34 Model-Based Testing Designer (MBT & Oracles)](skills/development/08_testing/SK-34_model_based_testing_designer.md).
*   **Patrones de Oro (Few-Shot):** [Plantillas y Ejemplos de Referencia](examples/00_few_shot_patterns.md).


---

## 🧹 6. Mantenimiento y Verificación de Integridad

Para verificar autónomamente que el arnés `.agents/` no contenga enlaces rotos ni colisiones tras modificar o añadir habilidades:

```bash
bash .agents/scripts/validate_agents.sh
```

---

## 📜 7. Licencia y Reutilización

Este marco de gobernanza y habilidades (`.agents/`) se distribuye bajo la **[Licencia MIT](LICENSE)**. Es 100% abierto, portátil y reutilizable en cualquier proyecto o repositorio comercial o privado sin restricciones de tipo Copyleft / GPL.

Historial de cambios: [CHANGELOG.md](CHANGELOG.md). Guía para contribuir nuevas skills/workflows: [CONTRIBUTING.md](CONTRIBUTING.md). Política de versionado: [VERSIONING.md](VERSIONING.md).
