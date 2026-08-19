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
  });
});
