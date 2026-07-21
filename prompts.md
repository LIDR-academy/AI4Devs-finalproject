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
```
Act as a platform/DX engineer who is an expert at building "skills" for coding agents (Claude Skill
format: a SKILL.md file with YAML frontmatter `name` + `description`, plus additional reference files
if needed).

Create a skill called `docs-maintainer` whose purpose is to keep the project's technical documentation
in the `@arospe/docs` folder alive, by reading the source code and its changes (diffs/commits) so the docs
always reflect the real state of the code, for both AI agents and humans.

### 1. Activation (frontmatter `description`)
The skill's description must make clear it triggers when:
- The user explicitly asks to "document this", "update @arospe/docs", "generate documentation".
- A feature, database schema change, or significant refactor has just been completed.
- Changes are detected in models, migrations, endpoints, infrastructure config, or relationships
  between services.
It should NOT trigger for trivial changes (formatting, lint fixes, local variable renames).

### 2. Required structure inside `@arospe/docs`
Create/maintain this tree (adapt names to the project's real modules, but keep the hierarchy):

@arospe/docs/
  README.md                  -> general index, links to everything else, one paragraph per document
  architecture/
    overview.md               -> system overview, C4 or component diagram in Mermaid
    <service-or-module>.md     -> one per major module/service
  database/
    schema.md                  -> ER diagram in Mermaid + description of each table/model and its relations
    migrations.md               -> migration conventions, real examples
  api/
    <resource>.md                -> real endpoint contracts, request/response examples taken from the code
  conventions/
    code-style.md                -> real "good" vs "bad" examples with cited file paths
    naming.md
  decisions/                      -> (ADRs) important architecture decisions and their context
  errors-log.md                   -> structured log of mistakes made and how they were avoided going forward

If a topic could fit in more than one document, decide as follows:
- If it's a detail specific to THAT module -> it lives there, with a link from the general document.
- If it's conceptual/cross-cutting (e.g. "how we handle authentication") -> it lives in ONE place
  (the most general document that applies), and every other document ONLY links to it. Never duplicate
  the same explanation across two files.

### 3. Content rules
- All content inside `@arospe/docs` is written in English, regardless of the conversation language.
- Clean Markdown: a single H1 per file, consistent heading hierarchy, a table of contents for files
  longer than ~150 lines, code blocks with the language specified.
- Every code example must be real code pulled from the repo, citing the relative file path
  (e.g. `// src/services/payment.ts`). Do not invent generic examples when a real case exists.
- For every important convention, show a "✅ Good" and a "❌ Bad" example taken or minimally adapted
  from the real code, explaining why one is preferable.
- Every document ends with a line: `_Last updated: <date> — <brief reason for the change>_`.

### 4. Required Mermaid diagrams
- `database/schema.md`: an `erDiagram` with entities, key attributes, and relationships (1:1, 1:N, N:M).
- `architecture/overview.md`: a component/flow diagram (`flowchart` or `graph`) showing services,
  databases, queues, external APIs, and the direction of dependencies.
- Complex business flows (e.g. checkout, authentication): `sequenceDiagram`.
- State machines (e.g. order status): `stateDiagram-v2`.
- Every diagram must correspond to something verifiable in the current code, not an aspirational design.

### 5. Errors file (`errors-log.md`)
Fixed entry format, not free-form prose:

## <short problem title> — <date>
- **Context**: what was being worked on
- **What happened**: observed symptom/error
- **Root cause**: why it happened
- **Fix applied**: what was changed, with a link to the commit/PR or file path if relevant
- **How to avoid it next time**: a concrete, actionable rule (ideally linked to a convention in `conventions/`)

### 6. Incremental update mode
The skill must NOT rewrite the entire documentation set on every run. It should:
1. Detect which files/modules changed (via diff, or the files the agent just touched).
2. Identify which `@arospe/docs` document(s) describe that module.
3. Update only the affected sections, preserving the rest.
4. If the change introduces a new concept with no existing document, create the file in the correct
   folder per the tree in section 2, and link it from `@arospe/docs/README.md`.
5. If existing documentation contradicts the current code, fix it — and if the mistake looks like a
   repeat, add an entry to `errors-log.md`.

### 7. Acceptance criteria for the skill
Before considering the skill finished, verify:
- [ ] SKILL.md has a clear, actionable `name` and `description` for automatic triggering.
- [ ] `@arospe/docs/README.md` exists as an index linking to every document.
- [ ] No duplicated content across files (only cross-links).
- [ ] Every code example cites a real project path.
- [ ] The minimum Mermaid diagrams exist (ER, architecture) and render without syntax errors.
- [ ] `errors-log.md` follows the fixed entry format.
- [ ] All text inside `@arospe/docs` is in English.

Before writing any code or documents, first show me the proposed `@arospe/docs` folder tree adapted to this
project's real structure, and wait for my confirmation.
```

**Prompt 2:**
```
confirm but add other file in the structure to add base-standards.md with the code standards of the project with example of real code of the project with laravel 13, livewire structure, etc..
```

**Prompt 3:**
```
I forgot to add that the skill can update the CLAUDE.md file so that it adds links to the documentation, marking some as mandatory reading and others as needed only when using something specific, for example:
## architecture documentation
Mandatory reading @docs/architecture/*

## database documentation
If you need information about the schema, read @docs/database/schema.md
If you need information about migrations, read @docs/database/migrations.md

It should also make sure the CLAUDE.md file doesn't exceed 200 lines, trying to split content into different markdown files in @docs/ai and adding links in CLAUDE.md to those markdown files, in order to avoid adding too much context and to keep the information in CLAUDE.md well structured.
```

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
