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
Modelo: GEMINI 3 PRO planning
Role: Senior Product Owner (PO/PDO), expert in product definition and software requirements management, focused on the successful delivery of transportation-oriented software projects.
Objectives:

* Guide the development of the project based on the requirements established in PRD_route_searcher.md.
* Ensure strict alignment with instructions.md.
* Generate documents 0, 1, and 5 as requested in readme.md, using PRD_route_searcher.md as the primary reference.
Rules:
* The files instructions.md, readme.md, and PRD_route_searcher.md must not be modified.
* The documents requested in the README must be placed in the /docs folder and must always be in .md format.

Before starting to create any document, please ask for any specific information requested within the documents or anything else you need to know to properly define the project.

Preguntas prompt 1
I have read the documentation and have a plan to generate the required documents. However, I need some specific details from you to complete the "Project Sheet" and "General Description" accurately, as requested in your instructions.
Please answer the following questions:

1. Project Sheet (Doc 0): What is your Full Name?
2. Project Sheet (Doc 0): Do you have a Project URL and Repository URL, or should I use placeholders?
3. General Description (Doc 1): For the Installation Instructions, do you have a preferred tech stack (e.g., Next.js, React, Node.js)? If not, I can propose a standard modern stack suitable for a "web landing" validation phase.
4. UX Design (Doc 1): For the "Design and User Experience" section, do you want me to generate AI mockups for the interface, or should I just describe the user flow textually?
Please review the implementation plan for more details.

Respuestas prompt 1

1. Project Sheet (Doc 0): What is your Full Name? ChristianDe Amorim, Alfonso Rodriguez y Eduardo Patiño
2. Project Sheet (Doc 0): Do you have a Project URL and Repository URL, or should I use placeholders?  project url: <https://routesearch.busup.org> repository url: <https://github.com/busup/AI4Devs-finalproject.git>
3. General Description (Doc 1): For the Installation Instructions, do you have a preferred tech stack (e.g., Next.js, React, Node.js)? If not, I can propose a standard modern stack suitable for a "web landing" validation phase.Backend:

* * Laravel 5.5
* * PHP >= 7.0
* * MySQL 8.0
* * Docker para entorno local
Frontend:

- Vue 3
* Composition API
* Vite 4.x
* Vue Router 4 (history mode)
* Pinia para gestión de estado
* vue-i18n 9 + @intlify/unplugin-vue-i18n
* Sass
* Tailwind CSS 3
* @googlemaps/js-api-loader
The project will be monorepo with backend separated from the frontend

1. UX Design (Doc 1): For the "Design and User Experience" section, do you want me to generate AI mockups for the interface, or should I just describe the user flow textually? Tengo el diseño de las interfaces aqui <https://stitch.withgoogle.com/projects/13706256767192248996>

**Prompt 2:**
Modelo: GEMINI 3 PRO planning
As Product Owner (PO or PDO): Refine or further detail the project definition that we have in documents 0, 1 and 5 inside docs directory. Before starting, ask me if you need any further details or if there are specific points I should consider.

Preguntas:

o ensure the refinement meets your expectations as a Product Owner, I have reviewed the current documents against the PRD and have a few questions:

1. Document 1 (General Description):

* KPIs & Risks: The PRD lists specific "Success Metrics (KPIs)" (Section 8) and "Risks" (Section 7). Should I explicitly include these subsections within 1.1 Objective or 1.2 Features to make the product definition more robust?
* Features: Should we detail the "Search Radius" logic (e.g., exact behavior when outside radius) more technically in 1.2 Characteristics?

2. Document 5 (User Stories):

* Error Handling: Do you want to add specific Acceptance Criteria for Edge Cases? (e.g., "User searches for a date in the past", "No routes found within radius", "API timeout").
* Technical Notes: Should I add a "Technical Notes" section to each story specifying endpoints or data requirements (e.g., "Requires POST /api/v1/search")?

3. Document 0 (Project Sheet):

* Is there any additional context or "elevator pitch" style description you'd like to add to the 0.3 Brief Description?
Please let me know which of these (or other points) you'd like me to focus on.

Respuestas:

1. Document 1 (General Description):

KPIs & Risks: The PRD lists specific "Success Metrics (KPIs)" (Section 8) and "Risks" (Section 7). Should I explicitly include these subsections within 1.1 Objective or 1.2 Features to make the product definition more robust? yes
Features: Should we detail the "Search Radius" logic (e.g., exact behavior when outside radius) more technically in 1.2 Characteristics? yes

1. Document 5 (User Stories):

Error Handling: Do you want to add specific Acceptance Criteria for Edge Cases? (e.g., "User searches for a date in the past", "No routes found within radius", "API timeout"). Yes
Technical Notes: Should I add a "Technical Notes" section to each story specifying endpoints or data requirements (e.g., "Requires POST /api/v1/search")?No

1. Document 0 (Project Sheet):

Is there any additional context or "elevator pitch" style description you'd like to add to the 0.3 Brief Description? NO

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

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

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
