# Command: /check-architecture

## Description

Runs the `hexagonal-check` skill across the repository to ensure the domain layer has zero framework dependencies.

## Usage

```
/check-architecture
/check-architecture --strict
```

## Flags

- `--strict` — fail on any `import` from the domain layer that touches an IO library (default: warn)

## What it checks

The `backend/src/domain/` directory MUST NOT import from:

- `express` or any Express middleware
- `@prisma/client`
- `node-fetch`, `axios`, `undici`
- `cheerio`
- `dotenv` (config must be injected)
- `fs`, `path` (except in `value-objects/` for hash computation)

The `frontend/src/lib/` (stores, utils) MUST NOT import from `backend/` directly — only via `api/client.ts`.

## Output

```
## Architecture Check
- Files scanned: 47
- Domain files: 12
- Forbidden imports found: 0 ✓

## Verdict
PASS — domain layer is pure.
```

Or, on failure:

```
## Architecture Check
- Files scanned: 47
- Domain files: 12
- Forbidden imports found: 2 ✗

## Violations
1. `backend/src/domain/services/AnalyzeListingUseCase.ts:5`
   - Imports: `import cheerio from 'cheerio';`
   - Fix: extract HTML parsing to `adapters/cheerio/CheerioAdapter.ts` and inject the parsed text into the use case.

2. ...
```
