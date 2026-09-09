import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the PIN Login screen.
 * Guard 20 Compliant.
 */
export class LoginPage {
  readonly page: Page;
  readonly userInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userInput = page.locator('#input-pin-login-user, input[type="text"]');
    this.loginButton = page.locator('button:has-text("Ingresar a Cocina"), button:has-text("Ingresar")');
    this.errorMessage = page.locator('.error-banner, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async enterUser(userId: string) {
    await this.userInput.fill(userId);
  }

  async enterPin(pin: string) {
    for (const char of pin) {
      await this.page.locator(`button:has-text("${char}")`).first().click();
    }
  }

  async submit() {
    await this.loginButton.click();
  }

  async login(userIdOrPin: string, pin?: string) {
    await this.goto();
    if (pin !== undefined) {
      await this.enterUser(userIdOrPin);
      await this.enterPin(pin);
    } else {
      // If only 1 argument provided, default user is bootstrap-admin and arg is pin
      await this.enterUser('bootstrap-admin');
      await this.enterPin(userIdOrPin);
    }
    await this.submit();
  }
}

