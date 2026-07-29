# Command: /scaffold-story

## Description

Creates the folder structure and stub files for a user story, ready for the `implementer` agent to fill in.

## Usage

```
/scaffold-story <us-id>
/scaffold-story US1
```

## What it creates

For each US, this command creates:

```
backend/
├── tests/unit/domain/value-objects/<us-id>-*.test.ts    # placeholder
├── tests/unit/domain/services/<us-id>-*.test.ts
├── tests/integration/api/<us-id>.test.ts
├── src/domain/value-objects/<us-id>-*.ts                # stub
├── src/domain/ports/<us-id>-*.ts
├── src/domain/services/<us-id>-*.ts
├── src/adapters/<us-id>/<us-id>-Adapter.ts
└── src/api/routes/<us-id>.ts

frontend/src/routes/<us-slug>/
├── +page.svelte        # placeholder UI
└── +page.server.ts     # placeholder server-side call
```

The stub files contain a `// TODO: implement` comment, an empty function/exports block, and a docstring pointing to the relevant FRs.

## Naming convention

- US1 → `listing-lens`
- US2 → `mortgage-compass`
- US3 → `dashboard`
- US4 → `negotiation`
- US5 → `timeline`
- US6 → `checklist`

## Idempotent

If the structure already exists, `/scaffold-story` reports what is missing and offers to create only the missing pieces.
