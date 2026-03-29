import { test, expect } from '@playwright/test';
import { generateTestUser, createUserViaApi, gotoLogin, type TestUser } from '../helpers/auth.helpers';

/**
 * E2E tests – User Login flow
 *
 * Prerequisites:
 *   - Frontend dev server running on http://localhost:3000
 *   - Backend API running on http://localhost:4000
 *
 * A shared test user is created via the API once before all tests.
 * Each individual test starts with a clean, unauthenticated browser context
 * so tests remain isolated and repeatable.
 */
test.describe('Login flow', () => {
  let testUser: TestUser;

  // Create a real user via the API once for the entire describe block.
  // Login tests are read-only against this user so parallel execution is safe.
  test.beforeAll(async () => {
    testUser = generateTestUser();
    await createUserViaApi(testUser);
  });

  // Guarantee each test starts without an active session
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  test('successful login with valid credentials redirects to the dashboard', async ({ page }) => {
    await gotoLogin(page);

    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);

    await page.getByTestId('login-submit-button').click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-user-name')).toContainText(testUser.fullName);
  });

  test('sets the auth_token cookie after a successful login', async ({ page, context }) => {
    await gotoLogin(page);

    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('login-submit-button').click();

    await expect(page).toHaveURL('/dashboard');

    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === 'auth_token');
    expect(authCookie).toBeDefined();
    expect(authCookie?.value).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // API errors
  // ---------------------------------------------------------------------------

  test('shows an error message when logging in with a wrong password', async ({ page }) => {
    await gotoLogin(page);

    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill('WrongPassword!');

    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('login-error-alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('shows an error message when logging in with a non-existent email', async ({ page }) => {
    await gotoLogin(page);

    await page.getByTestId('input-email').fill('no-such-user@trace-test.com');
    await page.getByTestId('input-password').fill('AnyPassword1!');

    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('login-error-alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  // ---------------------------------------------------------------------------
  // Client-side validation
  // ---------------------------------------------------------------------------

  test('shows required-field validation errors when submitting an empty form', async ({ page }) => {
    await gotoLogin(page);

    await page.getByTestId('login-submit-button').click();

    // vee-validate shows 'Email is required' / 'Password must be at least 8 characters'
    await expect(page.getByTestId('input-error-email')).toBeVisible();
    await expect(page.getByTestId('input-error-password')).toBeVisible();
  });

  test('shows an email validation error when the email format is invalid', async ({ page }) => {
    await gotoLogin(page);

    // Fill a valid password so only the email field fails
    await page.getByTestId('input-email').fill('not-an-email');
    await page.getByTestId('input-password').fill('ValidPass1!');
    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('input-error-email')).toBeVisible();
    await expect(page.getByTestId('input-error-email')).toContainText('inválido');
  });

  test('shows a password length validation error when password is shorter than 8 characters', async ({ page }) => {
    await gotoLogin(page);

    // Fill a valid email so only the password field fails
    await page.getByTestId('input-email').fill('valid@trace-test.com');
    await page.getByTestId('input-password').fill('short1');
    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('input-error-password')).toBeVisible();
    await expect(page.getByTestId('input-error-password')).toContainText('8');
  });

  // ---------------------------------------------------------------------------
  // Navigation / middleware
  // ---------------------------------------------------------------------------

  test('redirects an already-authenticated user away from /login to the dashboard', async ({ page }) => {
    // Authenticate first
    await gotoLogin(page);
    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL('/dashboard');

    // The guest middleware must redirect back to dashboard
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });

  test('redirects an unauthenticated user away from /dashboard to the login page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
