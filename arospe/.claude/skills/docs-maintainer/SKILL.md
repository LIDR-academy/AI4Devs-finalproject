---
name: docs-maintainer
description: "Use this skill to keep docs/ synchronized with the real state of the code, for both AI agents and humans. Trigger explicitly when the user says \"document this\", \"update docs\", \"generate documentation\", or references docs/. Trigger proactively right after completing a feature, a database schema change (new/altered migration or model), a significant refactor, or changes to models, migrations, routes/controllers, Livewire components, config/infrastructure files, or the relationships between services. Do NOT trigger for trivial changes with no observable contract, schema, or behavior change: formatting, Pint fixes, local variable renames, comment-only edits, or dependency patch bumps with no config change. Covers: writing/updating docs/README.md and its index, architecture docs with Mermaid diagrams (flowchart, erDiagram, sequenceDiagram, stateDiagram-v2), database schema docs, route/API contract docs, coding conventions with real ✅/❌ examples, ADRs in docs/decisions/, and structured entries in docs/errors-log.md."
license: MIT
---

# Docs Maintainer

Keeps `docs/` truthful to the current code — not a changelog, not aspirational design. Every fact, code sample, and diagram must be verifiable by reading the repository right now. If a document contradicts the code, the code wins: fix the document.

## When NOT to run

Skip trivial changes: formatting/Pint-only diffs, renamed local variables, comment-only edits, dependency patch bumps that don't change config or behavior. If nothing observable changed (schema, contract, public API, architecture, convention), there is nothing to document.

## Documentation tree

```
docs/
  README.md                      Index — one paragraph per document, links to everything
  architecture/
    overview.md                  System overview + flowchart of the real request lifecycle
    authentication.md            Cross-cutting: Fortify auth, 2FA, passkeys (sequenceDiagram)
    authorization.md             Cross-cutting: spatie/laravel-permission roles & permissions
    <new-module>.md              One per major module/service, added only when it exists in code
  database/
    schema.md                    erDiagram + description of every table/model and its relations
    migrations.md                Migration conventions, real examples from database/migrations/
  api/
    routes.md                    Real route/Livewire contract surface (this app has no REST
                                  API yet — split into api/<resource>.md once real API
                                  controllers + routes/api.php exist)
  conventions/
    base-standards.md            Baseline PHP/Laravel/Livewire project-structure standards
    code-style.md                Real ✅ Good / ❌ Bad examples cited from repo files
    naming.md                    Naming conventions with real examples
  decisions/
    <NNNN-title>.md               One ADR per significant architectural decision (created only
                                  when a real decision happens — this folder starts empty)
  errors-log.md                  Structured log of real mistakes and how to avoid repeats
```

### Placement rule (no duplication)

- **Module-specific detail** → lives in the one doc that owns that module, linked from the general doc that mentions it.
- **Cross-cutting concept** (e.g. "how authentication works") → lives in exactly ONE place — the most general document that applies (usually `architecture/<concept>.md`) — every other document only links to it (`See [Authentication](../architecture/authentication.md)`). Never re-explain the same concept in two files.
- Before adding a paragraph, grep `docs/` for the concept first. If it's already documented elsewhere, link instead of duplicating.

## Workflow (incremental update — never a full rewrite)

1. **Detect what changed.** Use `git diff`/`git log` against the base branch, or the set of files touched earlier in this session. Do not re-scan the whole repo.
2. **Map changes to doc(s)** using the table below. A single change can touch more than one doc (e.g. a new migration touches both `database/schema.md` and `database/migrations.md`).
3. **Edit only the affected section(s)** of each mapped doc. Preserve everything else verbatim.
4. **New concept, no home?** Create the file in the correct folder per the tree above, then add a link + one-paragraph summary to `docs/README.md`.
5. **Docs contradict the code?** Fix the doc to match the code. If this looks like a *repeated* mistake (same wrong assumption documented before, or the same bug class recurring), add an entry to `docs/errors-log.md`.
6. **Sync `CLAUDE.md`.** If a doc was created, or an existing one now covers something `CLAUDE.md` doesn't point to yet, add/update its link per [Keeping CLAUDE.md in sync](#keeping-claudemd-in-sync).
7. Re-read the diff of the doc file(s) you just wrote before finishing — confirm every fact and code snippet still matches the source file it cites.

### Change → doc mapping

| Changed path | Update |
| --- | --- |
| `app/Models/*.php` | `database/schema.md` (table/relations section for that model) |
| `database/migrations/*.php` | `database/schema.md` + `database/migrations.md` |
| `routes/*.php`, `app/Http/Controllers/**` | `api/routes.md` |
| `app/Livewire/**/*.php`, matching `resources/views/livewire/**` | `api/routes.md` (if route-mounted) and the owning architecture doc |
| `app/Actions/Fortify/**`, 2FA/passkey Livewire components | `architecture/authentication.md` |
| `config/permission.php`, `HasRoles` usage, role/permission seeding | `architecture/authorization.md` |
| `config/*.php` (queue, cache, session, mail, broadcasting drivers), CI/deploy files | `architecture/overview.md` |
| A new package, or a choice between two valid approaches | new file in `decisions/` (ADR), linked from `README.md` |
| Any convention enforced by Pint/PHPStan/tests that isn't documented yet | `conventions/code-style.md`, `conventions/naming.md`, or `conventions/base-standards.md` |

## Keeping CLAUDE.md in sync

`docs/` is only useful if the agent actually opens it. After any doc changes, make sure `CLAUDE.md` still points at the right files.

### Where the pointer section goes

- Add/update pointer sections **after** the closing `</laravel-boost-guidelines>` tag (or at the end of the file if there's no such block). Never hand-edit *inside* a `<laravel-boost-guidelines>...</laravel-boost-guidelines>` block — it's regenerated by `php artisan boost:install` and edits there get silently discarded.
- One `##` section per top-level `docs/` folder that has real content, using two link styles depending on what the content demands:
  - **Mandatory** — context every agent needs regardless of task (architecture overview, base coding standards): `Mandatory reading: @docs/architecture/*`
  - **Conditional** — detail only needed for a specific kind of task: `If you need information about the schema, read @docs/database/schema.md`
- Prefer a directory-level `@docs/<folder>/*` glob over listing every file individually when the distinction (mandatory vs conditional) is the same for the whole folder.

### 200-line budget

- `CLAUDE.md` must stay at or under 200 lines total — check with `wc -l CLAUDE.md` after editing.
- If the pointer section would push the file over 200 lines:
  1. Move the overflowing detail — the pointer-section prose itself, not the Boost-managed block — into `docs/ai/<topic>.md` (e.g. `docs/ai/reading-guide.md`).
  2. Replace it in `CLAUDE.md` with one link line: `See @docs/ai/reading-guide.md for what to read and when.`
  3. Re-run `wc -l CLAUDE.md` to confirm it's back at or under 200.
- `docs/ai/` holds content whose only purpose is instructing an agent working from `CLAUDE.md`. It isn't part of the human-facing tree in [Documentation tree](#documentation-tree) and doesn't need a `docs/README.md` entry (a link there is fine if it also helps humans, but not required).

## Content rules

- Everything inside `docs/` is written in **English**, regardless of the conversation language.
- One H1 per file. Consistent heading hierarchy (`##`, `###`). Add a table of contents for files longer than ~150 lines.
- Every fenced code block declares its language (`php`, `blade`, `mermaid`, ...).
- Every code example is **real code from this repo**, citing its relative path as the first comment line (e.g. `// app/Actions/Fortify/CreateNewUser.php`). Never invent a generic example when a real one exists — search the repo for one first.
- Every important convention shows a real **✅ Good** and **❌ Bad** pair. If no real "bad" example exists in the repo, adapt a minimal real snippet to illustrate the violation and say so explicitly rather than inventing an unrelated one.
- Every document ends with:
  ```
  _Last updated: <YYYY-MM-DD> — <brief reason for the change>_
  ```
  Update this line (not just prepend) every time the file changes. **Never accumulate a footer changelog.** If the file already carries one or more `_Previously: ...` blocks below the `_Last updated:` line, fold their still-relevant substance into the single current line and delete them — do not add another `_Previously:` block on top. See [Doc growth management](#doc-growth-management) below for why, and `docs/contracts.md`'s Doc Growth Management Rule for the full rationale.

## Doc growth management

`docs/README.md`, `docs/errors-log.md`, `api/routes.md`, `database/schema.md`, `conventions/base-standards.md` and `database/migrations.md` have each independently trended toward (or exceeded) a 150k-character practical limit, every time from the same two causes: an accumulating `_Previously:` footer chain, and a section re-narrating detail another doc already owns in full. This is a recognized, recurring failure mode — check for it on **every** sync pass, not only once a file is already close to the limit. The full rule lives in [docs/contracts.md](../../../docs/contracts.md#doc-growth-management-rule) (the standing agent-contract copy); this is the operational summary to act on while running this skill:

- **Collapse, don't append, the footer.** Per the Content rules bullet above — one current `_Last updated:` line, no `_Previously:` chain.
- **State current facts, not a narrative history.** Avoid "Since task X... corrected by Y..." chains inline; put real historical value in `errors-log.md`, a `decisions/` ADR, or a dedicated section, not repeated in the middle of every affected paragraph.
- **Watch for a section outgrowing its file.** If a section's own size is a large fraction of the whole file, or it keeps needing "Since story N" additions, propose splitting it into its own file (linked from the original) rather than continuing to expand it in place — the same move already applied to `docs/errors-log.md` (archived + topic-indexed).
- **Before trimming a section that re-narrates another doc's detail, verify the detail already lives there in full**, then rewrite the section to state the current contract concisely with a link, per the placement rule above — never delete detail that exists only in the section being trimmed.

## Mermaid diagrams

- `database/schema.md` → `erDiagram` with entities, key attributes, and relationship cardinality (`||--o{`, `}o--o{`, ...).
- `architecture/overview.md` → `flowchart` or `graph` showing real services, the database, queue, and external integrations, with arrows in the real dependency direction.
- Complex business flows (checkout, auth handshakes) → `sequenceDiagram`.
- State machines (order status, workflow states) → `stateDiagram-v2`.
- A diagram is only valid if every node/entity corresponds to something you can point at in the current code (a model, a route, a config binding). Before saving, mentally trace each node back to its source file. Do not add a node for a service or table that doesn't exist yet.

## `errors-log.md` entry format

Fixed structure — do not write free-form prose entries:

```markdown
## <short problem title> — <YYYY-MM-DD>
- **Context**: what was being worked on
- **What happened**: observed symptom/error
- **Root cause**: why it happened
- **Fix applied**: what changed, with a file path or commit/PR reference
- **How to avoid it next time**: a concrete, actionable rule — link to a `conventions/` doc if one covers it
```

Newest entry first (top of file, below the H1).

## Acceptance checklist (self-check before finishing any docs update)

- [ ] `docs/README.md` links to every document that exists, and only those.
- [ ] No concept is explained in two files — cross-cutting topics link to their single source.
- [ ] Every code example cites a real, currently-correct project path.
- [ ] Every diagram traces back to real code, no aspirational nodes.
- [ ] `errors-log.md` entries (if any were added) follow the fixed format.
- [ ] All prose inside `docs/` is in English.
- [ ] Every touched file's footer `_Last updated:_` line is current.
- [ ] No touched file gained or kept an accumulating `_Previously:` footer chain — see [Doc growth management](#doc-growth-management).
- [ ] No section touched this pass is re-narrating detail another doc already owns in full, and no section has silently grown to a large fraction of its file without at least a note that it may need splitting.
- [ ] `CLAUDE.md` links to every doc that should be surfaced (mandatory or conditional), is ≤200 lines, and no edits were made inside a `<laravel-boost-guidelines>` block.
