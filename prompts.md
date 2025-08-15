> Detalla en esta sección los prompts principales utilizados durante la creación
> del proyecto, que justifiquen el uso de asistentes de código en todas las
> fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección,
> principalmente los de creación inicial o los de corrección o adición de
> funcionalidades que consideres más relevantes. Puedes añadir adicionalmente la
> conversación completa como link o archivo adjunto si así lo consideras

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

I'll use ChatGPT 4o to generate the prompts, except when specified otherwise.
For code and diagrams, cursor will be used in "auto".

## 1. Descripción general del producto

**Prompt 1:** Summarize the main things a person has to know to manage personal
finances based on their income (usually salary) [search the internet tool
enabled] [RESULT](./prompts/1-manage-personal-finances.md)

**Prompt 2:** Role: You're a specialist in personal finances management
collaborating with a software developer to create an app

Context: You need to educate the developer on the things they need to develop

Goal: At this moment you both need to discuss about how to create the app

Task: Try outline a plan about the basic broad features a common individual
would care about when tracking their salary

Feel free to ask me any question [RESULT](./prompts/2-product-planning.md)

**Prompt 3:** Role: You're a prompt engineering expert ready to use the most
fitting techniques

Task: Create a prompt to generate the description of the product

Context:

The description should contain

- Goal: which value it brings, what it solves, and to whom
- Characteristics and main functionalities: identify necessities and how we can
  solve them
- Highlight of the main functionalities

Output: a markdown prompt that i can copy-and-paste

Input: [I'll paste the file]

Feel free to ask me any question before begin
[RESULT](./prompts/3-metaprompt.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** Role you're a software engineer with a lot of experience in
creating software architectures

Task: Create a diagram of the software architecture of the project on mermaid,
focusing only on the first milestone.

For the moment, ignore that the project needs a user that needs to login.

Focus on:

- Budgeting transactions (incomes and expenses)
- Allowing the user to add frequencies, categories and currencies
- Allowing the user to group transactions to compose into another transaction

Context: the project is a web app, possibly with a mobile version

[RESULT](./prompts/5-architecture-diagram.md)

**Prompt 2:** Create diagrams in mermaid following the C4 model

[RESULT](./prompts/6.1-context-diagram.md)

[RESULT](./prompts/6.2-container-diagram.md)

[RESULT](./prompts/6.3-component-diagram.md)

[RESULT](./prompts/6.4-code-diagram-transaction-module.md)

**Prompt 3:** Create the code diagram from the C4 model for the user module

[RESULT](./prompts/7-code-diagra-user-module.md)

### **2.2. Descripción de componentes principales:**

**Prompt 1:** Based on @prompts/ what do you think would be the main components
of this system?

[RESULT](./prompts/8-main-components.md)

**Prompt 2:** Following DDD, suggest some of the aggregate roots of transaction
and user modules.

[RESULT](./prompts/9-aggregate-roots.md)

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:** Role: you're a senior software engineer

Context: you're using nextjs (SPA) for frontend and nestjs for backend

Task: create a high-level description of the project, and layout the folder structure for each submodule

Instructions:

- You can clarify any questions before starting
- Follow the stack's best practices
- Create a "instructions.md" file that will explain how to handle submodules
- Prefer following DDD principles, and layering correctly
- Each component might be tested individually, with test file the closest as possible
- Create modular code, that is, a folder might have a "public" file and inside that folder have supporting files that won't be used outside of the folder

Output: markdown file

[RESULT 1](./prompts/14-project-description.md)
[RESULT 2](./contributions.md)

**Prompt 2:** Role: you're a software architect documenting how to run the project

Context: change @./contributions.md to add the following con  tent before "Module Structure"

- Setup: what install and in which order
- How to work with submodules: contributors should be able to run the project from root but also from the subrepositories individually
- Development guidelines: include archteture, testing, and make the module structre part of it

RESULT: `git show cbc0c47`

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

**Prompt 1:** Role: you're a experienced product owener who will collaborate
with developers in this project

Task: Plan how to create the user stories for the first milestone, focusing on
the tracking/budgeting and user modules

Context: The user will be mocked for the moment, and devs will use a single user
until the basic budgeting is implemented, at that point we can plan for
authenticate with different users

[RESULT](./prompts/10-user-stories.md)

**Prompt 2:** Use @10-user-stories.md to create the user stories following the
gerkhin format:

"Given [backgroun] When [action] Then [result]"

Add everything on @11-bdd.md

[RESULT](./prompts/11-bdd.md)

**Prompt 3:** Role: You're a senior softwer engineer who need to think of
developer stories, that is, enabling stories that will allow us to implement
user stories.

Track the dependencies between user stories and developer stories.

Context: We want to develop the app in vertical slices, for example, only when
working on the authentication flow (user story about authentication) I will
create user table and user-related code

We will mock user login until the last minute, that is, seed the user-related
stories to the end of the backlog

coding will be done without them as if there was no users until we manually add
them

Task: Rewrite the "tasks" focusing on the user stories (user-story centric),
while laying out each dev story associated with that

Remember to apply tdd principles, that is, tests and bdd specs have to be
delivered with each story.

[RESULT](./prompts/12-developer-stories.md)

---

### 6. Tickets de Trabajo

**Prompt 1:**: Role: You're a experienced prompt engineer focused on the best
practices

Task: Read 10-user-stories.md , 11-bdd.md, and 12-dev-stories.md and give me a
prompt to create the working tickets for developing the app in a way that each
story is created in a logical sequence for vertical slicing.

Feel free to ask me any question before begin and clarify any doubt.

Context: I need backend and frontend tickets, you might need to add those to
10-user-stories.md, 11-bdd.md, and 12-dev-stories to contemplate that

If that is necessary, focus on that first, then we worry about creating tickets.

[RESULT](./prompts/13-development-tickets.md)

**Prompt 2:** 

[ADD THEM TO CONTEXT]
- ./prompts/10-user-stories.md
- ./prompts/11-bdd.md
- ./prompts/12-dev-stories.md
- ./prompts/13-development-tickets.md

Amongst those files, there are many things to do, is there any contradiction between them?

Instructions:

- When you detect a contradiction, ask me how to solve it, one at a time. Ask me before moving on to next contradiction.
- Let's start solving small contradictions first.
- Change all the files so they all align in what they say.
- Review checkboxes, centralizing them on ./prompts/13-development-tickets.md

RESULT: `git show b7dd28c`

**Prompt 3:** review the docs in @prompts/ using @ideation.mdc 

RESULT: `git show b3be42f`

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
