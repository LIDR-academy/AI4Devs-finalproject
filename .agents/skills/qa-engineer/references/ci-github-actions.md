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

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Unit Tests
        run: npm run test:coverage

      - name: Upload Coverage Report
        uses: actions/upload-artifact@v4
        with:
          name: code-coverage
          path: coverage/

  e2e_tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    needs: unit_tests
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E Tests
        run: npm run test:e2e

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

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Run A11y Audit
        run: npm run test:a11y
```
