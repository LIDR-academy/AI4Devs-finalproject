# E2E BDD Test Structure

This folder contains end-to-end tests written with Playwright using a BDD-style organization.

## Structure

- `bdd/features/*.feature`: Gherkin scenarios (business-readable behavior)
- `bdd/specs/*.spec.ts`: Playwright executable scenarios mapped to Gherkin features
- `bdd/steps.ts`: reusable Given/When/Then step implementations
- `bdd/support/test-data.ts`: dynamic deterministic data factory for E2E runs
- `bdd/support/workflow.ts`: reusable UI workflow helpers

## Current Features

- `bdd/features/estimation_smoke.feature`
- `bdd/features/estimation_regression.feature`

## Run Commands

- Full E2E suite: `npm run test:e2e`
- Smoke only: `npm run test:e2e:smoke`
- Regression only: `npm run test:e2e:regression`

## Naming Convention

Each Playwright test title mirrors its feature/scenario:

- `Feature: <feature_name> / Scenario: <scenario_name>`

This keeps traceability between executable tests and Gherkin definitions.

## Legacy Folders

- `e2e/fixtures` and `e2e/utils` are legacy empty folders left from the pre-BDD layout.
- They are not used by Playwright execution because `testDir` points to `e2e/bdd/specs`.
