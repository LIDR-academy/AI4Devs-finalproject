# Command: /evidence-report

## Description

Generates an aggregate report of all evidence files in `docs/evidence/` for milestone reviews (e.g., end of Entrega 2, end of final delivery).

## Usage

```
/evidence-report
/evidence-report --since 2026-07-01
/evidence-report --story US1
/evidence-report --output report.md
```

## Flags

- `--since <date>` — only evidence after this date
- `--story <US-id>` — only evidence for this US
- `--output <path>` — write to file instead of stdout

## What it produces

A summary grouped by US, with:

- Total tasks completed
- Total tests added
- Total lines added/removed
- Critical findings encountered
- Time elapsed
- Final coverage

## Example output

```
# Evidence Report — Entrega 2 (2026-07-08 to 2026-07-08)

## US1 — Listing Lens
- Tasks: 22/22
- Tests: 35 added (33 unit, 2 integration)
- Coverage (domain): 87%
- Critical findings: 0
- Time: 47 min

## US2 — Mortgage Compass
- Tasks: 18/18
- Tests: 24 added
- Coverage (domain): 82%
- Critical findings: 1 (fixed: LLM was being used in narrative generation; replaced with templates)
- Time: 38 min

## Totals
- Tasks: 40/127
- Tests: 59
- Coverage: 84% avg
- Critical findings: 1 (all fixed)
```
