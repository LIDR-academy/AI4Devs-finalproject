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

### Notion
I have used Notion so that, from an idea or seed, I develop a market study, comparison, current usefulness and viability.

#### Prompt 1: Seeds
- Reduce the amount of food wasted at home.
- Easily track products and their expiration dates quickly and easily (by scanning your receipt).
- Expiration alerts (weekly notifications in the app/email).
- Offer recipes using your current uneaten purchases.
- Top Wasted food (you vs average)
- Add items using voice, photo, scan receipt or manual entry
- Insights of food and money wasted
- Recipes suggested by the current pantry.
- Sharing pantry with another family member (Editor, viewer).

---
**Human interaction:** Adding boundaries
Removed extra idas and put them into Non-MVP page. (Adding boundaries)
- Gamification. Points for food saved on time
- Consumption automation (consider food consumed if it is well past its expiration date).
- Potential collaboration with supermarkets (add a QR code that adds purchases to the app along with their exact expiration dates. This can provide added value for supermarkets).
---
[Idea-to-Product](docs/product/1_Idea-to-product.md)

#### Prompt 2: market research
Perform a market research on apps/software similar to ConsumeSmart, emphasizing AI assistance + automation, and a pros/cons comparison focused on my app RealSaveFooding feature set (receipt/scan → inventory → expiry → recipes → waste analytics → sharing)

[Market-Research](docs/product/2_Market-research.md)

#### Prompt 3: PRD Generation
Based on the content, generate a full detailed PRD that will be useful for the Product Owner for a further ticket split and Lead Engineer to start productisation

[Initial-PRD](docs/product/3_PRD.md)

#### Prompt 4: PRD refinement
Based on the new skill for prd generation, take the 3_PRD.md where it's described the first version of it and refine it. Ask me for doubts (check skill at .github/skills/prd/SKILL.md)

### Lovable
#### Prompt 5: Mockups
I used Lovable to produce the mockups for the application. Using the same seed as before. I also connected it to Github to produce the first mockups with Vue + Vite from where I extracted the Screenshots with the designs. Mockups available in front folder (First Delivery)
#### Prompt 6: Mockups v1
I want you to design a IOS app using web technologies (multi-platform) taking this as an input: docs/product/1_idea-to-product.md. The prototype must not be functional, provide the mockups with basic navigation. The style should be IOS (iPhone-like) with blue-grey colours and clean. Gestures (long-press, slide, etc) must be available for a great UX.

---
**Human interaction 1: ** - The design didn't contain Recipes
#### Prompt 7: 
Enable Recipes, considering the current pantry add another button in the dock that will land into a Recipe window designed to show recipes with the current pantry. Add other filters that you may consider but remember that the application should have clean interface.

---
**Human interaction 2: ** - Mockups were not including sharing options
#### Prompt 8: 
Enable sharing the pantry with other members. It should display the current shares, and the type (Editor / Viewer). It should display the sharing options (via code, send email, etc). 
The list of shares should allow to remove lines of sharing

### Lovable Results
The final results can be seen in docs/design

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
### Using ChatGPT
#### Prompt 1: 
I want to build RealSaveFooding is a pantry + consumption management mobile app concept focused on reducing food waste and saving money by helping people track what they buy, monitor expiration dates, and get recipe suggestions. A key capability is AI assistance—notably analyzing receipts to automatically infer items and suggest estimated expiration dates, reducing manual entry and improving automation. For Frontend (app) I chose Lovalbe (Radix-UI, React, TailWind, Vite, Typescript, Nitro) but for Backend I'd like to use NodeJS. Give me an architecture for this. Split between MVP and non-MVP as it's an academic project

#### Prompt 2: Switching to PlantUML
Create an Architecture diagram for Frontend and Backend and Full. Use PlantUML

---
**Human Interaction:** PlantUML failing
I manually modified 2 diagrams (easy fix) to do not consume tokens.

#### Prompt 3: OpenAI to AWS
Instead of using OpenAI cloud I have an AWS, please switch to it in all the solution points.

#### Prompt 1: Meta-Prompt (ChatGPT)
Writte a prompt for this "Given the MVP principals project components suggest the folder structure in the project. For the Frontend part I have already a folder called "front" for the rest I have nothing. After that for each main folder write the purpose and the framework / pattern architecture specific approach"

### Using GitHub Copilot (GPT-5.3-Codex)
#### Prompt 2: Prompt Execution
~~~markdown
I am building an academic project called **RealSaveFooding**, a mobile application focused on reducing food waste and helping users save money by managing their household pantry.

## Project Context

### MVP Scope
The MVP includes the following capabilities:

- User authentication (registration, login, JWT-based authorization)
- Pantry management (CRUD operations for pantry items)
- Receipt upload and processing
- Receipt analysis using **AWS Textract** to automatically identify purchased products
- Automatic estimation of expiration dates using a rules-based approach
- Push notifications for products nearing expiration
- Dashboard showing active items and items expiring soon

### Technology Stack

#### Frontend

- Existing root folder: `front`
- Lovable
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Vite
- Nitro

#### Backend

- Node.js
- NestJS
- Prisma ORM
- JWT authentication
- PostgreSQL (Amazon RDS)
- AWS Textract
- Amazon S3 for receipt image storage
- Amazon SNS for notifications

## Task
Given the MVP requirements and technology choices, propose a **complete project folder structure** for the entire repository.

Assume that the only existing folder is:

```
front/
```
Design all other folders from scratch.

For your answer:

1. Show the recommended folder tree using an ASCII structure.
2. Separate clearly:Frontend folders
3. Backend folders
4. Infrastructure folders
5. Documentation folders
6. Testing folders
7. For each **main folder**, explain:Its purpose within the system.
8. Which framework or technology it belongs to.
9. The architectural approach or pattern it follows (for example: Feature-Based Architecture, Modular Monolith, Layered Architecture, Clean Architecture, Infrastructure as Code, etc.).
10. For the NestJS backend, explain how the modules should be organized and why.
11. For the React frontend, recommend whether to organize by:feature,
12. technical layer,
13. or another pattern,
and justify the choice.14. Highlight which folders are essential for the MVP and which ones could be introduced later as the project evolves.
15. Provide recommendations that are realistic for an academic project with limited development time while still demonstrating good software engineering practices.

The final output should resemble the structure and rationale that would be expected in a university software architecture document.

~~~
#### Prompt 3: lets go first for the MVP
From everything that you have produced, I need to limit it to the MVP Version (Adding the PRD as context from the repository in the prompt)

---
**Human Interaction**: organising the resources provided to diferent layers.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

#### Prompt 1: Design the folder structure (Github Copilot Codex)
Detail the project infrastructure, including a diagram in the format you deem appropriate using PlantUML, and explain the deployment process that is followed. Keep it Simple and be tight to the MVP.

#### Prompt 2: Apply folder structure
Consider MVP only; lets build the folder structure and add the dependencies to the project. Reorganise the front folder if needed and if so update the readme.md documentation.

---
**Human Interaction**: commit changes into git splitting by front changes, backend and documentation. (Kind of a Checkpoint).

### **2.4. Infraestructura y despliegue**

#### Prompt 1
As a Expert Technical Architect detail the project infrastructure, including a diagram in the format you deem appropriate, and explain the deployment process that is followed. Keep it Simple and be tight to the MVP.

Output the content in docs/architecture/infrastructure.md and add a reference in architecture.md in a new h2 header 2.4. Infrastructure and Deployment

#### Prompt 2: Apply folder structure
Consider MVP only; Update the related documentation folder /docs/* and add any reference. Ask me before reorganise the documentation. Don't touch readme.md until I ask you to do so.

---
**Human Interaction**: After checking the result, updating refences into readme.md  documentation to match the new references and content.

### **2.5. C4-Model**
#### Prompt 1: Requesting C4 Models for main components
```markdown
Role
Acts as an expert Software Architect with extensive experience in mobile app and backend services, create C4 documentation and technical modeling of web systems, collaborating in the design of the first version of RealSaveFooding

Context
It is based on the docs/product/3_PRD.md file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in docs/architecture/architecture.md.

Instructions
Generates C4 diagrams of the RealSaveFooding system with the following levels: Context, Containers, Components.
Reaches the main components.

Visual context
If you consider it necessary, use the design at docs/design to align the containers and technical components with the main screens and flows:

Output
Write the content to docs/architecture/C4-Model.md and add a reference in architecture.md in a new h2 header 2.5. C4 Model
```

### **2.6. Seguridad**

#### Prompt 1: Apply security documentation
# Role
As an expert in security with expertise on the  in mobile app and backend services with the existing tech.stack.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`.

# Instructions
- Update PRD document to include non-functional requirements around security and aspects that the developers would need to consider before implementing.
- Highlight any potential risk based on the current architecture. Do not fix, document it.
- Update any related documentation in /docs/* accordingly

#### Prompt 2: Security considerations
As a Security Expert, analyze the security implications of the RealSaveFooding architecture and implementation. Consider authentication, authorization, data protection, and potential attack vectors. Provide recommendations for securing the application, including best practices for handling user data, securing API endpoints, and protecting against common vulnerabilities.

**Prompt 3:** Not needed.

### **2.7. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

### Prompt 1:
```markdown
# Role
You are a **Senior Solution Architect and Database Architect** specializing in PostgreSQL, Prisma ORM, AWS architectures, and mobile applications.

# Task
Design the **database model** for **RealSaveFooding**

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`.
**Keep tight to MVP**

# Deliverables
Provide the output in docs/db folder for the following sections:

## 1. Domain Analysis
List the identified business entities and explain their responsibilities.

## 2. Mermaid ER Diagram
Generate a complete **Mermaid ER diagram** using `erDiagram` syntax. 

Include:
- entities,
- attributes,
- PK indicators,
- FK indicators,
- cardinalities.

The Mermaid output must be directly usable in Markdown.

## 3. Entity Definitions
For each entity provide:

- purpose,
- attributes,
- PK,
- FKs,
- constraints,
- relationships.

### 4. Normalization Review
Demonstrate that the design satisfies:
- 1NF,
- 2NF,
- 3NF.

Explain any trade-offs.

## 5. Index Strategy
Provide SQL recommendations for indexes and justify them.

## 6. Prisma Considerations
Explain how the model maps naturally to Prisma ORM, including:
- one-to-many relationships,
- many-to-many relationships,
- enum recommendations,
- cascade considerations.

## 7. Future Evolution
Describe how the schema could evolve to support:
- households,
- barcode integration,
- recipe recommendations,
- advanced analytics,
- machine-learning-based expiration prediction,

while minimizing breaking changes.

---

# Quality Requirements
The solution should:

- Reflect production-grade database design practices.
- Be realistic for an academic MVP.
- Balance simplicity with extensibility.
- Avoid unnecessary complexity.
- Prioritize maintainability and data integrity.

Think step by step before generating the final model, and challenge assumptions that could lead to poor normalization or future scalability issues.
```

## Prompt 2: PRD update considering DB data model
```markdown
# Role
You are a **Senior Solution Architect and Database Architect** specializing in PostgreSQL, Prisma ORM, AWS architectures, and mobile applications.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`.

# Instructions
- Update PRD document to include functional and non-functional requirements around data model and aspects that the developers would need to consider before implementing.
- Update any related documentation in /docs/* accordingly

```

## Prompt 3: Main entities documentation
```markdown
# Role
You are a **Senior Solution Architect and Database Architect** specializing in PostgreSQL, Prisma ORM, AWS architectures, and mobile applications.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`.  `docs/db/database-model.md)`for Database model.

# Instructions
- Update `readme.md` document, header 3.2 to include the main entities. Remember to include the maximum detail of each entity, such as the name and type of each attribute, brief description if applicable, primary and foreign keys, relationships and type of relationship, restrictions (unique, not null...), etc.
- Consider reuse or point out to refernces into `docs/db/database-model.md)`for Database model to not duplicate information.
- If the content is too extensive consider create another .md into docs/db and point in 'readme.md` (header 3.2) to the new document.
```
---
**Human Interaction:** After checking the result, updating refences into readme.md  documentation, I moved part of the content to `docs/db/main-entities.md` to avoid duplication and keep better organization.

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

#### Prompt 1:
```markdown
# Role
You are a **Expert Product Manager** specializing  mobile applications with backend applications.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`. `docs/db/database-model.md)`for Database model.

# Instructions
- Add into docs/product/4_User-stories` all of the main user stories used during MPV development, taking into account good product practices in this regard.
- Update `readme.md` document, header 5 to include the references to the main user stories
```
#### Prompt 2: Using the new skill for user story generation
Please use the specific user-story skill and rewrite them in the format defined in the skill, making sure to include clear persona-goal-value format, testable acceptance criteria, and traceability to functional requirements and data model. If any story is too vague or large, break it down into smaller, more focused stories that can be implemented in a single session. Make sure to include "Verify in browser using dev-browser skill" as acceptance criteria for any story with UI changes.

#### Prompt 3: After refining the user stories, review them for completeness and clarity as a software enginner would.
```markdown
# Role
Acts as an expert Full-Stack Software Engineer with extensive experience in mobile app and backend services.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md` and the user stories defined in `docs/product/4_User-stories.md`

# Instructions
Refine the User stories adding more details from engineering perspective.

# Visual context
If you consider it necessary, use the design at `docs/design` to align the containers and technical components with the main screens and flows

# Output
Write the updatred user stories in the same .md file
```

---

### 6. Tickets de Trabajo

#### Prompt 1: 
```markdown
# Role
You are a **Expert Product Manager** specializing mobile applications with backend applications.

# Context
It is based on the `docs/product/3_PRD.md` file to understand the business model, use cases and data model of RealSaveFooding and the architecture definition defined in `docs/architecture/architecture.md`. `docs/db/database-model.md)`for Database model. The User stories from where you need to extract the tickets resides in `docs/product/4_User-stories.md`

# Instructions

- Add into docs/tickets/` the development work tickets.  Provides all the detail required to develop the task from start to finish, taking into account good practices in this regard (Front, Back, DB...).
- Update `readme.md` document, header 6 to include the references to 3 of main tickets. At least it should contain, one backend, one frontend, and one database ticket.
```

#### Prompt 2: Correction of the tickets generated
No, you should create ALL tickets from the user stories in /docs/tickets folder BUT only reference 3 main tickets (1 frontend, 1 backend, 1 DB) into readme.md

Prompt 3: Meta-Prompt for ticket ammendment
```markdown
Write this better for a prompt "Now I have 4 different sets of tickets: TKT-BE-{000}, TKT-DB-{000}, TKT-FE-{000} and TKT-US-{000}, it's not normalised, could you fix it?. Consider: As the Sofware Engineer that's going to work is a full-stack should we split by technology? If so, split by technology, If not, use the same pattern and correct the refernces into readme.md"
```

Prompt 4: Prompt from Meta-Prompt for ticket ammendment execution
```markdown
Review the current ticketing strategy used in the project. At present, there are four independent ticket sequences:

* `TKT-BE-{000}` (Backend)
* `TKT-DB-{000}` (Database)
* `TKT-FE-{000}` (Frontend)
* `TKT-US-{000}` (User Stories)

This approach does not appear to be normalized or consistently aligned with the project's delivery model.

Please perform the following tasks:

1. Evaluate whether organizing tickets by **technology layer** (Frontend, Backend, Database, etc.) is appropriate for this project, considering that the work will primarily be carried out by a **single full-stack software engineer**.

2. Recommend the most suitable ticketing strategy based on software engineering best practices for a small team or solo developer:

   * **Option A:** Maintain separate ticket sequences by technology.
   * **Option B:** Use a single, unified ticket sequence independent of technology.
   * If another approach is more appropriate, propose and justify it.

3. Explain the **advantages and disadvantages** of each approach in the context of:

   * Traceability,
   * Maintainability,
   * Ease of prioritization,
   * Alignment with Agile practices,
   * Academic project simplicity.

4. If you recommend changing the current approach:

   * Define the proposed ticket naming convention.
   * Provide examples of how the existing tickets should be migrated to the new format.
   * Ensure that relationships between user stories, tasks, and technical work remain clear.

5. Review the existing project documentation and identify any references to the old ticket identifiers.

   * Update all references so they align with the proposed convention.
   * Specify which sections of the `README.md` need to be modified.

6. Provide a final recommendation for the **RealSaveFooding** project, taking into account that:

   * The project is an academic MVP,
   * The implementation is being developed by a full-stack engineer,
   * Simplicity and clarity should be prioritized over enterprise-scale processes.

The output should include:

* The recommended ticketing strategy,
* The rationale behind the decision,
* The proposed naming convention,
* Examples of the updated ticket structure,
* A list of required updates to the `README.md`.
* Any additional documentation updates needed to reflect the new ticketing strategy.
```
---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 8. Documentation Alignment
#### Prompt 1: 
Check the documentation against the repository layout first, then pin down any drift that needs correction rather than guessing from the surface.

#### Prompt 2:
- Fix the index readme.md and extend it to all header levels.
- Verify the correct navigation in all links between different md files (consider that the navigation should work in Github)
Add missing readme.md in /docs/design move the content from docs/product.md header 1.3 to the readme and reference it back. Add description for each screenshot in the readme.md file.

Finally: For all .md files internal links across all files in /docs folder should be in the format [link text](./relative-path-to-file.md) and should work when navigating in Github. Please check all links and fix them if they are not in the correct format or if they are broken.

---

### 9. Ticket Implementation Prompts

Index of prompts used during the implementation of each ticket. Each file in `/prompts` contains the full prompt history used to resolve the corresponding ticket in `/docs/tickets`.

| Ticket | Title | Prompts File |
|--------|-------|--------------|
| [TKT-001](docs/tickets/TKT-001-auth-register-login.md) | Register and Login | [prompts-TKT-001.md](prompts/prompts-TKT-001.md) |
| [TKT-002](docs/tickets/TKT-002-pantry-manual-add-item.md) | Pantry Manual Add Item | [prompts-TKT-002.md](prompts/prompts-TKT-002.md) |
| [TKT-003](docs/tickets/TKT-003-receipt-upload-ocr.md) | Receipt Upload and OCR Extraction | [prompts-TKT-003.md](prompts/prompts-TKT-003.md) |
| [TKT-004](docs/tickets/TKT-004-expiration-confidence-flow.md) | Expiration Suggestion with Confidence | [prompts-TKT-004.md](prompts/prompts-TKT-004.md) |
| [TKT-005](docs/tickets/TKT-005-expiring-notifications.md) | Expiring Soon Notifications | [prompts-TKT-005.md](prompts/prompts-TKT-005.md) |
| [TKT-006](docs/tickets/TKT-006-price-comparison-mvp-dataset.md) | Price Comparison with MVP Dataset | [prompts-TKT-006.md](prompts/prompts-TKT-006.md) |
| [TKT-007](docs/tickets/TKT-007-dashboard-summary-use-next.md) | Dashboard Summary and Use-Next | [prompts-TKT-007.md](prompts/prompts-TKT-007.md) |
| [TKT-008](docs/tickets/TKT-008-household-sharing-invite-accept.md) | Household Sharing Invite and Accept | [prompts-TKT-008.md](prompts/prompts-TKT-008.md) |
| [TKT-009](docs/tickets/TKT-009-consumption-waste-events.md) | Consumption and Waste Events | [prompts-TKT-009.md](prompts/prompts-TKT-009.md) |
| [TKT-010](docs/tickets/TKT-010-use-next-prioritization.md) | Use-Next Prioritization | [prompts-TKT-010.md](prompts/prompts-TKT-010.md) |
| [TKT-011](docs/tickets/TKT-011-backend-receipt-ocr-pipeline.md) | Backend Receipt Upload and OCR Pipeline | [prompts-TKT-011.md](prompts/prompts-TKT-011.md) |
| [TKT-012](docs/tickets/TKT-012-frontend-pantry-add-item-flow.md) | Frontend Pantry Add Item Flow | [prompts-TKT-012.md](prompts/prompts-TKT-012.md) |
| [TKT-014](docs/tickets/TKT-014-mvp-hardening-schema-receipts-pantry.md) | MVP Hardening: Database Schema, Backend Receipts, and Frontend Pantry | — |

