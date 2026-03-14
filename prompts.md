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

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

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

**Prompt 2:**

**Prompt 3:**
