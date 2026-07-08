# Hook: pre-push

## Intent

Before pushing to remote, run the full test suite (unit + integration + e2e with mocks) to ensure the remote build will pass.

## Trigger

`git push` initiated.

## Scope

Both `backend/` and `frontend/`. Includes integration tests with mocked external APIs.

## Actions

```bash
#!/usr/bin/env bash
# .opencode/hooks/pre-push.sh
set -e

echo "→ backend: full test suite"
(cd backend && npm run lint && npm run typecheck && npm run test:unit && npm run test:integration)

echo "→ frontend: full test suite"
(cd frontend && npm run lint && npm run typecheck && npm test)

echo "→ e2e: Playwright (mocked APIs)"
(cd e2e && npx playwright test)

echo "→ hexagonal-check"
bash .opencode/skills/hexagonal-check/run.sh
```

## Skipping

To skip (e.g., pushing a WIP commit), use `git push --no-verify`. This is a `pre-push` hook, so the standard git bypass applies.

## E2E with real APIs

Real-API E2E runs only in nightly (see `.github/workflows/nightly.yml`), not in `pre-push`. This keeps the local loop fast.

## Reference

- TDD cycle: `.opencode/skills/tdd-cycle.md`
- Playwright config: `e2e/playwright.config.ts`
