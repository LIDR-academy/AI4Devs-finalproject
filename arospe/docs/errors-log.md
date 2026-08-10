# Errors Log

A structured log of real mistakes made in this project and the concrete rule adopted to avoid repeating them. Not a general bug tracker — only entries that produced a lasting convention belong here.

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

## A row carrying the configured email was treated as proof of mailbox ownership — 2026-08-09

- **Context**: task 0002 (`ai-spec/tasks/.../0002-seed-roles-permissions-catalog.md`), bootstrapping the `Super Admin` role from `SUPER_ADMIN_EMAIL` in `database/seeders/RolePermissionSeeder.php`.
- **What happened**: the Phase 3 implementation looked up `User::where('email', $email)->first()` and granted `Super Admin` to whatever row came back (warning and skipping when nothing matched). `appsec-auditor` flagged it as a privilege-escalation path: a `users` row merely *carrying* an address proves nothing about who controls that mailbox.
- **Root cause**: leaving `SUPER_ADMIN_EMAIL` unset at first deploy is a documented, supported state, and self-registration is enabled — so during that window anyone can register the address the operator intends to use later. Worse, `App\Livewire\Settings\Profile::updateProfileInformation()` lets any signed-in user point their **existing** account at an arbitrary address: it nulls `email_verified_at` but writes the new address to `users.email` immediately, with no re-verification. Either way the squatter is handed Super Admin the moment an operator sets the config and reseeds.
- **Fix applied**: the lookup in [`database/seeders/RolePermissionSeeder.php`](../database/seeders/RolePermissionSeeder.php) now carries `whereNotNull('email_verified_at')`, so verification is part of the **match condition** rather than a check bolted on afterwards, and a fifth branch was added for the address being occupied by an *unverified* account: abort loudly (console error + `Log::warning`), grant the role to nobody, insert no second account, send no mail, and `return` rather than throw so the roles and the 38-permission catalog still commit. The full decision tree is documented in [architecture/authorization.md](architecture/authorization.md#super-admin-bootstrap); the general rule is in [security/seeder-safety.md](security/seeder-safety.md#a-matching-row-is-not-proof-of-ownership).
- **How to avoid it next time**: **an existing row with the right email is not proof of mailbox ownership.** Any code that grants privilege by matching a configured or user-supplied address must require proof of control — `whereNotNull('email_verified_at')` — as part of the query, not as a follow-up `if`. When neither granting (unproven ownership) nor creating (address taken) is safe, abort with a `return` and an operator-actionable message; never throw from inside a seeder transaction that also writes required application data, and never resolve the ambiguity on the seeder's own initiative by verifying, renaming, or deleting the occupying account.

## Gherkin scenarios written with a generic "I" and bundled multi-action steps — 2026-07-21

- **Context**: `product-owner` agent writing the first project-level PRD (`docs/PRD/PRD.md`), covering five epics with Gherkin scenarios per capability.
- **What happened**: several scenarios used a generic, roleless `Given I have permission to manage products` / `When I create, rename, and delete...` style — no named business-role actor, and multiple distinct actions (create + rename + delete) bundled into a single scenario instead of one scenario per action.
- **Root cause**: `docs/workflow.md`'s User Story template shows a bare `Given <context> / When <action> / Then <expected result>` Gherkin skeleton with no actor or single-action guidance. This project already had the right rules written down — rule 1 ("Imperative vs. declarative scenarios", which models good examples as third-person business-role actors like "a registered user", never "I") and rule 3 ("Single When per scenario") in [testing/frontend/gherkin-guidelines.md](testing/frontend/gherkin-guidelines.md#1-imperative-vs-declarative-scenarios) — but that file frames itself as a browser-test-translation guide, and nothing in `workflow.md` or the `product-owner` agent definition pointed there when writing PRD/User-Story-level Gherkin, so the existing rules weren't applied outside `tests/Browser/`.
- **Fix applied**: rewrote every scenario in `docs/PRD/PRD.md` to open with a named business-role actor (e.g. `Given a catalog administrator`, not `Given I ...`) and to cover exactly one action per scenario, splitting bundled CRUD scenarios into one scenario per operation (e.g. "Create a product category" / "Rename a product category" / "Delete a product category" instead of one scenario doing all three). Added a cross-reference from `docs/workflow.md`'s User Story template to `testing/frontend/gherkin-guidelines.md`.
- **How to avoid it next time**: [testing/frontend/gherkin-guidelines.md](testing/frontend/gherkin-guidelines.md)'s rules 1 and 3 apply to **every** Gherkin scenario written in this project, not just browser-test translations — PRDs (`docs/PRD/`) and per-task User Stories (`ai-spec/tasks/`) included. Before writing or reviewing any scenario: open with a named business-role actor (`a catalog administrator`, `a store customer`, never `I`), and if a scenario needs a second `When`, split it into two scenarios instead.

_Last updated: 2026-08-10 — Logged the task 0002 privilege-escalation incident: a `users` row carrying `SUPER_ADMIN_EMAIL` was treated as proof of mailbox ownership; the rule adopted is that a privilege grant keyed on an address must require `email_verified_at` inside the lookup itself._
