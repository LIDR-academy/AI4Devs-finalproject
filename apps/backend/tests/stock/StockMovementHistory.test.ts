import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryLocationRepository } from '../../src/infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';
import { StorageLocation } from '../../src/domain/stock/entities/StorageLocation.js';

describe('TK-050: Trazabilidad de Movimientos de Stock (auditoria, solo ADMIN)', () => {
  const secret = 'test-secret-key-movement-history-12345';
  let stockRepo: InMemoryStockRepository;
  let adminToken: string;
  let staffToken: string;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-mozzarella-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('10.000') }] })
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
      .send({ insumoId: 'ins-mozzarella-1', fromStorageLocationId: 'loc-1', quantity: '2.000', toStorageLocationId: 'KITCHEN_FRIDGE' });

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
      new Insumo({ id: 'ins-tomate-1', name: 'Salsa de Tomate', unitOfMeasure: 'L', stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('5.000') }] })
    );

    await request(app).post('/api/v1/stock/extraction').set('Authorization', `Bearer ${adminToken}`).send({ insumoId: 'ins-mozzarella-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });
    await request(app).post('/api/v1/stock/extraction').set('Authorization', `Bearer ${adminToken}`).send({ insumoId: 'ins-tomate-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });

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

  // AUDIT-DEV-006 F-7 / TK-101: el movimiento guarda el id del sub-sector de origen
  // (FK), no solo su nombre — renombrar el sector no debe desincronizar el histórico.
  describe('TK-101: fromStorageLocationId (trazabilidad del sub-sector de origen por id)', () => {
    it('el movimiento de extraccion expone fromStorageLocationId', async () => {
      const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

      await request(app)
        .post('/api/v1/stock/extraction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ insumoId: 'ins-mozzarella-1', fromStorageLocationId: 'loc-1', quantity: '2.000', toStorageLocationId: 'KITCHEN_FRIDGE' });

      const response = await request(app)
        .get('/api/v1/stock/movements')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].fromStorageLocationId).toBe('loc-1');
    });

    it('renombrar el StorageLocation cambia el fromLoc mostrado en el historico (join), no el guardado', async () => {
      const locationRepo = new InMemoryLocationRepository();
      const app = createApp({ stockRepository: stockRepo, locationRepository: locationRepo, jwtSecret: secret });

      await request(app)
        .post('/api/v1/stock/extraction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ insumoId: 'ins-mozzarella-1', fromStorageLocationId: 'loc-1', quantity: '2.000', toStorageLocationId: 'KITCHEN_FRIDGE' });

      const before = await request(app).get('/api/v1/stock/movements').set('Authorization', `Bearer ${adminToken}`);
      expect(before.body[0].fromLoc).toBe('MAIN_WAREHOUSE'); // nombre original sembrado por InMemoryLocationRepository

      // Renombrar el sector (mismo id, nuevo nombre) — simula un PUT /locations/:id real.
      await locationRepo.saveLocation(
        new StorageLocation({ id: 'loc-1', name: 'Bodega Principal Renombrada', type: 'WAREHOUSE', isActive: true })
      );

      const after = await request(app).get('/api/v1/stock/movements').set('Authorization', `Bearer ${adminToken}`);
      expect(after.body[0].fromLoc).toBe('Bodega Principal Renombrada');
      // El id de FK no cambia — sigue apuntando al mismo sector, solo cambió su nombre.
      expect(after.body[0].fromStorageLocationId).toBe('loc-1');
    });

    it('el descarte directo (DIRECT_DISCARD) tambien persiste fromStorageLocationId, no solo la extraccion normal', async () => {
      const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

      await request(app)
        .post('/api/v1/stock/extraction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ insumoId: 'ins-mozzarella-1', fromStorageLocationId: 'loc-1', quantity: '1.000', purpose: 'DIRECT_DISCARD', reason: 'Producto vencido' });

      const response = await request(app).get('/api/v1/stock/movements').set('Authorization', `Bearer ${adminToken}`);
      expect(response.body[0].fromStorageLocationId).toBe('loc-1');
    });

    it('un movimiento sin sub-sector de bodega de origen (RESTOCK, viene del proveedor) no tiene fromStorageLocationId', async () => {
      const app = createApp({ stockRepository: stockRepo, jwtSecret: secret });

      await request(app)
        .patch('/api/v1/stock/insumos/ins-mozzarella-1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: '5.000', storageLocationId: 'loc-1' });

      const response = await request(app).get('/api/v1/stock/movements').set('Authorization', `Bearer ${adminToken}`);
      expect(response.body[0]).toMatchObject({ type: 'RESTOCK', fromLoc: 'SUPPLIER' });
      expect(response.body[0].fromStorageLocationId).toBeFalsy();
    });
  });
});
