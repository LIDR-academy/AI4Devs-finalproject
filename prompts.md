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

**Prompt 1: Lead Software Architect - Foundation Phase**
```
## 🧠 Prompt for Lead Software Architect: Spartan Guitar Gym - Foundation Phase

### 🎯 Objective:
As the **Lead Software Architect**, your mission is to **design the foundational software artifacts** necessary to begin development on the application named **Spartan Guitar Gym**. This app is aimed at guitarists seeking structured, high-discipline practice regimens, combining elements of a gym routine with musical training.

Your outputs must follow **software architecture best practices**, serve as solid documentation for **Product Owners, Business Analysts**, and the development team, and ensure **clarity, scalability, and feasibility** before coding begins.

---

### ⚠️ Required Context to Start:
> 🚨 **You must request and review the initial roadmap in markdown format** before beginning.  
This roadmap will define the **initial MVP scope**, business priorities, target users, and expected timeline. No artifact generation should begin until this roadmap is analyzed.

---

### ✅ Deliverables:
You will create the following artifacts, step-by-step and collaboratively, based on the roadmap:

1. ### 📝 **Brief Software Description**
   - Define **what Spartan Guitar Gym is**, its **value proposition**, and its **competitive advantages**.
   - Include:
     - Target audience
     - Problem it solves
     - Differentiators in the market

2. ### 🔍 **Main Functionalities**
   - List and explain the **core features** and expected user actions.
   - Group functionalities by type (e.g., Practice Routines, Progress Tracking, Gamification, etc.).

3. ### 📊 **Lean Canvas Diagram**
   - Create a Lean Canvas model covering:
     - Problem
     - Customer Segments
     - Unique Value Proposition
     - Solution
     - Channels
     - Revenue Streams
     - Cost Structure
     - Key Metrics
     - Unfair Advantage

4. ### 🎭 **Top 3 Use Cases**
   - Describe 3 **core user use cases** with:
     - Clear goal
     - Actors involved
     - Preconditions and outcomes
     - Step-by-step interaction
     - **Include one use case diagram per use case**

5. ### 🧱 **Data Model**
   - Design a **domain model** including:
     - **Entities** with:
       - Names
       - Attributes (with type annotations)
     - **Relationships** (one-to-one, one-to-many, many-to-many)
   - Can be expressed as a **UML class diagram** or entity-relationship diagram.

6. ### 🏗️ **High-Level System Architecture**
   - Describe the system's structure and technology components (e.g., frontend, backend, DB, APIs).
   - Show a **modular view** that emphasizes **scalability, modularity**, and **responsibility separation**.
   - Include a **diagram** (e.g., component or container diagram).

7. ### 🧩 **C4 Diagram (Component-Level)**
   - Choose one major component (e.g., Practice Scheduler, Recommendation Engine, Gamification System).
   - Develop a **detailed C4 component diagram**:
     - Internal structure
     - Interactions
     - Technology choices
     - Justification for design decisions

---

### 👇 Process & Guidance:
- Follow a **sequential and collaborative approach**.
- Before producing each artifact, **ask clarifying questions** based on the roadmap.
- Collaborate with stakeholders (real or hypothetical) to ensure alignment.
- Ensure every artifact is **well-documented, self-explanatory, and re-usable**.

---

### 🧩 Tools and Notation Suggestions:
- Use **Markdown tables** for data models and Lean Canvas.
- Use **PlantUML, Mermaid, or textual description** for diagrams if diagrams cannot be rendered.
- Maintain a clean, concise, and structured tone suitable for stakeholder presentation.

---

### 🚀 Final Goal:
By completing these artifacts, you will enable the team to:
- Understand the MVP scope
- Estimate work effectively
- Identify dependencies and potential risks
- Create an informed product backlog
- Lay the groundwork for iterative delivery
```

**Prompt 2: PRD Creation**
```
# Prompt for Product Owner -- PRD Creation

Act as a **Product Owner expert in digital product development** and **Agile methodologies**.
Your goal is to create the **PRD (Product Requirement Document)** for the project **Spartan Guitar Gym**.

Use as reference both **best practices in product & agile development** and the structure defined in `good-practices-product.md`.
You will receive all the available project documentation (including overviews, system diagrams, prior requirements, design decisions, and business notes) that provides the full context.

------------------------------------------------------------------------

## Your PRD must include:

1.  **Introduction & Objectives**: Clear summary of the product, its purpose, and strategic goals.
2.  **Stakeholders**: Identification of end-users, key partners, internal team members, and other relevant parties.
3.  **User Stories & Use Cases**: Written in the standard format ("As a [user], I want [action], so that [benefit]") with acceptance criteria.
4.  **Main Components & Architecture**: Sitemaps, core modules, and how they relate to each other.
5.  **Features & Functionalities**: Detailed and prioritized list of features considering business value, urgency, dependencies, and cost.
6.  **Design & UX**: Principles for user experience, wireframes, or interface guidelines if applicable.
7.  **Technical Requirements**: Technological dependencies, integrations, scalability, security, and maintainability considerations.
8.  **Planning & Roadmap**: Key milestones, phased deliverables, and initial backlog.
9.  **Acceptance Criteria**: Clear, measurable conditions to validate that the product fulfills its purpose.
10. **Appendices & Resources**: Glossary, references, links to diagrams, and additional supporting materials.

------------------------------------------------------------------------

## Considerations:

-   Apply **user story mapping** to organize functionalities.
-   Write everything in **clear business-oriented language**, avoiding unnecessary technical jargon.
-   Include **prioritization and effort estimation** whenever possible.
-   Highlight potential **risks and dependencies**.
-   Maintain an **iterative and incremental vision**, proposing an agile roadmap.

------------------------------------------------------------------------

The result must be an **actionable, clear, and complete PRD**, ready to be used by stakeholders, developers, UX, and business teams to align expectations and move forward with development.
```

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1: High-Level System Architecture (HLA)**
```
# Rol e intención
Eres un arquitecto de software senior. Tu tarea es GENERAR **un único archivo Markdown descargable** que describa una **High-Level System Architecture (HLA)** con diagrama de contenedores y componentes, elecciones tecnológicas justificadas, **código Mermaid** del diagrama y un **prompt equivalente para DiagramGPT** (para comparar resultados). Si falta información del contexto, realiza asunciones razonables y márcalas como [asunción].

# Reglas obligatorias
- Salida en **un solo documento Markdown** sin HTML, sin imágenes embebidas.
- Incluye **ambos** artefactos visuales: (1) bloque ```mermaid``` y (2) bloque con el **prompt para DiagramGPT** que represente el **mismo** diagrama (mismos nombres, agrupaciones y flechas).
- Mantén consistencia exacta de nombres entre la descripción textual, el Mermaid y el prompt DiagramGPT.
- Sé explícito en protocolos (HTTPS, gRPC, REST/GraphQL), colas/eventos, límites de contenedor y relaciones.
- Justifica tech choices con 1–2 frases de racional y trade-offs.
- Usa subgraphs de Mermaid para modelar **contenedores** y nodos internos para **componentes**.
- Añade una sección de riesgos/asunciones y preguntas a stakeholders.

# Pasos de razonamiento (explícitos en la salida)
1) Resume el dominio en 3–5 viñetas: propósito del sistema, actores, restricciones clave, cargas/volúmenes aproximados.
2) Prioriza 6–10 atributos de calidad (p. ej., disponibilidad, latencia, escalabilidad, mantenibilidad, seguridad, coste).
3) Propón un estilo arquitectónico (p. ej., microservicios, modular monolito, event-driven, serverless) y explica trade-offs en 4–8 frases.
4) Define contenedores (Frontend/BFF/API, servicios, workers, DB, cache, broker, almacenamiento de objetos, búsqueda, CDN/WAF, observabilidad).
5) Lista componentes por contenedor con responsabilidades.
6) Selecciona tecnologías (1–2 opciones por capa) con racional breve.
7) Genera el **diagrama en Mermaid** (flowchart/graph TD, subgraphs por contenedor, flechas dirigidas, notas).
8) Genera el **prompt para DiagramGPT** que produzca el MISMO diagrama.
9) Especifica riesgos/asunciones y 5–8 preguntas abiertas.
```

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1: Referencia a Diagramas C4**
```
Ver documento completo de componentes C4 en: spartan_guitar_gym_c4_components_master.md

Este documento contiene:
- Recommendation Service — Component View (con 5 representaciones: Mermaid, PlantUML, ChatUML, DiagramGPT, Edraw Max)
- Gamification / Badge Engine — Component View (con 5 representaciones)
- Practice Scheduler — Component View (con 5 representaciones)

Cada componente incluye:
- Propósito y responsabilidades
- Componentes internos detallados
- Vecinos y dependencias
- Múltiples formatos de diagramas para comparación
```

**Prompt 2: Lean Canvas (Versión A)**
```
Create a clean and visually appealing Lean Canvas for "Spartan Guitar Gym".

Business Idea:
A web/mobile platform combining fitness-style progression with gamified guitar practice for all skill levels. Users progress through Spartan-inspired ranks, complete daily structured exercises, and receive AI-driven personalized recommendations.

Blocks:
Problem: Lack of structured progressive training, low motivation in current platforms, limited personalization in daily practice.
Customer Segments: Individual guitar players (beginner to advanced), self-taught musicians, gamification/fitness enthusiasts. Later expansion to guitar teachers and music schools.
Unique Value Proposition: "Turn your guitar practice into a disciplined, fun, and competitive journey—like a gym for your fingers." Combines rank progression, gamification, and AI personalization.
Solution: Rank-based progression, daily recommendations, video + tablature, gamification (XP, badges, streaks), AI-driven practice suggestions.
Channels: Social media, influencers, SEO, app stores.
Revenue Streams: Freemium + Pro subscription, in-app purchases (badges, style packs), affiliate gear/software sales.
Cost Structure: Development, content creation, hosting, marketing, AI model training.
Key Metrics: DAU, retention, session time, subscription conversion, content engagement.
Unfair Advantage: Unique fitness-inspired brand + gamified structure, early AI personalization.

Make each block visually distinct with bold headings and bullet points.
```

**Prompt 3: Lean Canvas (Versión B)**
```
Business Name: Spartan Guitar Gym
Problem: 1) Lack of structured guitar training for all skill levels. 2) Low engagement and motivation. 3) Limited personalization in practice routines.
Customer Segments: Individual guitar players (beginner to advanced), self-taught musicians, gamification/fitness enthusiasts. Later: guitar teachers, music schools.
Unique Value Proposition: Turn your guitar practice into a disciplined, fun, and competitive journey—like a gym for your fingers. Combines rank progression, gamification, and AI personalization.
Solution: Spartan rank progression, daily exercise recommendations, video + tablature, gamification (XP, badges, streaks), AI-driven suggestions.
Channels: Social media, influencers, SEO, app stores.
Revenue Streams: Freemium + Pro subscription, in-app purchases, affiliate gear/software sales.
Cost Structure: Development, content production, hosting, marketing, AI setup/training.
Key Metrics: DAU, retention, avg. session time, subscription conversion, engagement.
Unfair Advantage: Fitness-inspired guitar brand + gamification, early AI integration.
```

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

**Prompt 1: Data Architect - ERD Creation**
```
Role: Act as a senior Data Architect with expertise in conceptual, logical, and physical data modeling, as well as diagram creation using DiagramGPT, Mermaid, and PlantUML.

Goal: Create a complete and consistent data model for the described system, including an Entity-Relationship Diagram (ERD). The model must be expressed in three formats so I can compare results visually and technically.

Tasks:

Explain your approach step-by-step for gathering requirements and designing the ERD.

Ask me any clarification questions needed to accurately define entities, attributes, and relationships.

Produce the ERD in three formats:

DiagramGPT-optimized prompt

Mermaid syntax

PlantUML syntax

Generate a Markdown (.md) file that contains the complete data model description, including:

Overview of entities and attributes

Relationship definitions

Code blocks for Mermaid and PlantUML

DiagramGPT prompt
This file should align with the format of other project artifacts.

Output format:

Section 1: Step-by-step approach

Section 2: Questions for me

Section 3: ERD in DiagramGPT prompt format

Section 4: ERD in Mermaid syntax

Section 5: ERD in PlantUML syntax

Section 6: Complete Markdown file content

Tone: Clear, precise, and professional. Prioritize accuracy, naming consistency, and formatting that allows immediate copy-paste into each tool.
```

**Prompt 2: ERD DiagramGPT Format**
```
# Title: Spartan Guitar Gym — ERD (MVP, Updated)

entities:
  User:
    - id: uuid pk
    - email: varchar(255) unique
    - full_name: varchar(120) nullable
    - auth_provider: enum('firebase','supabase') default 'firebase'
    - auth_uid: varchar(255) unique
    - rank: enum('Meirakion','Hilotas','Hoplitas','Hippeisy','Espartano') default 'Meirakion'
    - xp: int default 0
    - subscription_tier: enum('free','pro') default 'free'  # cache/derived
    - created_at: timestamptz
    - updated_at: timestamptz

  Level:
    - id: uuid pk
    - name: varchar(100)
    - description: text nullable
    - rank_order: int
    - created_at: timestamptz
    - updated_at: timestamptz

  Lesson:
    - id: uuid pk
    - level_id: uuid fk -> Level.id
    - name: varchar(120)
    - description: text nullable
    - lesson_order: int
    - created_at: timestamptz
    - updated_at: timestamptz

  Exercise:
    - id: uuid pk
    - lesson_id: uuid fk -> Lesson.id
    - name: varchar(140)
    - description: text nullable
    - video_url: varchar(1024)
    - tablature_url: varchar(1024)
    - guitar_pro_url: varchar(1024) nullable
    - is_free: boolean default false
    - difficulty: enum('beginner','intermediate','advanced')
    - duration_sec: int nullable
    - exercise_order: int
    - created_at: timestamptz
    - updated_at: timestamptz

  Style:
    - id: uuid pk
    - name: varchar(80) unique
    - description: text nullable

  Technique:
    - id: uuid pk
    - name: varchar(80) unique
    - description: text nullable

  ExerciseStyle:
    - exercise_id: uuid fk -> Exercise.id
    - style_id: uuid fk -> Style.id
    - primary key(exercise_id, style_id)

  ExerciseTechnique:
    - exercise_id: uuid fk -> Exercise.id
    - technique_id: uuid fk -> Technique.id
    - primary key(exercise_id, technique_id)

  Progress:
    - id: uuid pk
    - user_id: uuid fk -> User.id
    - exercise_id: uuid fk -> Exercise.id
    - completed_at: timestamptz
    - xp_awarded: int default 10
    - source: enum('manual','auto') default 'manual'
    - unique(user_id, exercise_id)

  PracticeSession:
    - id: uuid pk
    - user_id: uuid fk -> User.id
    - started_at: timestamptz
    - ended_at: timestamptz nullable
    - device: enum('web','ios','android') default 'web'
    - notes: text nullable

  Badge:
    - id: uuid pk
    - code: varchar(60) unique
    - name: varchar(120)
    - description: text nullable
    - icon_url: varchar(512) nullable
    - points: int default 0   # can be negative for "negative badges"

  UserBadge:
    - user_id: uuid fk -> User.id
    - badge_id: uuid fk -> Badge.id
    - awarded_at: timestamptz
    - reason: varchar(255) nullable
    - source: enum('auto','manual') default 'auto'
    - primary key(user_id, badge_id)

  BadgeRule:
    - id: uuid pk
    - code: varchar(60) unique
    - name: varchar(120)
    - trigger_type: enum('lesson_completed','level_completed','streak_reached','negative_event')
    - trigger_params: jsonb nullable  # e.g., {lesson_count:10}
    - badge_id: uuid fk -> Badge.id
    - active: boolean default true
    - created_at: timestamptz

  BadgeRuleEvent:
    - id: uuid pk
    - badge_rule_id: uuid fk -> BadgeRule.id
    - user_id: uuid fk -> User.id
    - occurred_at: timestamptz
    - outcome: enum('awarded','skipped')
    - details: jsonb nullable

  Referral:
    - id: uuid pk
    - referrer_user_id: uuid fk -> User.id
    - code: varchar(50) unique
    - referred_user_id: uuid fk -> User.id nullable
    - status: enum('generated','clicked','signed_up','converted') default 'generated'
    - created_at: timestamptz

  ReferralReward:
    - id: uuid pk
    - referral_id: uuid fk -> Referral.id
    - type: enum('xp','discount')
    - value: int  # xp points or discount percent
    - granted_at: timestamptz
    - granted_to_user_id: uuid fk -> User.id

  Plan:
    - id: uuid pk
    - code: varchar(50) unique  # e.g., basic, pro, pro_eu_monthly
    - name: varchar(120)
    - price_cents: int
    - currency: char(3) default 'USD'
    - billing_interval: enum('month','year')
    - status: enum('active','inactive') default 'active'
    - created_at: timestamptz

  Subscription:
    - id: uuid pk
    - user_id: uuid fk -> User.id
    - plan_id: uuid fk -> Plan.id
    - provider: enum('stripe','paypal','appstore','playstore')
    - status: enum('active','past_due','canceled','incomplete')
    - current_period_start: timestamptz
    - current_period_end: timestamptz
    - cancel_at_period_end: boolean default false
    - created_at: timestamptz

  Payment:
    - id: uuid pk
    - user_id: uuid fk -> User.id
    - subscription_id: uuid fk -> Subscription.id nullable
    - provider_payment_id: varchar(120) unique
    - amount_cents: int
    - currency: char(3) default 'USD'
    - status: enum('succeeded','pending','failed','refunded')
    - created_at: timestamptz

  RecommendationEvent:
    - id: uuid pk
    - user_id: uuid fk -> User.id
    - exercise_id: uuid fk -> Exercise.id nullable
    - action: enum('impression','click','like','skip')
    - reason: varchar(255) nullable
    - occurred_at: timestamptz

relationships:
  User 1--* PracticeSession
  User 1--* Progress
  User 1--* UserBadge
  User 1--* Subscription
  User 1--* Payment
  User 1--* RecommendationEvent
  User "referrer" 1--* Referral
  User 0..1 --* Referral : "referred"
  Referral 1--* ReferralReward
  ReferralReward *--1 User : "granted_to"

  Level 1--* Lesson
  Lesson 1--* Exercise

  Exercise *--* Style via ExerciseStyle
  Exercise *--* Technique via ExerciseTechnique

  Exercise 1--* Progress
  Exercise 0..*--* RecommendationEvent

  BadgeRule *--1 Badge
  BadgeRule 1--* BadgeRuleEvent
  BadgeRuleEvent *--1 User

  Plan 1--* Subscription
  Subscription *--1 User
  Payment *--1 User
  Payment *--0..1 Subscription
```

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1: Use Cases con ChatUML**
```
## ChatUML — UC-1
```
@startuml
title UC-1 Complete Daily Exercise
actor "Authenticated User" as User
rectangle "Spartan Guitar Gym" {
  usecase "Complete Daily Exercise" as UC1
  usecase "Play Video + Tablature" as UC1a
  usecase "Download GPX/PDF" as UC1b
  usecase "Mark as Completed" as UC1c
  usecase "Award XP & Update Streak" as UC1d
  usecase "Update Progress Dashboard" as UC1e
}
User --> UC1
UC1 --> UC1a
UC1 --> UC1b
UC1 --> UC1c
UC1c --> UC1d
UC1d --> UC1e
@enduml
```

## ChatUML — UC-2
```
@startuml
title UC-2 Subscribe to Pro
actor "Free User" as User
rectangle "Spartan Guitar Gym" {
  usecase "Subscribe to Pro" as UC2
  usecase "View Pro Benefits & Pricing" as UC2a
  usecase "Checkout (Stripe/PayPal)" as UC2b
  usecase "Activate Pro Entitlements" as UC2c
}
User --> UC2
UC2 --> UC2a
UC2 --> UC2b
UC2b --> UC2c
@enduml
```

## ChatUML — UC-3
```
@startuml
title UC-3 Get Personalized Recommendations
actor "Authenticated User" as User
rectangle "Spartan Guitar Gym" {
  usecase "Get Personalized Recommendations" as UC3
  usecase "Collect Usage & Preferences" as UC3a
  usecase "Rank Candidate Exercises" as UC3b
  usecase "Show Recommendations + Reasons" as UC3c
  usecase "Capture Feedback (Like/Skip)" as UC3d
}
User --> UC3
UC3 --> UC3a
UC3a --> UC3b
UC3b --> UC3c
User --> UC3c
UC3c --> UC3d
@enduml
```
```

**Prompt 2: User Stories para MVP en JIRA**
```
You are a **Product Owner** specialized in Agile methodologies and software project management.
Your task is to generate the **main User Stories** for the **MVP of Spartan Guitar Gym**, based on the provided PRD, roadmap, and best practices.

------------------------------------------------------------------------

## Context

-   **PRD**: Spartan Guitar Gym (web + mobile platform for structured and gamified guitar practice).
-   **Roadmap**: MVP must cover authentication, dashboard, exercises, gamification, payments, AI instructor, and deployment.
-   **Best Practices**: User stories must be written from the end-user perspective, follow the format *"As a [type of user], I want [goal] so that [benefit]"*, and include acceptance criteria.
-   **Target System**: All user stories must be created in **JIRA** through the MCP agent.
-   **Scope**: Stories must address **configuration, infrastructure, backend, frontend, media handling, payments, security, notifications, and business logic** required for MVP.

------------------------------------------------------------------------

## Instructions for the Agent

1.  **Create Epics** aligned with MVP phases:
    -   Authentication & User Management
    -   Dashboard & Tracking
    -   Exercises & Media Handling
    -   Payments & Subscription
    -   AI Instructor MVP
    -   Gamification & Rewards
    -   Notifications & Deployment
2.  **Generate User Stories** for each Epic:
    -   Use the standard format:
        *As a [user role], I want [functionality] so that [benefit]*.
    -   Provide a short **description** in natural language.
    -   Add **acceptance criteria** in the format:
        -   *Given [context], when [action], then [expected outcome]*.
    -   Define **priority** (High/Medium/Low).
    -   Add **labels** (e.g., backend, frontend, infra, security).
    -   Suggest **initial tasks** if relevant.
3.  **Apply Best Practices**:
    -   Keep stories concise, focused on value, not technical implementation.
    -   Ensure stories are small enough to be delivered in a sprint.
    -   Include at least one story covering **infra & security setup**.
    -   Use personas from the PRD (beginner, intermediate, advanced guitarist, free vs. Pro user).
    -   Maintain alignment with roadmap phases.
4.  **Output Format**:
    -   Deliver results as **structured User Stories** ready to be created in JIRA.
    -   Group them by **Epic**.
    -   Do not add extra information beyond what is required.

------------------------------------------------------------------------

## Example Output (Simplified)

**Epic: Authentication & User Management**
- *As a beginner guitarist, I want to register using email or Google so that I can easily start practicing.*
- Description: Enable authentication with email/password and Google/Apple login.
- Acceptance Criteria:
- Given a new user, when they sign up with email, then their account is created successfully.
- Given an existing user, when they log in, then they can access the dashboard.
- Priority: High
- Labels: frontend, backend, security

------------------------------------------------------------------------

## Final Goal

Generate a **backlog of prioritized user stories** that will allow the development team to build and deliver the MVP of **Spartan Guitar Gym** in JIRA.
```

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1: User Stories para MVP en JIRA (mismo que Historias de Usuario)**
```
You are a **Product Owner** specialized in Agile methodologies and software project management.
Your task is to generate the **main User Stories** for the **MVP of Spartan Guitar Gym**, based on the provided PRD, roadmap, and best practices.

------------------------------------------------------------------------

## Context

-   **PRD**: Spartan Guitar Gym (web + mobile platform for structured and gamified guitar practice).
-   **Roadmap**: MVP must cover authentication, dashboard, exercises, gamification, payments, AI instructor, and deployment.
-   **Best Practices**: User stories must be written from the end-user perspective, follow the format *"As a [type of user], I want [goal] so that [benefit]"*, and include acceptance criteria.
-   **Target System**: All user stories must be created in **JIRA** through the MCP agent.
-   **Scope**: Stories must address **configuration, infrastructure, backend, frontend, media handling, payments, security, notifications, and business logic** required for MVP.

------------------------------------------------------------------------

## Instructions for the Agent

1.  **Create Epics** aligned with MVP phases:
    -   Authentication & User Management
    -   Dashboard & Tracking
    -   Exercises & Media Handling
    -   Payments & Subscription
    -   AI Instructor MVP
    -   Gamification & Rewards
    -   Notifications & Deployment
2.  **Generate User Stories** for each Epic:
    -   Use the standard format:
        *As a [user role], I want [functionality] so that [benefit]*.
    -   Provide a short **description** in natural language.
    -   Add **acceptance criteria** in the format:
        -   *Given [context], when [action], then [expected outcome]*.
    -   Define **priority** (High/Medium/Low).
    -   Add **labels** (e.g., backend, frontend, infra, security).
    -   Suggest **initial tasks** if relevant.
3.  **Apply Best Practices**:
    -   Keep stories concise, focused on value, not technical implementation.
    -   Ensure stories are small enough to be delivered in a sprint.
    -   Include at least one story covering **infra & security setup**.
    -   Use personas from the PRD (beginner, intermediate, advanced guitarist, free vs. Pro user).
    -   Maintain alignment with roadmap phases.
4.  **Output Format**:
    -   Deliver results as **structured User Stories** ready to be created in JIRA.
    -   Group them by **Epic**.
    -   Do not add extra information beyond what is required.

------------------------------------------------------------------------

## Final Goal

Generate a **backlog of prioritized user stories** that will allow the development team to build and deliver the MVP of **Spartan Guitar Gym** in JIRA.
```

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
