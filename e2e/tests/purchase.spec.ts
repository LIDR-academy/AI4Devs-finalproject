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

  test('un carrito vacío muestra el estado vacío sin opción de tramitar pedido', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('button', { name: 'Tramitar pedido' })).toHaveCount(0);
  });

  test('datos de envío inválidos muestran error inline y no avanzan al paso 2', async ({ page }) => {
    await page.goto('/');
    await page.locator('article').first().locator('h3').click();
    await page.getByTestId('size-selector').getByRole('button').first().click();
    await page.getByTestId('color-selector').getByRole('button').first().click();
    await page.getByRole('button', { name: 'Añadir al carrito' }).click();
    await page.getByRole('link', { name: 'Ver carrito' }).click();
    await page.getByRole('button', { name: 'Tramitar pedido' }).click();

    await page.getByLabel('Nombre completo').fill('Corredor E2E');
    await page.getByLabel('Email').fill('no-es-un-email');
    await page.getByLabel('Dirección').fill('Calle de la Prueba 123');
    await page.getByLabel('Ciudad').fill('Madrid');
    await page.getByLabel('Código postal').fill('ABC');
    await page.getByRole('button', { name: 'Continuar al pago' }).click();

    await expect(page.getByText('Introduce un email válido')).toBeVisible();
    await expect(page.getByText('Introduce un código postal válido')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Método de pago' })).toHaveCount(0);
  });

  test('tarjeta inválida muestra error inline y no avanza al paso 3', async ({ page }) => {
    const runId = Date.now();
    await page.goto('/');
    await page.locator('article').first().locator('h3').click();
    await page.getByTestId('size-selector').getByRole('button').first().click();
    await page.getByTestId('color-selector').getByRole('button').first().click();
    await page.getByRole('button', { name: 'Añadir al carrito' }).click();
    await page.getByRole('link', { name: 'Ver carrito' }).click();
    await page.getByRole('button', { name: 'Tramitar pedido' }).click();

    await page.getByLabel('Nombre completo').fill(`Corredor E2E ${runId}`);
    await page.getByLabel('Email').fill(`corredor.e2e.${runId}@example.com`);
    await page.getByLabel('Dirección').fill('Calle de la Prueba 123');
    await page.getByLabel('Ciudad').fill('Madrid');
    await page.getByLabel('Código postal').fill('28001');
    await page.getByRole('button', { name: 'Continuar al pago' }).click();

    await expect(page.getByRole('heading', { name: 'Método de pago' })).toBeVisible();
    await page.getByLabel('Número de tarjeta').fill('1234');
    await page.getByLabel('Nombre del titular').fill('Corredor E2E');
    await page.getByLabel('Fecha de vencimiento').fill('12/29');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    await expect(page.getByText('Introduce un número de tarjeta válido de 16 dígitos')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Revisar pedido' })).toHaveCount(0);
  });
});
