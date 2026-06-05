# GitHub Actions CI Workflow Template

This reference document contains the default pipeline configuration for projects running on GitHub Actions.

## Default Workflow File (`.github/workflows/testing.yml`)

```yaml
name: Testing Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit_tests:
    name: Unit Testing & Coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 11

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Unit Tests
        run: pnpm run test:coverage

      - name: Upload Coverage Report
        uses: actions/upload-artifact@v4
        with:
          name: code-coverage
          path: coverage/

  mutation_tests:
    name: Mutation Testing
    runs-on: ubuntu-latest
    needs: unit_tests
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 11

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Mutation Tests
        run: pnpm run test:mutation

      - name: Upload Mutation Report
        uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: reports/mutation/

  e2e_tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    needs: unit_tests
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 11

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E Tests
        run: pnpm run test:e2e

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  a11y_tests:
    name: Accessibility Compliance
    runs-on: ubuntu-latest
    needs: e2e_tests
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 11

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run A11y Audit
        run: pnpm run test:a11y
```
