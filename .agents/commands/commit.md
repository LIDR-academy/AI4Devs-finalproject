---
description: Commit staged/unstaged changes using Conventional Commits (no Claude co-author)
argument-hint: "[optional type/scope or message hint, e.g. 'fix(auth)' or 'bump deps']"
---

# Commit (Conventional Commits)

Commit the current changes following the [Conventional Commits](https://www.conventionalcommits.org/) spec. Optional hint: $ARGUMENTS

<critical>NEVER add a `Co-Authored-By: Claude` line (or any Claude/AI co-author/attribution) to the commit message or body.</critical>

## Steps

1. **Confirm the repo.** Everything lives in this single monorepo: shared libs under `libs/*` and all apps under `apps/*`. Run `git` from the repo root (`git rev-parse --show-toplevel`). Do not try to commit files outside the repo (e.g. workspace-level `tickets/**`).

2. **Inspect.** Run `git status --short` and `git diff` (and `git diff --staged`) to understand every change. If nothing is changed, stop and report that.

3. **Safety on default branch.** Run `git rev-parse --abbrev-ref HEAD`. If it is the repo's default branch (`main`/`master`), do NOT commit directly — create a topic branch first (derive a short kebab name from the work) and tell the user. On any other branch, proceed.

4. **Group logically and order by dependency.** If the changes form one coherent unit, make a single commit. Otherwise split into multiple conventional commits — one per package/concern, never a catch-all — and commit them in an order where each commit stands on its own (builds/tests conceptually pass without the later ones):
   1. shared contracts first (types, interfaces)
   2. then libs, dependencies before dependents (e.g. `services` → `hooks` → `providers`/`components` → feature libs)
   3. then apps that consume them (`app`, `web-*`)
   4. last: tooling/config/docs-only changes (root configs, `.gitignore`, lockfiles not tied to a code commit)
   Keep a source change and its tests/stories in the SAME commit. Generated files (e.g. `Podfile.lock`, `yarn.lock`) go with the commit that caused them.

5. **Compose the message.** Format: `type(scope): subject`
   - **type** — one of: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`. Infer it from the diff (new behavior → `feat`; bug fix → `fix`; tests only → `test`; deps/tooling → `chore`/`build`).
   - **scope** — the affected package short name from `libs/<name>` or `apps/<name>` (e.g. `oe-rn-components`, `oe-app`, `live-classes`). Omit if it spans many packages.
   - **subject** — imperative mood, lowercase, no trailing period, ≤ ~72 chars.
   - **body** (optional) — wrap at ~72 cols; explain *what* and *why*, not *how*. Add a footer line referencing the ticket if is present in the branch name or $ARGUMENTS.
   - **breaking changes** — if any, add `!` after type/scope and a `BREAKING CHANGE:` footer.
   - Honor $ARGUMENTS as a hint (e.g. a forced type/scope or a one-line summary), but still verify it fits the actual diff.

6. **Commit.** Stage the intended files (`git add <paths>` — avoid blanket `git add -A` if there are unrelated changes) and commit. Pass the message via repeated `-m` flags or a heredoc. **Do not** include any Claude/AI co-author or "Generated with" attribution.

7. **Report.** Show the resulting `git log -1 --stat` (short) and the branch. Do NOT push unless the user explicitly asks.

8. Add the commit to the progress history file in the progress folder: progress/history.md

## Example messages

- `feat(login): add login screen`
- `fix(app): update lesson status when closing player via X button`
- `fix(auth): prevent token refresh loop on 401`
- `chore(deps): bump expo to 52`
- `refactor(components)!: drop deprecated Button color prop`
