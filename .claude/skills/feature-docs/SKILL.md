---
name: feature-docs
description: >
  Activate this skill when the user asks to "enter Documentation Mode", document a feature,
  generate architecture diagrams for a codebase feature, produce a feature spec, or create
  a structured technical reference for any software module. Triggers include: "document this
  feature", "generate docs for X", "create an architecture diagram", "document mode",
  or any request to produce a comprehensive written + visual technical document for a feature.
  Do NOT activate for general Q&A, unrelated code tasks, or simple README edits.
tags: [documentation, diagrams, architecture, feature-spec]
---

# Feature Documentation Generator

## Purpose and Scope

Generate comprehensive, navigable feature documentation that combines written specifications
with architecture diagrams. Outputs a markdown document with embedded Mermaid diagrams
and/or PNG architecture diagrams rendered via the `mingrammer/diagrams` Python library.

**In scope:** Feature overviews, data-flow docs, architecture diagrams, core-file maps,
extension guides, implementation pattern summaries.
**Out of scope:** API reference generation, test authoring, code refactoring.

---

## Preconditions

Before starting, verify:
- [ ] Python 3.8+ available: `python3 --version`
- [ ] `diagrams` library installed: `pip install diagrams --break-system-packages`
  - Requires Graphviz system package: `sudo apt-get install graphviz -y` (Linux)
    or `brew install graphviz` (macOS)
- [ ] Access to the codebase (local path or uploaded files)
- [ ] Output directory writable (default: `./docs/` relative to project root)

---

## Step 1 — Clarify Before Starting

Ask the user up to 4 clarifying questions. Stop as soon as you have enough to proceed.
Required unknowns:

1. **Feature name and entry point** — What is the feature called and where does it start
   (route, component, function, CLI command)?
2. **Tech stack** — Languages, frameworks, cloud provider (needed to pick diagram nodes).
3. **Diagram style** — Prefer Mermaid only (text-only output), `mingrammer/diagrams` PNG
   (visual architecture), or both?
4. **Output destination** — File path for the final `.md` document and diagram images.

If the user says "just do it" or provides enough context, infer and proceed — note
assumptions in a brief preamble.

---

## Step 2 — Codebase Exploration

Systematically locate all relevant files before writing a single line of documentation.

```
Search order:
1. Entry points    → routes, controllers, main components, CLI handlers
2. Business logic  → services, use cases, domain models
3. Data layer      → repositories, ORM models, DB schemas, migrations
4. API contracts   → tRPC routers, REST schemas, GraphQL types
5. State / side-effects → stores, event emitters, queues, caches
6. Configuration   → env vars, feature flags, dependency injection setup
7. Tests           → unit/integration tests reveal expected behavior
```

Build a **Core Files Map** table:

| File Path | Role | Key Exports |
|-----------|------|-------------|
| `src/features/X/index.ts` | Entry point | `XController` |
| ... | ... | ... |

---

## Step 3 — Choose and Generate Diagrams

### 3a — Diagram Type Decision Table

| Content type | Recommended tool |
|---|---|
| HTTP request → service → DB flow | Mermaid sequence diagram |
| High-level data/control flow | Mermaid flowchart |
| Domain model / entity relationships | Mermaid class or ER diagram |
| Entity lifecycle / state machine | Mermaid state diagram |
| System context (users + external systems) | C4-PlantUML — L1 Context (`C4_Context.puml`) |
| Internal apps, DBs, queues in a system | C4-PlantUML — L2 Container (`C4_Container.puml`) |
| Components inside one container | C4-PlantUML — L3 Component (`C4_Component.puml`) |
| Infrastructure / deployment topology | C4-PlantUML Deployment **or** `mingrammer/diagrams` PNG |
| Cloud-provider-specific infra (AWS/GCP/K8s) | `mingrammer/diagrams` PNG |
| Numbered interaction flows (C4 style) | C4-PlantUML Dynamic (`C4_Dynamic.puml`) |
| Simple process steps (text-only output OK) | Mermaid flowchart |

**Rule:** Always include at least one diagram. Combine tools freely:
a feature typically needs a Mermaid sequence (data flow) + a C4 container diagram
(system structure) + optionally a `mingrammer/diagrams` PNG (cloud infra detail).

⚠️ **C4 diagrams are PlantUML, not Mermaid.** They use `.puml` files and require
a PlantUML renderer. Do NOT write `C4Context` in a Mermaid fence.
See `references/c4-plantuml-guide.md` for full syntax, examples, and tooling setup.

### 3b — Mermaid Diagrams (inline in Markdown)

Embed directly in the output `.md` using fenced code blocks with `mermaid` language tag.
See `references/mermaid-examples.md` for templates.
Place each diagram immediately after the section it illustrates.

### 3b2 — C4-PlantUML Diagrams

C4 diagrams are authored as `.puml` files and rendered to PNG/SVG by PlantUML.

**Standard library include (preferred — no internet required):**
```plantuml
@startuml [Title]
!include <C4/C4_Container>
' ... diagram content ...
@enduml
```

**Render to PNG:**
```bash
plantuml docs/diagrams/feature_containers.puml   # → feature_containers.png
```

Reference the rendered image in the markdown:
```markdown
![Container Diagram](docs/diagrams/feature_containers.png)
```

See `references/c4-plantuml-guide.md` for all macros, levels, layout options,
sprites, and complete working examples for all four diagram types.

### 3c — `mingrammer/diagrams` Architecture Diagrams

Use the bundled script to generate PNG files. Do NOT write diagram code from scratch —
call `scripts/generate_diagram.py` with a JSON spec:

```bash
python3 scripts/generate_diagram.py \
  --spec '{"title":"Feature X Architecture","output":"docs/diagrams/feature_x","nodes":[...]}' \
  --outdir docs/diagrams/
```

For complex topologies, write a dedicated diagram script and pass it via `--script`:

```bash
python3 scripts/generate_diagram.py \
  --script /tmp/feature_x_diagram.py \
  --outdir docs/diagrams/
```

The generated PNG is then referenced in the markdown as:
```markdown
![Feature X Architecture](docs/diagrams/feature_x.png)
```

See `references/diagrams-library-guide.md` for the full node catalog and advanced patterns.

---

## Step 4 — Generate the Documentation

Produce a single markdown file with this structure:

```
# [Feature Name] — Technical Documentation

## 1. Feature Overview
## 2. Core Files Map          ← table from Step 2
## 3. Architecture Diagram    ← mingrammer/diagrams PNG (if applicable)
## 4. Data Flow               ← Mermaid sequence or flowchart
## 5. Domain Model            ← Mermaid class/ER (if applicable)
## 6. Key Dependencies
## 7. Configuration Options
## 8. Extension Points
## 9. Implementation Patterns ← references to auth.md, crud.md, etc.
## 10. Failure Modes
```

### Code Snippet Format

Reference code with line numbers:

````markdown
```startLine:endLine:filepath
// snippet
```
````

---

## Step 5 — Verify Output

After generating all files:

1. Confirm every diagram file referenced in the markdown actually exists on disk.
2. Confirm the markdown renders without broken links (check image paths are relative).
3. Print a summary:

```
✅ Documentation generated:
   - docs/feature_x.md
   - docs/diagrams/feature_x_arch.png   (mingrammer/diagrams)
   Mermaid diagrams: 2 (inline)
```

---

## Error Handling

| Error | Action |
|-------|--------|
| `diagrams` not installed | Run `pip install diagrams --break-system-packages`, retry once |
| Graphviz not found | Instruct user to install system package; fall back to Mermaid-only |
| Node type not found in `diagrams` | Use `diagrams.generic.compute.Rack` or `diagrams.onprem.compute.Server` as fallback |
| Codebase not accessible | Ask user to paste key file contents or file tree |
| Unknown tech stack | Default to generic nodes (`diagrams.generic.*`), note assumption |
| Output directory not writable | Write to `/tmp/`, report path to user |

If Graphviz is unavailable and the user requires PNG output, escalate with a clear
installation message rather than silently producing wrong output.

---

## Examples

### Minimal invocation
**User:** "Enter Documentation Mode for the authentication feature."

**Agent:** Asks 2–3 clarifying questions → explores codebase → generates
`docs/auth.md` with one Mermaid sequence diagram and one `mingrammer/diagrams`
PNG showing the AWS Cognito + Lambda + RDS topology.

### With explicit diagram request
**User:** "Document the payments feature. Use both Mermaid and Python diagrams.
Output to `docs/payments/`."

**Agent:** Proceeds without clarifying questions → generates
`docs/payments/payments.md` + `docs/payments/diagrams/payments_arch.png`.
