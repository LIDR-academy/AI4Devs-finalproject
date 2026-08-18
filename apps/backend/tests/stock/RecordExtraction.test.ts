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
      warehouseStock: new DecimalQuantity('5.000'),
    });
    stockRepo.seedInsumo(insumoMozzarella);
  });

  it('debe registrar exitosamente la extraccion de 2.000 kg y crear remanente activo FEFO (201 Created)', async () => {
    // 1. ARRANGE (Dado)
    const app = createApp({ stockRepository: stockRepo });

    // 2. ACT (Cuando)
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
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
    expect(response.body).toHaveProperty('status', 'ACTIVE');
    expect(response.body).toHaveProperty('expirationDate');

    // ORACULO ESTADO: Verificación de persistencia de stock e histórico de movimientos
    const updatedInsumo = await stockRepo.findInsumoById('ins-mozzarella-1');
    expect(updatedInsumo?.warehouseStock.toString()).toBe('3.000');
    expect(stockRepo.remanentes.size).toBe(1);
    expect(stockRepo.movements.length).toBe(1);
  });

  it('debe rechazar la extraccion si la cantidad supera el stock disponible en bodega (422 Unprocessable Entity)', async () => {
    // 1. ARRANGE (Dado)
    const app = createApp({ stockRepository: stockRepo });

    // 2. ACT (Cuando)
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'ins-mozzarella-1',
        quantity: '10.000',
      });

    // 3. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO RED / RESPUESTA: Manejo de excepción RFC 7807 (422 Unprocessable Entity)
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error', 'InsufficientStockException');
    expect(response.body.message).toMatch(/Stock insuficiente/);

    // ORACULO ESTADO: Garantizar que el stock NO fue alterado (Invariante)
    const updatedInsumo = await stockRepo.findInsumoById('ins-mozzarella-1');
    expect(updatedInsumo?.warehouseStock.toString()).toBe('5.000');
    expect(stockRepo.remanentes.size).toBe(0);
  });

  it('debe retornar 404 Not Found si el insumo no existe', async () => {
    const app = createApp({ stockRepository: stockRepo });
    const response = await request(app)
      .post('/api/v1/stock/extraction')
      .send({
        insumoId: 'insumo-inexistente',
        quantity: '1.000',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'EntityNotFoundException');
  });
});
