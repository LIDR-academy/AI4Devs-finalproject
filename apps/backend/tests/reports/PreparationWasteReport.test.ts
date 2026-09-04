import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryReportRepository } from '../../src/infrastructure/reports/repositories/InMemoryReportRepository.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

const RANGE = '?startDate=2026-09-01T00:00:00.000Z&endDate=2026-09-07T23:59:59.999Z';
// docs/03_persistence_and_api/07_api_specification.md: /reports/* exige rol ADMIN sin
// excepción por isAuthRequired (a diferencia de kitchen/stock) — mismo patrón que
// tests/security/PerRouteRbac.test.ts: token real, no requireAuth:false.
const JWT_SECRET = 'test-secret-preparation-waste-report-12345';
const adminToken = (): string => `Bearer ${jwt.sign({ sub: 'usr-admin', name: 'ADMIN', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' })}`;

describe('GET /api/v1/reports/preparation-waste (US-029 / TK-105)', () => {
  it('agrega la merma de preparación y el consumo vs. teórico, con el umbral configurado (200, rol ADMIN)', async () => {
    const reportRepo = new InMemoryReportRepository();
    reportRepo.seedPreparationWasteRecord({
      recipeId: 'rec-pizza',
      recipeName: 'Pizza Margarita',
      insumoId: 'ins-queso',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      wasteReason: 'recorte no aprovechable',
      extractedQty: new DecimalQuantity('1.000'),
      wastedQty: new DecimalQuantity('0.120'),
      unitCost: new DecimalQuantity('4.00'),
    });
    reportRepo.seedRecipeConsumptionRecord({
      recipeId: 'rec-pizza',
      recipeName: 'Pizza Margarita',
      insumoId: 'ins-queso',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      theoreticalUnitQty: new DecimalQuantity('0.150'),
      actualPortions: 8,
      consumedQty: new DecimalQuantity('1.300'),
    });

    const app = createApp({ reportRepository: reportRepo, jwtSecret: JWT_SECRET });
    const res = await request(app)
      .get(`/api/v1/reports/preparation-waste${RANGE}`)
      .set('Authorization', adminToken());

    expect(res.status).toBe(200);
    expect(res.body.wasteAlertThresholdPercent).toBe(5);
    expect(res.body.wasteByReason[0]).toMatchObject({
      recipeId: 'rec-pizza',
      wasteReason: 'recorte no aprovechable',
      totalWastedQty: '0.120',
      wastePercent: '12.00',
      wastedCost: '0.48',
      overThreshold: true,
    });
    expect(res.body.consumptionVsTheoretical[0]).toMatchObject({
      theoreticalQty: '1.200',
      actualQty: '1.300',
      differenceQty: '0.100',
    });
  });

  it('rango de fechas inválido → 400', async () => {
    const app = createApp({ jwtSecret: JWT_SECRET });
    const res = await request(app)
      .get('/api/v1/reports/preparation-waste?startDate=not-a-date&endDate=2026-09-07')
      .set('Authorization', adminToken());
    expect(res.status).toBe(400);
  });

  it('sin rol ADMIN → 403', async () => {
    const app = createApp({ jwtSecret: JWT_SECRET });
    const token = `Bearer ${jwt.sign({ sub: 'usr-staff', name: 'KITCHEN_STAFF', role: 'KITCHEN_STAFF' }, JWT_SECRET, { expiresIn: '1h' })}`;
    const res = await request(app).get(`/api/v1/reports/preparation-waste${RANGE}`).set('Authorization', token);
    expect(res.status).toBe(403);
  });
});
