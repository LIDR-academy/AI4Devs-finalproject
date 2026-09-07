# CI/CD — Pipeline (GitHub Actions)

> **Status: built.** `.github/workflows/deploy-stage.yml` implements the `verify` job on every push
> and pull request, and the `deploy-stage` job (build → push to `ghcr.io` → call both Render deploy
> hooks, ADR-013) gated to a push on `main`. This document still describes the command surface it is
> built from — read it before changing the workflow, not as a description of something unbuilt.

The remote is GitHub (`origin` → `github.com/igomez-ai4devs-projects/AI4Devs-finalproject`), so the
platform is **GitHub Actions**. The default branch is `main` (`nx.json` → `defaultBase`).

## The gates this workspace actually has

Every one of these runs today and is the real material for a workflow. Do not invent gates beyond
them.

| Gate | Command | What it proves |
|---|---|---|
| Install integrity | `pnpm install --frozen-lockfile` | The lockfile is honoured and exactly one lockfile exists |
| Formatting | `pnpm prettier --check .` | Nothing deviates from `.prettierrc` |
| Lint + boundaries | `pnpm nx run-many -t lint` | ESLint passes, including `@nx/enforce-module-boundaries` |
| **Boundary rule still bites** | `pnpm verify:boundaries` | Deliberate violations are still rejected — see below |
| Unit tests | `pnpm nx run-many -t test` | Today: that the runner works. Both suites are empty (`passWithNoTests`) |
| Build | `pnpm nx run-many -t build` | `api` and `web` compile |
| Changed-only | `pnpm nx affected -t lint test build` | The same, restricted to what changed against `main` |

**`verify:boundaries` is the gate that cannot be replaced by lint.** A green lint over legal code
shows the configuration loads; it never shows an illegal import would be caught. The harness
scaffolds throwaway projects carrying one deliberate violation each, asserts every one is rejected,
checks three legal control edges are *not* rejected, and removes the scaffolding. Run it on every
pipeline execution, and always after a change to the tag vocabulary, the type matrix or
`depConstraints`.

**Not yet runnable in a pipeline:** `pnpm nx e2e api-e2e | web-e2e` (neither project exists until
`T-C10-06`) and any TypeORM migration command (no data source until `T-C10-16`).

## Runner setup — the parts that are easy to get wrong

**Node must be pinned to 22 and verified.** `engines.node` is `>=22.0.0 <23.0.0` and `.nvmrc` says
`22`. Prefer `actions/setup-node` with `node-version-file: .nvmrc` so the runner and the repository
cannot drift apart. If you ever use a third-party container image instead, read the gotcha about
image tags not pinning their own Node.

**pnpm before Node.** `pnpm/action-setup` must run before `actions/setup-node` if you want
`cache: 'pnpm'` to work — the Node action needs pnpm on `PATH` to resolve the store location.
Install with `--frozen-lockfile`; anything else defeats the point of committing a lockfile.

**Nx cache.** `.nx/cache` is local and gitignored. Restore it across runs keyed on the lockfile plus
the source, or accept cold builds. `nx affected` needs history to diff against `main`, so
`actions/checkout` requires `fetch-depth: 0` — with the default shallow clone, `affected` cannot
compute a base and either fails or silently treats everything as affected.

**Cypress needs two things pnpm does not give it by default.** pnpm 10 blocks postinstall scripts,
which is where Cypress downloads its binary, so the workspace needs an explicit build-script
allowlist. And the binary itself lives outside the workspace in the user cache — cache that path
explicitly or it re-downloads on every run. Since `@nx/cypress` is not installed (ADR-011), there is
no `e2e-ci` target and no `ciWebServerCommand`: the workflow starts the application itself, or the
`e2e` target's `dependsOn` does.

**Artifact and cache paths must be relative to the workspace.** A path outside the checkout is not
archived; copy it into the workspace first, then cache the relative path.

## Job shape — as built in `deploy-stage.yml`

1. **`verify`** — runs on every push and pull request: checkout with full history, pnpm before Node
   (`.nvmrc`), `pnpm install --frozen-lockfile`, `prettier --check`, `nx run-many -t lint test build`,
   `verify:boundaries`, then uploads `dist/` as an artifact so `deploy-stage` never rebuilds it.
2. **`deploy-stage`** — `needs: verify`, gated to `github.ref == 'refs/heads/main'` on a `push` event
   only (never a PR, never another branch — Render has one stage environment, no previews). Downloads
   the `dist/` artifact, logs in to `ghcr.io` with the built-in `GITHUB_TOKEN` (`packages: write`),
   builds and pushes both images via `docker compose -f docker/docker-compose.stage.yml build|push`,
   then calls both Render deploy hooks with `imgURL` pinned to the commit SHA that was just pushed.

Not yet added, and deliberately: an **`acceptance`** job for the Cypress suites — blocked on
`T-C10-06` — and any `typeorm migration:*` step — blocked on `T-C10-16`. Adding either now would be a
gate this repository cannot actually pass.

`concurrency` is keyed on `github.ref` so a new push cancels the previous run for that ref, and every
action is pinned by commit SHA (with the version tag as a trailing comment) rather than a mutable tag.

## Rules

- **Pin everything**: actions by tag or SHA, images by a tag whose contents you verified.
- **No secrets in the workflow file** — GitHub Secrets and environment variables only.
- **The pipeline must not be the only place a gate runs.** Everything in the table above runs
  locally with the same command, and that is deliberate: a contributor can reproduce a red pipeline
  without pushing.
- **Never weaken a gate to make the pipeline green.** A failing boundary probe means the rule broke,
  not that the probe is inconvenient.
