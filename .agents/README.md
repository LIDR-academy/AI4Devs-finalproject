# 🤖 Manual de Operaciones y Configuración del Agente de IA (.agents)

Este directorio contiene las meta-directivas, reglas de gobernanza y habilidades procedimentales que guían el comportamiento de los asistentes de desarrollo basados en Inteligencia Artificial (Google Antigravity, Gemini, etc.) en el proyecto RestoStock.

---

## 💡 1. Meta-Protocolos de Trabajo (Master Workflows)
Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir estrictamente estos dos flujos maestros y su mapa de trazabilidad:

*   **[Mapa y Trazo Maestro VSDD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/trazo_maestro_vsdd.md):** Diagrama de secuencia y explicación end-to-end desde la idea inicial hasta el commit atómico en Git.
*   **[Protocolo de Especificación en Cascada (Nuevas Ideas / Specs)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/nuevas_ideas_cascada.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial (`Idea ➔ docs/`).
*   **[Protocolo de Desarrollo en Cascada (Codificación / Tickets)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/desarrollo_cascada.md):** Guía paso a paso para ejecutar un ticket técnico desde la extracción de reglas, migraciones, TDD, verificación de linter, pruebas visuales y commit atómico (`TK-XXX ➔ apps/`).

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
*   **01_product_definition:** [Descubrimiento de Producto](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/01_product_definition/SK-01_product_discovery.md) y [Generación del PRD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/01_product_definition/SK-02_prd_generation.md).
*   **02_architecture_design:** [Diseño de Arquitectura Hexagonal](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/02_architecture_design/SK-03_architecture_design.md), [Diagramación Mermaid C4](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/02_architecture_design/SK-04_mermaid_diagram.md), [Descripción de Capas](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/02_architecture_design/SK-05_hexagonal_layers.md) y [Estructura de Carpetas](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/02_architecture_design/SK-06_folder_structure.md).
*   **03_governance_and_quality:** [Pipeline CI/CD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/03_governance_and_quality/SK-07_cicd_pipeline.md), [Estrategia de Seguridad](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/03_governance_and_quality/SK-08_security_strategy.md) y [Directiva de Pruebas](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/03_governance_and_quality/SK-09_testing_strategy.md).
*   **04_persistence_and_api:** [Esquema Prisma](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/04_persistence_and_api/SK-10_prisma_schema.md) y [Contratos OpenAPI](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/04_persistence_and_api/SK-11_api_specification.md).
*   **05_agile_planning:** [Historias de Usuario (INVEST)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/05_agile_planning/SK-12_user_stories.md), [Planificación de Tickets](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/05_agile_planning/SK-13_backlog_tickets.md) y [Registro de PRs](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/specs/05_agile_planning/SK-14_pull_requests.md).

### Fase de Codificación (Development)
*   **01_rules_extraction:** [SK-15 Extracción de Reglas](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/01_rules_extraction/SK-15_extract_rules.md) (Genera `docs/03_governance_and_quality/rules/` analizando la documentación en `docs/`).
*   **02_backend_development:** [SK-16 Desarrollo de Backend desde Tickets](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/02_backend_development/SK-16_backend_ticket.md) (Lógica de dominio, aplicación e infraestructura con TDD).
*   **03_frontend_development:** [SK-17 Desarrollo de Frontend desde Tickets](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/03_frontend_development/SK-17_frontend_ticket.md) (Componentes de interfaz táctil, estado y enrutamiento).
*   **04_persistence_and_db:** [SK-18 Migraciones de Base de Datos](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/04_persistence_and_db/SK-18_db_migration.md) (Actualización del esquema ORM y migraciones).
*   **05_quality_and_lint:** [SK-19 Refactorización y Lints](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/05_quality_and_lint/SK-19_refactor_lint.md), [SK-22 Autorrecuperación de Errores](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/05_quality_and_lint/SK-22_agent_troubleshooting.md) y [SK-23 Seguridad en Dependencias Anti-Slopsquatting](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/05_quality_and_lint/SK-23_dependency_security_guard.md).
*   **06_visual_qa:** [SK-20 Pruebas de Calidad Visual (Visual QA)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/06_visual_qa/SK-20_browser_qa.md) y [SK-21 Auditoría de Accesibilidad UI y Ergonomía (a11y)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/06_visual_qa/SK-21_ui_accessibility_auditor.md).
*   **Patrones de Oro (Few-Shot):** [Plantillas y Ejemplos de Referencia](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/examples/FEW_SHOT_PATTERNS.md).

---

## 💬 4. Instrucciones y Prompts de Ejemplo para el Specialist (Usuario)

Para solicitar cambios en el backlog o nuevas funcionalidades al agente utilizando el **Protocolo en Cascada (VSDD)**, puedes usar los siguientes prompts de ejemplo:

### 🔹 Caso A: Agregar una nueva funcionalidad a un MÓDULO EXISTENTE
Usa este prompt cuando la funcionalidad pertenezca a un Epic ya existente (ej: `auth`, `stock`, `kitchen`, `reports`, `shared`).

> **Prompt de ejemplo:**
> *"Agente, ejecuta el protocolo en cascada (`.agents/nuevas_ideas_cascada.md`) para agregar la siguiente funcionalidad al módulo existente de **[nombre_modulo]**: **[describir la funcionalidad]**. Recuerda guardar las historias de usuario en la carpeta `user_stories/[nombre_modulo]/` y los tickets técnicos en las subcarpetas correspondientes de `tickets/[nombre_modulo]/` sin crear nuevas carpetas de módulo."*
>
> *(Ejemplo real: "...al módulo existente de auth: Autenticación con Huella Digital o FaceID para administradores...")*

### 🔹 Caso B: Agregar un MÓDULO NUEVO (Epic completa)
Usa este prompt cuando introduzcas una vertical de negocio que no existe en el proyecto (ej: `suppliers`, `marketing`, `delivery`).

> **Prompt de ejemplo:**
> *"Agente, ejecuta el protocolo en cascada (`.agents/nuevas_ideas_cascada.md`) para crear el nuevo módulo de **[nombre_modulo_nuevo]** con la siguiente funcionalidad inicial: **[describir funcionalidad]**. Recuerda crear la carpeta correspondiente en `user_stories/[nombre_modulo_nuevo]/` y `tickets/[nombre_modulo_nuevo]/` para alojar las historias de usuario y tickets de forma autocontenida."*
>
> *(Ejemplo real: "...crear el nuevo módulo de suppliers para la gestión de proveedores, órdenes de compra y control de materias primas...")*

