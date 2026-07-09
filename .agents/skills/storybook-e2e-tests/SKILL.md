---
name: storybook-e2e-tests
description: Write Playwright end-to-end tests for Storybook-rendered UI components in this monorepo — `libs/components`, `libs/lib-with-storybook`, or any new Storybook-enabled lib. Use when adding a `.e2e.js` test for a `.stories.tsx` file, adding more test cases to an existing `.e2e.js`, or wiring up Playwright for a workspace that doesn't have it yet. Trigger on "e2e test", "playwright test", "storybook test", "test this component", "add e2e for <component>". Do NOT use for hooks/services/DAOs/non-visual logic — see the "When not to use this" section, those get Jest instead.
---

# Storybook + Playwright E2E Tests

Playwright drives a real browser against a running Storybook instance and asserts on rendered
stories. It's for **Storybook-backed UI components** only.

## When not to use this

Hooks, services, DAOs, and any non-visual logic get Jest unit tests
(`*.service.test.ts`, `*.dao.test.ts`, `use-*.test.ts`), not Playwright. If the thing you're
testing has no `.stories.tsx`, this skill doesn't apply — stop and use Jest instead.

## The one tricky part: deriving the story URL

A story renders at `/?path=/story/{title-slug}--{export-slug}`. Both halves come from the
`.stories.tsx` file, not from the component name:

1. **`{title-slug}`** — the story's `title` field, lowercased, `/` replaced with `-`.
2. **`{export-slug}`** — the named export for the specific story, kebab-cased.

Worked examples from this repo:

| `title` in `.stories.tsx` | named export | URL path |
|---|---|---|
| `'Atoms/Card'` | `Elevated` | `atoms-card--elevated` |
| `'Molecules/SlideProgress'` | `Default` | `molecules-slide-progress--default` |
| `'Example/Button'` | `Primary` | `example-button--primary` |
| `'Example/Button'` | `Secondary` | `example-button--secondary` |

Always open the `.stories.tsx` file and read its `title` and export names directly — never guess
the slug from the component's file path. `CamelCase` exports become hyphen-separated lowercase
(`SlideProgress` title segment → `slide-progress`; export names are usually already single words
like `Default`/`Primary` so they lowercase straight across).

## Test file

Put `{component-name}.e2e.js` under `libs/{lib}/tests/e2e/`, at the same relative path the
component has under `src/`. Mirror the atomic-design folder — don't flatten it and don't
co-locate the test with the `.stories.tsx` file:

```
libs/{lib}/src/{atoms|molecules|organisms|templates|pages}/{name}/{name}.stories.tsx
libs/{lib}/tests/e2e/{atoms|molecules|organisms|templates|pages}/{name}/{name}.e2e.js
```

For `lib-with-storybook`, stories live under `src/stories/{name}/`, so tests live under
`tests/e2e/stories/{name}/`.

Plain CommonJS `.js` — no TS, no ESM import:

```js
const { test, expect } = require('@playwright/test');

test('Card component renders', async ({ page }) => {
  await page.goto('/?path=/story/atoms-card--elevated');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const storyContainer = canvas.locator('div').filter({ has: canvas.locator('text=Photosynthesis basics') }).first();
  await expect(storyContainer).toBeVisible();
});
```

Rules that matter:

- **Always go through the iframe.** The story renders inside
  `iframe[title="storybook-preview-iframe"]`. `page.locator()` looks at the outer Storybook UI
  and will not see story content — use `page.frameLocator(...)` and query through that, or query
  the bare iframe element itself (`page.locator('iframe[...]')`) only to assert it's visible/loaded.
- **Prefer text locators over HTML semantics.** These are React Native components rendered via
  `react-native-web`. A `Pressable` becomes a `div`, not a `<button>`; there's no native `role`
  to rely on. Use `canvas.locator('text=...')` against visible copy in the story, not
  `getByRole`.
- **One test per meaningful assertion**, not one giant test per component. Match the existing
  style — separate `test()` blocks for "story loads", "content renders", each story variant
  (Primary/Secondary/etc).
- Add a `test()` per additional story variant the component exports, plus content assertions for
  the ones that matter. See `libs/lib-with-storybook/tests/e2e/stories/button/button.e2e.js` for
  the pattern of one test per variant + one content test.

## Adding tests to an existing `.e2e.js`

Just append more `test(...)` blocks to the file — same import, same file. No new file needed.

## Scaffolding a new workspace (no `playwright.config.js` yet)

If the target lib has no `playwright.config.js`, it means e2e was never wired up there. Do all
three of the following — Playwright itself is already a shared root devDependency (pnpm
workspace), do **not** add it again to this workspace's `package.json`.

**1. `{lib}/playwright.config.js`** — copy this, changing only the port (pick one not already
used by another workspace's Storybook dev server; check sibling libs' `package.json` `dev`
scripts):

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:PORT',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:PORT',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

`PORT` must match the `-p` flag in that workspace's `dev` script (Storybook's dev server port).

**2. `package.json` scripts** — add these three (keep whatever `dev`/`build`/`check-types`
already exist):

```json
"test:e2e": "npx playwright test",
"test:e2e:ui": "npx playwright test --ui",
"test:e2e:report": "npx playwright show-report"
```

**3. Create `{lib}/tests/e2e/`** mirroring the `src/` path of the stories it will cover — this is
where `.e2e.js` files go, not next to the `.stories.tsx` files.

## Running tests

```bash
cd libs/{lib} && pnpm test:e2e            # headless run
cd libs/{lib} && pnpm test:e2e:ui         # interactive UI mode
pnpm --filter @helsoft/{lib} test:e2e     # from repo root
```

Config auto-starts Storybook (`pnpm dev`) if it isn't already running.
