# E2E Tests with Playwright

This project uses [Playwright](https://playwright.dev) for end-to-end testing of Storybook components. Tests live in each workspace's `tests/e2e/` folder, mirroring the `src/` path of the component/story they cover, using the `*.e2e.js` naming convention.

## Setup

Playwright is installed at the root level as a shared devDependency.

```bash
pnpm install
```

## Running Tests

### From workspace directory (recommended)
```bash
cd libs/components && pnpm test:e2e
cd libs/lib-with-storybook && pnpm test:e2e
```

### From monorepo root using pnpm filter
```bash
pnpm --filter @helsoft/components test:e2e
pnpm --filter @helsoft/lib-with-storybook test:e2e
```

### Watch mode
```bash
cd libs/components && npx playwright test --watch
```

### UI mode (interactive testing dashboard)
```bash
cd libs/components && npx playwright test --ui
```

### Specific browser
```bash
cd libs/components && npx playwright test --project=chromium
```

### View test report
```bash
cd libs/components && npx playwright show-report
```

## Test Structure

Tests live under each workspace's `tests/e2e/` folder, mirroring the component's path under `src/`, using the `.e2e.js` naming suffix. For example:

**Components library:**
- `libs/components/tests/e2e/atoms/card/card.e2e.js` — Card component tests
- `libs/components/tests/e2e/molecules/slide-progress/slide-progress.e2e.js` — SlideProgress tests
- `libs/components/tests/e2e/molecules/text-field/text-field.e2e.js` — TextField tests

**Lib-with-Storybook:**
- `libs/lib-with-storybook/tests/e2e/stories/button/button.e2e.js` — Button component tests

Each Playwright config discovers tests matching `**/*.e2e.js` in the `tests/e2e/` directory.

## Writing Tests

Create a `{component}.e2e.js` file under `tests/e2e/`, at the same relative path as the component's story file under `src/` (e.g. `src/atoms/card/card.stories.tsx` → `tests/e2e/atoms/card/card.e2e.js`). Tests access Storybook stories via URL patterns. Stories are rendered inside an iframe, so use `frameLocator()` to access them:

```javascript
const { test, expect } = require('@playwright/test');

test('Button renders', async ({ page }) => {
  await page.goto('/?path=/story/example-button--primary');
  
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  const button = canvas.locator('button');
  
  await expect(button).toBeVisible();
  await expect(button).toContainText('Button');
});
```

**File naming:** `{ComponentName}.e2e.js`  
**Location:** `tests/e2e/`, mirroring the component's path under `src/`

## Configuration

Each workspace has its own `playwright.config.js`:
- **Components** (`libs/components/playwright.config.js`):
  - Discovers: `tests/e2e/**/*.e2e.js`
  - Port: 6007
- **Lib-with-Storybook** (`libs/lib-with-storybook/playwright.config.js`):
  - Discovers: `tests/e2e/**/*.e2e.js`
  - Port: 6006

Both auto-start Storybook on `pnpm dev`.

## CI/CD

In CI environments (when `process.env.CI` is set), tests run with:
- 2 retries for flaky tests
- 1 worker (serial execution)
- Fresh servers (no reuse of existing servers)

## Test Results

After running tests, artifacts are saved in each workspace:
- `test-results/` — detailed test results and traces
- `playwright-report/` — HTML report with screenshots/videos on failure

View with:
```bash
npx playwright show-report
```
