import { test, expect } from '@playwright/test';

test.describe('Listing Lens', () => {
  test('rejects empty URL', async ({ page }) => {
    await page.goto('/listing-lens');
    const submit = page.getByRole('button', { name: /Analizar/ });
    await expect(submit).toBeDisabled();
  });
});
