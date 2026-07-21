# Errors Log

A structured log of real mistakes made in this project and the concrete rule adopted to avoid repeating them. Not a general bug tracker — only entries that produced a lasting convention belong here. No incidents have been logged yet.

## Entry format

Newest entry first, directly below this line. Every entry uses this exact structure:

```markdown
## <short problem title> — <YYYY-MM-DD>
- **Context**: what was being worked on
- **What happened**: observed symptom/error
- **Root cause**: why it happened
- **Fix applied**: what changed, with a file path or commit/PR reference
- **How to avoid it next time**: a concrete, actionable rule — link to a `conventions/` doc if one covers it
```

## Gherkin scenarios written with a generic "I" and bundled multi-action steps — 2026-07-21

- **Context**: `product-owner` agent writing the first project-level PRD (`docs/PRD/PRD.md`), covering five epics with Gherkin scenarios per capability.
- **What happened**: several scenarios used a generic, roleless `Given I have permission to manage products` / `When I create, rename, and delete...` style — no named business-role actor, and multiple distinct actions (create + rename + delete) bundled into a single scenario instead of one scenario per action.
- **Root cause**: `docs/workflow.md`'s User Story template shows a bare `Given <context> / When <action> / Then <expected result>` Gherkin skeleton with no actor or single-action guidance. This project already had the right rules written down — rule 1 ("Imperative vs. declarative scenarios", which models good examples as third-person business-role actors like "a registered user", never "I") and rule 3 ("Single When per scenario") in [testing/frontend/gherkin-guidelines.md](testing/frontend/gherkin-guidelines.md#1-imperative-vs-declarative-scenarios) — but that file frames itself as a browser-test-translation guide, and nothing in `workflow.md` or the `product-owner` agent definition pointed there when writing PRD/User-Story-level Gherkin, so the existing rules weren't applied outside `tests/Browser/`.
- **Fix applied**: rewrote every scenario in `docs/PRD/PRD.md` to open with a named business-role actor (e.g. `Given a catalog administrator`, not `Given I ...`) and to cover exactly one action per scenario, splitting bundled CRUD scenarios into one scenario per operation (e.g. "Create a product category" / "Rename a product category" / "Delete a product category" instead of one scenario doing all three). Added a cross-reference from `docs/workflow.md`'s User Story template to `testing/frontend/gherkin-guidelines.md`.
- **How to avoid it next time**: [testing/frontend/gherkin-guidelines.md](testing/frontend/gherkin-guidelines.md)'s rules 1 and 3 apply to **every** Gherkin scenario written in this project, not just browser-test translations — PRDs (`docs/PRD/`) and per-task User Stories (`ai-spec/tasks/`) included. Before writing or reviewing any scenario: open with a named business-role actor (`a catalog administrator`, `a store customer`, never `I`), and if a scenario needs a second `When`, split it into two scenarios instead.

_Last updated: 2026-07-21 — Logged the Gherkin actor/single-action convention violation found in the first PRD draft and the cross-reference fix applied to `workflow.md`._
