# Playbook: release

## Purpose

Produce a release artefact: tag, CHANGELOG entry, version bump, and `readme.md` note. Used at the end of a delivery (e.g., end of Entrega 2, end of final delivery).

## When to use

- At the end of a delivery (Entrega 1, Entrega 2, final)
- When the user requests a release tag

## Steps

### Step 1: Verify state

```bash
git status
git log --oneline main..HEAD
```

Confirm:

- All tests pass (`npm test` in backend, frontend, e2e)
- All ADRs are in `Accepted` state
- All `docs/evidence/INDEX.md` is current
- `readme.md` and `prompts.md` are up to date

### Step 2: Generate CHANGELOG

```bash
git log --oneline <last-tag>..HEAD
```

Write a human-readable CHANGELOG entry. Sections:

- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be-removed features
- **Removed** — now-removed features
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

### Step 3: Bump version

In `backend/package.json` and `frontend/package.json`, bump the version following semver:

- **Patch** (x.y.Z) — bug fixes, no breaking changes
- **Minor** (x.Y.0) — new features, backward compatible
- **Major** (X.0.0) — breaking changes

For Realista deliveries, use minor (e.g., `0.2.0` for Entrega 2).

### Step 4: Commit version bump

```bash
git add backend/package.json frontend/package.json CHANGELOG.md
git commit -m "chore(release): bump to v0.2.0 — Entrega 2"
```

### Step 5: Tag

```bash
git tag -a v0.2.0 -m "Entrega 2 — MVP code + AI engineering setup"
git push origin v0.2.0
```

### Step 6: Update readme.md

Add a release section with:

- Tag name
- Date
- Summary of what was delivered
- Link to the milestone's evidence report (`/evidence-report`)

### Step 7: Generate evidence report

```bash
@evidence-report --output docs/evidence/REPORT-<tag>.md
```

### Step 8: Notify

If the delivery is for a cohort, submit the form with the tag URL.

## Anti-patterns

- Tagging on a branch that has failing tests
- Forgetting to bump both `package.json` files
- Skipping the CHANGELOG entry
- Tagging without pushing (`git push origin v0.2.0`)

## Reference

- Semver: https://semver.org
- Conventional Commits: https://www.conventionalcommits.org
- Evidence report: `.opencode/commands/evidence-report.md`
