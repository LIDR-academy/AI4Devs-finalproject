> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1: Definición de capacidades críticas del sistema**

*Contexto: Fase inicial - Definición del MVP*

"Based on your knowledge of SMB digitalization, AI-assisted content generation, and modern product design trends, outline the critical capabilities that an AI Business Presence Builder needs to have. Focus on how guided business discovery, profile normalization, and AI-driven asset generation can create differentiation. Describe how each capability reduces user friction."

*Resultado:* Identificación de 8 capacidades críticas incluyendo: flujo guiado, validación inteligente, normalización de perfiles, generación de personas, AI brand storytelling, generación multi-formato, recomendaciones de identidad y local SEO readiness.

**Prompt 2: Oportunidades de diferenciación**

*Contexto: Estrategia de producto - Análisis competitivo*

"Based on your experience with SMB digitalization, AI-assisted content generation, and modern product design trends, we want to explore opportunities for differentiation. Specifically, identify: new capabilities that could significantly enhance an AI-driven business presence platform beyond current market standards; existing capabilities in similar products that should be rethought, especially considering the shift from prompt-based generation to structured business profiling."

*Resultado:* 8 oportunidades identificadas: Business Identity Graph dinámica, generación sin prompts (data-driven), templates verticales, intent-aware content bundles, scanners de diferenciación, motores de consistencia, brand voice tuner interactivo, y más.

**Prompt 3: Validación de propuesta de valor con el cliente final**

*Contexto: Fase inicial - Alineación comercial*

"Articulate the core value proposition of AI Business Presence Builder for small business owners. Consider: barriers to digital adoption, budget constraints, technical literacy, and time availability. How does our solution differ from expensive agency services and generic AI content tools? What are the key pain points we solve?"

*Resultado:* Clarificación de propuesta de valor enfocada en: asequibilidad, facilidad de uso, coherencia de marca y rapidez de deployment.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1: Diseño de arquitectura de alto nivel**

*Contexto: Arquitectura - Estructura base*

"Based on everything we've defined so far, outline a high-level system architecture for this platform. Focus on how the system should be organized end-to-end, including the main components, how data flows through the system, and how the AI layer integrates with the structured business profiling process. Make sure to reflect the separation between guided business discovery, normalized business profile, and AI-driven asset generation. Highlight key services, boundaries, and architectural decisions."

*Resultado:* Arquitectura modular con capas: Experience Layer, Application Layer, Data Layer y AI Layer, con servicios desacoplados de evaluación IA y notificaciones. Definición clara de límites y flujo entre descubrimiento, perfil normalizado y generación asistida.

**Prompt 2: Representación gráfica con Mermaid**

*Contexto: Visualización - Diagramas técnicos*

"Can you represent the architecture you just described as a Mermaid diagram? Please structure it so it clearly shows the main system components, their relationships, and how data flows from the business discovery process into the normalized profile and finally into AI-driven asset generation. Keep the diagram clean and focused on high-level system boundaries rather than implementation details."

*Resultado:* Diagrama flowchart LR que visualiza el flujo completo de capas y componentes.

**Prompt 3: Comparación de opciones arquitectónicas**

*Contexto: Decisiones técnicas - Trade-offs*

"Propose three viable architectural approaches for this platform, describing each at sufficient detail to understand how they handle: business discovery, profile normalization, and AI-driven asset generation. Compare them in terms of scalability, maintainability, complexity, and suitability for an AI-driven system. Recommend the most appropriate option with clear justification."

*Resultado:* Evaluación de: Monolito modular, SOA con orquestador dedicado, y Serverless event-driven. Recomendación: monolito modular con servicios desacoplados para evaluación IA y notificaciones, que equilibra simplicidad y capacidad de iterar rápido en el MVP.

### **2.2. Descripción de componentes principales:**

**Prompt 1: Desglose de responsabilidades**

*Contexto: Detalles técnicos - Interfaces*

"Describe the most important backend components: Discovery Orchestration Service, Profile Normalization Service, Business Identity Graph, Asset Generation Service, and Quality & Consistency Service. For each, explain: role, inputs/outputs, dependencies, and how it contributes to the core flow. Include technology choices when relevant."

*Resultado:* Descripción detallada de cada servicio con límites claros de responsabilidad.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1: Organización de proyecto modular**

*Contexto: Estructura - Carpetas y convenciones*

"Represent the project structure and explain the purpose of main folders. Ensure it supports: frontend/UX, backend/logic, data/persistence, and documentation. Explain how this structure promotes modularity, separation of concerns, and team collaboration in a multi-disciplinary startup."

*Resultado:* Carpetas por capas: `frontend/`, `backend/`, `models/`, `docs/`, `config/`. Justificación de cada una.

---

## 3. Modelo de Datos

**Prompt 1: Diseño de entidad-relación**

*Contexto: Datos - Estructura base*

"Based on the system we have defined so far, produce an entity-relationship diagram using Mermaid. Represent the core domain entities, their attributes, and relationships, especially around business profiling, structured discovery data, and generated digital assets. Include primary keys, foreign keys, and constraints. Ensure it supports all use cases defined earlier."

*Resultado:* Diagrama ER con 9 entidades: Organization, User, BusinessProfile, AssetPackage, GeneratedAsset, AssetVariation, QualityCheck, AIRecommendation, PublicationTask.

**Prompt 2: Descripción de entidades y cardinalidades**

*Contexto: Documentación - Catálogo de datos*

"For each main entity in the model, describe: purpose, primary keys, foreign keys, key attributes with data types, constraints, relationships and cardinalities, and business meaning. Ensure consistency with the architecture and use cases. Focus on implementability in PostgreSQL."

*Resultado:* Documentación detallada de cada entidad con cardinalidades, constraints y ejemplos.

---

## 4. Especificación de la API

**Prompt 1: Diseño de endpoints OpenAPI**

*Contexto: API - Contrato técnico*

"Describe the three main backend endpoints in OpenAPI 3.0 format that support: discovery flow, profile management, and asset generation. For each endpoint include: request/response schemas, HTTP methods, status codes, error handling, and realistic examples. Endpoints: POST /api/discovery/sessions, GET /api/profiles/{profileId}, POST /api/assets/generate."

*Resultado:* Especificación completa con schemas, ejemplos de request/response y documentación clara.

**Prompt 2: Manejo de errores y códigos de estado**

*Contexto: API - Robustez operativa*

"Expand the API design to include detailed error handling for the main endpoints. Map the PRD-specific error conditions such as profile_not_normalized, gdpr_consent_required, quota_exceeded, invalid_format and insufficient_permissions to HTTP status codes and response payloads. Ensure each endpoint defines the expected 400/401/403/404/500 responses and uses a consistent error schema."

*Resultado:* Descripción de errores y códigos de estado alineada con el PRD, con payloads de error reutilizables.

**Prompt 3: Validación de request/response y restricciones**

*Contexto: API - Contratos de datos*

"Describe the input validation rules and schema constraints for the API requests and responses. Include required fields, field formats, enum restrictions, array size limits, and relation to domain rules like BusinessProfile status and GDPR consent. Highlight how invalid requests should fail fast with meaningful error messages."

*Resultado:* Reglas de validación claras para request/response schemas y criterios de rechazo anticipado.

**Prompt 4: Cross-cutting API concerns**

*Contexto: API - Operaciones y seguridad*

"Describe how cross-cutting concerns should be handled for the API layer: authentication, authorization, rate limiting, pagination, and error propagation. Use the PRD behavior to explain when requests should be authenticated, which endpoints require user role checks, and how throttling is communicated to clients."

*Resultado:* Recomendaciones de patrones de autenticación, autorización y operación para el API.

---

## 5. Historias de Usuario

**Prompt 1: Generación de user stories MVP**

*Contexto: Requerimientos - Backlog priorizado*

"Generate 5 must-have user stories for the MVP following: 'As a [role], I want [action], so that [benefit]'. Each story must include: acceptance criteria in Given/When/Then format, edge cases, and measurable outcomes. Cover: business discovery, profile normalization, asset generation, quality control. Align with Lean Canvas and architecture."

*Resultado:* 5 historias con criterios de aceptación detallados y casos borde.

**Prompt 2: Historias should-have post-MVP**

*Contexto: Backlog futuro - Roadmap*

"Generate 2 should-have user stories for post-MVP phases that extend the platform without adding complexity to MVP. Focus on: metrics dashboard and collaborative asset sharing. Include same level of detail as must-have stories."

*Resultado:* 2 historias adicionales para fases posteriores con criterios claros.

---

## 6. Tickets de Trabajo

**Prompt 1: Decomposición en tickets técnicos**

*Contexto: Planificación - Sprint breakdown*

"Based on the 5 must-have user stories, decompose them into 3 technical tickets covering: backend, frontend, and database layers. Each ticket must include: ID, name, description, objective, dependencies, and scope for a single developer. Ensure: business discovery capture, profile normalization backend logic, and asset generation infrastructure."

*Resultado:* 3 tickets (BE-101, FE-102, DB-103) con descripción técnica completa.

**Prompt 2: Estimación con Story Points**

*Contexto: Estimación - Planning Fibonacci*

"Estimate the three technical tickets using Fibonacci scale (1, 2, 3, 5, 8, 13). Provide for each: Story Points value and brief justification considering complexity, dependencies, learning curve, and team experience. Ensure estimates reflect realistic MVP startup effort."

*Resultado:* BE-101 (5 pts), FE-102 (3 pts), DB-103 (8 pts) con justificación clara.

---

## 7. Pull Requests

**Prompt 1: Descripción profesional de PR**

*Contexto: Control de cambios - Documentación*

"Create a comprehensive PR description that explains: addition of 7 complete user stories with acceptance criteria, decomposition into 3 technical tickets with story point estimation, and rationale for architecture decisions. Include: title, what changes, why, business impact, technical impact. Audience: product and engineering stakeholders."

*Resultado:* PR description profesional y completa que comunica valor y cambios técnicos.

---

## Notas Finales

Todos los prompts fueron diseñados para:
- Traducirse directamente en artefactos concretos y medibles
- Mantener coherencia arquitectónica y de dominio a lo largo del proyecto
- Justificar decisiones técnicas y de producto ante stakeholders
- Documentar supuestos y restricciones del MVP

Los prompts enfatizan:
- Restricciones realistas de startup (presupuesto, tiempo, complejidad)
- Enfoque en usuarios finales no técnicos (PYMEs pequeñas)
- Calidad, consistencia y explicabilidad como diferenciadores
- Human-in-the-loop y validación humana en workflows de IA
