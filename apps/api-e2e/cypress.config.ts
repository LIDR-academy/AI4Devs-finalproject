import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { defineConfig } from 'cypress';

/**
 * Acceptance harness for `apps/api` — Cypress 15 driven directly, with Gherkin
 * `.feature` files as the spec entry point (ADR-011).
 *
 * The API under test is started by this project's own `serve-under-test`
 * target, which supplies `NODE_ENV` and `PORT`: `apps/api` validates both at
 * boot with no in-code default, and `.env` is gitignored, so a harness that
 * relied on a developer's local `.env` would not be reproducible.
 *
 * `PORT` here is deliberately *not* the `3300` of `.env.example`: a dedicated
 * port keeps the suite from silently passing against a developer's running dev
 * server instead of the process this target started. The API therefore lives in
 * the `33xx` family — `3300` for development, `3333` for acceptance.
 */
const API_UNDER_TEST_PORT = 3333;

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${API_UNDER_TEST_PORT}`,
    // The layout of PROJECT-STRUCTURE.md, not Cypress's `cypress/e2e` default.
    specPattern: 'src/features/**/*.feature',
    supportFile: 'src/support/e2e.ts',
    // This suite drives HTTP only; there is no browser session worth recording.
    video: false,
    screenshotOnRunFailure: false,
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({ plugins: [createEsbuildPlugin(config)] }),
      );

      // The plugin mutates `config` (it registers the `.feature` handling);
      // returning it is what makes Cypress adopt the mutated copy.
      return config;
    },
  },
});
