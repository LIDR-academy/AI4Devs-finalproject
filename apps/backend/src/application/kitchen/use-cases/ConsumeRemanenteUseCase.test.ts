import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

describe('TK-005: Partial Remanente Consumption TDD Suite', () => {
  let stockRepo: InMemoryStockRepository;
  let queryRepo: InMemoryRemanenteQueryRepository;
  let activeRemanente: Remanente;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    queryRepo = new InMemoryRemanenteQueryRepository();

    activeRemanente = new Remanente({
      id: 'rem-salsa-1',
      insumoId: 'ins-salsa',
      currentQuantity: new DecimalQuantity('1.750'),
      initialQuantity: new DecimalQuantity('1.750'),
      location: 'KITCHEN_FRIDGE',
      status: 'ACTIVE',
      expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });

    stockRepo.seedRemanente(activeRemanente);
  });

  it('debe registrar exitosamente un consumo parcial (1.750 -> 1.500) manteniendo el estado ACTIVE (200 OK)', async () => {
    // 1. ARRANGE
    const connectedQueryRepo = new InMemoryRemanenteQueryRepository(stockRepo);
    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: connectedQueryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)

    // 2. ACT
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-salsa-1/consume')
      .send({ quantity: '0.250' });

    // 3. ASSERT: Verificación con los 3 Oráculos (Guard 20)
    // ORACULO RED / RESPUESTA: Payload de respuesta HTTP 200 OK
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('consumedQuantity', '0.250');
    expect(response.body).toHaveProperty('remainingQuantity', '1.500');
    expect(response.body).toHaveProperty('status', 'ACTIVE');
    expect(response.body).toHaveProperty('isExhausted', false);

    // ORACULO ESTADO: Persistencia en Write Model (StockRepository)
    const updated = await stockRepo.findRemanenteById('rem-salsa-1');
    expect(updated?.currentQuantity.toString()).toBe('1.500');

    // ORACULO ESTADO & READ MODEL: Sincronización inmediata en el modelo de lectura (GET /remanentes-activos)
    const getResponse = await request(app).get('/api/v1/kitchen/remanentes-activos');
    expect(getResponse.status).toBe(200);
    const activeItem = getResponse.body.find((item: any) => item.id === 'rem-salsa-1');
    expect(activeItem).toBeDefined();
    expect(activeItem.currentQuantity).toBe('1.500');
  });

  it('debe cambiar automaticamente el estado a EXHAUSTED si la cantidad restante llega a 0 (200 OK)', async () => {
    // Sembrar remanente con 0.250 kg
    const lowRemanente = new Remanente({
      id: 'rem-low-1',
      insumoId: 'ins-salsa',
      currentQuantity: new DecimalQuantity('0.250'),
      initialQuantity: new DecimalQuantity('0.250'),
      location: 'KITCHEN_FRIDGE',
      status: 'ACTIVE',
      expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
    stockRepo.seedRemanente(lowRemanente);

    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-low-1/consume')
      .send({ quantity: '0.250' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('consumedQuantity', '0.250');
    expect(response.body).toHaveProperty('remainingQuantity', '0.000');
    expect(response.body).toHaveProperty('status', 'EXHAUSTED');
    expect(response.body).toHaveProperty('isExhausted', true);

    const updated = await stockRepo.findRemanenteById('rem-low-1');
    expect(updated?.status).toBe('EXHAUSTED');
  });

  it('debe rechazar con 422 Unprocessable Entity si se intenta consumir una cantidad mayor a la disponible', async () => {
    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-salsa-1/consume')
      .send({ quantity: '5.000' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error', 'ExcessConsumptionException');
    expect(response.body.message).toMatch(/No es posible consumir/);

    // Garantizar que la cantidad del remanente NO cambio
    const updated = await stockRepo.findRemanenteById('rem-salsa-1');
    expect(updated?.currentQuantity.toString()).toBe('1.750');
  });
});
