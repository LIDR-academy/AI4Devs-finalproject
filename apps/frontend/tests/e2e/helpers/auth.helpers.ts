/**
 * Helpers for E2E authentication tests.
 *
 * Data strategy: each test run generates unique user identifiers using a
 * timestamp so tests are atomic and repeatable without manual DB cleanup.
 * Pattern: user-test-{timestamp}@trace-test.com
 */
import type { Page } from '@playwright/test';

const API_BASE = process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

export interface TestUser {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Generates a unique test user payload.
 * The timestamp embedded in the email makes every test run traceable
 * in both logs and the database.
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    fullName: `Test User ${timestamp}`,
    email: `user-test-${timestamp}@trace-test.com`,
    password: 'Test1234!',
  };
}

/**
 * Waits for Vue 3 / Nuxt 3 to finish hydrating the SSR-rendered page AND
 * for vee-validate to bind its form context.
 *
 * Strategy:
 *  1. Wait for `networkidle` so all JS chunks have been evaluated.
 *  2. Poll until `#__nuxt.__vue_app__` exists (Vue hydration complete).
 *  3. Dispatch a synthetic `focus` + `blur` on the first input so that
 *     vee-validate's `useField` reactive watchers are triggered at least
 *     once, confirming the form context is fully mounted before we interact.
 *
 * Without all three steps, Playwright can interact with inputs before
 * vee-validate has registered them, causing:
 *  - `fill()` values to be ignored (shows "Required" instead of min-length error)
 *  - submit button to trigger a native HTML GET instead of Vue's handler
 */
async function waitForVueHydration(page: Page, formTestId: string): Promise<void> {
  // 1. All JS evaluated
  await page.waitForLoadState('networkidle');

  // 2. Vue hydration complete
  await page.waitForFunction(() => {
    const el = document.getElementById('__nuxt');
    return el !== null && '__vue_app__' in el;
  });

  // 3. vee-validate form context mounted: confirm first input in the form
  //    is reactive by checking that it is enabled and focusable.
  const form = page.getByTestId(formTestId);
  await form.waitFor({ state: 'visible' });
  const firstInput = form.locator('input').first();
  await firstInput.waitFor({ state: 'visible' });
  // A brief focus/blur ensures vee-validate's useField watcher has run.
  await firstInput.focus();
  await firstInput.blur();
}

/**
 * Navigates to /login and waits until the form is fully rendered and Vue has
 * hydrated. This prevents the Nuxt SSR hydration race where clicking a submit
 * button before hydration causes a native browser GET form submission.
 */
export async function gotoLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await waitForVueHydration(page, 'login-form');
}

/**
 * Navigates to /register and waits until the form is fully rendered and
 * Vue has hydrated.
 */
export async function gotoRegister(page: Page): Promise<void> {
  await page.goto('/register');
  await waitForVueHydration(page, 'register-form');
}

/**
 * Creates a user directly via the backend API (real HTTP call, no mocks).
 * Intended for test setup (beforeAll / beforeEach) when a pre-existing
 * authenticated user is required.
 *
 * Retries up to 3 times on 5xx errors to handle transient backend failures
 * that can occur when many parallel workers hit the API simultaneously.
 */
export async function createUserViaApi(user: TestUser, retries = 3): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        fullName: user.fullName,
      }),
    });

    if (response.ok) return;

    const body = await response.text();

    // 400 "already exists" means the user was created by another parallel worker
    // running the same beforeAll — the goal (user exists) is already met.
    if (response.status === 400 && body.includes('already exists')) return;

    // Any other 4xx is a real misconfiguration — do not retry.
    if (response.status < 500) {
      throw new Error(
        `Failed to create test user via API (${response.status}): ${body}`,
      );
    }

    // 5xx — transient, worth retrying
    lastError = new Error(
      `Failed to create test user via API (${response.status}): ${body}`,
    );

    if (attempt < retries) {
      // Exponential back-off: 200 ms, 400 ms, …
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }

  throw lastError!;
}
