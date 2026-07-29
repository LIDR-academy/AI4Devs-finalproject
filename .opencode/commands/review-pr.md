# Command: /review-pr

## Description

Runs the **reviewer** agent on the current staged diff (or branch against main). Produces a categorised findings list and proposed fixes.

## Usage

```
/review-pr
/review-pr --branch feature-entrega2-DMM
/review-pr --focus hexagonal
```

## Flags

- `--branch <name>` — review a branch against `main` (default: staged diff)
- `--focus <area>` — narrow review to `hexagonal`, `tdd`, `coverage`, `fr-alignment`, or `all` (default: `all`)

## What it does

1. `git diff` (or `git diff main...<branch>`)
2. Apply reviewer rubric from `.opencode/agents/reviewer.md`
3. Run `hexagonal-check` skill on changed files
4. Run coverage report if `domain/` changed
5. Cross-reference each behaviour with FR numbers
6. Produce findings list
7. Propose concrete fixes for each critical/important finding
8. Output to terminal and (optionally) a `docs/evidence/review-<timestamp>.md`

## Output format

```
## Review Summary
- Files changed: 12
- Lines added: +340
- Lines removed: -45
- Domain coverage: 87% (≥80% ✓)

## Findings

### Critical (1)
1. **backend/src/api/routes/listings.ts:42** — `domain` directory imports from `express` (cors middleware). Violates Principle I. Fix: move middleware invocation to adapter layer or wrap in a domain port.

### Important (2)
1. **backend/src/domain/services/AnalyzeListingUseCase.ts:18** — No test for the case where `GeocodingAdapter` returns null. Add test: "given no coordinates, skip catastro but continue analysis".

### Minor (3)
1. ...
```
