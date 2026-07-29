# Skill: hexagonal-check

## Purpose

Verifies that the `backend/src/domain/` layer has zero framework or IO dependencies, preserving the constitutional principle of hexagonal architecture (Principle I, NON-NEGOTIABLE).

## When to invoke

- Pre-commit (in `post-commit` hook intent, see `.opencode/hooks/post-commit.md`)
- During every `/review-pr`
- After any refactor that touches `backend/src/domain/`
- In CI as a dedicated job (`.github/workflows/ci.yml`)

## Inputs

- (none — operates on the whole repo)

## Outputs

- A pass/fail verdict
- A list of violations with file:line and proposed fix

## Forbidden imports in `backend/src/domain/`

| Source | Reason |
|---|---|
| `express` | Web framework belongs in `api/` |
| `@prisma/client` | Database ORM belongs in `infrastructure/` |
| `svelte`, `@sveltejs/*` | Frontend framework, must not leak into backend |
| `node-fetch`, `axios`, `undici` | HTTP clients belong in `adapters/` |
| `cheerio` | HTML parser belongs in `adapters/cheerio/` |
| `dotenv` | Config must be injected, not imported |
| `fs`, `path` (outside `value-objects/`) | IO belongs in `infrastructure/` |
| `winston`, `pino`, `console.*` | Logging must be a port |
| `ioredis`, `kafkajs`, etc. | Other IO clients |

## Implementation (bash + grep)

```bash
# Scan domain for forbidden imports
forbidden='express|@prisma/client|svelte|@sveltejs|node-fetch|axios|undici|cheerio|dotenv|fs|path|console'
violations=$(grep -rE "import .* from ['\"](" "$forbidden")['\"]" backend/src/domain/ 2>/dev/null)

if [ -z "$violations" ]; then
  echo "hexagonal-check: PASS"
  exit 0
else
  echo "hexagonal-check: FAIL"
  echo "$violations"
  exit 1
fi
```

## Allowed exceptions

- `backend/src/domain/value-objects/SnapshotHash.ts` may import `crypto` from Node (built-in, no external dep).
- `backend/src/domain/services/ProgressEvents.ts` may use Node's `EventEmitter` from `events` (built-in).

These are documented in the corresponding files.

## Example violation

```typescript
// backend/src/domain/services/AnalyzeListingUseCase.ts
import * as cheerio from 'cheerio';  // ❌ forbidden

// Fix: move cheerio to adapter, inject parsed text into use case
```

## Example pass

```
$ bash .opencode/skills/hexagonal-check/run.sh
hexagonal-check: PASS
```
