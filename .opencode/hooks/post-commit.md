# Hook: post-commit

## Intent

After every commit, run lint + typecheck + tests to catch regressions early.

## Trigger

`git commit` succeeds.

## Scope

Both `backend/` and `frontend/` projects are checked. Tests in the changed project are prioritised; full suite runs in `pre-push`.

## Actions

```bash
#!/usr/bin/env bash
# .opencode/hooks/post-commit.sh
set -e

# Detect which projects changed
changed_backend=$(git diff --name-only HEAD~1 HEAD | grep -E '^backend/' || true)
changed_frontend=$(git diff --name-only HEAD~1 HEAD | grep -E '^frontend/' || true)

if [ -n "$changed_backend" ]; then
  echo "→ backend: lint + typecheck + test"
  (cd backend && npm run lint && npm run typecheck && npm test)
fi

if [ -n "$changed_frontend" ]; then
  echo "→ frontend: lint + typecheck + test"
  (cd frontend && npm run lint && npm run typecheck && npm test)
fi

# Always run hexagonal check on backend
if [ -n "$changed_backend" ]; then
  echo "→ hexagonal-check"
  bash .opencode/skills/hexagonal-check/run.sh
fi
```

## Installation

OpenCode has no native hook runner. Options:

1. **Git hook** — copy `post-commit.sh` to `.git/hooks/post-commit` (not versioned).
2. **Husky** — `npx husky add .husky/post-commit ".opencode/hooks/post-commit.sh"`.
3. **CI only** — let the CI pipeline do this work. Use the hook intent as documentation.

Recommended: option 3 for now (CI-only) — fastest setup, no local surprises.

## Failure handling

If lint/typecheck/tests fail, the hook exits with non-zero. The commit is NOT rolled back (already committed) — the user must fix and amend or create a new commit.

## Reference

- TDD cycle: `.opencode/skills/tdd-cycle.md`
- Hexagonal check: `.opencode/skills/hexagonal-check.md`
