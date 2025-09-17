## Table of Contents

1. [General Product Description](#1-general-product-description)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Specification](#4-api-specification)
5. [User Stories](#5-user-stories)
6. [Work Tickets](#6-work-tickets)
7. [Pull Requests](#7-pull-requests)

---

## 1. General Product Description

**Prompt 1:**

```markdown
[System message]  
You are “BudgetMate,” an expert product strategist and UX designer specializing in expense‑tracking and budgeting tools for couples and families.

[User message]  
My wife and I currently struggle to

1. Track our joint and individual expenses
2. Enforce the 50/30/20 rule across multiple currencies and accounts
3. Preserve privacy by self‑hosting on our NAS

**Our setup:**

- I’m paid in EUR into Account A.
- My wife’s salary arrives in USD into Account B.
- We funnel 50% of total net income to “Needs,” 30% to “Wants,” and 20% to “Savings.”
- “Wants” is further split into three sub‑accounts: Common, Hers, Mine.
- All apps must run on our personal NAS; no third‑party cloud.

**Please do the following:**

1. **Core feature list:** Enumerate the minimum viable features to solve our tracking and budgeting challenges.
2. **Prioritization:** Sort these features by business impact and user pain relief (High/Medium/Low).
3. **Value propositions:** For each prioritized feature, describe the benefit we’ll experience.
4. **Alternative approaches:** Suggest two other ways to address our pain points (e.g. off‑the‑shelf tools, manual workflows).
5. **Contextual fit:** For each alternative, explain when it’s preferable over building our own solution.

Ask any clarifying questions you need before answering.
```

**Prompt 2:**

```markdown
Based on the core functionalities you recommended, describe the **end-to-end customer journey** for my wife and me using this web app.

Please provide:

1. A **step-by-step walkthrough** of our typical usage — from initial setup to ongoing tracking and budgeting.
2. Each interaction we would have with the system (e.g. logging income, categorizing expenses, viewing reports).
3. How the app would support **collaborative use** (between two people with separate incomes, currencies, and budgets).
4. Points where the app would deliver **delight**, reduce friction, or solve major pain points.
5. Any **notifications, automations, or insights** that would improve our experience.

Use clear, real-world examples when possible. Feel free to ask questions if any assumptions need clarification.
```

**Prompt 3:**

```markdown
I'm looking for inspiration before building this app.

1. What are the **most popular open-source** personal finance or budgeting tools that could meet our needs (especially those that support self-hosting on a NAS)?
2. What are the best **commercial (paid or freemium)** alternatives worth considering?

Please compare both types of solutions using the following criteria:

- **Multi-currency support**
- **Custom budgeting (50/30/20 split, shared and personal budgets)**
- **Expense tracking with multiple accounts**
- **Privacy and self-hosting capabilities**
- **Collaboration features for couples**
- **Mobile or responsive web support**
- **Ease of setup and long-term maintenance**

Then: 3. Recommend the **best-fit option** for our specific use case — or explain why building our own might still be preferable. 4. Highlight any open-source projects that could be used as a foundation or backend for a custom app.

Let me know if you need to clarify any part of our setup before answering.
```

**[Link to chat](https://www.perplexity.ai/search/system-message-you-are-budgetm-72a_HAI.R0iOQnF7EE16Rw)**

---

## 2. System Architecture

### **2.1. Architecture diagram:**

**Prompt 1:**

```markdown
You are a senior software architect with experience in designing secure, privacy-first, self-hosted financial web applications.

I am building a NAS-hosted (Synology DS211) web app for my wife and I only to manage our personal and shared finances, enforce budgeting rules like 50/30/20, and handle multi-currency scenarios. Privacy, clarity, and collaboration are critical.

## 🔍 **System Goal (UX value proposition):**

> A smarter way to manage money together—without losing independence.

## ✅ **Key Capabilities & Requirements:**

- **Multi-currency support** with real-time conversion and unified reporting
- **Automated 50/30/20 split** with shared and individual envelopes
- **Hybrid categorization engine** (manual + rule-based)
- **NAS-based self-hosting** with granular access controls
- **Secure import of financial data** (CSV, OFX, API-ready)
- **Editable ledger** with audit trail
- **Custom dashboards** for shared and personal views
- **Real-time collaboration features** (notes, sync, etc.)

## 🧠 **Your task:**

1. Propose **three viable architecture options** for this system. Each option should include:

   - Backend language/framework (e.g. Python + FastAPI, Node.js + Express)
   - Frontend stack (e.g. React, Svelte)
   - Data storage (relational vs. document DB, rationale)
   - Authentication & user roles (how we manage shared access/privacy)
   - NAS deployment model (e.g. Docker, VM, bare metal). **IMPORTANT:** My NAS model is a Synology DS211. Your deployment model should be within its capabilities. [Reference: Deploying a web app on Synology DS211](https://www.perplexity.ai/search/deploy-an-web-app-in-synology-3z6xdtRiTa2VvugBxKqKmw)
   - Scalability and maintainability notes

2. **Compare the options** based on:

   - Ease of self-hosting & maintenance (especially for non-technical users)
   - Performance and responsiveness
   - Suitability for privacy and offline-first use
   - Extensibility for future features (e.g. mobile app, open banking APIs)

3. **Make a recommendation**: Choose the best architecture for our use case and explain why it's the most balanced option given our constraints.

Feel free to ask any clarifying questions about usage patterns, technical skill level, or hosting environment before responding.
```

**Prompt 2:**

```markdown
Provide a **concise and structured overview** of the web application's architecture and technology stack. The output should include:

1.  A **Mermaid diagram** that clearly represents the **main components** of the application and how they interact (frontend, backend, database, authentication, deployment, etc.).

2.  A **table** listing the **technologies used** for each component, along with a brief explanation of their role.

3.  An explanation of whether the architecture follows a **predefined pattern** (e.g., client-server, microservices, layered), and **why this pattern was chosen**.

4.  A clear **justification for each architectural decision**, considering relevant **constraints** (e.g., platform limitations like no Docker support).

5.  A brief discussion of **key benefits** (e.g., simplicity, scalability, maintainability) and **trade-offs or limitations** (e.g., use of SQLite, lack of CI/CD, manual deployment).

The goal is to communicate the **technical design rationale** of the application in a standalone document that is easy to understand, visually structured, and useful for future maintenance or collaboration.
```

**[Link to chat](https://www.perplexity.ai/search/you-are-a-senior-software-arch-B8HHDJFYQha9KB3Zu2t0gQ?1=d)**

### **2.2. Description of main components:**

**Prompt 1:**

```markdown
List and describe the key components of the system, along with the specific technologies chosen for each and their role in the overall architecture. Use a table to present the information
```

**[Link to chat](https://www.perplexity.ai/search/you-are-a-senior-software-arch-B8HHDJFYQha9KB3Zu2t0gQ?1=d#2)**

### **2.3. High-level project description and file structure**

**Prompt 1:**

```markdown
- Describe the overall folder structure of the backend.
- Explain the purpose of the main backend directories and if they belong to a specific patter or architecture
- Describe the frontend folder structure.
- Explain the role of the key frontend directories and if they belong to a specific patter or architecture
```

**[Link to chat](https://www.perplexity.ai/search/you-are-a-senior-software-arch-B8HHDJFYQha9KB3Zu2t0gQ?1=d#3)**

### **2.4. Infrastructure and deployment**

**Prompt 1:**

```markdown
Describe the infrastructure of the project in detail using a mermaid diagram.
Additionally, explain the deployment process step by step, including tools, environments, and any relevant configurations. Add the front end to the diagram
```

**[Link to chat](https://www.perplexity.ai/search/you-are-a-senior-software-arch-B8HHDJFYQha9KB3Zu2t0gQ#4)**

### **2.5. Security**

**Prompt 1:**

```markdown
You are a security architect responsible for defining the foundational security strategy for this project.

1. Identify and describe the key high-level security practices that should be incorporated into the project. Focus on strategic principles, architectural considerations, and organizational policies — not low-level implementation or code.
2. For each practice, briefly explain its purpose and, if helpful, provide a conceptual example or scenario to illustrate how it would apply in a real-world context. Avoid technical implementation details.
```

**[Link to chat](https://www.perplexity.ai/search/you-are-a-senior-software-arch-B8HHDJFYQha9KB3Zu2t0gQ#5)**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 3. Data Model

**Prompt 1:**

```markdown
You are a database architect expert. Let's discuss the data model for a couple's financial management web application with the following requirements:

**Application Context:**

- Two user system for couples to track shared and personal finances
- Supports multiple currencies with automatic conversion
- Implements 50/30/20 budgeting rule (Needs/Wants/Savings) with sub-envelopes
- Tracks transactions with categorization (auto and manual)
- Supports CSV/OFX bank data imports
- Maintains audit trail for all changes
- Has role-based permissions (individual vs shared access)
- Self-hosted on SQLite database

**Special Considerations:**

- Support for multi-currency with base currency conversion
- Flexible categorization system with parent/child categories
- Audit trail that tracks who changed what and when
- Privacy controls (what each partner can see)
- Budget periods (monthly, annual, etc.)

Propose me a high level view of the simplest datamodel that would fulfill these requirements. This is totally theoretical. There is nothing implemented yet.
```

**Prompt 2:**

```markdown
Generate a mermaid diagram for this data model. Use all allowed parameters for details such as primary and foreign keys
```

**Prompt 3:**

```markdown
Describe each entity.

- Include the name and type of each attribute.
- Sort description
- Primary and foreign keys
- Relalations and their type
- Restriction
```

**Link to chat:**
[Link to chat about data model design](.cursorchats/cursor_design_data_model_for_financial.md)

---

## 4. API Specification

**Prompt 1:**

```markdown
You are a senior backend engineer specializing in RESTful API design and OpenAPI specifications.

## Task

Generate OpenAPI 3.0 @OpenAPI 3.0 specifications for the THREE most critical API endpoints of the application described in @## 1. General Product Description with the following data model @## 3. Data Model

## Requirements for Each Endpoint

For each endpoint, provide:

- Complete OpenAPI specification including:
  - Path and HTTP method
  - Summary and description
  - Request parameters (path, query, body)
  - Request body schema (if applicable)
  - Response schemas for all status codes
  - Security requirements (JWT Bearer token)
  - Tags for API organization
- Realistic example request and response
- Consider multi-currency scenarios and partner permissions

## Specific Considerations

1. All monetary amounts should include currency information
2. Responses should handle both account currency and user's base currency
3. Include proper error responses for unauthorized access to partner's personal data
4. Date formats should follow ISO 8601
5. Pagination should be implemented for list endpoints
6. Include filtering capabilities where appropriate

## Output Format

Present the API specification in YAML format following OpenAPI 3.0 standards, with example requests and responses.
```

**Context files used:**

- [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.4.html)
- [General Product Description](#1-general-product-description)
- [Data Model](#3-data-model)

**[Link to chat](.cursorchats/cursor_generate_openapi_specifications.md)**

---

## 5. User Stories

**Prompt 1:**

```markdown
Analyze this app description @readme.md and create a comprehensive backlog structure:

For this app, please:

1. Identify 3-4 main user personas
2. Extract 6-8 high-level epics (group related features)
3. For each epic, provide:
   - Epic name and description
   - Business value
   - Key features included
   - Priority level (High/Medium/Low)

Format as a clear, structured list.
Save it as `backlog.md` in the root.
```

**Context files used:**

- [readme.md](./readme.md)

**Prompt 2:**

```markdown
Create detailed user stories:

For each epic, provide:

1. 3-5 user stories in "As a [persona], I want [goal] so that [benefit]" format
2. Acceptance criteria for each user story
```

**[Link to chat](.cursorchats/cursor_create_app_backlog_structure.md)**

---

## 6. Work Tickets

**Prompt 1:**

```markdown
You are a technical project manager skilled in breaking down user stories into manageable development tasks.

## Your Task

Using the methodology defined in @task-breakdown-methodology.md, create a comprehensive task breakdown for the @#### US1.1: Account Registration and save it as a markdown file in `./backlog/Epic 1: User Management Core`.

## Instructions

1. **Read and understand** the complete methodology in @task-breakdown-methodology.md
2. **Analyze** the user story and its acceptance criteria
3. **Create** a task breakdown following the exact template and format from the methodology
4. **Generate** a markdown file with the breakdown

## File Naming Convention

Name the file using this pattern: `[StoryID]-[brief-description]-tasks.md`

Examples:

- `US1.1-account-registration-tasks.md`
- `US2.1-add-transaction-tasks.md`
- `US3.1-budget-automation-tasks.md`

## Quality Checks

Before creating the file, verify:

- [ ] Every acceptance criterion is addressed by at least one task
- [ ] No task exceeds 1 story point
- [ ] Each task includes testing requirements
- [ ] Tasks follow logical build sequence
- [ ] File name follows the convention
- [ ] All tasks use the exact template format

Generate the complete task breakdown file now.
```

**Context files used:**

- [task-breakdown-methodology.md](./task-breakdown-methodology.md)
- [US1.1: Account Registration](./backlog/backlog.md#us11-account-registration)

**[Link to chat](.cursorchats/cursor_create_app_backlog_structure.md)**

---

## 7. Pull Requests

**Prompt 1:**

```markdown
Let's add a PR template to @branch-strategy.md
```

**Prompt 2:**

```markdown
1. PR Title should be `Jira issue: [Ticket description]`
2. Add a Jira section before Summary with link to the issue
3. No need for type of PR
4. No acceptance criteria
5. Add a coverage table in the Testing section
6. Add Jira links to Related Issues/Stories
```

**Context files used:**

- [branch-strategy.md](./docs/branch-strategy.md)

**[Link to chat](.cursorchats/cursor_create_pr_template.md)**
