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

**Prompt 1:**
Tengo una idea para el mvp, que el usuario sea capaz de realizar meditaciones personalizadas donde pueda crear un texto con IA, con música relajante de fondo, elegir una imagen o vídeo, subtitularla, etc. La salida final será un video listo para meditar. ¿Qué necesito para realizar esto con java y microservicios?¿Es viable como proyecto mvp para 30h?

**Prompt 2:**
I need you to generate a fully written, copy/paste-ready final prompt. This prompt should be designed to guide an AI model through a complex technical task. When generating the final prompt, you must follow this structure exactly: --- ## 🔶 STRUCTURE OF THE PROMPT TO GENERATE # 🧪 TOPIC > Con todo lo que hemos hablado y para resumir mvp de 30h con Spring boot, java 21, arquitectura hexagonal, principios SOLID y buenas prácticas de programación, postgreSQL, autenticación con AWS cognito, el objetivo es crear meditaciones a partir de un texto simple (openAI para generar un prompt más rico, pasar a voz y generar imagen) > > > con esto en mente: React SPA > | > |--> Cognito (Auth) > | > |--> meditation-api ([Fly.io](http://fly.io/)) > | - Spring Security (JWT) > | - PostgreSQL (Neon) > | - SQS producer > | > |--> media-worker ([Fly.io](http://fly.io/)) > - SQS consumer > - OpenAI > - FFmpeg > - S3 y Frontend: React → Render > Backend API: Java → [Fly.io](http://fly.io/) > Worker: Java → [Fly.io](http://fly.io/) > DB: Neon.tech (Postgres) > Storage: S3 > Auth: Cognito > Queue: SQS > --- ### 1️⃣ ROLE & CONTEXT Define an expert role and the specific domain context. It should include: - Level of expertise (e.g., senior expert, architect, auditor, etc.) - Specific knowledge required - Professional context in which the model will operate --- ### 2️⃣ TASK A single clear instruction about what the model should produce. It should be concrete, measurable, and oriented to a deliverable. --- ### 3️⃣ SPECIFICATIONS List detailed requirements, including: - Files or paths involved - Specific models, entities, objects, or components - Exact fields with constraints - Rules, relationships, or expected architecture - Validations, constraints, normalization, etc. --- ### 4️⃣ TECHNICAL REQUIREMENTS Any additional technical requirements, such as: - Languages - Frameworks - Connections - Formats - Corporate standards - Indexing rules - Naming conventions - Security policies or data cleaning requirements --- ## 🧩 METAPROMPT REQUIREMENTS When generating the final prompt, ensure that: - It is highly detailed and prescriptive - It forces the model to produce consistent technical output - It maintains a professional tone and tactical formatting - It uses clear lists, headings, and sections - It avoids ambiguity and allows zero misinterpretation - It maintains precision for generating code or data models - It is reproducible for any technical domain (DB, backend, frontend, APIs, architecture, etc.) --- ## 📌 EXPECTED OUTPUT OF THIS METAPROMPT A final prompt that uses exactly the above structure, following the domain details provided by the user.

**Prompt 3:**
### 1️⃣ **ROLE & CONTEXT**

You are a **Senior Product Architect / Software Architect**

- 10+ years of experience in:
    - Digital product design
    - Distributed system architecture
    - SaaS platforms
    - Modern backend + frontend systems
- Solid knowledge in:
    - Domain modeling
    - Business-oriented design
    - Modern service-based architectures
    - Visual representation via diagrams (C4, use cases, architecture)
- Professional context:
    - Leading the definition of an evaluable product (portfolio project / senior-level assessment)
    - The document must be understandable by both technical and non-technical profiles
    - The output must convey **judgment, clarity, and professional maturity**

---

### 2️⃣ **TASK**

Design and document the **first complete version of the meditation generation system**, delivering all functional, business, and architectural artifacts required for a team to:

- Understand the product
- Validate its value proposition
- Begin technical implementation unambiguously

The result must be a **single, structured, self-explanatory document**.

---

### 3️⃣ **SPECIFICATIONS**

The design must strictly comply with the following specifications:

- System must be oriented to:
    - End-users who want to generate personalized meditations
    - A scalable digital business model
- Use cases must:
    - Be user-centric
    - Be clear, bounded, and realistic
- Data model must:
    - Be normalized
    - Use clear and consistent naming
    - Explicitly indicate data types
- High-level design must:
    - Clearly identify frontend, backend, asynchronous processing, and external services
    - Show communication flows
- Diagrams must:
    - Be described textually (e.g., Mermaid, PlantUML)
    - Be consistent with each other
- There must be no contradictions between:
    - Features
    - Use cases
    - Data model
    - Architecture

---

### 4️⃣ **TECHNICAL REQUIREMENTS**

Although the focus is functional and design-oriented, assume the following technical context:

- Architecture based on:
    - Frontend (SPA with React)
    - Backend (Java 21 Spring Boot)
    - Asynchronous processing
- Integration with external AI services
- Use of:
    - Token-based authentication
    - Persistent storage
    - Multimedia file storage
- Diagrams must use:
    - Clear naming and standard conventions
    - Separation of concerns
- Keep the design:
    - Realistic
    - Implementable
    - Avoid over-engineering

---

## 🧩 **METAPROMPT REQUIREMENTS**

When generating the output, ensure that:

- Content is **highly detailed and prescriptive**
- Output is **consistent and coherent end-to-end**
- Tone is **professional, clear, and structured**
- Uses:
    - Lists
    - Headings
    - Well-defined sections
- No ambiguities or open interpretations
- Document could be reused in any similar technical domain (digital product, SaaS, backend platform, etc.)

---

## 📌 **EXPECTED OUTPUT OF THIS METAPROMPT**

A **fully structured final prompt** (this one), which allows an AI model to:

- Design a software system from scratch
- Think as both product manager and software architect
- Deliver clear, visual, and actionable documentation
- Serve as a real foundation for a professional or evaluable project
- 10+ years of experience in:
    - Digital product design
    - Distributed system architecture
    - SaaS platforms
    - Modern backend + frontend systems
- Solid knowledge in:
    - Domain modeling
    - Business-oriented design
    - Modern service-based architectures
    - Visual representation via diagrams (C4, use cases, architecture)
- Professional context:
    - Leading the definition of an evaluable product (portfolio project / senior-level assessment)
    - The document must be understandable by both technical and non-technical profiles
    - The output must convey **judgment, clarity, and professional maturity**
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Tu misión será diseñar y documentar un sistema de software siguiendo las fases de investigación y análisis, definición funcional, casos de uso, modelado de datos y diseño de alto nivel.

El sistema a diseñar es una plataforma de generación de meditaciones personalizadas, capaz de transformar un texto simple proporcionado por el usuario en una experiencia multimedia completa (texto enriquecido, audio, imagen y vídeo).

Contexto inicial:

El producto parte desde cero (no hay nada implementado).

Debes ponerte el gorro de Product Manager + Arquitecto de Software.

Es el momento de hacer brainstorming informado, investigar qué hacen productos similares y detectar palancas de diferenciación real.

Objetivo del diseño:
Definir la primera versión (v1 / MVP) del sistema, dejando una base clara, coherente y entendible para todo el equipo (producto, frontend, backend, negocio).

Artefactos que debes entregar obligatoriamente:

Descripción breve del software:

Qué es

Qué problema resuelve

Para quién

Valor añadido y ventajas competitivas frente a soluciones existentes.

Explicación clara de las funciones principales del sistema (feature-level, no técnicas).

Un diagrama Lean Canvas que permita entender el modelo de negocio completo.

Descripción detallada de los 3 casos de uso principales, incluyendo:

Objetivo del usuario

Flujo principal

Actores implicados

Un diagrama de caso de uso asociado a cada uno

Modelo de datos:

Entidades

Atributos (nombre + tipo)

Relaciones entre entidades

Diseño del sistema a alto nivel:

Explicación textual clara

Diagrama de arquitectura adjunto

Diagrama C4, profundizando progresivamente hasta el nivel de componentes del sistema.

Todo el contenido debe estar orientado a servir como documentación fundacional del producto y del sistema.

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Based on the hexagonal architecture we defined, describe the main components of Meditation Builder in detail: the 4 Bounded Contexts (identity, meditationbuilder, meditation.generation, playback), their responsibilities, the ports and adapters pattern within each one, and their dependencies. Explain why no BC should have a direct domain dependency on another.

**Prompt 2:**
For the meditation.generation BC, explain the internal pipeline components: GoogleCloudTtsAdapter, OpenAiImageAdapter, FfmpegRenderAdapter, and S3StorageAdapter. For each one define: the output port interface it implements, its constructor dependencies, its main method signature, and how errors are propagated up to the use case. The pipeline is synchronous — no queues.

**Prompt 3:**
Describe the shared infrastructure component BearerTokenFilter. It must: extract the userId from the backend-issued JWT on every protected request, inject it into the Spring SecurityContext, return 401 for missing or invalid tokens, and have zero knowledge of any bounded context. Show the Spring Security configuration class that registers it.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Generate the exact Maven folder structure for a Spring Boot Java 21 project with hexagonal architecture and 4 Bounded Contexts: identity, meditationbuilder, meditation.generation, playback. Each BC must have domain/, application/, infrastructure/, and controllers/ layers. Include the shared/ package for cross-cutting concerns. Show the test folder mirroring the main structure with bdd/, e2e/, and contracts/ directories.

**Prompt 2:**
For the frontend, generate the folder structure for a React + TypeScript Vite project with: auto-generated OpenAPI clients in src/api/generated/, React Query hooks in src/hooks/, Zustand stores in src/state/, and Playwright E2E tests in tests/e2e/. Explain the role of each folder and how the generate:api npm script connects the backend OpenAPI spec to the frontend clients.

**Prompt 3:**
Explain how OpenAPI-first development works in this project: we define the YAML spec first in backend/src/main/resources/openapi/<bc>/, then the controller must match it exactly (contract tests enforce this), and npm run generate:api generates the TypeScript client for the frontend. Show a concrete example with the identity BC authentication endpoint.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Create a docker-compose.yml for local development that starts: LocalStack (for S3 emulation on port 4566) and PostgreSQL 15 (port 5432). Include a health-check for each service and environment variable defaults matching the application-local.yml.example. Add a bash init script (init-localstack.sh) that creates the meditation-builder S3 bucket after LocalStack starts.

**Prompt 2:**
Design the GitHub Actions CI pipeline for the backend with exactly 8 sequential gates: (1) BDD Cucumber, (2) OpenAPI lint, (3) Unit domain tests, (4) Unit application tests, (5) Infrastructure integration tests with Testcontainers, (6) Contract tests, (7) E2E tests, (8) Maven package build. Each gate must fail fast and must not run if a previous gate fails. Add the required secrets: GOOGLE_CLIENT_ID, OPENAI_API_KEY, JWT_SECRET.

**Prompt 3:**
Describe the production deployment topology: React SPA on Vercel (automatic deploy on push to main, VITE_GOOGLE_CLIENT_ID env var), Spring Boot JAR on Render.com (Docker, 512MB RAM minimum for FFmpeg), PostgreSQL on Neon.tech serverless (connection pooling via PgBouncer), media assets on AWS S3 us-east-1. Explain how Flyway migrations run automatically at Spring Boot startup.

### **2.5. Seguridad**

**Prompt 1:**
We decided to replace AWS Cognito with Google OAuth2 + a backend-issued JWT. Implement the full auth flow: the frontend sends the Google id_token to POST /api/v1/identity/auth/google; the backend validates it against Google's JWKS public endpoint using Spring Security OAuth2 Resource Server; if valid, it issues its own HS256 JWT (24h expiry, userId as subject) and returns it. The backend JWT is then used as Bearer token for all subsequent requests. Show the Spring Security configuration and the JWKS validation bean.

**Prompt 2:**
Implement ownership enforcement for the meditation generation use case. The GenerateMeditationUseCase must: retrieve the composition by compositionId, verify that composition.userId equals the userId extracted from the SecurityContext, throw a ForbiddenException if they differ (mapped to HTTP 403 by the controller), and never leak another user's data in error messages. Add a unit test that verifies the 403 path.

**Prompt 3:**
For S3 media storage, implement pre-signed URL generation in S3StreamingAdapter: URLs must expire after 3600 seconds (1 hour), use GET method only, and be generated per-request (never cached or stored in the DB). Add a LocalStack integration test that verifies the generated URL is accessible and returns the correct content type for video.mp4 and audio.mp3.

### **2.6. Tests**

**Prompt 1:**
Set up Cucumber BDD for the identity Bounded Context. Create the feature file features/identity/US1.feature with 5 scenarios (new user login, returning user login, protected route access without auth, logout, OAuth cancellation). Create the Spring Boot test configuration class IdentityCucumberSpringConfiguration with @CucumberContextConfiguration, a @MockBean for ValidarCredencialGooglePort, and a @Before hook that calls POST /v1/identity/auth/google to obtain a real JWT. All step definitions must start in PENDING state.

**Prompt 2:**
For the meditation.generation BC, write integration tests using WireMock for the external service adapters. GoogleCloudTtsAdapterIT must: start WireMock on a random port, stub POST /v1/text:synthesize to return a base64-encoded MP3, call the adapter, and verify the returned byte array is non-empty. A second test stubs a 500 response and verifies the adapter throws a TtsGenerationException. Do not call the real Google TTS API in any test.

**Prompt 3:**
Design the frontend test strategy. Unit tests use Vitest + React Testing Library. Integration tests add MSW (Mock Service Worker) to intercept API calls — one handler per endpoint. Playwright E2E tests in tests/e2e/ must cover the 5 BDD scenarios for US1 using a mocked Google OAuth flow (inject a fake id_token via page.evaluate before clicking the Google button). Show the msw/handlers.ts structure and the Playwright fixture for authenticated state.

---

### 3. Modelo de Datos

**Prompt 1:**
Design the PostgreSQL data model for Meditation Builder using two schemas: identity and generation. The identity.users table stores Google OAuth profiles (id UUID PK, google_id TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, name TEXT, picture TEXT, created_at TIMESTAMP). The generation.meditations table stores generated meditations with a FK to identity.users. Include the ENUM types for status (PROCESSING, COMPLETED, FAILED, TIMEOUT) and type (AUDIO, VIDEO). Generate the Flyway migration SQL files with versioned naming convention V1__, V2__, etc.

**Prompt 2:**
We decided not to use a separate jobs table because generation is synchronous. Explain in the data model documentation why there is no generation_jobs table, how status transitions work within generation.meditations (PROCESSING on insert → COMPLETED or FAILED on pipeline result → TIMEOUT if threshold exceeded), and what indexes to add for the most frequent query patterns: list by user_id ordered by created_at DESC, and lookup by id + user_id for ownership validation.

**Prompt 3:**
Write the complete ER diagram in Mermaid erDiagram notation for both schemas, including all field names, types, constraints (PK, FK, unique, not null), and the cardinality of the relationship between identity.users and generation.meditations. Also document the S3 key convention (generation/{userId}/{meditationId}/video.mp4 etc.) as a separate section in the data model doc since those paths are derived at runtime and not stored as FKs.

---

### 4. Especificación de la API

**Prompt 1:**
Using OpenAPI 3.0 YAML, write the complete spec for the identity BC (file: openapi/identity/US1.yaml). It must define: POST /api/v1/identity/auth/google (request body with idToken string, responses 200 with token/userId/name/email/picture and 401), POST /api/v1/identity/auth/logout (Bearer auth required, response 204), and a reusable SecurityScheme component named BearerAuth. The spec must pass Redocly lint with no errors and must not include any endpoint not covered by the US1 BDD scenarios.

**Prompt 2:**
Write the OpenAPI spec for the meditation.generation BC (openapi/generation/US3.yaml). The POST /api/v1/generation/{meditationId}/generate endpoint must: require BearerAuth, accept a path parameter meditationId (UUID format), return 201 with meditationId/type/mediaUrl/subtitleUrl/status on success, and document all error responses: 401 (no token), 403 (not owner), 404 (not found), 500 (pipeline failure). Include a concrete JSON example for the 201 response.

**Prompt 3:**
Implement contract tests for the AuthController using Spring Cloud Contract or a RestAssured provider test against the US1.yaml OpenAPI spec. The test must: load the YAML spec, start the Spring context with @SpringBootTest, send a POST /api/v1/identity/auth/google request with a mocked Google id_token (WireMock stubs the JWKS endpoint), and assert that the response structure (field names, types, HTTP status) exactly matches the spec. Add this test to CI gate 6 (Contract Tests).

---

### 5. Historias de Usuario

**Prompt 1:**
🧪 TOPIC Generate 4 User Stories based on the info of the attached PRD. Follow good practices with the following structure: Standard Format: "As a [user type], I want to [perform an action] to [gain a benefit]." Description: A concise, natural-language description of the functionality the user desires. Acceptance Criteria: Must follow Gherkin-style syntax: Given [initial context], when [action performed], then [expected result]. Additional Notes: Any clarifying detail that aids development. Tasks: A list of engineering tasks and subtasks needed to complete the story. 

User Story Examples: 

- Product Development: "As a product manager, I want a way for team members to understand how individual tasks contribute to the goals, so they can better prioritize their work."
- Customer Experience: "As a returning customer, I expect my information to be saved to create a smoother checkout experience, so I can complete my purchases quickly and easily."
- Mobile App: "As a frequent app user, I want a way to quickly and easily access relevant information so I can find what I need efficiently."

1️⃣ ROLE & CONTEXT You are acting as a Senior Product Requirements Architect, with expertise in: Enterprise-grade PRD decomposition Writing high-quality User Stories aligned with Agile/Scrum and INVEST Translating complex or ambiguous product requirements into atomic, testable stories Working within engineering, UX, QA, and architecture teams to ensure feasibility and clarity Context: You are the final reviewer of User Stories generated from the provided PRD. You must infer missing details only when logically necessary, but never invent features that are not present in the PRD. Your output must meet enterprise-quality standards for precision, consistency, and testability. 

2️⃣ TASK Produce exactly 4 complete User Stories, using only the information contained in the attached PRD. Each story must follow the full structure described above. 

3️⃣ SPECIFICATIONS When generating the 4 User Stories: Use only the PRD as the functional source of truth. Extract from it: User types Actions grounded in actual features described in the PRD Benefits aligned with the value proposition and use-cases Each story must include: Title (clear, descriptive) User Story sentence (As a..., I want..., so that...) Description Acceptance Criteria (Gherkin: Given / When / Then) Additional Notes Tasks & Subtasks Acceptance Criteria rules: Must be testable, measurable, unambiguous Must not overlap with other stories Must reflect the minimum definition of done for the feature Tasks must: Be written as action verbs (Implement, Create, Validate, Integrate...) Cover backend, frontend, UX, indexing, validations, events, error cases, and QA whenever applicable Include edge-case validations required by the PRD 

4️⃣ TECHNICAL REQUIREMENTS Your output must follow: Language: English, concise, technical, neutral Format: Markdown headings + bullet lists Corporate Standards: INVEST criteria Gherkin-style acceptance criteria No architectural decisions not explicitly in the PRD Naming conventions: Titles: descriptive and functional Tasks: action verbs only Constraints: No assumptions beyond reasonable inferences No features invented outside the PRD No filler content Zero duplication across stories 

🧩 METAPROMPT REQUIREMENTS You must: Produce a highly detailed, prescriptive, and consistent output Maintain strict formatting with headings and bullet lists Avoid ambiguity; use objective technical language Ensure reproducibility Provide stories that are immediately usable by engineering teams 

📌 EXPECTED OUTPUT A final deliverable containing exactly 4 complete User Stories, each with: Title Standard User Story sentence Description Acceptance Criteria (Given / When / Then) Additional Notes Tasks & Subtasks

**Prompt 2:**
te voy a dar más información acerca de cómo quiero que se creen las meditaciones, tendremos un campo texto general obligatorio con varios uses cases (el usuario puede incluir su texto personalizado o mediante un botón puede pedir a la IA que lo genere del todo [si está vacío] o generarlo a partir de x palabras), lo mismo para la música y las imágenes (puede seleccionar su propia música/imagen o generarlas con IA con un botón específico que llamará a los diferentes servicios de OpenAI o la plataforma elegida en cada caso). Añadir botones de preview en la imagen y la música, finalmente un botón para generar el vídeo con todas las opciones. Dame más ideas para hacer una pantalla que denote un producto profesional, moderno y atractivo para los consumidores.

**Prompt 3:**
reescribe cada US con tus recomendaciones para que sea BDD puro
---

### 6. Tickets de Trabajo

**Prompt 1:**
Consider the 4 user stories you've generated as a backlog, generate a Markdown table estimating the following for each item: Impact on the user and business value. Urgency based on market trends and user feedback. Complexity and estimated implementation effort. Risks and dependencies between tasks.

**Prompt 2:**
Order the user stories by priority using two typical different approaches and compare them in a markdown table

**Prompt 3:**
I need you to generate a fully written, copy/paste-ready final prompt. This prompt should be designed to guide an AI model through a complex technical task. When generating the final prompt, you must follow this structure exactly: --- ## 🔶 STRUCTURE OF THE PROMPT TO GENERATE # 🧪 TOPIC > Using the user story 1 generate the work tickets using the champion guide flow attached. Implement them technically, just as you would in planning meetings. "> --- ### 1️⃣ ROLE & CONTEXT Define an expert role and the specific domain context. It should include: - Level of expertise (e.g., senior expert, architect, auditor, etc.) - Specific knowledge required - Professional context in which the model will operate --- ### 2️⃣ TASK A single clear instruction about what the model should produce. It should be concrete, measurable, and oriented to a deliverable. --- ### 3️⃣ SPECIFICATIONS List detailed requirements, including: - Files or paths involved - Specific models, entities, objects, or components - Exact fields with constraints - Rules, relationships, or expected architecture - Validations, constraints, normalization, etc. --- ### 4️⃣ TECHNICAL REQUIREMENTS Any additional technical requirements, such as: - Languages - Frameworks - Connections - Formats - Corporate standards - Indexing rules - Naming conventions - Security policies or data cleaning requirements --- ## 🧩 METAPROMPT REQUIREMENTS When generating the final prompt, ensure that: - It is highly detailed and prescriptive - It forces the model to produce consistent technical output - It maintains a professional tone and tactical formatting - It uses clear lists, headings, and sections - It avoids ambiguity and allows zero misinterpretation - It maintains precision for generating code or data models - It is reproducible for any technical domain (DB, backend, frontend, APIs, architecture, etc.) --- ## 📌 EXPECTED OUTPUT OF THIS METAPROMPT A final prompt that uses exactly the above structure, following the domain details provided by the user.

---

### 7. Pull Requests

**Prompt 1:**
Write a GitHub Pull Request description for the branch feature/us1-google-oauth-identity targeting feature-entrega3-JVC. The PR implements the complete identity Bounded Context: PerfilDeUsuario aggregate, IniciarSesionConGoogleUseCase, JWKS validation adapter, JWT issuer, AuthController, BearerTokenFilter, Flyway migration V3__create_identity_users.sql, migration of existing BC controllers from X-User-Id header to SecurityContext, and the frontend LoginPage + AuthGuard + authStore. Include: summary, motivation, list of key changed files, CI gates status, and a reviewer checklist with items for domain purity, contract compliance, and header removal.

**Prompt 2:**
Review this Pull Request and identify any violations of our hexagonal architecture rules: (1) domain classes must not import Spring or infrastructure types, (2) use cases must only orchestrate — no business logic, (3) controllers must not contain business logic and must delegate 100% to use cases, (4) infrastructure adapters must implement domain output ports. For each violation found, explain why it breaks the rule and suggest the correct refactoring.

**Prompt 3:**
Write the Pull Request description for feature/us3-multimedia-generation. This PR implements the synchronous generation pipeline in the meditation.generation BC. Key points to highlight: the decision to use synchronous HTTP processing instead of SQS/async workers (and why), the FFmpeg binary dependency (how it is detected at startup), the WireMock-only policy for Google TTS and OpenAI tests (no real API calls), and the Testcontainers LocalStack setup for S3 integration tests. Include a risk section noting the long HTTP response time (~30–180s) and how the 187s timeout is configured.
