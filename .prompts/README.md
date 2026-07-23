# 🤖 Catálogo de Skills de IA — RestoStock

Este directorio contiene las habilidades e instrucciones de desarrollo optimizadas para asistentes de programación basados en Inteligencia Artificial (como Gemini, Cursor, Copilot o agentes locales).

Las habilidades están estructuradas y divididas en dos grandes bloques:
1. **`skills/specs/`**: Habilidades de especificación, análisis, diseño y documentación (Spec-Driven Development), organizadas secuencialmente por fases de ejecución.
2. **`skills/development/`**: Habilidades para la implementación de código ejecutable, testing y refactorización.

---

## 🧭 1. Skills de Especificación y Diseño (`skills/specs/`)

Las habilidades de especificación están organizadas en subdirectorios numerados según su **orden cronológico de ejecución**:

### 01. Concepción y Alcance de Producto (`skills/specs/01_product_definition/`)
* [SK-01: Descubrimiento de Producto e Idea Inicial](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/01_product_definition/SK-01_product_discovery.md)
  * *Rol:* Senior Product Manager
  * *Objetivo:* Crear un documento de concepción del producto MVP a partir de una idea vaga.
* [SK-02: Generación del PRD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/01_product_definition/SK-02_prd_generation.md)
  * *Rol:* Senior Product Manager & Software Architect
  * *Objetivo:* Traducir la idea inicial en un PRD estructurado con historias de usuario preliminares y edge cases.

### 02. Diseño de Arquitectura y Sistema (`skills/specs/02_architecture_design/`)
* [SK-03: Diseño de Arquitectura y Persistencia](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/02_architecture_design/SK-03_architecture_design.md)
  * *Rol:* Senior Software Architect & Principal DBA
  * *Objetivo:* Crear un plano técnico con capas hexagonales y modelo de persistencia 3NF.
* [SK-04: Diagrama de Arquitectura Mermaid (C4)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/02_architecture_design/SK-04_mermaid_diagram.md)
  * *Rol:* Senior Systems Architect
  * *Objetivo:* Generar un diagrama de contenedores de nivel 2 utilizando sintaxis Mermaid.
* [SK-05: Estructuración de Capas en Arquitectura Hexagonal](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/02_architecture_design/SK-05_hexagonal_layers.md)
  * *Rol:* Technical Lead
  * *Objetivo:* Definir las dependencias de capas e inyección de dependencias con ejemplos TypeScript.
* [SK-06: Estructura de Directorios del Monorepo](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/02_architecture_design/SK-06_folder_structure.md)
  * *Rol:* Technical Lead
  * *Objetivo:* Generar el árbol físico de directorios del monorepo basado en el principio CCP.

### 03. Gobernanza, Calidad y DevOps (`skills/specs/03_governance_and_quality/`)
* [SK-07: Pipeline CI/CD Seguro](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/03_governance_and_quality/SK-07_cicd_pipeline.md)
  * *Rol:* DevOps Engineer
  * *Objetivo:* Diseñar la automatización del pipeline en GitHub Actions (`ci.yml`) con base de datos de pruebas.
* [SK-08: Estrategia de Seguridad OWASP/GDPR/EU AI Act](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/03_governance_and_quality/SK-08_security_strategy.md)
  * *Rol:* Cybersecurity Architect
  * *Objetivo:* Definir la sanitización de inputs, mitigación de SQLi, secretos de entorno y regulaciones europeas.
* [SK-09: Directiva de Testing y TDD](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/03_governance_and_quality/SK-09_testing_strategy.md)
  * *Rol:* Senior QA Engineer
  * *Objetivo:* Instaurar el flujo RED-GREEN-REFACTOR y reglas innegociables de control de calidad.

### 04. Modelo de Datos y Contratos API (`skills/specs/04_persistence_and_api/`)
* [SK-10: Esquema de Base de Datos Prisma (3NF)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/04_persistence_and_api/SK-10_prisma_schema.md)
  * *Rol:* DBA experto en PostgreSQL
  * *Objetivo:* Escribir el archivo `schema.prisma` respetando la 3NF, tipos Decimal y mapeos.
* [SK-11: Especificación de API OpenAPI 3.0](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/04_persistence_and_api/SK-11_api_specification.md)
  * *Rol:* Senior API Architect
  * *Objetivo:* Generar los contratos HTTP REST del MVP consistentes con OpenAPI y el modelo físico.

### 05. Gestión Agile, Historias y Deliverables (`skills/specs/05_agile_planning/`)
* [SK-12: Redacción de Historias de Usuario (INVEST/BDD)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/05_agile_planning/SK-12_user_stories.md)
  * *Rol:* Senior Product Owner
  * *Objetivo:* Definir las historias de usuario del MVP detallando criterios de aceptación en Gherkin (Given-When-Then).
* [SK-13: Desglose de Backlog y Tickets de Trabajo](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/05_agile_planning/SK-13_backlog_tickets.md)
  * *Rol:* Tech Lead & Agile Coach
  * *Objetivo:* Crear y priorizar las tareas técnicas y el backlog de sprints.
* [SK-14: Registro e Historial de Pull Requests](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/skills/specs/05_agile_planning/SK-14_pull_requests.md)
  * *Rol:* Release Manager
  * *Objetivo:* Documentar de forma transparente las tres Pull Requests iniciales e incrementales.

---

## 🛠️ 2. Skills de Desarrollo de Código (`skills/development/`)

Espacio reservado para las habilidades enfocadas en generación e implementación de código ejecutable:

* **`skills/development/frontend/`**: Habilidades para componentes UI, estado local/global, validación de formularios y estilos.
* **`skills/development/backend/`**: Habilidades para entidades de dominio, casos de uso, repositorios Prisma y controladores REST.
* **`skills/development/testing_and_qa/`**: Habilidades para suite de pruebas unitarias (Jest/Vitest), integración y refactorización.
* **`skills/development/devops_and_env/`**: Habilidades para Dockerfiles, migraciones y configuración de entornos.

---

## 🔄 Protocolo de Integración en Cascada
Cuando solicites agregar una nueva funcionalidad o cambio, el agente de IA debe guiar su proceso usando el meta-skill:
* [Protocolo de Integración en Cascada (Meta-Skill)](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.prompts/nuevas_ideas_cascada.md)
