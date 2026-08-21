import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

describe('TK-050: Trazabilidad de Movimientos de Stock (auditoria, solo ADMIN)', () => {
  const secret = 'test-secret-key-movement-history-12345';
  let stockRepo: InMemoryStockRepository;
  let adminToken: string;
  let staffToken: string;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-mozzarella-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity('10.000') })
    );
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Cocinero', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
  });

  it('ADMIN consulta el historial de movimientos tras una extraccion real (200, orden mas reciente primero)', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    // Genera un movimiento real via el flujo de negocio existente (no seed directo del array)
    await request(app)
      .post('/api/v1/stock/extraction')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ insumoId: 'ins-mozzarella-1', quantity: '2.000', toLocation: 'KITCHEN_FRIDGE' });

    const response = await request(app)
      .get('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${adminToken}`);

    // ORACULO RED/RESPUESTA
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      insumoId: 'ins-mozzarella-1',
      insumoName: 'Queso Mozzarella',
      type: 'EXTRACTION',
      quantity: '2.000',
    });
    expect(response.body[0]).toHaveProperty('createdAt');
  });

  it('filtra correctamente por insumoId', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-tomate-1', name: 'Salsa de Tomate', unitOfMeasure: 'L', warehouseStock: new DecimalQuantity('5.000') })
    );

    await request(app).post('/api/v1/stock/extraction').set('Authorization', `Bearer ${adminToken}`).send({ insumoId: 'ins-mozzarella-1', quantity: '1.000' });
    await request(app).post('/api/v1/stock/extraction').set('Authorization', `Bearer ${adminToken}`).send({ insumoId: 'ins-tomate-1', quantity: '1.000' });

    const response = await request(app)
      .get('/api/v1/stock/movements')
      .query({ insumoId: 'ins-tomate-1' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].insumoId).toBe('ins-tomate-1');
  });

  it('rechaza con 403 Forbidden a un usuario KITCHEN_STAFF (dato administrativo)', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app)
      .get('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('title', 'ForbiddenException');
  });

  it('rechaza con 401 Unauthorized sin token', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app).get('/api/v1/stock/movements');

    expect(response.status).toBe(401);
  });

  it('retorna lista vacia cuando no hay movimientos registrados', async () => {
    const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

    const response = await request(app)
      .get('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
