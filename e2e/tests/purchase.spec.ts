import { test, expect } from '@playwright/test';

test.describe('Ciclo de compra', () => {
  test('completa el ciclo carrito → checkout → confirmación', async ({ page }) => {
    const runId = Date.now();
    const shipping = {
      name: `Corredor E2E ${runId}`,
      email: `corredor.e2e.${runId}@example.com`,
      address: 'Calle de la Prueba 123',
      city: 'Madrid',
      postalCode: '28001',
    };

    await page.goto('/');
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();
    await firstCard.locator('h3').click();
    await expect(page).toHaveURL(/\/product\//);

    await page.getByTestId('size-selector').getByRole('button').first().click();
    await page.getByTestId('color-selector').getByRole('button').first().click();
    await page.getByRole('button', { name: 'Añadir al carrito' }).click();

    const cartBadge = page.getByTestId('cart-badge');
    await expect(cartBadge).toHaveText('1');

    await page.getByRole('link', { name: 'Ver carrito' }).click();
    await expect(page).toHaveURL('/cart');

    await page.getByRole('button', { name: 'Tramitar pedido' }).click();
    await expect(page).toHaveURL('/checkout');

    await page.getByLabel('Nombre completo').fill(shipping.name);
    await page.getByLabel('Email').fill(shipping.email);
    await page.getByLabel('Dirección').fill(shipping.address);
    await page.getByLabel('Ciudad').fill(shipping.city);
    await page.getByLabel('Código postal').fill(shipping.postalCode);
    await page.getByRole('button', { name: 'Continuar al pago' }).click();

    await page.getByLabel('Número de tarjeta').fill('4111111111111111');
    await page.getByLabel('Nombre del titular').fill(shipping.name);
    await page.getByLabel('Fecha de vencimiento').fill('12/29');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    await expect(page.getByRole('heading', { name: 'Revisar pedido' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toBeVisible();
    const orderNumber = page.getByText(/Número de pedido:/);
    await expect(orderNumber).toBeVisible();
    await expect(orderNumber).toContainText(/ORD-\d+/);

    await expect(cartBadge).not.toBeVisible();
  });
});
