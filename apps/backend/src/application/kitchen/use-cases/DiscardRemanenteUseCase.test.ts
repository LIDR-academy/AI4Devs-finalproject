import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

describe('TK-006: Waste and Discard Recording TDD Suite', () => {
  let stockRepo: InMemoryStockRepository;
  let queryRepo: InMemoryRemanenteQueryRepository;
  let activeRemanente: Remanente;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    queryRepo = new InMemoryRemanenteQueryRepository();

    activeRemanente = new Remanente({
      id: 'rem-mozzarella-discard',
      insumoId: 'ins-mozzarella',
      currentQuantity: new DecimalQuantity('1.500'),
      initialQuantity: new DecimalQuantity('1.500'),
      location: 'KITCHEN_FRIDGE',
      status: 'ACTIVE',
      expirationDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // Vencido hace 2 horas
    });

    stockRepo.seedRemanente(activeRemanente);
  });

  it('debe descartar exitosamente un remanente vencido con motivo EXPIRATION y cambiar su estado a DISCARDED (200 OK)', async () => {
    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-mozzarella-discard/discard')
      .send({ reason: 'EXPIRATION' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('remanenteId', 'rem-mozzarella-discard');
    expect(response.body).toHaveProperty('discardedQuantity', '1.500');
    expect(response.body).toHaveProperty('reason', 'EXPIRATION');
    expect(response.body).toHaveProperty('status', 'DISCARDED');

    // Verificar en repositorio
    const updated = await stockRepo.findRemanenteById('rem-mozzarella-discard');
    expect(updated?.status).toBe('DISCARDED');
    expect(updated?.currentQuantity.toString()).toBe('0.000');

    // Verificar registro de auditoria de merma
    expect(stockRepo.movements.length).toBe(1);
    expect(stockRepo.movements[0].type).toBe('DISCARD_EXPIRATION');
    expect(stockRepo.movements[0].quantity).toBe('1.500');
    expect(stockRepo.movements[0].toLoc).toBe('WASTE_BIN');
    expect(stockRepo.movements[0].id).toMatch(/^mov-discard-/);
  });

  it('debe rechazar con 422 Unprocessable Entity si se intenta descartar un remanente ya inactivo', async () => {
    // Descartar primero
    activeRemanente.discard();
    stockRepo.seedRemanente(activeRemanente);

    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-mozzarella-discard/discard')
      .send({ reason: 'DAMAGED' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error', 'ExcessConsumptionException');
  });

  it('debe retornar 404 Not Found si el ID de remanente no existe', async () => {
    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/remanente-inexistente/discard')
      .send({ reason: 'EXPIRATION' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'EntityNotFoundException');
    expect(response.body.message).toMatch(/^Remanente con ID/);
  });

  it('TK-118: rechaza un motivo fuera del catálogo fijo (EXPIRATION/DAMAGED/QUALITY_FAIL) con 400', async () => {
    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app)
      .post('/api/v1/kitchen/remanentes/rem-mozzarella-discard/discard')
      .send({ reason: 'PORQUE_SI' });

    expect(response.status).toBe(400);

    const updated = await stockRepo.findRemanenteById('rem-mozzarella-discard');
    expect(updated?.status).toBe('ACTIVE');
  });

  it('TK-118: dos descartes en el mismo milisegundo generan movimientos con ids distintos (AUDIT-DEV-006 F-3, caso no cubierto por TK-099/TK-101)', async () => {
    const secondRemanente = new Remanente({
      id: 'rem-provolone-discard',
      insumoId: 'ins-provolone',
      currentQuantity: new DecimalQuantity('1.000'),
      initialQuantity: new DecimalQuantity('1.000'),
      location: 'KITCHEN_FRIDGE',
      status: 'ACTIVE',
      expirationDate: new Date(Date.now() - 60 * 60 * 1000),
    });
    stockRepo.seedRemanente(secondRemanente);

    const app = createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, requireAuth: false });
    await Promise.all([
      request(app).post('/api/v1/kitchen/remanentes/rem-mozzarella-discard/discard').send({ reason: 'EXPIRATION' }),
      request(app).post('/api/v1/kitchen/remanentes/rem-provolone-discard/discard').send({ reason: 'DAMAGED' }),
    ]);

    expect(stockRepo.movements).toHaveLength(2);
    const ids = stockRepo.movements.map((m) => m.id);
    expect(new Set(ids).size).toBe(2);
  });
});
