import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

describe('TK-003: Record Warehouse Extraction TDD Suite', () => {
  let stockRepo: InMemoryStockRepository;
  let insumoMozzarella: Insumo;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    insumoMozzarella = new Insumo({
      id: 'ins-mozzarella-1',
      name: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      // US-025: stock alojado en un sub-sector concreto de bodega (seed InMemoryLocationRepository).
      stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('5.000') }],
    });
    stockRepo.seedInsumo(insumoMozzarella);
  });

  it('debe registrar exitosamente la extraccion de 2.000 kg y crear remanente activo FEFO (201 Created)', async () => {
    // 1. ARRANGE (Dado)
    const app = createApp({ stockRepository: stockRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)

    // 2. ACT (Cuando)
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        fromStorageLocationId: 'loc-1',
        quantity: '2.000',
        toLocation: 'KITCHEN_FRIDGE',
      });

    // 3. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO RED / RESPUESTA: Payload HTTP 201 Created conforme a especificación
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('remanenteId');
    expect(response.body).toHaveProperty('insumoName', 'Queso Mozzarella');
    expect(response.body).toHaveProperty('quantityExtracted', '2.000');
    expect(response.body).toHaveProperty('remainingWarehouseStock', '3.000');
    // US-025: saldo del sub-sector de origen
    expect(response.body).toHaveProperty('fromStorageLocationId', 'loc-1');
    expect(response.body).toHaveProperty('remainingSectorStock', '3.000');
    expect(response.body).toHaveProperty('status', 'ACTIVE');
    expect(response.body).toHaveProperty('expirationDate');

    // ORACULO ESTADO: Verificación de persistencia de stock e histórico de movimientos
    const updatedInsumo = await stockRepo.findById('ins-mozzarella-1');
    expect(updatedInsumo?.warehouseStock.toString()).toBe('3.000');
    expect(updatedInsumo?.stockAt('loc-1').toString()).toBe('3.000');
    expect(stockRepo.remanentes.size).toBe(1);
    expect(stockRepo.movements.length).toBe(1);
  });

  it('debe rechazar la extraccion si la cantidad supera el stock disponible en bodega (422 Unprocessable Entity)', async () => {
    // 1. ARRANGE (Dado)
    const app = createApp({ stockRepository: stockRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)

    // 2. ACT (Cuando)
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        fromStorageLocationId: 'loc-1',
        quantity: '10.000',
      });

    // 3. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO RED / RESPUESTA: Manejo de excepción RFC 7807 (422 Unprocessable Entity)
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error', 'InsufficientStockException');
    expect(response.body.message).toMatch(/Stock insuficiente/);

    // ORACULO ESTADO: Garantizar que el stock NO fue alterado (Invariante)
    const updatedInsumo = await stockRepo.findById('ins-mozzarella-1');
    expect(updatedInsumo?.warehouseStock.toString()).toBe('5.000');
    expect(stockRepo.remanentes.size).toBe(0);
  });

  it('debe retornar 404 Not Found si el insumo no existe', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'insumo-inexistente',
        fromStorageLocationId: 'loc-1',
        quantity: '1.000',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'EntityNotFoundException');
  });

  it('TK-072: debe registrar extraccion para receta vinculando recipeId, reason y operatorId', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        fromStorageLocationId: 'loc-1',
        quantity: '1.500',
        toLocation: 'KITCHEN_PREP',
        purpose: 'RECIPE',
        reason: 'Preparacion Pizza Especial',
        recipeId: 'rec-pizza-01',
        operatorId: 'user-cook-99',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('quantityExtracted', '1.500');

    expect(stockRepo.movements.length).toBe(1);
    const mov = stockRepo.movements[0];
    expect(mov.type).toBe('EXTRACTION_RECIPE');
    expect(mov.purpose).toBe('RECIPE');
    expect(mov.reason).toBe('Preparacion Pizza Especial');
    expect(mov.recipeId).toBe('rec-pizza-01');
    expect(mov.operatorId).toBe('user-cook-99');
  });

  it('TK-072: debe ejecutar descarte directo desde bodega sin crear remanente en cocina (purpose DIRECT_DISCARD)', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        fromStorageLocationId: 'loc-1',
        quantity: '2.000',
        purpose: 'DIRECT_DISCARD',
        reason: 'Empaque roto en bodega',
        operatorId: 'user-admin-01',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('location', 'WASTE_BIN');
    expect(response.body).toHaveProperty('status', 'DISCARDED');

    // ORACULO ESTADO: No se crea remanente en cocina, pero el stock en bodega se reduce
    const updatedInsumo = await stockRepo.findById('ins-mozzarella-1');
    expect(updatedInsumo?.warehouseStock.toString()).toBe('3.000');
    expect(stockRepo.remanentes.size).toBe(0);

    expect(stockRepo.movements.length).toBe(1);
    const mov = stockRepo.movements[0];
    expect(mov.type).toBe('DISCARD_DIRECT');
    expect(mov.toLoc).toBe('WASTE_BIN');
    expect(mov.reason).toBe('Empaque roto en bodega');
    expect(mov.operatorId).toBe('user-admin-01');
  });

  it('TK-072: debe rechazar descarte directo si no se especifica motivo (400 Bad Request)', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        fromStorageLocationId: 'loc-1',
        quantity: '1.000',
        purpose: 'DIRECT_DISCARD',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'ValidationError');
    expect(response.body.detail).toMatch(/motivo es obligatorio/i);
  });

  it('US-025: rechaza 400 si falta fromStorageLocationId', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({ insumoId: 'ins-mozzarella-1', quantity: '1.000' });

    expect(response.status).toBe(400);
    expect(response.body.detail).toMatch(/sub-sector de bodega de origen es obligatorio/i);
  });

  it('US-025: rechaza 422 si el sub-sector de origen no alcanza, sin tocar otras líneas', async () => {
    const multi = new Insumo({
      id: 'ins-lomo',
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      stockLines: [
        { storageLocationId: 'loc-seed-meat-fridge', quantity: new DecimalQuantity('12.000') },
        { storageLocationId: 'loc-seed-freezer', quantity: new DecimalQuantity('8.000') },
      ],
    });
    stockRepo.seedInsumo(multi);
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });

    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({ insumoId: 'ins-lomo', fromStorageLocationId: 'loc-seed-freezer', quantity: '15.000' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error', 'InsufficientStockException');

    const after = await stockRepo.findById('ins-lomo');
    expect(after?.stockAt('loc-seed-meat-fridge').toString()).toBe('12.000');
    expect(after?.stockAt('loc-seed-freezer').toString()).toBe('8.000');
    expect(stockRepo.remanentes.size).toBe(0);
  });

  it('US-025: extrae del sub-sector elegido y deja intactas las demás líneas', async () => {
    const multi = new Insumo({
      id: 'ins-lomo-2',
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      stockLines: [
        { storageLocationId: 'loc-seed-meat-fridge', quantity: new DecimalQuantity('12.000') },
        { storageLocationId: 'loc-seed-freezer', quantity: new DecimalQuantity('8.000') },
      ],
    });
    stockRepo.seedInsumo(multi);
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });

    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({ insumoId: 'ins-lomo-2', fromStorageLocationId: 'loc-seed-meat-fridge', quantity: '3.000', toLocation: 'KITCHEN_FRIDGE' });

    expect(response.status).toBe(201);
    expect(response.body.remainingSectorStock).toBe('9.000');
    expect(response.body.remainingWarehouseStock).toBe('17.000');

    const after = await stockRepo.findById('ins-lomo-2');
    expect(after?.stockAt('loc-seed-meat-fridge').toString()).toBe('9.000');
    expect(after?.stockAt('loc-seed-freezer').toString()).toBe('8.000');
    expect(stockRepo.movements[0].fromLoc).toBe('Heladera de Carnes');
  });
});
