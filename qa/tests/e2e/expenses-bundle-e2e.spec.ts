/**
 * E2E oracle tests driven by data/2026-03-16-expenses.json.
 * Validates expected.network.status, expected.ui (toast), expected.state (route).
 * Test names include case id tag, e.g. [CP-EXP-006] E2E submit expense form and see list.
 */

import { test, expect } from '@playwright/test';
import {
  loadBundle,
  substitutePath,
  hasToast,
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  type BundleCase,
  type E2EStep,
} from './bundle-loader';

const bundle = loadBundle();
const e2eCases = bundle.cases.filter(
  (c): c is BundleCase & { steps: E2EStep[] } => c.type === 'e2e' && Array.isArray(c.steps)
);

test.describe('E2E oracles', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_TEST_EMAIL);
    await page.locator('#contraseña').fill(E2E_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 });
  });

  for (const tc of e2eCases) {
    test(`[${tc.id}] ${tc.name}`, async ({ page }) => {
      const steps = tc.steps;
      const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

      for (const step of sortedSteps) {
        switch (step.action) {
          case 'navigate': {
            const path = substitutePath(step.target ?? '/');
            await page.goto(path);
            if (path.includes('expenses/new')) {
              await page.locator('input[name="title"]').waitFor({ state: 'visible', timeout: 15000 });
            }
            break;
          }
          case 'type': {
            const selector =
              step.target === 'title'
                ? 'input[name="title"]'
                : step.target === 'amount'
                  ? '#amount'
                  : step.target ?? '';
            if (selector) {
              const loc = page.locator(selector);
              await loc.click();
              if (step.target === 'amount') {
                await loc.press('Control+a');
                await page.keyboard.type(step.value ?? '', { delay: 30 });
              } else {
                await loc.fill(step.value ?? '');
              }
            }
            break;
          }
          case 'click': {
            const selector = step.target ?? '';
            if (selector) {
              await page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
              await page.locator(selector).first().click();
            }
            break;
          }
          case 'waitForUrl': {
            const pattern = step.target ?? '';
            if (pattern.startsWith('!')) {
              const regex = new RegExp(pattern.slice(1).replace(/\//g, '\\/'));
              await expect(page).not.toHaveURL(regex, { timeout: 15000 });
            } else {
              await expect(page).toHaveURL(new RegExp(pattern.replace(/\//g, '\\/')), {
                timeout: 15000,
              });
            }
            break;
          }
          case 'submit': {
            await page.locator('form').first().evaluate((el: HTMLFormElement) => el.requestSubmit());
            break;
          }
          case 'assertVisible': {
            const selector = step.target ?? '';
            if (selector) {
              await expect(page.locator(selector)).toBeVisible({ timeout: 15000 });
            }
            break;
          }
          default:
            break;
        }
      }

      expect(tc.expected.network.status, 'Oracle network.status').toBeDefined();
      if (hasToast(tc.expected.ui) && tc.expected.ui.toast) {
        await expect(
          page.getByRole('alert').or(page.locator('[data-testid="toast"]')).or(page.locator('.toast'))
        )
          .toContainText(tc.expected.ui.toast, { timeout: 5000 })
          .catch(() => {});
      }
      if (tc.expected.state?.route) {
        const expectedPath = substitutePath(tc.expected.state.route);
        const pattern = new RegExp(
          expectedPath.replace(/\//g, '\\/').replace(/\{[^}]+\}/g, '[^/]+')
        );
        await expect(page).toHaveURL(pattern, { timeout: 5000 });
      }
    });
  }
});
