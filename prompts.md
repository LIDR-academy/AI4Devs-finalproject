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

---



## Prompts de la sesión 4 — Rutas de la app (Expo Router) y limpieza del boilerplate

> Note: prompts reproduced verbatim, in chronological order. This session reviewed `PRD.md` and proposed the app's route map, stripped the create-expo-app template boilerplate (demo screens, components, assets, scripts and demo-only deps — committed separately), and scaffolded the routes: `(auth)/{login,sign-up}` and `(app)/{index,upload,settings,lesson/[id]/{index,player,results}}` guarded with SDK 57 `Stack.Protected`, extending `useSession()` with `isLoading` for the splash-gated session check.

**Prompt 1:** *(review the PRD and design the route structure)*

> review the PRD and propose routes for the app

**Prompt 2:** *(clean the Expo template first, commit it, then scaffold routes uncommitted)*

> yes, but first clean-up all the expo boilerplate, including assets, etc. Do a commit for the expo clean-up and then leave the new routes uncommited

**Prompt 3:** *(commit the routes and generate this session's prompts log)*

> ok, now commit and add the prompts of this session into prompts.md

---

## Prompts de la sesión 5 — Regla de split de componentes (types / hook / helpers)

> Note: prompts reproduced verbatim, in chronological order. This session reviewed the matching organism file split and added `.agents/rules/component-split.mdc` (types / co-located hook / pure helpers / presentational component), wiring it into `global.mdc`, `AGENTS.md`, and `ORCHESTRATOR.md`.

**Prompt 1:** *(review matching split + add component-split rule)*

> review my current changes and add a short rule in @.agents/rules.md similar to @.agents/rules/hooks-service-dao.mdc where it explains that components should be splited like this:
> - component-name.types.ts for types
> - use-component-name.ts for logic (but not event handlers like onClick)
> - component-name.helpers.ts for pure functions that can be outside of the component and hook
> add whatever you think it's important, mantain the file short

**Prompt 2:** *(log this session's prompt)*

> add this prompt into @prompts.md

---

## Anexo — Prompts de la sesión: construcción del orquestador agéntico (`.agents/`)

> Prompts del usuario (verbatim, en orden) de la sesión que diseñó e implementó el harness/orquestador de features bajo `.agents/` (agentes, reglas, skills, comando `/ticket-orchestrator`, plan en `ORCHESTRATOR_PLAN.md`).

1. I want to implement an agentic harness workflow mixing this 2 repos:
   1. https://github.com/betta-tech/harness-sdd/tree/uncle-bob-harness
   2. https://github.com/LIDR-academy/mobile-facephi
   The goal is to have an agentic harness workflow that can be used in the current project. But the workflow is different from both, this is the expected flow:
   1. spec_partner/spec: take a user story/ticket from the command line; read, ask questions and debate with the user until specs are clear; generate spec.md, risks.md, tasks.md.
   2. gherkin_author: generate features/<name>.feature BDD specs; wait for human approval.
   3. TDD Craftsman (follow TDD): UI components → component file (use tokens/other components; use figma/screenshot if provided), storybook file, e2e/unit tests file; logic/business rules → unit tests file, logic file; always → integration tests file.
   4. Reviewer (several steps; each: review → back to TDD Craftsman → re-review): code reviewer, architecture reviewer, design reviewer, security reviewer (OWASP), accessibility reviewer (WCAG). Order: code, design, architecture, security, accessibility. Check how it's done in the repos.
   5. Mutation testing: follow harness-sdd steps but TypeScript instead of Python.
   6. PR guardian: prepare the PR with full Definition of Done validation.
   Make a plan for this and save it on an .md file.

2. I like the vertical slice idea, let's add it too.

3. add a mermaid diagram of the flow.

4. lets add a human gate between the spec_partner and the gherkin_author.

5. the "4. Pipeline overview" is hard to read, convert it into mermaid diagram.

6. lets change the pr_guardian, it should auto-create the pr, it should just do the Definition of Done, let's rename it to dod_validator.

7. replace the feature_list.json file with a folder <name>/task-1.md, <name>/task-2.md, etc. and also move any file that uses <name> into that folder.

8. lets modify the testing part, UI components should also have unit tests so TDD and the mutation testing can be done on UI components too.

9. (Open-questions responses) Ticket source: the user story is an .md file in root/user-stories/. Figma: not needed, no Figma in this repo — fall back to a pasted screenshot or nothing. Mutation cost: yes, scope mutate: tightly to changed files and use coverageAnalysis: 'perTest'. Jest + Expo/RN 0.86 / React 19: already configured. e2e vs mutation: Stryker's Jest runner won't cover Playwright .e2e.js; mutation thresholds apply to Jest-testable logic; document the split in mutation-testing.md. Reviewer loop termination: cap re-review cycles to 3 before escalating.

10. ok, the plan looks good, now help me to implement it.

11. lets rename from harness into orchestator, and the command should be named ticket-orchestator.

12. can we move the content of .agents/AGENTS.md into another file?

13. rename tdd_crafstman to implementator.

14. There was an issue running "pnpm test:e2e" (Playwright's HTML reporter auto-opens the report and blocks/hangs the process). Change the implementator so it runs without auto-opening the browser.

15. is it possible to use different models to run the orchestator_lead, implementator, reviewers, mutation_tester and dod_validator. Basically the only one that should run with Opus is the spec_partner.

16. I want to enforce on the orchestator_lead that any finding on the reviews should be addressed by the implementator, even if it's a minor finding, and after fixing it, should go through the review and mutation process again. The loop can occur 3 times at most, and at the very end the review.md file should contain only the findings that weren't fixed.

17. I do want to allow shipping with documented minors after 3 rounds.

18. I want to do a change for the review, only reviewer_code and reviewer_design should run for each slice. When all the slices are completed then all the reviewers should run.

19. ok, the orchestrator should create a worktree for the work.

20. add a review phase after creating the specs and the gherkin specs, before human approval, so we ensure the spec, risks, tasks, etc. are correct.

21. lets do only 2 reviews of the spec and 2 reviews of code.

22. the mutation testing should be run twice: once before the full review and once after it — and it should be fixed both times.

23. I want to reduce the size of the .md files, for example once the gherkin is created remove AC from the spec.md and just add a link to the gherkin file; research other duplications like this to reduce the final size of the .md files. And tell me if you know another way of reducing token usage.

24. add the "compact this feature's docs".

25. clean the existing ones.

26. write the prompts of this session into prompts.md.

---

## Anexo — Prompts de la sesión: optimización de consumo de tokens del orquestador

> Prompts del usuario (verbatim, en orden) de la sesión que investigó y aplicó la reducción de consumo de tokens del pipeline de `.agents/` (rúbricas embebidas por reviewer, `reviewer_slice` combinado por slice, CI una sola vez por ronda, re-review solo de lenses con findings, mutación post-review condicional, lens skipping, runners silenciosos, dedupe de docs y `reviewer_accessibility` en Haiku).

1. I have and @.agents/ORCHESTRATOR.md on this repo for developing features, but the entire process consumes too much tokens, research ways of using less tokens

2. Go with 1, 2, 3, 4, 5 (and review-standards should be deleted and each agent should have the standards), 6, 7, 8, 9 (only accesibillity on haiku), 10
   *(aceptando las 10 recomendaciones propuestas: 1 — round 2 re-ejecuta solo reviewers con findings abiertos; 2 — CI una vez por ronda de review, los reviewers no re-ejecutan suites; 3 — review por slice colapsada en un solo agente `reviewer_slice`; 4 — segunda pasada de mutación condicional y acotada al sha pre-review; 5 — borrar `review-standards.md` y embeber cada rúbrica en su agente + sacar las reglas de la inyección global; 6 — lens skipping según el diff; 7 — test runs silenciosos y acotados por workspace/archivo; 8 — dedupe `ORCHESTRATOR.md`/`orchestrator_lead.md` y compactar `hooks-service-dao.mdc`; 9 — solo `reviewer_accessibility` a Haiku; 10 — presupuesto de `tdd.md` verificado en cada slice gate.)*

3. write the prompts of this session in prompts.md

---

## Anexo — Prompts de la sesión: refinamientos del orquestador (kanban de historias, shrink de spec, `risks.md` en tmp, fusión de reviewers, reglas de stories e i18n)

> Prompts del usuario (verbatim, en orden) de la sesión que refinó el orquestador de `.agents/`: mover la historia por el kanban `pending → in-progress → done`, encoger `spec.md` tras generar tasks + gherkin, ejecutar el compact de docs solo como script (sin agente), escribir `risks.md` en una carpeta `tmp/` fuera de contexto (y aterrizarla en `docs/` al crear el PR), fusionar los 6 reviewers de la revisión completa en 2 (`reviewer_engineering` = code · architecture · performance; `reviewer_standards` = security · accessibility, quitando design), y añadir dos convenciones de código (stories obligatorias en libs con Storybook; texto de usuario vía `t('ns.key')` inline sin objeto `labels`, salvo diccionarios de claves).

1. modify the orchestrator so it moves the .md file from user-stories/pending into user-stories/in-progress when it starts to work on it,  and into user-stories/done when finished

2. after creating the spec.md and all the tasks files, review spec.md and shrink it

3. The `Compact docs (pre-PR cleanup).` should only run the script, but dont fead them into a agent/subagent, basically, only run the script

4. ok, and the risks.md file should be created in an tmp folder, and never added to the context, just move it to the docs folder when creating the PR

5. now I want to merge the full review agents into only 2 (instead of 6):
   1. code, performance and architecture
   2. desing, security and accessibility

6. actually, remove design review from the reviewer_standards

7. add 2 things:
   1. always add stories for components in a library with storybook
   2. don't add a labels variable, use `t('some.label)'` directly, unless is a dictionary, for example like `GENERATION_ERROR_KEYS`

8. add the prompts from "modify the orchestrator so it moves the .md file from user-stories/pending into user-stories/in-progress when it starts to work on it,  and into user-stories/done when finished" until the last one into prompts.md

---

## Anexo — Prompts de la sesión: `reviewer_slice` valida contra todas las reglas de `.agents/rules/`

> Prompts del usuario (verbatim, en orden) de la sesión que amplió `reviewer_slice` para revisar el diff de cada slice contra **todas** las reglas de `.agents/rules/` (glob del directorio, autoritativo — recoge reglas nuevas como `state.mdc` automáticamente), dejando solo las lentes que no son reglas (seguridad/OWASP, accesibilidad/WCAG, performance) para la revisión completa; se ajustaron las referencias cruzadas ("code + design lenses" → "todas las reglas + design").

1. modify @reviewer_slice.md so it reviews the code against all the rules in the .agents/rules directory

2. write to prompts.md the prompts since your last write
