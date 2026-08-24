import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the PIN Login screen.
 * Guard 20 Compliant.
 */
export class LoginPage {
  readonly page: Page;
  readonly pinInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pinInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button:has-text("Ingresar"), button[type="submit"]');
    this.errorMessage = page.locator('.error-banner, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async enterPin(pin: string) {
    await this.pinInput.fill(pin);
  }

  async submit() {
    await this.loginButton.click();
  }

  async login(pin: string) {
    await this.goto();
    await this.enterPin(pin);
    await this.submit();
  }
}
