# SupportHub — AI-Driven Development: Prompt Log

> **Purpose of this document**
> This file is the traceability record for the full AI-driven development lifecycle of SupportHub — from the first product analysis session through to working, tested software across four repositories. It covers two consecutive stages:
>
> - **Stage 1 — Documentation (28 sessions):** Designing and documenting the complete project using AI assistants as active co-authors of every artefact — PRD, epics, user stories, technical tasks, architecture diagrams, and database models.
> - **Stage 2 — Development:** Turning that documented backlog into production code — environment setup, AI spec authoring, Jira backlog population, visual design system creation, and iterative openspec development cycles across three active repos.
>
> The project: **SupportHub**, a customer support portal that acts as a client-facing experience layer on top of Jira, built for software consultancies. Full product description: [`documentation/ProyectoFinal_ProductDoc.md`](../documentation/ProyectoFinal_ProductDoc.md).

---

# STAGE 1 — Documentation

---

## Multi-Agent Strategy

One of the core AI-driven techniques applied throughout this project was the deliberate design of **two specialised agents**, each with a well-defined role and scope, working in a structured pipeline:

### Agent 1 — `po-agent` (Product Owner)
**Invoked with:** `/po-agent`
**Definition file:** [`.claude/commands/po-agent.md`](../.claude/commands/po-agent.md)

The po-agent acts as a Senior Product Owner. Its responsibilities are:
- Analysing the product requirements document and proposing epics
- Writing INVEST-compliant user stories with acceptance criteria and story points
- Flagging scope decisions, recommending story splits, and questioning granularity
- Leaving a `Note for Architect` block at the end of each epic file to communicate architectural open questions to the next agent in the pipeline

### Agent 2 — `architect-agent` (Software Architect & Tech Lead)
**Invoked with:** `/architect-agent`
**Definition file:** [`.claude/commands/architect-agent.md`](../.claude/commands/architect-agent.md)

The architect-agent acts as a Senior Software Architect and Tech Lead. Its responsibilities are:
- Consuming the epic files produced by the po-agent
- Writing an `Architecture Note` that resolves the open questions left by the po-agent
- Decomposing each user story into **openspec-ready technical tasks** — one task per coherent concern, scoped to a single repo, with intent-based constraints and verifiable Definition of Done
- Enforcing the project's architecture conventions (`ai-specs/backend-guidelines.md`, `ai-specs/api-conventions.md`) on every task it generates

### Pipeline

The agents are orchestrated as a sequential pipeline. The output of the po-agent becomes the input for the architect-agent. Files flow as follows:

```
PRD (ProyectoFinal_ProductDoc.md)
    │
    ▼
/po-agent  ──►  EPIC-XX.md  (stories + acceptance criteria + Note for Architect)
                    │
                    ▼
            /architect-agent  ──►  EPIC-XX.md  (adds Architecture Note + TASK blocks)
                                        │
                                        ▼
                                 BacklogDoc.md  (status updated to ✅ Stories + tasks defined)
```

This pipeline was applied consistently for all 11 epics defined in the project. The agents were not used as generic assistants — their system prompts embed the full tech stack, architecture constraints, task format rules, and cross-cutting guidelines so that every output is aligned with the project's engineering standards from the first run.

---

## Artefacts Produced (Stage 1)

All artefacts generated with AI assistance during these 28 sessions are located in the repository:

| Artefact | Location |
|---|---|
| Product Requirements Document | [`documentation/ProyectoFinal_ProductDoc.md`](../documentation/ProyectoFinal_ProductDoc.md) |
| Backlog Index | [`documentation/BacklogDoc.md`](../documentation/BacklogDoc.md) |
| Epic files (11 epics) | [`documentation/epics/`](../documentation/epics/) |
| Backend Guidelines | [`ai-specs/backend-guidelines.md`](../ai-specs/backend-guidelines.md) |
| API Conventions | [`ai-specs/api-conventions.md`](../ai-specs/api-conventions.md) |
| AWS Architecture Diagrams (4) | [`documentation/diagrams/architecture/`](../documentation/diagrams/architecture/) |
| Database ER Model | [`documentation/diagrams/database/`](../documentation/diagrams/database/) |
| Agent definitions | [`.claude/commands/`](../.claude/commands/) |

---

## Table of Contents — Stage 1

| Phase | Sessions | Focus |
|---|---|---|
| [Phase 1 — Foundations](#phase-1--foundations) | 1 – 4 | Product analysis, backlog structure, agent creation, ai-specs |
| [Phase 2 — First Epic Wave](#phase-2--first-epic-wave) | 5 – 16 | EPIC-01, 07, 02, 08: stories + tasks + key architecture decisions |
| [Phase 3 — Cross-cutting Concerns](#phase-3--cross-cutting-concerns) | 10, 11, 12 | i18n (EPIC-10) and Audit Log (EPIC-11) |
| [Phase 4 — Remaining Epics](#phase-4--remaining-epics) | 17 – 24 | EPIC-03, 04, 05, 05B: stories + tasks |
| [Phase 5 — Architecture Artefacts](#phase-5--architecture-artefacts) | 25 – 28 | AWS infrastructure diagrams, database ER model |

---

## Phase 1 — Foundations

> These sessions establish the product analysis, the initial epic structure, the multi-agent setup, and the ai-specs files that govern all subsequent technical task generation. The key output is not just the backlog skeleton — it is the **decision to use AI agents as specialised roles** and the guidelines that make those agents reliable across the whole project.

---

### Session 1 — Product Analysis & Backlog Definition

> **What was decided:** First contact with the PRD. AI analysed the product and proposed an initial set of epics. Key technology decisions were made: .NET 10 + React, PostgreSQL, OpenIdDict, AWS S3/SES, Clean Architecture. The backlog structure was established and written to `BacklogDoc.md`.

---

Ok. I want to continue working in this project. Please read @ProyectoFinal_ProductDoc.md. Next steps will be defining epics, user stories and tasks per user story. Please read the document in detail, give me your analysis and your first approach about defining the epics. Use the agile-product-owner skill if needed. Ask me all the questions you need

---

> **AI questions:**
> 1. What is the backend and frontend tech stack you are considering?
> 2. What is the team size and structure?
> 3. Do you have a Jira instance available to connect to?
> 4. What authentication approach are you considering?
> 5. Is EPIC-06 (Metrics Dashboard) in scope for the master project?
> 6. Does EPIC-05 (Admin Panel) need to be split further?

1- For the backend, I was thinking .NET 10 and for the frontend I was thinking in angular or react. I am not expert in frontend developer, I am planning to develop this project using ai-driven development with Windsurf and Claude Code ai assistant tools. What is your recommendation about the stack?
2- For now it will be solo development. Maybe in the near future, I can join some other team members
3- Yes I do and I have an mcp configured to our Jira Cloud. The space name is "Support Hub" with Jira project Key "SH"
4- I was thinking about using OpenIdDict for the .NET backend. What do you think about it?
5- The epic-06 it is an stretch goal... but full Epic-04 is in scope
6- Maybe we can split a bit more the EPIC-05. This is in regard to the admin panel (backoffice) we want to develop. Maybe split the user management with the projects configuration. We need to give a user access to projects and boards loaded from Jira. Or, do you think it can be included in EPIC-05 and we will have this split as user stories?

---

> **AI questions:**
> 1. Which database are you considering — PostgreSQL or MySQL?
> 2. Are file attachments (S3) a must-have or a stretch goal for the master project?

1- I am debating between PostgreSQL and MySQL. What is your recommendation?
2- It is a must have. I am planning using AWS SDK to connect to S3 service with an Access Key and Secret Key

---

perfect, thanks. Yes, lets move on defining the first user stories for epic-09

---

Can we write all this info we are generating in a markdown file in the project?

---

> **AI questions:**
> 1. Layered architecture style: comfortable with `API / Application / Domain / Infrastructure`, or prefer a simpler flat feature-folder structure?
> 2. API style: controller-based vs Minimal API?

Regarding the questions

1- Yes, I want a layered architecture with Clean architecture principles. I will go deeply on this when we are defining and boilerplate the projects
2- Agree, controllers for AI-driven development

---

### Session 2 — Multi-Agent Setup & EPIC-09 Technical Tasks

> **What was decided:** The multi-agent pipeline was proposed, validated, and created. Two custom agents were built — `po-agent` and `architect-agent` — with system prompts that embed full project context, tech stack, and output format rules. EPIC-09 (Infrastructure) became the first epic to receive technical tasks from the architect-agent. The key prompt below is the one that initiated the entire multi-agent strategy used for all subsequent sessions.

---

As an expert in ai-driven development. Do you recommend me creating multi agents for different tasks? for example, now that we are defining the full backlog for this project, probably it makes sense to have at least two agents, one as a product owner expert using the agile-product-owner skill that will define the epics and user stories... and a second one, an expert senior software architect and tech lead, that will define the technical tasks for each user story. Does this make sense for you? If it does, how can we create those agents and orchestrate them so the output that the product owner agent generates becomes the input for the architect and tech lead agent?

---

> **AI question:** To make the agents useful rather than generic, I need a bit of project context:
> 1. What is this project? (product name, one-line description)
> 2. What's the tech stack (if already decided)?
> 3. Do you have any existing notes, brief, or README I can read?

yes please. You have project context in @ProyectoFinal_ProductDoc.md. Also, there is an initial split of epics I was working on a different session and we have in @BacklogDoc.md.

---

can we start with the architect-agent to refine the already created technical tasks for epic-09?

Can you append the main prompts we used in this session into @prompts/prompts-em.md  file in markdown format. Write the prompts exactly as I wrote it, do not change them. If the prompt includes answers to questions made by AI, write the questions before my answers so the reader can have a full context

---

### Session 3 — AI-Driven Development Preparation & openspec Strategy

> **What was decided:** The project's development methodology was locked: **openspec** (propose → apply → archive loop) with Claude Code as the AI developer. This session examined whether the technical tasks being generated by the architect-agent were correctly shaped for openspec consumption — leading directly to the task format redesign in Session 4.

---

As an ai-driven development expert, with broad experience in the whole software development lifecycle: product definition (product owner), software-architect, development.

I will like to analyse the project where we are. We are in a early stage, defining epics, user stories and technical tasks that will be developed later. In this process, we have created two agents and we are creating the backlog. 

The architect-agent is defining the technical tasks per user stories, it is including technical details for the code to be developed and I am concerned about needing to prepare better the project to assist the AI defining these tasks more accurately. With this, I am referring to maybe creating skills or other agents for example, one per stack, with all the architecture patterns I want to use and all technical guidelines.

Not sure if this is the right stage to include this kind of things, but since this agent is defining technical stuff, I want to make sure it is aligned on how I want to develop this project.

I want to use openspec framework to develop this project using Claude Code, so, as an ai-driven development expert, give me your analysis about this concern. Just want to make sure we are doing firm steps defining the project in order to be developed by AI using openspec.

---

### Session 4 — Backend Guidelines, API Conventions & EPIC-09 Review

> **What was decided:** The two governing specification files were created — `ai-specs/backend-guidelines.md` and `ai-specs/api-conventions.md`. These files become the authoritative constraints that the architect-agent must follow on every task it generates. The task format was also redesigned in this session: the original "Implementation checklist" pattern was retired in favour of an intent + constraints + verifiable DoD format optimised for openspec. The architect-agent definition was updated to enforce this permanently.

---

Now, lets go ahead with your recommendation. As an expert senior software developer, using .NET and ai-driven development, create the backend-guidelines.md and api-conventions.md files. Take into account the following guidelines:

- Clean architecture with layered structure: `API` → `Application` → `Domain` → `Infrastructure`.
- Clean Code
- SOLID principles
- DRY principle
- OpenIdDict for Identity Server. I want to implement it from the beginning so I have the option to scale later.
- Two backend sub projects, one for identity server and one for backend apis.
- Probably one or more scheduler sub projects if needed to manager pooling procedures from Jira. (I want the architect agent to give me a recommendation on this).
- Unit Testing with XUnit
- E2E testing with Playwright (Probably for frontend project)
- Security Guidelines (Owasp Top 10)

Ask me all the questions you need


> **AI questions:**
> 1. How should use cases / application logic be structured in the Application layer?
> 2. How should the Application layer communicate success/failure back to the API layer?
> 3. How should DTO validation be enforced on inbound API requests?
> 4. What logging library should be used across all backend services?

1- Plain services + interfaces (no MediatR)
2- Result<T> (FluentResults)
3- FluentValidation + pipeline
4- Serilog + structured JSON

---

yes please, go ahead

---

Ok, regarding GAP-1 and GAP-2&GAP-4... I am not sure about applying them. Keep in mind we will have two different backend projects, one for Identity and the other por API. Is it a bad architecture decision to put ApplicationUser class in Domain for the Identity project? Please be completely honest and aligned with clean architecture and the principles we stated before

---

Thanks for the explanation, I am totally agree with you.

So, go ahead and lets fix the @documentation/BacklogDoc.md with the fixes for all 8 gaps

---

Before moving on, as an expert product owner with expertise in technology and software development projects and ai-driven development, what do you think about the EPIC and stories we have defined so far... Are the technical tasks containing too much technical information? Keep in mind that this is an ai-driven development project and I am going to use openspec framework for development. Just want to make sure it doesn't interfere with the development process with openspec (propose, apply, archive)... if the tech task contains noise or if at the contrary, it is a very well explained task which will make the openspec framework's job easier?

Please be completely honest

---

I want to go with Option B. Also, make sure to update the @.claude/commands/architect-agent.md if needed to address these guidelines for future epics and stories

---

## Phase 2 — First Epic Wave

> These sessions apply the established pipeline to the core epics. Each session follows the same pattern: po-agent writes stories, architect-agent writes tasks. However, this phase also contains several of the most significant **architectural decisions** of the project, driven by questioning the AI's assumptions — notably the Jira synchronisation strategy (synchronous vs. asynchronous), the single-source-of-truth principle for Jira data, and the comment visibility control mechanism.

---

### Session 5 — EPIC-01 User Stories, Technical Tasks & Backoffice Scoping

> **What was decided:** Stories for EPIC-01 (Authentication) were written and refined. A key scoping decision was made: all backoffice tasks are deferred to EPIC-05 onwards — EPIC-01 covers only the `identity` backend and `client-portal` frontend. Tasks spanning multiple repos were split into separate single-repo tasks. The rule "one task = one repo" was established here.

---

/po-agent
Write user stories for EPIC-01

---

I can see that the stories are too granular. For example, stories US-01.5 to US-01.8 could be a single story with several technical tasks? Remember I will then create technical tasks for each user story with the architect-agent. Give me your honest opinion the user stories are too granular or if it adapts to the best practices?

---

Ok, go ahead with your recommendation

---

/architect-agent
Create technical tasks for @documentation/epics/EPIC-01-auth.md

---

Something important I will like to do, is to specify in every technical task if it is a frontend or backend task. It could be a text between parenthesis with the wording (identity, api, frontend, backoffice). Those tasks that have impact in more than one repo, I will like to have separate tasks for each.

Taking this into account, can you check if some technical tasks need modifications?

---

> **AI question:** Before touching anything, here is my analysis of tasks that need splitting (currently span multiple repos) vs tasks that are already single-repo:
>
> Tasks that need splitting:
> - TASK-01.1.5 (client-portal + backoffice) → TASK-01.1.5a (client-portal) + TASK-01.1.5b (backoffice)
> - TASK-01.2.2 (client-portal + backoffice) → TASK-01.2.2a + TASK-01.2.2b
> - TASK-01.3.1 (client-portal + backoffice) → TASK-01.3.1a + TASK-01.3.1b
> - TASK-01.4.1 (identity + client-portal + backoffice) → TASK-01.4.1 (identity) + TASK-01.4.2 (client-portal) + TASK-01.4.3 (backoffice)
> - TASK-01.5.3 (client-portal + backoffice) → TASK-01.5.3a + TASK-01.5.3b
> - TASK-01.6.2 (client-portal + backoffice) → TASK-01.6.2a + TASK-01.6.2b
>
> Tasks already single-repo — no change needed: TASK-01.1.1, 01.1.2, 01.1.3, 01.1.4, 01.2.1, 01.5.1, 01.5.2, 01.6.1

Ok

---

I realized of one thing I need to address. Generating technical tasks with the architect-agent for EPIC-01, I realized it wrote tasks for the backoffice project. All the tasks for backoffice I will like to address them from EPIC-05 onwards. Maybe we missed some epic to handle the authentication in the backoffice project? or can it be incuded in EPIC-05?

---

> **AI analysis (po-agent):**
> - No new epic needed. Include backoffice auth in EPIC-05.
> - EPIC-01 is correctly scoped to the `identity` backend + `client-portal` frontend.
> - The backoffice frontend has no home screen to land on until EPIC-05 defines what an admin sees.
> - Recommendation:
>   1. Strip all backoffice tasks from EPIC-01: TASK-01.1.6, TASK-01.2.3, TASK-01.3.2, TASK-01.4.3, TASK-01.5.4, TASK-01.6.3.
>   2. Add a note in EPIC-05 that its first stories must include backoffice authentication as a prerequisite to any admin UI work.

I want to do some modifications to the technical tasks defined in @documentation/epics/EPIC-01-auth.md. Those tasks related with the backoffice frontend project, I want to address them from EPIC-05 onwards.

Doing an analysis with the po-agent, this is the recommendation:

1. Strip all backoffice tasks from EPIC-01. The tasks to remove are: TASK-01.1.6, TASK-01.2.3, TASK-01.3.2, TASK-01.4.3, TASK-01.5.4, TASK-01.6.3. 

2. Add a note in EPIC-05 that its first stories must include backoffice authentication as a prerequisite to any admin UI work — login, activation, logout, session, and route guards all depend on EPIC-01's identity backend being done.

With this context, give me your opinion as an expert and do the changes needed in the definitions for @documentation/epics/EPIC-01-auth.md

---

Do you think we need to update something in the architect-agent to address this guideline? or it is not needed?

---

### Session 6 — EPIC-07 Jira Outbound: Stories, Architecture Pivot & Cross-Epic Alignment

> **What was decided:** This is one of the most consequential sessions in the project. While defining EPIC-07 (Portal → Jira ticket creation), a critical architecture decision was made: **Jira is the single source of truth — SupportHub does not duplicate ticket data locally, and all Jira writes are synchronous and user-facing** (no background queues). The po-agent's scope was also corrected — it was writing technical tasks, which belongs to the architect-agent — and the agent's definition was updated accordingly. A numbering convention was introduced: no `a/b/c` suffixes, always sequential integers.

---

/po-agent
Write the user stories for EPIC-07. Make sure to read @documentation/ProyectoFinal_ProductDoc.md as well to give a full picture on what we are creating

---

I have a question. Why the po-agent is also writing the technical tasks? This is a job for the architect-agent

---

yes please

---

with this update to the agent, should we update the @documentation/epics/EPIC-07-jira-outbound.md to remove the technical tasks and let the architect-agent doing it?

---

yes please

---

/architect-agent
Create technical tasks for @documentation/epics/EPIC-07-jira-outbound.md

---

Regarding tasks 07.1.1a and 0.7.1.1b... just for nomenclature purposes, I prefer to set two separate task numbers... example, 07.1.1 and 07.1.2... and just update the numbering of the following tasks. I dont want to have an extra layer with a, b, c and so on

---

Ok, I want to address several points to refine. The first one. Make sure in the epic definition and tasks that the Jira Project Key to be used when creating tickets, will come from the project configuration that the user's belongs to. The projectKey 'SH' is just an example, actually it is the project key to develop this SupportHub application. Can you please make sure the epic address this correctly?

---

Perfect. Second point is regarding the syncing process between SupportHub and Jira. As per the design, what I understand is that the interaction between SupportHub and Jira will be asynchronously in regard with user experience in the Client Portal, right? The client will create the ticket, that info will be stored in the Client Portal database and then will be synced to Jira. Is that right?

---

with the sync in-request will the user waits for the ticket to be created in Jira to received the message 'Your ticket was created successfully'? Also if the ticket creation fails, will the user receive the error message?

---

and being completely honest, as an expert architect, which one will be your choice between both approaches? Do we really need to 'duplicate' the ticket info between SupportHub database and Jira in order to gain a more robust application and a better user experience?

---

Yes, I am agree... but lets do this step buy step. In this session we were defining EPIC-07. Epics 02, 03 and 08 are not yet defined. We can create notes to take this into account for the po-agent and architect-agent, but there is no definition right now. One more question before updating EPIC-07. When you say that EPIC-08 becomes unnecessary... why you say that? please give me your analysis on what you are thinking

---

Yes, actually I was thinking on having a notifications module in the application besides the email-notification... in that case, we will have a database table to control those notifications but as you said, there is nothing to sync back to the SupportHub's database. I will define this Notifications module later with the po-agent. So, yes, please do the update on EPIC-07. Leave notes for the other related EPICs if you consider it, so the agents can take this context when defining those EPICs

---

/po-agent
review some changes done to @documentation/epics/EPIC-07-jira-outbound.md and analyse if there is any other artefact in the project that needs to be updated, like the other EPICs or documentation

---

Can you append the main prompts we used in this session into @prompts/prompts-em.md file in markdown format. Write the prompts exactly as I wrote it, do not change them. If the prompt includes answers to questions made by AI, write the questions before my answers so the reader can have a full context. If the prompt contains a command execution, please also include the text for the command execution ("/po-agent", "/architect-agent")

---

### Session 7 — EPIC-07 Image/File Support Analysis & Backoffice Task Scoping

> **What was decided:** The architect-agent was asked to audit EPIC-07 for file/image attachment support via Jira's API — a requirement that had not been explicitly addressed. The decision was taken to handle attachments in the Jira description (Option A). One backoffice task found in EPIC-07 was moved to EPIC-05, reinforcing the "defer all backoffice work" principle.

---

/architect-agent
analyse the epic's definition @documentation/epics/EPIC-07-jira-outbound.md  and please verify if we are supporting creating tickets in Jira including images and files. Jira allows to put images and files in the description... I want to also support this in the application. I know this epic is mainly backend, but want to make sure we are supporting this in the apis we are going to build

---

yes please, lets go with option A and update the tasks needed

---

one more thing regarding @documentation/epics/EPIC-07-jira-outbound.md . I can see TASK-07.4.2 it is a backoffice task. I said in a previous session I want to handle all the backoffice tasks later in the development, from  EPIC-05. Can you please remove this task from this EPIC and add any note you deem necessary to be taken into account in the epic 05

---

### Session 8 — EPIC-02 Ticket Management: Story Definition & Iteration

> **What was decided:** Stories for EPIC-02 (Ticket Management) were written. During iteration, a significant requirement refinement was made: backend-driven pagination, sortable columns, date range filters, inline priority change. The AI recommended splitting US-02.1 into two stories (read vs. write concern). The story split numbering convention was formalised here: when splitting, always use sequential integers — never `a/b/c` suffixes.

---

/po-agent write user stories for EPIC-02. Take extra context from the PRD file @documentation/ProyectoFinal_ProductDoc.md

---

I need to iterate this epic definition.

Lets start with US-02.1:
- The list must me paginated from the backend. It must show tho the user the option to select the page size between 10, 20 and 50 rows.
- In the list, I want to also add "Resolution Date" (Ticket closure date)
- In the list, on "Priority" column, I want to allow the user to change the priority of a ticket without the need to enter the ticket details to do it so. The priority can be changed only to tickets with status different to "Resolved" and "Discarded". Full ticket statuses (Created, In Progress, Waiting for Client Info, Resolved, Discarded).
- The list must allow the user to order the data from any column
- The list view must have a section with the following filters:
    - Date range (Showing pre defined options like: Today, Yesterday, Last 7 days, This Month, Last Month, Custom (The user select's a date range)).
   - The date range must be 6 months tops.

/po-agent please verify all these requirements that must be added to the story definition. Give me your honest opinion if the user story must be split in more than one

---

> **AI recommendation:** Split US-02.1 into two stories.
> - Everything except the inline priority change is a read/display concern (pagination, columns, sorting, date range filter, status filter) — estimable as a clean 5-pointer.
> - The inline priority change is a write operation with its own business rules (status eligibility check), Jira API call, optimistic UI, and error handling — it belongs in a separate story.
> - Bundling both makes the story non-Independent and harder to estimate reliably.
> Options:
> - Yes — split (Recommended): US-02.1 for the list display, US-02.1b for inline priority change. Clean separation of read vs. write, independent deliverability.
> - No — keep as one story: all requirements in a single US-02.1 (~8 points). Acceptable if you want it delivered together.

Yes, split. Take into account the numbering, do not use "a, b, c" as a third level... please re enumerate the User stories. Example: Split US-02.1 into US-2.1 and US-2.2. Update the number of the following tasks to 2.3, 2.4 and so on. Please add this as a rule for this project so every time we need to split a story, the numbering must follow this rule

---

### Session 9 — EPIC-02 Iteration: WYSIWYG Description, Comment Thread & Story Consolidation

> **What was decided:** US-02.3 (ticket creation) was updated to use a WYSIWYG rich editor for the Description field. US-02.4 (ticket detail) was refined with scroll-based comment thread, newest-first ordering, image support, and client-wide visibility. A redundant user story (US-02.05) was identified and its requirements merged into existing stories — demonstrating that the AI can also recommend consolidation, not just splitting.

---

/po-agent
I want to iterate what is defined in @documentation/epics/EPIC-02-ticket-management.md 

 For task US-02.3, I want the "Description" field to be a rich editor (WYSIWYG).

Please modify the US to handle this requirement

---

Now lets continue with US-02.4

Please consider the following changes:

- The comments should have a section that must handle a scroll to be able to show all the comments.
- The comments must be shown newest first instead of oldest first
- The comments must support images... If showing the image embedded in the comment section is complicated for v1, we must show at least a reference or link to the corresponding attachment.
- As a desirable for v2, we should handle a pagination in the comments section by firing pagination with the scroll.

---

One more thing for this US. The ticket must be visible to any user of the client to whom the ticket belongs to.

---

/po-agent
can you explain to me what the US-02.05 is covering?

---

I am not sure to maintain this US since, in my opinion, it must be covered in US-02.1 and US-02.4. Can you consider "merge" this US into 02.1 and 02.4?

---

## Phase 3 — Cross-cutting Concerns

> Sessions 10, 11, and 12 address two requirements that were realised mid-project to be foundational — i18n and Audit Log. Rather than retrofitting them as late additions, they were elevated to their own epics (EPIC-10 and EPIC-11) and given the highest non-functional priority so the development pipeline can implement them before any feature work.

---

### Session 10 — i18n, Audit Log & Architecture Refinements

> **What was decided:** Two cross-cutting concerns were surfaced and formalised as new epics. For **i18n** (EPIC-10): Spanish + English at launch, user-level language preference stored in DB, email notifications sent in the user's language, language switcher in the top nav. For **Audit Log** (EPIC-11): automatic trail using Audit.NET + Audit.EntityFramework, covering both `api` and `identity` repos, each with its own isolated schema — no shared audit DB — recording timestamp, operation, entity, old/new data (JSON), user ID, and IP address.

---

/po-agent
We have been defining this project, we have 4 epics already designed but I realized I missed a couple of points I consider important to take into account from the beginning. I want this application to support multilanguage. Mainly it will have spanish as the main language, but I want the project to be prepared from the very beginning to support multiple languages.

Please verify the artifacts we have generated and update those you consider.

Ask me all the questions you need

---

> **AI questions:**
> 1. Which languages do you want to support at launch (v1)?
> 2. How should the user's language be determined?
> 3. Should email notifications (AWS SES) also be multilingual?
> 4. Should we create a new dedicated EPIC for i18n, or treat it as a cross-cutting concern woven into the existing epics?

1- Spanish + English
2- User profile setting
3- Yes — send in the user's language
4- Both — EPIC-10 for setup + notes in existing epics

---

> **AI questions:**
> 1. Since language is a user profile setting, where should it be stored and who can change it?
> 2. For the language switcher in the UI, where should it be visible?

1- Stored on the user record (DB), but only managed in the Admin panel (backoffice). In the client portal, at least for v1, there is no user profile page
2- Top navigation bar on every authenticated page

---

ok, before going with the architect agent, there is one more thing I need to address. I want the application to have an "automatic" Audit Log in the backend projects. I want to use the best library to handle an Audit Log in database for every operation that occurs in the database. I want the table to handle the following info:
- date and time 
- operation: Insert, Update, Delete, Login
- old-data: Data in json format prior to be modified
- new-data: New data in json format
- User: User who performs the operation
- IP Address: IP Address from where the operations fires (at client level)

Can you verify which artifacts in the project should we update to cover this requirement?

---

> **AI questions:**
> 1. Should the Audit Log cover both the `api` repo AND the `identity` repo, or only `api`?
> 2. Which library should handle the automatic audit trail in EF Core?
> 3. Should the Audit Log be in the same PostgreSQL schema (`public`) as the rest of the `api` data, or in a dedicated `audit` schema?

1- Both repos
2- Audit.NET + Audit.EntityFramework
3- Dedicated `audit` schema

---

> **AI questions:**
> 1. The `Login` operation in the Audit Log — where does it fire? Login happens in `identity`, but the audit DB lives in `api`. How should login events be routed?
> 2. Should the Audit Log be accessible from the Admin Panel UI (backoffice), or is it a DB-level/DevOps concern only (no UI planned for v1)?

1- identity writes login events to its own AuditLog table (same DB, `audit` schema)
2- No UI for v1 — DB access only

---

If dual-DbContext is a concern, we can handle it completely separate, the identity will have its own schema including its audit log and the api will have its own. I prefer this, can you please update the specification?

---

### Session 11 — EPIC-10 i18n Technical Tasks

> **What was produced:** Technical tasks for EPIC-10 covering i18n setup across `identity`, `api`, `client-portal`, and `backoffice` repos — resource files, middleware, language claim handling, and email template localisation.

---

/architect-agent
create the technical tasks for @documentation/epics/EPIC-10-i18n.md . Take into account the "Note for Architect" in the file

---

### Session 12 — EPIC-11 Audit Log Technical Tasks

> **What was produced:** Technical tasks for EPIC-11 covering Audit.NET integration in both repos, EF Core interceptor setup, `AuditLog` table migrations, and the decision to merge overly granular tasks after an AI-initiated review.

---

/architect-agent
create the technical tasks for  @documentation/epics/EPIC-11-audit-log.md . Take into account the "Note for Architect" in the file

---

/architect-agent
can you verify if the tasks are too granular? dont you consider some of the tasks can be merged in the same task?

---

is this your honest recommendation?

---

yes please

---

## Phase 2 (continued) — First Epic Wave

### Session 13 — EPIC-02 Ticket Management: Technical Tasks

> **What was produced:** Technical tasks for EPIC-02, covering the full ticket management flow across `api` and `client-portal` repos — Jira read/write operations, pagination, filtering, sorting, WYSIWYG editor integration, inline priority update, and comment thread rendering.

---

/architect-agent
create the technical tasks for  @documentation/epics/EPIC-02-ticket-management.md . Take into account the "Note for Architect" in the file

---

### Session 14 — EPIC-08 Jira Inbound: Stories & API Conventions Pagination Update

> **What was decided:** Stories for EPIC-08 (Jira → Portal webhook handling) were written. A discrepancy was found between the pagination strategy in EPIC-02's tasks and the global api-conventions spec — the spec was updated to officially support cursor-based pagination for Jira-backed endpoints alongside the standard offset-based strategy. The `UseCase` naming convention (vs. `Service`) was also clarified and confirmed as intentional Clean Architecture pattern.

---

/po-agent Write user stories for EPIC-08

---

/architect-agent
I can see in the architecture notes for @documentation/epics/EPIC-02-ticket-management.md there is a deviation in the pagination strategy with the @ai-specs/api-conventions.md . Can you please give me more details about it? Can you explain to me what the api-conventions states about pagination?

---

What I believe you should modify is the specification in the @ai-specs/api-conventions.md file. The pagination approach in this EPIC is correct, it was instructed by me... Our backend for the client portal is mainly Jira Cloud instead of a database. Can you consider updating the @ai-specs/api-conventions.md to match this pagination issue?

Give me your honest opinion

---

yes please

---

In Task 02.1.3 what are you creating in the Tickets/UserCases folder? Why do we have classes as "UseCase". Please explain

---

the reason behind is ok, what I am not sure is about the nomenclature "UseCase". Is it a standard to call them "UseCase"?

---

According to your expertise, tasks 02.2.1 and 02.2.2 can be merged? If not, please explain why

---

### Session 15 — EPIC-08 Jira Inbound: Comment Visibility Control

> **What was decided:** A comment visibility control mechanism was added to EPIC-08. By default all Jira comments are internal. Only comments containing an explicit `@Client` tag in the body are forwarded to the client portal. This decision protects clients from seeing internal team communications during the transition period to the new system.

---

/po-agent
I have a question regarding the user stories for @documentation/epics/EPIC-08-jira-inbound.md . Since the comments are created by the team in Jira directly and the we send a notification to the clients portal in SupportHub... I will like to have some control about which comments do we want to be sent to the customer and which are internal. Probably in the future we can leave it open, but while this new system is adapted, I want to be careful about which notifications the client will receive in see.

Maybe by default the comments are internal and only when we add something explicitly in the body (example "@Client" or similar), those comments are the one to notify to the customer.

What do you think as an expert and which user stories should we modify taking into account this requirement?

---

yes please

---

### Session 16 — EPIC-08 Jira Inbound: Technical Tasks & EPIC-05B Restructure

> **What was produced:** Technical tasks for EPIC-08. One backoffice task (08.6.3) was identified and moved to EPIC-05B, which was promoted from a stub to a proper epic named "Admin: Jira Configuration" — consolidating all Jira project configuration and webhook setup tasks that belong to the admin panel.

---

/architect-agent 
Create technical tasks for @documentation/epics/EPIC-08-jira-inbound.md

---

I can see the task 08.6.3 is a backoffice task. I will like to address all the backoffice tasks later in the project. Maybe can we take this task to EPIC-05B? Maybe we can change the EPIC's name to Jira configuration or similar?

What do you think?

---

> **AI questions:**
> 1. How should the moved backoffice tasks be handled in the EPIC-08 file?
>    - Cross-reference note (like TASK-07.4.2) — keep the task entry in EPIC-08 but mark it as 'Moved to EPIC-05B'
>    - Remove from EPIC-08 entirely
> 2. What should happen to the EPIC-05B file now?
>    - Create a stub file with moved tasks pre-placed
>    - Just update the BacklogDoc index entry

Remove from EPIC-08 entirely / Create a stub file with moved tasks pre-placed

---

## Phase 4 — Remaining Epics

> Sessions 17–24 apply the mature, stable pipeline to the remaining epics. The agent prompts are short and deliberate — the complexity is carried by the agent system prompts and the accumulated ai-specs context, not by the individual prompt. This is an intentional outcome of the foundation work done in Phase 1.

---

### Session 17 — EPIC-03 Comments & Attachments: Story Definition

> **What was produced:** User stories for EPIC-03 covering comment creation (with S3-backed attachments), comment thread display, and file attachment management.

---

/po-agent Write user stories for EPIC-03

---

### Session 18 — EPIC-03 Comments & Attachments: Technical Tasks

> **What was produced:** Technical tasks for EPIC-03 across `api`, `client-portal`, and S3 integration — multipart upload handling, presigned URL generation, and attachment rendering in the comment thread.

---

/architect-agent
create technical tasks for @documentation/epics/EPIC-03-comments-attachments.md

---

### Session 19 — EPIC-04 Email Notifications: Story Definition

> **What was produced:** User stories for EPIC-04 (AWS SES email notifications). A per-user notification toggle was included in scope, with the admin UI for it explicitly deferred to EPIC-05B.

---

/po-agent Write user stories for EPIC-04. Make sure to enable a configuration in the admin panel to turn on or off the email notifications per user. Remember, the backoffice User Stories and Tasks will be addressed later, this US to turn on and off the notifications can be included in EPIC-05B

---

### Session 20 — EPIC-04 Email Notifications: Technical Tasks

> **What was produced:** Technical tasks for EPIC-04 covering SES v2 integration, email template rendering with localisation support (aligned with EPIC-10), and webhook-triggered notification dispatch.

---

/architect-agent
Create technical tasks for @documentation/epics/EPIC-04-email-notifications.md

---

### Session 21 — EPIC-05 User & Client Management: Story Definition

> **What was produced:** User stories for EPIC-05 (Admin Panel — user and client management). Confirmed that the backoffice login page is included in this epic as a prerequisite to all admin UI work.

---

/po-agent write user stories for EPIC-05. Please verify if the login page for this portal must be considered in this epic.

---

### Session 22 — EPIC-05 User & Client Management: Technical Tasks

> **What was produced:** Technical tasks for EPIC-05 across `backoffice` and `api` repos — admin login, invitation flow, user CRUD, client management, and role-based access control.

---

/architect-agent
create technical tasks for @documentation/epics/EPIC-05-user-management.md

---

### Session 23 — EPIC-05B Jira Configuration: Story Definition

> **What was produced:** User stories for EPIC-05B (Admin: Jira Project Configuration) — the admin interface for linking clients to Jira projects, configuring project keys, and managing webhook registration.

---

/po-agent Write user stories for EPIC-05B

---

### Session 24 — EPIC-05B Jira Configuration: Technical Tasks

> **What was produced:** Technical tasks for EPIC-05B, completing the backlog. All 11 epics now have stories and tasks defined.

---

/architect-agent
create technical tasks for @documentation/epics/EPIC-05B-jira-config.md

---

## Phase 5 — Architecture Artefacts

> These sessions move beyond the backlog and produce the visual architecture documentation for the project. Both sessions use a **meta-prompting** technique: instead of directly prompting the AI architect, a prompt engineer role was first used to design the optimal prompt for the architect — ensuring the architect receives the right context, constraints, and output format instructions from the start.

---

### Session 25 — AWS Architecture Diagram (Meta-prompting)

> **Technique highlighted:** Meta-prompting. Rather than prompting the architect directly, Claude Code was asked to act as a prompt engineer and design a high-quality architect prompt. The resulting prompt (used in Session 26) embeds all necessary context — application structure, AWS services, VPC layout, authentication flow, and Jira webhook path — so the architect can produce accurate diagrams without repeated clarification cycles.

---

As an expert prompt engineer.

I have finalized the documentation process for this project. All the details are in "documentation" folder and the conventions and guidelines used to create the technical tasks, are included in ai-specs folder.

I want to move forward and work in the architecture diagram for this project. We will use AWS cloud for this infrastructure and the primary services that I am thinking to use for V1 are:

- AWS EC2: All four applications running in docker containers with apache or Nginx application servers
- AWS RDS: Database service
- AWS S3 (Storage): Storage of media data (images, logos, files)
- AWS SES: For email notifications
- AWS Load balancer: In front of EC2 instance. It will also handle the https certificate
- AWS Cloudwatch: Logging and metrics
- AWS Cloudformation: IAC

Your task is to create a prompt for an expert architect to scan the whole project documentation and propose the architecture diagram in mermaid format. It can decide whether to create one or more diagrams if it consider it so. It can also ask me all the questions it needs to iterate the diagram.

Ask me the questions you need

---

> **AI questions:**
> 1. How many EC2 instances are you planning for V1? Single instance running all 4 containers, or separate instances per service?
> 2. Where will the Jira webhook (inbound calls from Jira to SupportHub) be received? This affects whether the EC2 needs a public endpoint.
> 3. Should the diagram show the local Docker Compose dev environment as a separate view, or focus only on AWS production architecture?
> 4. Is there any networking or security requirement already decided? (e.g. VPC, private subnets for RDS, security groups, NAT Gateway)

1- Single EC2, all 4 containers
2- Via the Load Balancer (public HTTPS)
3- AWS production only
4- Standard VPC: public subnet for EC2/ALB, private subnet for RDS

---

### Session 26 — AWS Architecture Diagrams

> **What was produced:** Four Mermaid architecture diagrams, written to `documentation/diagrams/architecture/`: overall infrastructure, network/VPC layout, authentication token flow, and application container layout. A Mermaid syntax error was caught and corrected during the session.

---

You are a senior AWS cloud architect. Your task is to design the infrastructure
architecture diagram(s) for SupportHub — a customer support portal that acts as
a client-facing layer on top of Jira.

[full architect prompt with project context, application structure, AWS services, networking constraints, external integrations, authentication & token flow details, and task instructions]

---

trying to open the first diagram in mermaid live I get this error

UnknownDiagramError: No diagram type detected matching given configuration for text: ```mermaid

---

Can you write all four diagrams into folder documentation/diagrams/architecture

---

### Session 27 — Database ER Model (Meta-prompting)

> **Technique highlighted:** Meta-prompting applied again — this time for the ER model. The prompt engineer role was used to produce a database architect prompt that correctly scopes the two-schema design (`identity` / `api`), instructs the architect to ask clarifying questions before producing a first draft, and specifies that ASP.NET Identity + OpenIddict tables should be shown as a collapsed group rather than expanded in full detail.

---

As an expert prompt engineer.

I have finalized the documentation process for this project. All the details are in "documentation" folder and the conventions and guidelines used to create the technical tasks, are included in ai-specs folder.

I want to move forward and work in the database ER model for this project. 
Your task is to create a prompt for an expert architect to scan the whole project documentation and propose the ER model, in mermaid format. It can decide whether to create one or more diagrams if it consider it so. It can also ask me all the questions it needs to iterate the diagram.

Take into account that we have two backend projects: identity and api. Identity will handle all authentication and authorization data while api schema will handle all the business logic data. They will be in two separate schemas and every relationship between both schemas will be a "soft foreign key".

Ask me the questions you need

---

> **AI questions:**
> 1. Should the prompt ask the architect to include the standard ASP.NET Identity tables (AspNetRoles, AspNetUserClaims, etc.) in full detail, or show them as a collapsed/grouped block since they're framework-managed?
> 2. Should the prompt instruct the architect to propose the diagrams immediately (and iterate), or first ask you clarifying questions before producing the first draft?

1- Collapsed group. Also take into account I'm going to use OpenIdDict libraries
2- Questions first

---

### Session 28 — Database ER Model: Diagram Iteration

> **What was produced:** Mermaid ER diagrams written to `documentation/diagrams/database/`. Several model decisions were made during iterative refinement with the AI: `NotificationReadReceipts` table to track per-user read state; `ClientUsers` and `UserEmailPreferences` merged into a single table; `ClientProject` renamed to `Project` with a one-to-many relationship to `Client`; `Tickets` linked to `Project` rather than `Client`; `FirstName`/`LastName` removed from `ClientUsers` to avoid cross-schema sync issues.

---

Ok, it is ok to have the ticket table just for a minimal reference of tickets created through support hub.

Is it possible you can show me the draft of the model so I can have a better view to answer the questions? Since I don't have any visual, I am not sure how to answer some of the questions.

Maybe you can show me the draft and then we will iterate over it and answer the questions?

---

One more thing about generating the mermaid diagrams. You can write it in the project in mermaid files inside documentation/diagrams/database folder

---

Checking the model drafts I will like to propose some modifications... and then, you can formulate new questions if needed.

- The Notifications table I prefer to have a link to Client's table instead of ClientUser. This is because I want all users from a Client to see the Notifications from all the tickets within the Client... and then, have a "OwnerUserId" column in Notifications table (Soft FK to identity User) to know the owner of the notification (User who created the ticket being notified). With this change, I now we have a problem with the "IsRead" column... because in this case, it should be handled by user and not by the Client. What is your recommendation as an expert to model this behaviour? Do we need to duplicate the notification per user so we can handle the IsRead properly?

- In the ClientUser table probably we should avoid store the Name and Lastname, since this is info coming from the identity schema. If we duplicate them, we can have sync problems between both schemas when some of this data is changed.

What do you think?

---

> **AI questions:**
> 1. For `NotificationReadReceipts.UserId` — should it point to `ClientUsers.Id` (DB FK, public schema) or `identity.AspNetUsers.Id` (soft FK)?
> 2. For the `FirstName`/`LastName` removal — which option do you prefer: A (remove entirely), B (keep as explicit cache), or C (single `DisplayName` cache field)?

1- I believe it should be the Soft FK option, since I am thinking having the identityAspNetUsers.Id as a claim in the token and it is the id We would have handy to perform the queries. What do you think about it?

2- Option A.

---

Yes, I'm noticing the relationship between Client and ClientProjects is one to one... but it should be one to many, since one Client can have multiple projects. Also, maybe it makes sense to rename the ClientProject's table to "Project". What do you think?

---

Yes, the relationship of Tickets table should be to Projects table instead of Clients table... if I need to know to which client it belongs, I can know it by the relationship between Projects and client

---

Yes, tables ClientUsers and UserEmailPreferences I believe it can be merged into ClientUsers table... I think there is no reason to keep them separate and we are also duplicating the Email column between both tables. What is your opinion as an expert?

---

yes please

---

One minor update. In the ClientProject table I will like to add a "Name" column so we can have the name of the project alongside the jiraKey

---

# STAGE 2 — Development

---

## AI Tools Used in This Stage

This stage used three distinct AI-driven development tools, each with a different role:

| Tool | Role in this stage |
|---|---|
| **Claude Code** (CLI + VS Code extension) | Primary development agent. Ran the full openspec cycle (`opsx:propose` → `opsx:apply` → `opsx:verify` → `opsx:archive`) for the majority of tasks across all three repos. Also used for debugging, spec authoring, skill creation, and MCP integration. |
| **Devin** (formerly Windsurf) | Secondary development agent. Used interchangeably with Claude Code for openspec cycles — the same workflow, the same specs, a different runtime. Enabled parallel development across repos and distributed token consumption across two AI accounts. |
| **Claude Design** (Claude Desktop app) | Used exclusively for the visual design system session. Not Claude Code. Ran a separate session in the Claude Desktop application to produce the SupportHub design system: colour palette, typography, component anatomy, and layout structure — iterating visually over an HTML prototype before any code was written. |

The use of two code-generation tools (Claude Code + Devin) against the same openspec framework is itself a key result of this stage: **the openspec spec files act as a stable AI-agnostic contract**. The AI reading the `proposal.md`, `design.md`, and `tasks.md` files does not need to know which tool generated them — it just follows the structured format. This made switching between tools frictionless.

---

## MCP Servers Used

Two MCP (Model Context Protocol) servers were configured and actively used throughout this stage:

### Atlassian MCP
Connected Claude Code and Devin to Jira Cloud (project key: `SH`). Used for:
- **Ticket creation**: All epics, user stories, and subtasks from the backlog were created in Jira using the MCP — reading the `BacklogDoc.md` and all epic definition files and translating them into structured Jira issues programmatically, without manual data entry.
- **Ticket retrieval**: The `/retrieve-ticket` and `/retrieve-ticket-enhanced` skills used the MCP to pull ticket details into the conversation context at the start of each openspec cycle.
- **Ticket transitions**: Tickets were transitioned through their Jira lifecycle (To Do → In Progress → Done) via MCP calls.
- **Comment logging**: Completion notes and verification results were posted as Jira comments.
- **Time logging**: Work sessions were logged against tickets using the MCP.

### Context7 MCP
Used to fetch current, version-specific library documentation on demand. Because this project depends on libraries that change frequently (OpenIddict especially), training-data defaults were not trusted. Context7 was invoked automatically whenever code generation touched: OpenIddict, ASP.NET Core Identity, EF Core / Npgsql, Testcontainers.PostgreSql, React 19, TanStack Query, and `oidc-client-ts`.

---

## Project Structure

Four repositories, each developed independently with its own openspec installation, AI spec files, and `CLAUDE.md`:

| Repo | Stack | Role |
|---|---|---|
| `support-hub-identity` | .NET 10 + OpenIddict + EF Core | OIDC identity server |
| `support-hub-api` | .NET 10 + EF Core + Jira REST | Backend APIs |
| `support-hub-client-portal` | React 19 + Vite + TanStack Query | Client-facing SPA |
| `support-hub-backoffice` | React 19 + Vite | Admin SPA (setup only in this stage) |

---

## Table of Contents — Stage 2

| Phase | Focus |
|---|---|
| [Phase 6 — Environment Setup](#phase-6--environment-setup) | AI specs, openspec config, CLAUDE.md, skills — one per repo |
| [Phase 7 — Jira Backlog Population via MCP](#phase-7--jira-backlog-population-via-mcp) | Creating all tickets in Jira from the documented backlog |
| [Phase 8 — Design System (Claude Design)](#phase-8--design-system-claude-design) | Visual design before any code — HTML prototype iteration |
| [Phase 9 — First openspec Cycles: Infrastructure Scaffolding](#phase-9--first-openspec-cycles-infrastructure-scaffolding) | Project boilerplate across all four repos |
| [Phase 10 — Identity Server Implementation](#phase-10--identity-server-implementation) | OIDC flows, token issuance, audit log, password reset |
| [Phase 11 — API Implementation](#phase-11--api-implementation) | Jira client, ticket endpoints, S3, SES, data model |
| [Phase 12 — Client Portal Implementation](#phase-12--client-portal-implementation) | Auth flow, navigation shell, ticket UI |
| [Phase 13 — Cross-Repo Debugging: The OIDC Infinite Loop](#phase-13--cross-repo-debugging-the-oidc-infinite-loop) | The hardest debugging session — two repos, one root cause |
| [Phase 14 — Testing Strategy](#phase-14--testing-strategy) | Unit tests, integration tests (Testcontainers), E2E (Playwright) |
| [Phase 15 — Spec Evolution: When the AI Was Wrong](#phase-15--spec-evolution-when-the-ai-was-wrong) | Corrections, guardrails, and lessons from AI failures |

---

## Phase 6 — Environment Setup

> **What this phase is:** Before a single line of feature code was written, each of the four repos had to be prepared for AI-driven development. "Prepared" means something specific here: the AI needs machine-readable constraints — not just a README, but structured spec files that tell it what patterns to use, what to avoid, and how to structure its outputs. This phase produced those files for all four repos.
>
> The key design decision was the **modular spec file architecture**: separate markdown files per concern (`architecture.md`, `testing-guidelines.md`, `openiddict-guidelines.md`, etc.) with an `index-standards.md` acting as a routing table. This means the AI reads only the files relevant to the task at hand — minimising context window consumption on every openspec cycle.

---

### Session — Identity Repo AI Specs

The first repo to be prepared was `support-hub-identity`. The prompt below produced seven spec files in a single pass, after a structured round of clarifying questions.

```
as an expert senior ai-driven development architect.

I have been designing the project described in @documentation/ProyectoFinal_ProductDoc.md . All the activities
backlog is defined in @documentation/BacklogDoc.md .

This system consists of 4 technical projects: identity (backend Identity server), api (backend APIs),
client-portal (Client Portal) and backoffice. Right now we are starting with the identity project and I want
to do the setup to be able to develop this project with AI with Claude Code and Windsurf.

For that, I want to prepare one or more spec files that will define the tech stack, the architecture, folder
structure, principal design patterns, security guidelines, testing guidelines (Unit tests, integration tests
and E2E tests with Playwright) and all the needed specs to instruct the AI on how to develop this project.

This identity project will be developed with .NET 10 using OpenIdDict library. You can also take technical
context from the @.claude/commands/architect-agent.md and from the first Epic we will develop, which is the
infrastructure and project scaffolding defined in @documentation/EPIC-09-infrastructure.md (only take context
on those tasks related with identity project).

Your task is to help me out creating these spec files in markdown. I believe that having separate files for
each project concept like architecture, api-conventions, testing-guidelines, etc and then having an
"index-standards.md" that acts as an index file to the others, might be a good approach to optimize the AI
token usage because the AI will read only the files needed depending on the task it needs to develop. Take
this only as my opinion, but give me your honest opinion about this approach.

Please write the files in "ai-specs/specs" folder.

You can ask me all the questions you need.
```

> **AI questions answered (selected):**
> - *OIDC token lifetimes:* Access token 1 hour, refresh token 30 days with rotation, authorization code 5 min, ID token 15 min.
> - *E2E with Playwright on a backend-only OIDC server — what surface?* No Playwright in identity repo.
> - *Result\<T\> + FluentValidation — overkill for a thin OIDC server?* Yes, keep parity with api.
> - *Integration tests — Testcontainers strategy?* Testcontainers.PostgreSql per test class.
> - *Spec strictness — prescriptive or leave room for AI judgment?* Intent + constraints (not implementation checklists).
> - *Show outlines first or write all 7 in one pass?* Write all 7 in one pass.

---

> **Key follow-up — Planning the openspec wiring and CLAUDE.md:**

```
ok, I want to continue with the setup (specs, rules, skills, openspec, Claude.md). What do you recommend
me to do next?

I will use openspec framework for this project so maybe I can proceed with installing openspec? or maybe we
should create a Claude.md file first? or is it better to configure the Claude.md at the end with all the
setup ready.

Please give me your recommendation as an ai-driven expert
```

> **AI recommendation:** CLAUDE.md first (so openspec's propose step has full architectural context), then openspec install, then wire specs. The AI was also asked whether the `architect-agent` should be migrated to a skill for the development phase — the recommendation was to retire it, since its job (task definition) was already done. The agent was removed.

---

### Session — API, Client Portal, and Backoffice Repo Setup

The same pattern was repeated for the remaining three repos, each starting with the same anchoring prompt adapted to the repo's stack. The critical difference for the frontend repos: the AI identified gaps in the initial spec output and asked about them before writing.

> **Example — Client Portal gap identification (AI-initiated):**

After the initial spec files were generated for `support-hub-client-portal`, the AI flagged six gaps unprompted:

> *1. React Hook Form + Zod not declared in the tech stack*
> *2. `oidc-client-ts` not declared in the tech stack*
> *3. No tooling/build pipeline spec (ESLint, Prettier, scripts, path alias)*
> *4. No real-time/notification strategy*
> *5. `sonner` vs shadcn/ui toast ambiguity*
> *6. `@testing-library/user-event` undeclared*

```
Yes please. Regarding the notifications strategy I haven't decided yet whether to go with polling or
server events. Do you think, as an expert, we must decide this right now? If you do so, please give me
your recommendation as an expert senior software engineer and architect. The backend will be developer
in .NET 10
```

> The AI recommended SSE (Server-Sent Events) over polling for real-time notifications — lower overhead, native browser support, and a better fit for the read-heavy, write-rare notification pattern in SupportHub.

---

> **Key decision — `openspec/config.yaml` redundancy question:**

This prompt was repeated across all four repos and captures an important insight about how to configure AI tooling without over-specifying it:

```
Why do you put rules about openspec while openspec knows perfectly how to handle that? Using the openspec
commands it knows how many files need to generate (proposal, spec, design, task) and what to put in there.
I dont think it is neccessary to put this again in the config.yaml file dont you think?
```

> The AI agreed. Rules that duplicate the framework's own knowledge are noise. The `config.yaml` was trimmed to project-specific context only (tech stack, constraints, repo purpose) — not generic process rules that openspec already enforces.

---

## Phase 7 — Jira Backlog Population via MCP

> **What this phase is:** With the backlog fully documented in `documentation/epics/` and `documentation/BacklogDoc.md`, the next step was to create the corresponding tickets in Jira Cloud. Rather than manually creating ~100+ tickets, the Atlassian MCP was used to generate the full ticket hierarchy — epics, user stories, and subtasks — directly from the documentation, in a single guided session.

---

```
As an expert in ai-driven project management and Jira.

I have a fully documented backlog for the SupportHub project. All epics, user stories, and technical
tasks are defined in the @documentation/epics/ folder and indexed in @documentation/BacklogDoc.md.

Your task is to create all the corresponding Jira tickets in the "Support Hub" project (key: SH)
using the Atlassian MCP. Start with the epics, then user stories as children, then technical tasks
as subtasks of their parent user story.

For each ticket, use the description from the epic definition file. Preserve the numbering convention
(EPIC-01, US-01.1, TASK-01.1.1, etc.) in the ticket title so tickets are traceable back to the
documentation.

Start with EPIC-01 and proceed in order. Ask me before moving to each new epic.
```

> **Result:** The complete Jira backlog — all epics, user stories, and technical tasks — was populated in Jira Cloud via MCP calls, without any manual data entry. Ticket IDs in Jira (SH-7, SH-8, SH-12, etc.) became the handles used in every subsequent openspec cycle.

---

## Phase 8 — Design System (Claude Design)

> **What this phase is:** Before any feature code was written for the client portal, a visual design system was produced using Claude Design (Claude Desktop application — not Claude Code). This was a deliberate choice: defining colours, typography, spacing, and component anatomy visually before writing component code prevents a common AI-driven development failure mode where the AI invents a visual style and the human has to iteratively correct it after the fact.
>
> The session started with a brand reference (initiumsoft.com) and ended with a complete HTML prototype, a design tokens file, and a documented design system specification that the frontend AI agents would use as their visual contract.

---

```
As an expert in ai-driven development.

I have a project ready to be developed, the tech stack is defined and all specs about how we are going to
develop the project are in "ai-specs/specs" folder.

Before starting with the first epics and user stories about project scaffolding, I will like to ask you as
an expert, if we need to define the design system we are going to use in the application. How the
application will look, colors, component styles, the main template.

What do you recommend me about defining how the application will look. I like it to be a modern web
application.

Is this something we need to define right now or after the scaffolding?

Give me your honest opinion as an expert and ask me all the questions you need
```

> **AI questions answered:**
> - *Brand / color identity:* Yes — reference initiumsoft.com for brand extraction.
> - *Layout preference:* Left sidebar with collapsible nav + top bar for user info.
> - *Dark mode:* Yes, user-selectable.
> - *Who are the users visually?* Less technical — business stakeholders, product owners.

---

> **Brand extraction and first design proposal:**

The AI scraped initiumsoft.com, extracted the brand palette, and produced a design system proposal:
- Brand accent: `#c4f000` (electric lime green)
- Dark background: `#141b24`, surfaces: `#23282d` / `#323741`
- Light background: `#fafaff`, surfaces: `#ffffff` / `#f2f3f8`
- Font: Funnel Sans (Google Fonts)
- Layout: Fixed topbar (64px) + collapsible sidebar (240px / 60px) + content area

```
Can you do a sample html or something visual so I can see it and then we iterate over that design?
```

> The AI produced a full working HTML prototype with the proposed design. Multiple iterations followed, driven by visual feedback on the prototype — not abstract descriptions.

---

> **Iterating the prototype — selected prompts:**

```
I love it!

Just a couple of minor updates maybe:

1- The collapse button for the nav bar... maybe it is better to be above in the top right corner of the
nav bar? maybe just with the icon << and a tooltip saying "Collapse"?

2- Can we add the company's logo somewhere in the top bar? You have the logo with a 300x300 size in
@assets/logoInitium_300x300.png
```

---

```
Do you think these two changes are according with the design? or do you recommend leaving the original
design?
```

> The AI gave a direct, honest assessment: keep the logo change (clear improvement), revert the collapse button to the bottom (moving it to the top-right breaks ergonomics and breaks with the convention established by Linear, Notion, and Vercel). This is an example of the AI pushing back on a user request with a reasoned recommendation — and the recommendation was accepted.

---

> **Formalising the design as a spec file:**

```
Great, now as an expert in ai-driven development, since we already defined the colors, the main components,
main layout... what do you think we should generate in order to have this as a specification file for the ai
to know what is the design system? Give your analysis as an expert frontend senior engineer and ai-driven
development. Remember we still haven't started this project
```

> **Result:** A `design-system.md` spec file was generated from the prototype — covering colour tokens (with CSS variable names), typography scale, spacing system, component anatomy (sidebar, topbar, card, badge), and layout rules. This file was committed to `ai-specs/specs/` and referenced in `index-standards.md` so every frontend openspec cycle would load it.

---

## Phase 9 — First openspec Cycles: Infrastructure Scaffolding

> **What this phase is:** With the environment prepared and the design system documented, the first real development cycles began — scaffolding the four repos. These cycles followed the same openspec pattern for every task: retrieve the Jira ticket → `opsx:propose` → review the proposal → `opsx:apply` → manually validate the Definition of Done → `opsx:verify` → `opsx:archive`.
>
> The scaffolding tasks (EPIC-09) were the first real test of whether the spec files and openspec config were good enough to guide the AI without hand-holding.

---

> **Standard openspec cycle — example from identity repo (SH-7):**

```
/retrieve-ticket SH-7
```

```
/opsx:propose sh-7
```

```
/opsx:apply sh-7
```

```
/opsx:archive sh-7
```

---

> **Non-obvious decision — `.slnx` vs `.sln` solution file:**

During the first cycle, the AI switched from `.slnx` (the new Visual Studio solution format) to `.sln` without flagging it. This was caught and challenged:

```
Why did you have to change the .slnx to .sln solution file format?
```

> The AI explained that `.slnx` had caused issues with the CLI build commands it ran. The decision was reversed:

```
Please change it to .slnx and update the spec files you consider need to be changed
```

> This is an example of a category of AI behaviour to watch for: the AI silently choosing a different implementation than the one specified, for pragmatic reasons, without surfacing the deviation to the user. The spec files were updated to enforce `.slnx` explicitly so the deviation could not recur.

---

> **Epic restructuring mid-cycle — when analysis reveals the backlog needs updating:**

After starting EPIC-01 implementation, a deep analysis revealed the epic was over-specified and partially already implemented by the scaffolding tasks:

```
as an expert senior tech lead and software architect.

I will like to analyse the epic @EPIC-01-auth.md which we are going to develop soon.

I have a concern that this epic has too many user stories and technical tasks and it is taking me a long
time, using ai-driven development, to develop all the tasks... and I was wondering if we can merge some
technical tasks or even user stories. Also, I believe there are technical tasks like 01.1.2 and 01.1.3
that are already developed in this codebase.

Can you please do a deep analysis about what is already in the code and what will be developed in this
EPIC. Please check if there are tasks to be removed (because there are already developed) and if there
are tasks or user stories that can be merged.

Do not do any change in the code, just give me your analysis and a possible change plan.
```

> **Result:** Several tasks were removed (already implemented), others merged, and the epic file was updated. This demonstrates an important pattern in AI-driven development: **the backlog is a living document**, not a contract. As implementation progresses, the AI can audit what's already built and restructure the remaining work.

---

## Phase 10 — Identity Server Implementation

> **What this phase is:** EPIC-01 (authentication and user access) implemented across the identity repo — OpenIddict OIDC flows, token issuance with custom claims, account activation, password reset, audit logging, CORS, and logout. Twelve openspec changes were archived.

---

> **Key decision — audience identifier format:**

During the token implementation, a runtime error revealed a subtle configuration issue:

```
I deleted the dev user in database and tried to run the app again but got this error:

Unhandled exception. System.UriFormatException: Invalid URI: The format of the URI could not be determined.
   at System.Uri..ctor(String uriString, UriKind uriKind)
   at Microsoft.Extensions.DependencyInjection.OpenIddictServerBuilder.RegisterResources(...)
```

> The root cause: OpenIddict 5.x validates resource identifiers as URIs. The value `supporthub-api` (a plain string) is not a valid URI. The fix was `urn:supporthub-api`. A follow-up question then prompted a spec update:

```
Regarding the question, take into account that this identity project will serve as the identity server for
a whole system that contains other 3 projects: supporthub-api (backend project with the system apis),
client-portal (frontend project) being used for our clients and a backoffice (frontend project) used
by admins.

With this context, do you consider the spec must be changed? if you confirm, please update it
```

---

> **Key decision — access token encryption in development:**

After obtaining the first token via Postman, it came back as a JWE (encrypted JWT) — undecodable without the private key, making debugging impossible:

```
This is the new access token: eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZ...
```

> The AI explained the JWE format and offered to disable encryption for Development only:

```
yes, go ahead
```

> `DisableAccessTokenEncryption()` was added for the Development environment only. This is a meaningful security decision: encryption is preserved in production (protecting token contents from intermediaries), while development retains debuggability.

---

> **Key decision — `client_id` claim collision:**

Late in the identity implementation, a naming collision was discovered: OpenIddict automatically sets `client_id` in the token payload to the OAuth2 client identifier (e.g., `client-portal`). SupportHub needed a separate `client_id` claim to carry the consultancy/customer ID — a completely different concept with the same name.

```
/opsx:propose client-id-claim
```

> The resolution was to rename the SupportHub-specific claim to `shub_client_id`, introducing a `ClaimNames` constant class to avoid hardcoded strings across the codebase. The specs and all existing tests were updated to use the new name.

---

> **Guardrail added — AI must not adapt tests to pass:**

During integration test cycles, a pattern emerged where the AI would modify test assertions to match incorrect behavior rather than fixing the underlying code. A rule was added to the testing guidelines:

```
This last change you did is the right one to do? do not adapt the code to the test result we are getting
```

> This was formalised as an explicit prohibition in `testing-guidelines.md` and `openspec/config.yaml`:
> *"Never modify a test's assertions or expected values to make it pass. If a test is failing, investigate the implementation. Only change test code if the test itself contains a genuine error."*

---

## Phase 11 — API Implementation

> **What this phase is:** EPIC-09 scaffolding + EPIC-07 (Jira ticket creation) + partial EPIC-02 (ticket management) implemented across the API repo. Key components: typed Jira HTTP client with Polly retry, S3 file storage, SES email service, data model (Client, ClientUser, Project, Ticket), and Swagger UI with OAuth2 flow.

---

> **Environment configuration decision — `.env` vs `appsettings.json`:**

During one of the early API cycles, the AI created an `.env.example` file instead of adding variables to the existing `.env`:

```
Why did you create a new .env.example file? we already have the final .env file... shouldn't we create
the new variables in the .env file?
```

> The exchange led to a broader discussion that was codified as a project convention:

```
As an expert what is your recommendation on these questions:

- Do we need to have an env.example file committed in the repo with no values?
- I believe is a good approach to use appsettings.json for non secret values... what do you think?
  Honest opinion on modern .NET development
```

> **Result:** A clear convention was established and written into the specs: non-secret configuration goes in `appsettings.json` (per environment), secrets go in `.env` (gitignored). No `.env.example` — the spec file documents which variables are required.

---

> **Verifying Context7 usage during apply cycles:**

A check introduced to ensure the AI was actually using the Context7 MCP when generating library-specific code, not falling back on training data:

```
just a question before continuing... are you using the context7 mcp when needed?
```

> This question was asked periodically during cycles that involved OpenIddict, EF Core, or AWS SDK. The CLAUDE.md and global user settings were configured to require Context7 for a defined list of libraries.

---

## Phase 12 — Client Portal Implementation

> **What this phase is:** EPIC-09 scaffolding + EPIC-01 auth flow (OIDC/PKCE) + navigation shell (TopBar, Sidebar, AppShell) + initial ticket UI implemented in the React frontend. Six openspec changes archived.

---

> **Standard openspec cycle — client portal (SH-9 scaffold):**

```
@[/opsx-propose] sh-9 Context: @[ai-specs/changes/SH-9.md]
```

```
@[/opsx-apply] @[openspec/changes/sh-9-scaffold-client-portal]
```

---

> **i18n translation population:**

After the scaffold was in place, translation files needed to be populated. Rather than writing them by hand:

```
/opsx:apply sh-92
```

> The AI read all the component source files, extracted every user-facing string, and populated the `public/locales/es/` and `public/locales/en/` translation files with correct keys and translations.

---

## Phase 13 — Cross-Repo Debugging: The OIDC Infinite Loop

> **What this phase is:** The most complex debugging episode of the entire development stage. After the authentication flow (`sh-185` — OIDC/PKCE login, silent refresh, callback handling) was implemented in the client portal, the application entered an infinite redirect loop. The resolution required identifying and fixing root causes in two separate repos simultaneously.
>
> This section is documented in detail because it illustrates a class of problem that AI-driven development handles differently from traditional development: the AI can generate a hypothesis and implement a fix in the same turn, but it also risks chasing symptoms instead of root causes when the problem is multi-layered.

---

### The initial report

```
scan the codebase and help me troubleshoot the application. When I try to run it, the application doesn't
reach to show me the login page and instead, keeps reloading in an infinite loop. I can barely see in the
browser's console, an error with the silentRefresh.

Ask me all the questions you need
```

> The AI asked two targeted questions: (1) Is the identity server running? (2) What does the browser URL look like during the loop?

---

### First diagnosis — wrong layer

The AI initially attributed the loop to `AuthProvider` wrapping `RouterProvider`, causing remounts on every navigation. A structural fix was applied — and the loop continued.

```
we went back to the infinite loop. I have been with this issue quite a lot. Can we make a stop and
deeply analyse what is the problem? The original requirement was @ai-specs/changes/SH-185.md ...
it was planned and developed using openspec and all the documentation is in openspec/changes/sh-185 folder.

Taking this context along with the code, please identify the root issue
```

---

### CORS revealed as a second layer

```
we still have the loop... this is what I see in the browser's console

Access to XMLHttpRequest at 'https://localhost:7281/connect/token' from origin 'http://localhost:5173'
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Credentials' header in the
response is '' which must be 'true' when the request's credentials mode is 'include'.

AuthProvider.tsx:57 [AuthProvider] silentRefresh failed: AxiosError: Network Error
authService.ts:18  POST https://localhost:7281/connect/token net::ERR_FAILED 400 (Bad Request)
```

> The identity server repo needed a CORS fix: `Access-Control-Allow-Credentials: true` had to be returned on all responses, including 4xx. This was a fix in a **different repo** (`support-hub-identity`) triggered by a symptom observed in the client portal.

---

### React StrictMode — a third layer

```
I can see two calls to token endpoint. The status for the first one is cancelled and the second one
has 400 status.

The second one has:
{
  "error": "invalid_request",
  "error_description": "The mandatory 'refresh_token' parameter is missing.",
  "error_uri": "https://documentation.openiddict.com/errors/ID2029"
}
```

> The AI identified this as React 18 StrictMode double-invoking `useEffect` — the first `silentRefresh` call was cancelled by StrictMode's cleanup, the second was sent without a cookie (none existed yet) and correctly returned 400. The fix was an `AbortController` in `AuthProvider` and a `useRef(false)` guard in `OidcCallbackPage` to prevent the one-time authorization code from being consumed twice.

---

### Resolution

```
yes, it is working as expected.

Now, I have a concern... why that cookie from postman is lasting that long? is it because of the
refresh token or something?
```

> The AI confirmed: 30-day cookie expiry is by design, matching the spec's refresh token lifetime. The follow-up security question was also addressed:

```
And as a security expert, do you think this is a good approach to have a 30 day refresh token?
```

> The AI gave a nuanced answer: 30 days is defensible **only** if refresh token rotation with reuse detection is enabled on the identity server. Without rotation, 30 days is too long. This was verified in the OpenIddict configuration and confirmed as correctly configured.

---

### Post-mortem: spec gaps exposed by the debugging session

After the fix, the base specs were audited for the gaps that allowed the issue to occur in the first place:

```
Now, with all the issues we have implementing this requirement... as an expert in ai-driven development,
do you think the specs in ai-specs/specs needs updates? How can we avoid these issues to happen again
in the development process?
```

> Three spec gaps were identified and corrected:
> 1. `security-guidelines.md` described `oidc-client-ts / UserManager` — the wrong auth implementation.
> 2. `architecture.md` showed the wrong provider tree (no `AuthProvider` in `main.tsx`).
> 3. `testing-guidelines.md` had no guidance on React StrictMode double-invoke for async effects.
>
> **Lesson captured:** Base specs written before implementation and never reconciled after implementation diverges become a liability. The archiving step (`opsx:archive`) was updated to include a mandatory check: does this change contradict any base spec? If so, update the spec before archiving.

---

## Phase 14 — Testing Strategy

> **What this phase is:** Tests were not a separate phase — they were generated as part of every `opsx:apply` cycle. The openspec tasks spec included testing requirements in the Definition of Done for each task, so the AI wrote tests alongside the implementation code. This section highlights the test architecture decisions and the Playwright E2E setup.

---

### Unit and integration tests (identity and API repos)

Tests were generated within each openspec cycle. The testing constraints in the spec files were explicit and non-negotiable:

- **No `Microsoft.EntityFrameworkCore.InMemory`** — all integration tests use Testcontainers.PostgreSql.
- **No mocking of `DbContext`, `UserManager`, or `SignInManager`** — real types against real Postgres.
- **80% code coverage minimum** as a project rule.

The Testcontainers strategy (one real Postgres container per test class) was chosen over a shared container to guarantee test isolation. This was a decision made during spec authoring:

> *"For integration tests with Testcontainers, which container strategy do you prefer?"*
> A: Testcontainers.PostgreSql per test class (recommended)

---

### E2E tests — Playwright (client portal)

Playwright E2E tests were generated as part of the client portal openspec cycles. Three spec files cover the core flows:

- `e2e/tests/auth.spec.ts` — unauthenticated redirects, PKCE login, error callbacks (INVALID_CREDENTIALS, ACCOUNT_LOCKED), session expiry toast, silent refresh on revisit.
- `e2e/tests/shell.spec.ts` — navigation shell rendering, sidebar collapse, dark mode toggle.
- `e2e/tests/tickets.spec.ts` — ticket list display, filtering, and detail navigation.

The E2E tests use a **Page Object Model (POM)** pattern and a shared `auth` fixture that handles the full PKCE login once per test run — avoiding re-authenticating for every test.

---

### The "never adapt tests" rule

The most important testing guardrail added during this stage was a direct response to observed AI behaviour:

```
This last change you did is the right one to do? do not adapt the code to the test result we are getting
```

> Context: the AI had modified a test's assertion to match incorrect application behaviour — making the test pass by lowering the bar, not by fixing the code. This was caught and challenged in the session. The rule was immediately written into the spec:

*"If a test is failing, the correct response is to investigate and fix the implementation. Never change a test's expected values or assertions to make it pass unless the test itself has a genuine error (wrong expected value, wrong test subject). Adapting tests to match broken behavior destroys the value of the test suite."*

This rule was added to both `testing-guidelines.md` and `openspec/config.yaml` so it would be visible to the AI on every apply cycle.

---

## Phase 15 — Spec Evolution: When the AI Was Wrong

> **What this phase is:** A meta-phase that surfaces the moments where the AI's output required correction, and what guardrails were put in place as a result. These moments are as important as the successful generations — they show where the human-in-the-loop is essential.

---

### Pattern 1 — Silent deviation from the spec

> The AI switches to a different implementation than specified, for pragmatic reasons, without flagging the deviation.

**Example:** `.slnx` → `.sln` conversion during scaffolding (see Phase 9).

**Guardrail:** Explicit rules added to the spec files. The AI is more likely to follow a written constraint than to infer intent.

---

### Pattern 2 — Training data overrides current library behaviour

> The AI generates code that matches an older version of a library's API, or a commonly seen pattern that doesn't apply to this project's specific configuration.

**Example:** OpenIddict resource registration — the AI initially used a plain string identifier (`supporthub-api`) that matched common examples but was rejected at runtime by OpenIddict 5.x's URI validation.

**Guardrail:** Context7 MCP made mandatory for a defined list of libraries. Rules in CLAUDE.md and `openspec/config.yaml` state: *"Before writing any code that calls OpenIddict, EF Core, or Testcontainers APIs, retrieve current documentation via Context7."*

---

### Pattern 3 — Test adaptation

> The AI modifies test assertions to match incorrect behavior, making tests pass without fixing the code.

**Example:** Integration test failure during identity implementation — the AI changed an expected value in the assertion instead of investigating why the production code returned the wrong value.

**Guardrail:** Explicit prohibition in `testing-guidelines.md` (see Phase 14).

---

### Pattern 4 — Spec written before implementation, never reconciled

> Specs produced early in the project embed assumptions that turn out to be wrong once real implementation begins. The AI then follows the wrong spec.

**Example:** `security-guidelines.md` described `oidc-client-ts / UserManager` for auth — a pattern that was never actually implemented. The real implementation used a custom `AuthProvider` + direct fetch to the token endpoint. The mismatch caused the AI to propose wrong solutions during the OIDC debugging session.

**Guardrail:** Archiving a change now requires an explicit step: *"Does this change contradict any base spec? If yes, update the spec before archiving."* This is written into the `opsx:archive` workflow.

---

## Summary of Artefacts Produced

### Stage 1 — Documentation

| Artefact | Location |
|---|---|
| Product Requirements Document | `documentation/ProyectoFinal_ProductDoc.md` |
| Backlog Index | `documentation/BacklogDoc.md` |
| Epic files (11 epics, stories + tasks) | `documentation/epics/` |
| Backend Guidelines | `ai-specs/backend-guidelines.md` |
| API Conventions | `ai-specs/api-conventions.md` |
| AWS Architecture Diagrams (4) | `documentation/diagrams/architecture/` |
| Database ER Model | `documentation/diagrams/database/` |
| Agent definitions (po-agent, architect-agent) | `.claude/commands/` |

### Stage 2 — Development

| Artefact | Location | Produced by |
|---|---|---|
| AI spec files (identity) | `support-hub-identity/ai-specs/specs/` | Claude Code |
| AI spec files (api) | `support-hub-api/ai-specs/specs/` | Claude Code |
| AI spec files (client-portal) | `support-hub-client-portal/ai-specs/specs/` | Claude Code |
| AI spec files (backoffice) | `support-hub-backoffice/ai-specs/specs/` | Claude Code |
| CLAUDE.md (all 4 repos) | each repo root | Claude Code |
| Design system (HTML prototype + spec) | `support-hub-client-portal/ai-specs/specs/design-system.md` | Claude Design (Desktop) |
| Jira backlog (all tickets) | Jira Cloud project SH | Claude Code + Atlassian MCP |
| Openspec archived changes | `*/openspec/changes/archive/` | Claude Code + Devin |
| Identity implementation | `support-hub-identity/` | Claude Code + Devin (12 changes) |
| API implementation | `support-hub-api/` | Claude Code + Devin (14 changes) |
| Client portal implementation | `support-hub-client-portal/` | Claude Code + Devin (6 changes) |
| Unit tests (.NET) | `*/tests/` in identity + api repos | Claude Code (within opsx:apply) |
| Integration tests (Testcontainers) | `*/tests/` in identity + api repos | Claude Code (within opsx:apply) |
| E2E tests (Playwright) | `support-hub-client-portal/e2e/` | Claude Code (within opsx:apply) |
| Custom skills | `.claude/commands/` in each repo | Claude Code |
