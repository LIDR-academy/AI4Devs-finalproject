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

### Herramientas: Deepseek R1

**Prompt 1:**

You are an expert project manager. I want to design and document a software system following investigation and analysis phases, defining use cases data models and high level design for a finance management system called Welz. 

Welz will integrate with as many financial institutions as possible to aggregate accounts, transactions, and investments in one place. It will also calculate total net worth by categorizing assets, debts, and liquid funds, converting them into a unified view. Finally, it will offer advanced analytics, using AI to categorize transactions and provide users with deep financial insights.

I need to generate a PRD containing:

* Small description of Welz's software, added value and competitive advantages in front of state-of-the-art competitors.
* Explanation of the main functionality, and a Lean Canvas diagram to better understand the business model.
* Description of the 3 main use cases, with an associated diagram for each of them.
* Data model that will cover entities, attributes and relations.
* High level design, with both a text explanation and a diagram.
* In-depth C4 diagrams for each of the components.

We will proceed step by step, and I will tell you once we can continue with the next one. 

Do you have any questions before proceeding?

**Prompt 2: Responder a preguntas**

One important aspect is that the initial phase of the project will be an MVP, so the scope will have to be limited.

1. **Target Audience & Scope: Is Welz focused on individual consumers (e.g., personal finance) or businesses (e.g., SMBs)? This affects use cases (e.g., tax planning vs. payroll integration) and compliance requirements.**

    Yes, we will focus on individual consumers.

2. **Monetization Strategy: How will Welz generate revenue? Options include subscriptions, freemium models, or white-labeling for institutions. This is critical for the Lean Canvas (Revenue Streams/Cost Structure).**

    The MVP will have no monetization.

3. **Compliance & Security: Are there specific regulations to prioritize (e.g., GDPR, PSD2, Open Banking standards)? Security requirements (e.g., encryption, audit trails) will shape the high-level design.**
    
    Yes, we will operate in the EU, so we need to follow all standard regulations.

4. **Integration Approach: Will Welz use existing financial aggregators (e.g., Plaid, MX, Yodlee) or build direct integrations? This impacts the data model and system complexity.**
    
    The MVP will only use data from a mocked entity.

5. **AI/ML Scope: What specific analytics are planned? For example:**

    * **Automated transaction categorization (e.g., "Food" vs. "Travel")?**
    * **Predictive insights (e.g., cash flow forecasting)?**
    * **Anomaly detection (e.g., fraud alerts)?**
    
    We can focus on automated transaction categorization for the PoC, but the final product will also have the other two features you mentioned.

6. **Deployment Model: Cloud-native (AWS/Azure/GCP) or hybrid? This influences scalability, infrastructure costs, and high-level architecture.**

    The MVP will be deployed on-premise on a small server, so we will be using docker.

7. **Competitive Differentiation: What are the top 3 competitors (e.g., Mint, Personal Capital)? What unique advantages will Welz emphasize? (e.g., broader institution coverage, better AI insights?)**
    
    Our main competitors would be Fintonic, Monefy and Bilance. If you know of any other similar ones, you can add them as well.

**Prompt 3: Ajustes**

Documentation must only contain use cases that are relevant for the MVP.

Please use markdown, as that is the format I will be storing the documentation in.

Welz will also support having cash accounts, to allow managing physical transactions.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

#### Herramientas: Deepseek R1 + ChatGPT 4o

**Prompt 1:**

You are an expert Systems Architect.

Create the high level design with the following technical requirements:
- Language: TypeScript (both frontend and backend)
- Frameworks: Deno, EffectTS
- Database: PostgreSQL
- Data source: Mocked data
- CI: GithubActions

Do not answer yet. Ask any questions you require first to give a thorough answer.

**Prompt 2: Respuesta a preguntas**

1. **Deployment Architecture:**
    - **Should the design assume **Docker containers** for the MVP?** 

        Correct

    - **Are there specific **EU cloud regions** (e.g., AWS Frankfurt) to prioritize for GDPR compliance?**
    
        We are in Spain, so we will need to follow regulations there.

2. **EffectTS Scope**:  
    - **Should EffectTS handle domain logic (e.g., net worth calculations) and error handling, or is it primarily for API layer validation?**

        I'm not an expert, so use whatever solution you consider best. Using multiple features from the same library sounds like a good choice.

3. **Security Extensions**:  
    - **Is client-side encryption (e.g., encrypting sensitive fields like balances) required, or is server-side encryption sufficient?**

        Use encryption on both sides.

    - **Are audit logs needed for profile sharing or transaction edits?**

        Audit logs will not be implemented.

5. **Frontend Framework**:  
    - **Should the frontend use React (with Next.js) or a lightweight framework like Fresh (Deno-native)?**

        Use Deno Fresh

6. **Monitoring**:  
    - **Are OpenTelemetry integrations or third-party tools (e.g., Datadog) expected for observability?**

        No

**Prompt 3: Ajustes**

- I would prefer to only have two artifacts, one for the frontend and another one for the backend.
- The frontend will have a web client as well as a mobile app

### **2.2. Descripción de componentes principales:**

#### Herramientas: GithubCopilot + Claude 3.5 Sonnet

**Prompt 1:**

Let's move to filling the C4 model, starting with the first two levels.
Include a small description of the elements for each of the two diagrams.

**Prompt 2:**

You're missing the functionality to manually include transactions in the Container diagram, as well letting the user change transaction categories. Which modules do you think would be in charge?

Focus on the use cases defined in the product requirements. Do you think the modules we have currently defined would be able to fulfill them, or do we need to make any adjustments?

**Prompt 3:**

Seeing that the diagrams are using events and an event bus, let's embrace CQRS. Update the documentation accordingly.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Define a file structure for the project defined in #file:architecture.md, separating backend and frontend and infrastructure.

**Prompt 2:**

Organize the project so that all deno commands can be executed from the root of the project.

- Create a parent deno.json file defining both backend and web modules, and referencing the tasks within the nested #file:deno.json files.
- Extract the common configuration and create a single import_map.json file to be used by both modules

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Provide scripts for starting backend, frontend and database

**Prompt 2:**

Include a script to execute database migrations.

**Prompt 3:**

#codebase The next step is to deploy this project in production via Deno Deploy. 
First, extract env variables like the url in #file:BackendClient.ts, the CORS configuration in #file:ApiController.ts,
or the database connection in #file:PostgresClient.ts.
Analyze the rest of the project and extract any other parameters you find.

### **2.5. Seguridad**

**Prompt 1:**

What security measures do we need to follow, taking into account that this is a financial app that will contain PII?

### **2.6. Tests**

**Prompt 1:**

Implement tests for all changes made in this task.

- Add unit tests for all new classes
- Add integration tests for new controllers and repository implementations.
- Use the documentation in #file:testing-strategy.md, create test files in the correct folders and follow testing patterns.
- Make sure to hit coverage targets
- Follow the best practices defined in the strategy

**Prompt 2:**

#### Herramientas: Github Copilot + o3-mini

@workspace Update the testing strategy document based on all the tests implemented.

- Make sure to reflect the new approach for integration tests.
- Refer to the documentation section of the same document and apply the requirements
- Remove or update obsolete sections:
  - Remove all references to superdeno as it is no longer used.
  - Document the createTestServer approach. 
  - Do not remove E2E as they are not yet implemented

---

### 3. Modelo de Datos

#### Herramientas: Deepseek R1

**Prompt 1:**

Let's move to the data model next. Please include names, type, description for attributes, and primary/foreign keys.

**Prompt 2:**

Rename NetWorthSnapshot to BalanceSnapshot and attach it to each account instead of the user. The net worth history can be calculated as the sum of account balance snapshots.

**Prompt 3:**

Let's define all the events required first so that we can better define the components in our system.

---

### 4. Especificación de la API

#### Herramientas: Github Copilot Agent + Claude 3.7 Sonnet

**Prompt 1:**

Create the ApiController class defined in the #file:architecture.md file.

- There will be a single route, /api, that will process POST and GET requests.  
- All Commands should be available via the POST method.  
- All Queries should be available via the GET method.
- All other methods should return an error.
- All other possible routes should return an error.
- Use the WebTransformer class to format both successful and failure responses.

**Prompt 2:**

Create the main entrypoint for the backend by adapting the EffectTS-based controller in #file:ApiController.ts to the app structure expected by Deno.

**Prompt 3:**

Document the OpenApi specification for the endpoints defined in #file:ApiController.ts. Store the documentation in the folder defined in #file:architecture.md.

---

### 5. Historias de Usuario

#### Herramientas: Github Copilot + Claude 3.5 Sonnet

**Prompt 1:**

Based on the #file:product-requirements.md file, generate 10 user stories with the following structure

```
**As a <actor>, I want to <task> so that I can <goal>**

### Description
<description>

### Acceptance Criteria:
- <acceptance criteria>
- <acceptance criteria>
- <acceptance criteria>
```

**Prompt 2:**

Provide a table with RICE scores for the user stories you created

**Prompt 3:**

Sort the table by prioritization and highlight the 3 most important user stories to be implemented.

---

### 6. Tickets de Trabajo

#### Herramientas: Github Copilot + Claude 3.5 Sonnet

**Prompt 1:**

Develop all the necessary tickets to implement the 3 selected user stories. Use the following format:

```
### **[WELZ-001][type] <title>

**Description**  
<description>

**Details**
- <technical detail>
- <technical detail>
- <technical detail>

**Acceptance Criteria**
- <acceptance criteria>
- <acceptance criteria>
- <acceptance criteria>

**Effort:** S|M|L
**Priority:** Low|Mid|High  
**Dependencies:** WELZ-002
```

**Prompt 2:**

Create a table with all the tickets, sorted by priority.  
Include markdown links from the table leading to each of the tickets. Use the column with the ticket number.

**Prompt 3:**

Add one more ticket to the backlog:

Create a minimal working connection between backend and frontend.
- The frontend's main page should return the list of transactions of one of the mock accounts by using GetAccountTransactions. 
- Update all ticket dependencies

---

### 7. Pull Requests

**Prompt 1:**

Generate the database structure and mock data as defined in WELZ-004.

- Use nessie to execute both migrations and seeds
- Use the database connection details defined in #file:docker-compose.yml
- Create 50 transactions for each account, spanning the last 6 months.

**Prompt 2:**

Let's implement WELZ-005, defined in #file:backlog.md.

I have used another AI tool to generate the pages for the web app, but it is implemented in React. I need you to convert the screens **as faithfully as possible** to Deno Fresh + Preact and include it in the current project.

The react implementation is stored in the folder containing #file:index.html. It is using mock data, but we should instead fetch data from the backend by using #sym:BackendClient.

Start by implementing the landing screen.

**Prompt 3:**

Create a new category insights page as defined in WELZ-011.

- Use the same page structure and components as in the account view in #transactions.tsx
- Provide a card element to view the current expenses for the month, as well as the forecast at the end of the month
- Show a bar chart, similar to the one in accounts, but with a stacked bar to see the progress of how much was spent the last month vs the total forecast.
- Display the same transaction list, but removing the category dropdown as there will only be one category.