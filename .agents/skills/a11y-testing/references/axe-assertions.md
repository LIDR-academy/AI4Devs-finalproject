# Axe-Core Automated Accessibility Integration & Assertions Reference

This document provides setup, configuration details, and test templates for integrating `axe-core` across E2E and component-level testing libraries.

## 1. Playwright Integration (`@axe-core/playwright`)

### Installation
```bash
npm install --save-dev @axe-core/playwright
```

### Shared Playwright Test Fixture (a11y-fixture.ts)
```typescript
import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type A11yFixture = {
  makeA11yBuilder: () => AxeBuilder;
};

export const test = base.extend<A11yFixture>({
  makeA11yBuilder: async ({ page }, use) => {
    const makeBuilder = () => new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
    await use(makeBuilder);
  },
});

export { expect };
```

### Usage in E2E Tests
```typescript
import { test, expect } from './a11y-fixture';

test('should have no accessibility violations on load', async ({ page, makeA11yBuilder }) => {
  await page.goto('/dashboard');
  const results = await makeA11yBuilder().analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 2. Cypress Integration (`cypress-axe`)

### Installation
```bash
npm install --save-dev cypress-axe axe-core
```

### Support Configuration (`cypress/support/e2e.js`)
```javascript
import 'cypress-axe';
```

### Usage in Cypress Specs
```javascript
describe('Accessibility Audits', () => {
  it('checks the landing page', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
      }
    });
  });
});
```

---

## 3. Jest Integration (`jest-axe`)

### Installation
```bash
npm install --save-dev jest-axe @types/jest-axe
```

### Setup file (`jest.setup.js`)
```javascript
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);
```

### Component Test Example (React)
```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Button from './Button';

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 4. Standalone Audit Runner (Pa11y)

### Running on-demand audits
```bash
npx pa11y https://localhost:3000/login --reporter cli --standard WCAG2AA
```
