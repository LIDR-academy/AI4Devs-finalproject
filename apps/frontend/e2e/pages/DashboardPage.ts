import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for FEFO Kitchen Dashboard.
 * Guard 20 Compliant.
 */
export class DashboardPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly userBadge: Locator;
  readonly extractionButton: Locator;
  readonly recipeButton: Locator;
  readonly reconciliationButton: Locator;
  readonly reportsButton: Locator;
  readonly activeRemanentesCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('h1, header');
    this.userBadge = page.locator('#btn-open-user-management, .user-badge');
    this.extractionButton = page.locator('button:has-text("Extraer Insumo de Bodega")');
    this.recipeButton = page.locator('button:has-text("Descontar Receta FEFO")');
    this.reconciliationButton = page.locator('#btn-open-reconciliation');
    this.reportsButton = page.locator('#btn-open-reports');
    this.activeRemanentesCards = page.locator('.remanente-card');
  }

  async openExtractionModal() {
    await this.extractionButton.click();
  }

  async openRecipeModal() {
    await this.recipeButton.click();
  }

  async openReconciliationWizard() {
    await this.reconciliationButton.click();
  }
}
