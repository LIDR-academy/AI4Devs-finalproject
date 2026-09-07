import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { defineConfig } from 'cypress';

/**
 * Acceptance harness for `apps/web` — Cypress 15 driven directly, with Gherkin
 * `.feature` files as the spec entry point (ADR-011).
 *
 * The shell under test is served by `web:serve`, declared as a `dependsOn` of
 * this project's `e2e` target: that target is `continuous`, so Nx starts it,
 * keeps it alive for the run and tears it down afterwards. The port is the one
 * `web:serve` binds, and is therefore not this file's to choose.
 */
const WEB_UNDER_TEST_PORT = 4200;

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${WEB_UNDER_TEST_PORT}`,
    // The layout of PROJECT-STRUCTURE.md, not Cypress's `cypress/e2e` default.
    specPattern: 'src/features/**/*.feature',
    supportFile: 'src/support/e2e.ts',
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
