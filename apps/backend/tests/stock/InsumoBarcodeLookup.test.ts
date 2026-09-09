import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

describe('TK-119: Escaneo de Código de Barras en Extracción de Bodega (US-032)', () => {
  const secret = 'test-secret-key-barcode-lookup-12345';
  let stockRepo: InMemoryStockRepository;
  let staffToken: string;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-leche-1',
        name: 'Leche Entera 1L',
        unitOfMeasure: 'L',
        barcode: '7791234567890',
        stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('10.000') }],
      })
    );
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Cocinero', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
  });

  it('200: encuentra el insumo por código de barras (cualquier rol autenticado)', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app)
      .get('/api/v1/stock/insumos/by-barcode/7791234567890')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 'ins-leche-1', name: 'Leche Entera 1L', barcode: '7791234567890' });
  });

  it('404: código sin match', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app)
      .get('/api/v1/stock/insumos/by-barcode/0000000000000')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(404);
  });

  it('401: sin token', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app).get('/api/v1/stock/insumos/by-barcode/7791234567890');

    expect(response.status).toBe(401);
  });

  it('409: alta de insumo con barcode duplicado', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });
    const adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .post('/api/v1/stock/insumos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Leche Entera 1L (duplicado)',
        unitOfMeasure: 'L',
        storageLocationId: 'loc-1',
        barcode: '7791234567890',
      });

    expect(response.status).toBe(409);
  });

  it('400: rechaza barcode vacío en la creación (FASE 4.B — evita colarse falsy del check de unicidad)', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });
    const adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .post('/api/v1/stock/insumos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Insumo con Barcode Vacío', unitOfMeasure: 'L', storageLocationId: 'loc-1', barcode: '' });

    expect(response.status).toBe(400);
  });

  it('400: rechaza barcode de solo espacios (FASE 4.B — mismo caso que la cadena vacía, tras el trim de Zod)', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });
    const adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .post('/api/v1/stock/insumos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Insumo con Barcode de Espacios', unitOfMeasure: 'L', storageLocationId: 'loc-1', barcode: '   ' });

    expect(response.status).toBe(400);
  });
});
