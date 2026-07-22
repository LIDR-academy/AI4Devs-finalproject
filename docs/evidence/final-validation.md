# Final Validation Evidence

Branch: v1.0-final-GV
Date: 2026-07-21

## Backend

- Command: `npm run typecheck --prefix app/backend`
- Result: PASS

- Command: `npm run test --prefix app/backend`
- Result: PASS (16/16)

## Frontend

- Command: `npm run test --prefix app/frontend`
- Result: PASS (4/4)

- Command: `npm run build --prefix app/frontend`
- Result: PASS

## E2E (T11)

- Command: `DATABASE_URL='postgresql://gianella.vezzoni@127.0.0.1:5432/projectscope_e2e_local?schema=public' npm run test:e2e --prefix app/frontend`
- Result: PASS (2/2)
- Notes: Playwright executed with 1 worker and completed full happy path + failing path scenario.
