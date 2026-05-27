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

> I want to define a final project for my master's course in AI. I'm thinking about building a web-based CRM and workflow management platform for construction companies. It should handle the full lifecycle: project configuration, unit management, client relationships, quotations, contracts, and document tracking. Internal users are company staff (admin, sales agents, employees); the product should be multi-tenant. What do you think about this idea and how should we structure it?

**Prompt 2:**

> That's well structured organisation. Regarding the things to discuss: 1. Agree with that. 2. For now, we are not creating user stories yet. 3. I'll be working alone on this. The product should cover: buyer account management, project hierarchy (towers, floors, units), documentation workflow with Google Drive integration, and an AI roadmap post-MVP (RAG document assistant).

**Prompt 3:**

> The tools sound good, but firstly, let's organise our small space in Notion to document the project properly before we start coding. One thing, if we don't create subsections or subpages, the architecture document will be huge — the main sections like Product, Architecture, Data Model, etc. should each be a separate page.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

> For the backend and frontend, please use Notion to organise the project properly and the tech stack. Get the latest versions of the dependencies initially since we are starting from scratch — clean start. Golang for backend using Gin Gonic as the HTTP layer, Nuxt 4 SPA mode for the frontend deployed to S3 + CloudFront, PostgreSQL on AWS RDS.

**Prompt 2:**

> Great. I was checking the ADRs, and I want to clear a few things: Golang for backend using Gin Gonic as the HTTP framework — it lives only in the infrastructure/http layer. Nuxt 4 SPA mode (ssr: false). PostgreSQL with pgx/v5 as native driver. Custom JWT RS256 with access tokens 15 min and refresh tokens 7 days via httpOnly cookies. Multi-tenancy with company_id on all tables and PostgreSQL RLS enforcement.

**Prompt 3:**

> Now, I want to think about the SDD (Spec Driven Development) framework to work on this project. I have in mind Speckit or OpenSpec — what could be the proper decision? Check again GitHub to see details about the frameworks mentioned.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

> For the backend and frontend, please use Notion to organise the project properly and document the tech stack. Get the latest versions of the dependencies initially since we are starting from scratch. Include: Gin v1.12.0, pgx/v5 v5.9.1, golang-jwt/jwt v5.2.2, golang.org/x/crypto, AWS SDK v2 (S3, SES v2, Secrets Manager).

**Prompt 2:**

> Ok, using Mermaid for some diagrams is good. Another thing to keep in mind — the main sections like Product, Architecture, Data Model, etc. should link between each other. We need an ADR for each major architectural decision: application architecture pattern, database choice, frontend framework, authentication strategy, deployment platform.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

> I want to create the backend repo for Golang and the frontend repo. Just to initialise the repositories. Golang project will be under /Users/jonatanbonilla/Development/go/src/ — Frontend project will be under /Users/jonatanbonilla/Development/. Please use my GitHub account https://github.com/brolyssjl/

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> For the backend and frontend, please use Notion to organise the project properly and the tech stack. Get the latest versions of the dependencies initially. The deployment should use ECS Fargate for the Go API, S3 + CloudFront for the Nuxt SPA static build, RDS PostgreSQL db.t3.micro for dev, ECR for the container registry, and AWS Secrets Manager for the RS256 key pair.

### **2.5. Seguridad**

**Prompt 1:**

> Golang for backend using Gin Gonic. Custom JWT RS256: golang-jwt/jwt v5.2.2; access tokens 15 min, refresh tokens 7 days via httpOnly cookies; bcrypt via golang.org/x/crypto. Multi-tenancy: company_id on all tables; PostgreSQL RLS as enforcement. UUID v7 for main entities. The RS256 private key must live exclusively in AWS Secrets Manager — never in code or env vars.

### **2.6. Tests**

---

### 3. Modelo de Datos

**Prompt 1:**

> Ok, let's work on the data model. We need tables for: companies, roles, users, projects, project_nodes (adjacency list tree with node_types vocabulary), units, unit_associations, stages, trust_entities, clients, quotations (with installment_simulation JSONB), contracts (reservation_amount, reservation_paid_at, payment_method, signed_at), installments, format_types, formats, documents. UUID v7 as primary keys for main entities, BIGSERIAL for audit_logs.

**Prompt 2:**

> Awesome, don't forget to add the image_url or logo_url column for projects and companies, to build the navigation by project using the image as an easy UI identifier. Also company images can be used for emails using the logo, for web browser icon, etc. And thinking we can also add a table to save a registry of operation logs for audit — if someone deletes a client's document or a project config, we can know who did it, when, and what action was made.

**Prompt 3:**

> I was thinking about PROJECT HIERARCHY (adjacency list tree) — what about considering a section in the UI to define the hierarchy? That would be dynamic regardless of the company, so it's up to the company itself. Do we need to change the data model in that regard? Also, a few things to clear: The quotation is not valid as a reservation. Units only become reserved after contract signed AND reservation_paid_at is confirmed. For the reservation, two things can happen: direct payment (immediate) or loan (bank/trust entity pays).

---

### 4. Especificación de la API

**Prompt 1:**

> Can we define the API spec candidates for our entities? After that, can we define the full API spec? All possible endpoints — verb + RESTful convention + query params + payloads and responses. We can define in natural language to use it to create the proper OpenAPI file in the backend. Create a page only to define that.

**Prompt 2:**

> Can you give the relevant prompts for building the documentation? I need to have them in order from the oldest to the most recent. Continue from where you left off. The API spec should cover all 18 domains: Auth, Companies, Roles, Users, Projects, Node Types, Project Nodes, Stages, Units, Unit Associations, Trust Entities, Clients, Quotations, Contracts, Installments, Format Types, Formats, Documents.

---

### 5. Historias de Usuario

**Prompt 1:**

> Now, we can do the same to plan the user stories. For the user stories, please go to the Prompt Library in Notion and create the skill using the skill called: Create User Stories (INVEST + BDD + MoSCoW). The skill should generate user stories following INVEST criteria, BDD/Gherkin format, and MoSCoW prioritisation for any domain of the ConstructFlow platform. Roles: admin, seller, employee.

**Prompt 2:**

> I added a new skill `/generate-user-stories`. Use it to create the necessary user stories for our product. Use a new page to create those — it can be under the Product page as a child page. The skill should act as a Senior Product Owner generating developer-ready backlog items with BDD acceptance criteria, T-shirt sizing, INVEST audit, DoD, and MoSCoW prioritisation across all MVP domains.

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
