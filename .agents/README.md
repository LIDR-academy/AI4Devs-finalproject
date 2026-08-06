# 🤖 Manual de Operaciones y Configuración del Agente de IA (.agents)

Este directorio contiene las meta-directivas, reglas de gobernanza y habilidades procedimentales que guían el comportamiento de los asistentes de desarrollo basados en Inteligencia Artificial (Google Antigravity, Gemini, etc.) en el proyecto RestoStock.

> [!IMPORTANT]
> **✋ REGLA INNEGOCIABLE DE APROBACIÓN PREVIA (HUMAN-IN-THE-LOOP):**
> Antes de guardar cambios o crear cualquier archivo de especificación, diseño, sistema de color, arquitectura o código fuente, el Agente DEBE presentar primero su propuesta completa o borrador al Usuario (Especialista) y obtener su confirmación o aprobación explícita. Queda terminantemente prohibido modificar o crear archivos en disco sin previa autorización del usuario.

---

## 💡 1. Meta-Protocolos de Trabajo (Master Workflows)
Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir estrictamente estos dos flujos maestros y su mapa de trazabilidad:

*   **[Mapa y Trazo Maestro VSDD](workflows/00_master_vsdd_workflow.md):** Diagrama de secuencia y explicación end-to-end desde la idea inicial hasta el commit atómico en Git.
*   **[Protocolo de Especificación en Cascada (Nuevas Ideas / Specs)](workflows/01_cascading_spec_workflow.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial (`Idea ➔ docs/`).
*   **[Protocolo de Desarrollo en Cascada (Codificación / Tickets)](workflows/02_cascading_dev_workflow.md):** Guía paso a paso para ejecutar un ticket técnico desde la extracción de reglas, migraciones, TDD, verificación de linter, pruebas visuales y commit atómico (`TK-XXX ➔ apps/`).
*   **[Prompt de Auditoría de Especificaciones VSDD](workflows/03_spec_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para auditar la suficiencia de la documentación viva antes de codificar (`docs/`).
*   **[Prompt de Auditoría de Código y Calidad VSDD](workflows/04_dev_audit_prompt.md):** Meta-prompt de auditoría en 7 fases para la revisión adversarial del Reviewer Independiente sobre el código antes de hacer commit (`apps/`).

---

## 🔴 2. Reglas y Estándares del Proyecto (Project Specifications)
Toda regla de arquitectura, base de datos, ciberseguridad, testing y frontend es **dinámica y agnóstica**, e inferida directamente por las habilidades a partir de la documentación viva del proyecto en `docs/`:

*   **Alcance y Producto:** `docs/01_product_definition/` (PRDs y Reglas de Negocio).
*   **Arquitectura y Diseño:** `docs/02_architecture_design/` (Capas, Mappers, ADRs y Estructura).
*   **Gobernanza y Calidad:** `docs/03_governance_and_quality/` (Estrategias de prueba, seguridad e informes).
*   **Persistencia y APIs:** `docs/04_persistence_and_api/` (Esquemas de Base de Datos y OpenAPI 3.0).
*   **Gestión Ágil:** `docs/05_agile_planning/` (User Stories INVEST y Tickets Técnicos).

---

## 🔵 3. Catálogo de Skills (Habilidades Procedimentales)
Las habilidades son runbooks especializados organizados por fases que la IA carga bajo demanda para la generación o edición guiada de componentes:

### Fase Documental (Specs)
*   **01_product_definition:** [Descubrimiento de Producto](skills/specs/01_product_definition/SK-01_product_discovery.md) y [Generación del PRD](skills/specs/01_product_definition/SK-02_prd_generation.md).
*   **02_architecture_design:** [Diseño de Arquitectura Hexagonal](skills/specs/02_architecture_design/SK-03_architecture_design.md), [Diagramación Mermaid C4](skills/specs/02_architecture_design/SK-04_mermaid_diagram.md), [Descripción de Capas](skills/specs/02_architecture_design/SK-05_hexagonal_layers.md), [Asistente de Diseño UI/UX Frontend](skills/specs/02_architecture_design/SK-05-B_frontend_ui_ux_guide.md) y [Estructura de Carpetas](skills/specs/02_architecture_design/SK-06_folder_structure.md).
*   **03_governance_and_quality:** [Pipeline CI/CD](skills/specs/03_governance_and_quality/SK-07_cicd_pipeline.md), [Estrategia de Seguridad](skills/specs/03_governance_and_quality/SK-08_security_strategy.md) y [Directiva de Pruebas](skills/specs/03_governance_and_quality/SK-09_testing_strategy.md).
*   **04_persistence_and_api:** [Esquema Prisma](skills/specs/04_persistence_and_api/SK-10_prisma_schema.md) y [Contratos OpenAPI](skills/specs/04_persistence_and_api/SK-11_api_specification.md).
*   **05_agile_planning:** [Historias de Usuario (INVEST)](skills/specs/05_agile_planning/SK-12_user_stories.md), [Planificación de Tickets](skills/specs/05_agile_planning/SK-13_backlog_tickets.md) y [Registro de PRs](skills/specs/05_agile_planning/SK-14_pull_requests.md).

### Fase de Codificación (Development)
*   **01_rules_extraction:** [SK-15 Extracción de Reglas](skills/development/01_rules_extraction/SK-15_extract_rules.md) (Genera `docs/03_governance_and_quality/rules/` analizando la documentación en `docs/`).
*   **02_backend_development:** [SK-16 Desarrollo de Backend desde Tickets](skills/development/02_backend_development/SK-16_backend_ticket.md) (Lógica de dominio, aplicación e infraestructura con TDD).
*   **03_frontend_development:** [SK-17 Desarrollo de Frontend desde Tickets](skills/development/03_frontend_development/SK-17_frontend_ticket.md) (Componentes de interfaz táctil, estado y enrutamiento).
*   **04_persistence_and_db:** [SK-18 Migraciones de Base de Datos](skills/development/04_persistence_and_db/SK-18_db_migration.md) (Actualización del esquema ORM y migraciones).
*   **05_quality_and_lint:** [SK-19 Refactorización y Lints](skills/development/05_quality_and_lint/SK-19_refactor_lint.md), [SK-22 Autorrecuperación de Errores](skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md) y [SK-23 Seguridad en Dependencias Anti-Slopsquatting](skills/development/05_quality_and_lint/SK-23_dependency_security_guard.md).
*   **06_visual_qa:** [SK-20 Pruebas de Calidad Visual (Visual QA)](skills/development/06_visual_qa/SK-20_browser_qa.md) y [SK-21 Auditoría de Accesibilidad UI y Ergonomía (a11y)](skills/development/06_visual_qa/SK-21_ui_accessibility_auditor.md).
*   **Patrones de Oro (Few-Shot):** [Plantillas y Ejemplos de Referencia](examples/FEW_SHOT_PATTERNS.md).

---

## 💬 4. Instrucciones y Prompts Secuenciales por Fase (De la Idea al Despliegue)

Para guiar al asistente de IA en cada etapa del ciclo de vida del producto, utiliza las siguientes instrucciones estructuradas según la fase en la que te encuentres:

---

### ⚪ FASE 0: Descubrimiento e Investigación Inicial (Idea Bruta ➔ `01_idea_inicial.md`)
* **Propósito:** Investigar la problemática, delimitar el alcance del producto, identificar actores/operarios, definir la propuesta de valor y estructurar la concepción inicial.
* **Habilidad involucrada:** `skills/specs/01_product_definition/SK-01_product_discovery.md`.

> **Prompt para la Fase 0:**
> *"Agente, ejecuta el skill de Descubrimiento de Producto (`skills/specs/01_product_definition/SK-01_product_discovery.md`) para investigar y analizar la siguiente idea inicial: **[describir la idea en lenguaje natural]**. Estructura los objetivos, problemas a resolver, roles de usuario, limites de alcance y guarda el análisis en `docs/01_product_definition/01_idea_inicial.md`."*

---

### 🟢 FASE 1: Especificación y Documentación Viva (Idea Inicial ➔ `docs/`)
* **Propósito:** Transformar la concepción inicial en PRD, arquitectura C4, esquemas de BD, OpenAPI 3.0, Historias de Usuario INVEST y Tickets Técnicos `TK-XXX`.
* **Habilidades involucradas:** `SK-02` a `SK-14` (incluyendo `SK-05-B` para UI/UX).

> **Prompt General para la Fase 1 (Cascada Completa):**
> *"Agente, ejecuta el protocolo de especificación en cascada (`.agents/workflows/01_cascading_spec_workflow.md`) analizando `docs/01_product_definition/01_idea_inicial.md` para generar el PRD y actualizar la documentación viva en `docs/`, incluyendo arquitectura, modelo de base de datos, contrato OpenAPI, historias de usuario INVEST y tickets técnicos `TK-XXX`."*

> **Prompt Especializado para Co-Diseño Visual de UI/UX (SK-05-B):**
> *"Agente, ejecuta la habilidad de Asistente de Diseño UI/UX Frontend (`.agents/skills/specs/02_architecture_design/SK-05-B_frontend_ui_ux_guide.md`) para iniciar la sesión interactiva de co-diseño visual, recibir mis imágenes de referencia y cristalizar el Design System en `docs/02_architecture_design/04_ui_ux_design_system.md` y `frontend_rules.md`."*

---

### 🟡 FASE 2: Auditoría de Especificaciones VSDD (Antes de Codificar)
* **Propósito:** Validar que la documentación en `docs/` sea autosuficiente, sin vacíos técnicos ni decisiones inventadas antes de escribir código.
* **Flujo involucrado:** `.agents/workflows/03_spec_audit_prompt.md`.

> **Prompt para la Fase 2:**
> *"Agente, ejecuta el prompt de auditoría de especificaciones VSDD (`.agents/workflows/03_spec_audit_prompt.md`) sobre la documentación viva en `docs/`. Emite un informe formal en 7 fases y confirma si el veredicto es **IMPLEMENTABLE** antes de proceder a la fase de desarrollo."*

---

### 🔵 FASE 3: Desarrollo Técnico TDD (Codificación por Tickets en `apps/`)
* **Propósito:** Implementar un ticket técnico específico (`TK-XXX`) usando TDD (RED-GREEN-REFACTOR), fakes en memoria y sanitización Zod.
* **Habilidades involucradas:** `SK-15` a `SK-18`.

> **Prompt para la Fase 3:**
> *"Agente, ejecuta el ticket técnico **TK-XXX** siguiendo el protocolo de desarrollo en cascada (`.agents/workflows/02_cascading_dev_workflow.md`). Extrae las reglas dinámicas en `docs/03_governance_and_quality/rules/`, implementa TDD (RED-GREEN-REFACTOR) con repositorios InMemory y garantiza 0 errores de linter/compilador y un Mutation Score ≥ 70% con `@stryker-mutator/core`."*

---

### 🟣 FASE 4: Auditoría Adversarial de Código (Reviewer Independiente)
* **Propósito:** Ejecutar la validación cruzada sobre los cambios realizados antes de autorizar el commit atómico en Git.
* **Habilidades y Flujo:** `.agents/workflows/04_dev_audit_prompt.md`, `SK-19`, `SK-20`, `SK-21`.

> **Prompt para la Fase 4:**
> *"Actúa como Reviewer Independiente (Validación Cruzada) y ejecuta la auditoría de código sobre el ticket **TK-XXX** usando `.agents/workflows/04_dev_audit_prompt.md`. Audita las 7 fases de calidad (Mutation Score ≥ 70%, Anti-Drift Spectral/Prisma, Zod, WCAG 2.1 y SOLID) y emite el veredicto formal (**APROBADO PARA COMMIT** o **RECHAZADO**)."*

---

### 🔴 FASE 5: Integración Continua, Build y Despliegue CI/CD
* **Propósito:** Verificar el pipeline de integración continua, validar el bundle de producción y desplegar la solución.
* **Habilidades involucradas:** `SK-07` (Pipeline CI/CD y Despliegue).

> **Prompt para la Fase 5:**
> *"Agente, ejecuta la skill de automatización CI/CD (`skills/specs/03_governance_and_quality/SK-07_cicd_pipeline.md`). Verifica que el pipeline de GitHub Actions (`.github/workflows/ci.yml`) pase limpiamente, ejecuta `pnpm run build` para validar el artefacto de producción y certifica el despliegue final."*




