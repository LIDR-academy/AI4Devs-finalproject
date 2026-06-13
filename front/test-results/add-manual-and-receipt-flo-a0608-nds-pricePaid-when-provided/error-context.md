# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: add/manual-and-receipt-flow.ui.spec.ts >> Add flows: manual and receipt review >> manual entry sends pricePaid when provided
- Location: tests/e2e/add/manual-and-receipt-flow.ui.spec.ts:7:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/auth/register
    - user-agent: Playwright/1.60.0 (arm64; macOS 26.5) node/26.0
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 76

```