# 🤖 Manual de Operaciones y Configuración del Agente de IA (.agents)

Este directorio contiene las meta-directivas, reglas de gobernanza y habilidades procedimentales que guían el comportamiento de los asistentes de desarrollo basados en Inteligencia Artificial (Google Antigravity, Gemini, etc.) en el proyecto RestoStock.

---

## 💡 1. Meta-Protocolos de Trabajo (Master Workflows)
Para asegurar que el desarrollo se realice bajo el enfoque **Verified Spec-Driven Development (VSDD)**, el agente debe seguir estrictamente este flujo maestro antes de escribir código:

*   **[Protocolo de Integración en Cascada](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/nuevas_ideas_cascada.md):** Guía paso a paso para analizar el impacto, actualizar el PRD, modelar la base de datos, adaptar el contrato OpenAPI y registrar los tickets de Agile de forma secuencial y sin "vibe coding".

---

## 🔴 2. Reglas del Entorno (Workspace Rules)
Las reglas son directrices innegociables cargadas automáticamente en el contexto de la IA según el directorio de trabajo activo. Su objetivo es garantizar la consistencia técnica y de diseño:

*   **[Reglas del Dominio](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/domain-rules.md):** Preservación de la pureza de la capa Domain (TypeScript puro, uso obligatorio de `decimal.js`, cero dependencias de infraestructura).
*   **[Reglas de Backend](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/backend-rules.md):** Estándares de inyección de dependencias, controladores Express, validación estricta con Zod y serialización de decimales como strings en JSON.
*   **[Reglas de Base de Datos y Persistencia](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/database-rules.md):** Estándares de nombres snake_case en BD, tipos Decimal de alta precisión para cocina, integridad referencial y definición de índices en Prisma.
*   **[Reglas de Frontend y UX/UI](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/frontend-rules.md):** Directivas para pantallas táctiles (botones ≥48px), código semafórico de alertas FEFO y persistencia/banner de estado offline.
*   **[Reglas de Ciberseguridad](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/security-rules.md):** Mitigación OWASP, hashing de PINs con `bcrypt`, duración de JWT (12 horas) y protección de fuga de datos en logs.
*   **[Reglas de Git y Workflow](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/git-rules.md):** Estándar de Conventional Commits y validación de Quality Gates en Pull Requests.
*   **[Reglas de Testing y TDD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/rules/testing-rules.md):** Flujo RED-GREEN-REFACTOR obligatorio y uso de InMemory Fakes en lugar de mocks tradicionales de base de datos.

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
*   **backend:** [Desarrollo de Backend desde Tickets](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/backend/SK-dev-backend-ticket.md) (entidades de dominio, casos de uso, controladores REST, adaptadores Prisma y tests unitarios).
*   **frontend:** [Desarrollo de Frontend desde Tickets](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/skills/development/frontend/SK-dev-frontend-ticket.md) (componentes UI táctiles, alertas FEFO, estado local/global, offline).
*   **testing_and_qa:** Pruebas unitarias de dominio, integración HTTP, fakes.
*   **devops_and_env:** Docker, migraciones Prisma.

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

