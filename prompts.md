> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

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

**Prompt 2:**

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

## Prompts adicionales de iteración y revisión

These prompts drove refinement, reconciliation and review across the documents rather than a single deliverable section:

**Refine R1 to cover the whole PDF (not just text-based):**

> R1 still talks about a text-based pdf, check on the entire pdf

**After manual edits to the file:**

> I've edited the .md file, re-read it

**Reconcile the matching/drag-drop inconsistency across sections:**

> yes, reconcile it

**Final cross-document review:**

> Do a final review of both PRD.md and readme.md, check that both files are correct by themselves, and also that their are consistent between them

**Generate this prompts log:**

> ok, now fill the file prompts.md using the current session, be extremely precise saving the exact promps I've wrote

---



## Prompts de la sesión 2 — Inicialización del monorepo (Turborepo + Expo + Supabase + Storybook)

> Note: prompts reproduced verbatim, in chronological order. This session covered the project scaffolding: Turborepo + yarn workspaces, the universal Expo app (web/iOS/Android), the shared `@helsoft/` libs, Storybook, creation of the hosted Supabase project, agent-rules consistency, and repo tooling.

**Prompt 1:** *(initialize the monorepo — created apps/, libs/, turbo.json, Supabase wiring)*

> I want to initialize a turbo repo on this repository, the repo will have  react-native web & mobile applications for the FE, and it will use Supabase for the BE

**Prompt 2:** *(scaffold the Storybook template library and verify it)*

> do the scaffold for @helsoft/lib-with-storybook, install storybook and test it works

**Prompt 3:** *(create the hosted Supabase project via CLI)*

> I need to create the supabase project now, help me doing it

**Prompt 4:** *(confirming* `npx supabase login` *was completed)*

> done

*(Region selected via the question UI: sa-east-1 — São Paulo.)*

**Prompt 5:** *(add Storybook to the shared components library)*

> now add storybook into the components library

**Prompt 6:** *(consistency review of the agent instruction files)*

> now finally do a review of @AGENTS.md, @CLAUDE.md and the files inside @.agents/ to ensure they're consistent for this monorepo

**Prompt 7:** *(add a clean script to the root package.json)*

> add a script "clean" in the main @package.json that will delete all the node_modules and caches inside any apps/ and libs/ subfolders

**Prompt 8:** *(extend clean to the root node_modules and caches)*

> yes, include root too

**Prompt 9:** *(document both DAO approaches — Supabase vs external endpoints)*

> going back to the previous prompt, I want to leave on @.agents/rules/hooks-service-dao.mdc the approach for calling endponts that are not on supabase, so depending on the user prompt, one or the other approach is used

**Prompt 10:** *(re-sync after manually moving the monorepo spec to .agents/rules/global.mdc)*

> now re-read AGENTS.md and @.agents/rules/global.mdc

**Prompt 11:** *(generate this session's prompts log)*

> write all the prompts of this session into @prompts.md

---



## Prompts de la sesión 3 — Migración del gestor de paquetes de yarn a pnpm

> Note: prompts reproduced verbatim, in chronological order. This session covered researching yarn vs npm vs pnpm for this monorepo (Turborepo + Expo SDK 57), migrating to pnpm 11 (`pnpm-workspace.yaml`, `workspace:*` protocol for the `@helsoft/*` libs, lockfile converted with `pnpm import`, `allowBuilds` approvals), verifying with `check-types`/`lint`/`build`, and updating the docs (`AGENTS.md`, `PRD.md`, `.agents/rules/global.mdc`, `readme.md`).

**Prompt 1:** *(research and compare package managers before deciding)*

> I'm thinking in migrating from yarn into npm or pnpm, can you research the advantages/disavantages of doing it, I want to compare them

**Prompt 2:** *(execute the migration)*

> migrate to pnpm

**Prompt 3:** *(document the isolated-dependencies escape hatch in the readme)*

> add this comment into the readme file: "If a future React Native library ever breaks with isolated dependencies, the one-line escape hatch is nodeLinker: hoisted in pnpm-workspace.yaml."

**Prompt 4:** *(keep the course readme in a single language)*

> translate the text so the entire readme is in spanish

**Prompt 5:** *(commit the migration and generate this session's prompts log)*

> ok, now commit the changes and then write this session prompts into prompts.md

