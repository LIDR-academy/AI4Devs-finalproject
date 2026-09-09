import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';

describe('System Settings API — Parámetros de Restaurante (TK-075)', () => {
  const app = createApp({ requireAuth: false });

  it('GET /api/v1/settings — Deberia retornar la configuracion actual del restaurante', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('restaurantName');
    expect(res.body).toHaveProperty('currencySymbol');
    expect(res.body).toHaveProperty('criticalAlertHours');
    // US-029 / TK-105: umbral de merma de preparación, default 5%.
    expect(res.body.preparationWasteAlertPercent).toBe(5);
  });

  it('PUT /api/v1/settings — Deberia actualizar preparationWasteAlertPercent sin tocar el resto (US-029)', async () => {
    const res = await request(app).put('/api/v1/settings').send({ preparationWasteAlertPercent: 15 });
    expect(res.status).toBe(200);
    expect(res.body.preparationWasteAlertPercent).toBe(15);
    expect(res.body.currencySymbol).toBeTruthy();
  });

  it('PUT /api/v1/settings — Deberia actualizar la identidad del restaurante y parametros FEFO', async () => {
    const res = await request(app)
      .put('/api/v1/settings')
      .send({
        restaurantName: 'Bistró Gourmet RestoStock',
        currencySymbol: '€',
        criticalAlertHours: 18,
      });

    expect(res.status).toBe(200);
    expect(res.body.restaurantName).toBe('Bistró Gourmet RestoStock');
    expect(res.body.currencySymbol).toBe('€');
    expect(res.body.criticalAlertHours).toBe(18);
  });
});
