import { test, expect } from '@playwright/test';
import { generateTestUser, createUserViaApi, gotoRegister } from '../helpers/auth.helpers';

/**
 * E2E tests – User Registration flow
 *
 * Prerequisites:
 *   - Frontend dev server running on http://localhost:3000
 *   - Backend API running on http://localhost:4000
 *
 * Each test generates a unique user (user-test-{timestamp}@trace-test.com)
 * so the suite is fully atomic and can be executed any number of times.
 */
test.describe('Register flow', () => {
  // Start every test with a clean, unauthenticated browser context
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  test('successful registration with valid data redirects to the dashboard', async ({ page }) => {
    const user = generateTestUser();

    await gotoRegister(page);

    await page.getByTestId('input-fullName').fill(user.fullName);
    await page.getByTestId('input-email').fill(user.email);
    await page.getByTestId('input-password').fill(user.password);
    await page.getByTestId('input-confirmPassword').fill(user.password);

    await page.getByTestId('register-submit-button').click();

    // Auto-login after register must redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    // Dashboard must display the registered user's name
    await expect(page.getByTestId('dashboard-user-name')).toContainText(user.fullName);
  });

  // ---------------------------------------------------------------------------
  // API errors
  // ---------------------------------------------------------------------------

  test('shows an error message when registering with an already-existing email', async ({ page }) => {
    // Create the user first via API so the email is already taken
    const existingUser = generateTestUser();
    await createUserViaApi(existingUser);

    await gotoRegister(page);

    await page.getByTestId('input-fullName').fill(existingUser.fullName);
    await page.getByTestId('input-email').fill(existingUser.email);
    await page.getByTestId('input-password').fill(existingUser.password);
    await page.getByTestId('input-confirmPassword').fill(existingUser.password);

    await page.getByTestId('register-submit-button').click();

    // API error banner must appear; user stays on /register
    await expect(page.getByTestId('register-error-alert')).toBeVisible();
    await expect(page).toHaveURL('/register');
  });

  // ---------------------------------------------------------------------------
  // Client-side validation
  // ---------------------------------------------------------------------------

  test('shows required-field validation errors when submitting an empty form', async ({ page }) => {
    await gotoRegister(page);

    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('input-error-fullName')).toBeVisible();
    await expect(page.getByTestId('input-error-email')).toBeVisible();
    await expect(page.getByTestId('input-error-password')).toBeVisible();
  });

  test('shows an email validation error when the email format is invalid', async ({ page }) => {
    await gotoRegister(page);

    await page.getByTestId('input-email').fill('not-a-valid-email');
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('input-error-email')).toBeVisible();
    await expect(page.getByTestId('input-error-email')).toContainText('inválido');
  });

  test('shows a password length validation error when password is shorter than 8 characters', async ({ page }) => {
    await gotoRegister(page);

    // Fill all other fields validly so only the password field triggers the length error
    await page.getByTestId('input-fullName').fill('Test User');
    await page.getByTestId('input-email').fill('valid@trace-test.com');
    await page.getByTestId('input-password').fill('short1');
    await page.getByTestId('input-confirmPassword').fill('short1');
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('input-error-password')).toBeVisible();
    await expect(page.getByTestId('input-error-password')).toContainText('8');
  });

  test('shows a validation error when the confirmation password does not match the password', async ({ page }) => {
    await gotoRegister(page);

    // All fields must pass individual validation so the cross-field refine() rule runs
    await page.getByTestId('input-fullName').fill('Test User');
    await page.getByTestId('input-email').fill('valid@trace-test.com');
    await page.getByTestId('input-password').fill('Test1234!');
    await page.getByTestId('input-confirmPassword').fill('DifferentPass!');
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('input-error-confirmPassword')).toBeVisible();
    await expect(page.getByTestId('input-error-confirmPassword')).toContainText('no coinciden');
  });

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  test('redirects an already-authenticated user away from /register to the dashboard', async ({ page, context }) => {
    // Register and authenticate a user first
    const user = generateTestUser();
    await gotoRegister(page);

    await page.getByTestId('input-fullName').fill(user.fullName);
    await page.getByTestId('input-email').fill(user.email);
    await page.getByTestId('input-password').fill(user.password);
    await page.getByTestId('input-confirmPassword').fill(user.password);
    await page.getByTestId('register-submit-button').click();
    await expect(page).toHaveURL('/dashboard');

    // Visiting /register while authenticated must redirect back to dashboard
    await page.goto('/register');
    await expect(page).toHaveURL('/dashboard');
  });
});
