import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../infrastructure/http/app.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';

describe('TK-004: FEFO Active Remanentes Query TDD Suite', () => {
  let queryRepo: InMemoryRemanenteQueryRepository;
  const now = new Date();

  beforeEach(() => {
    queryRepo = new InMemoryRemanenteQueryRepository();

    const dateA = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Vence en 24h
    const dateB = new Date(now.getTime() + 2 * 60 * 60 * 1000);  // Vence en 2h (¡Debe ser el PRIMERO!)
    const dateC = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Vence en 12h

    queryRepo.seedRemanente({
      id: 'rem-a',
      insumoId: 'ins-1',
      insumoName: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
      currentQuantity: '5.000',
      initialQuantity: '5.000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: dateA,
      status: 'ACTIVE',
      createdAt: now,
    });

    queryRepo.seedRemanente({
      id: 'rem-b',
      insumoId: 'ins-2',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      currentQuantity: '2.000',
      initialQuantity: '2.000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: dateB,
      status: 'ACTIVE',
      createdAt: now,
    });

    queryRepo.seedRemanente({
      id: 'rem-c',
      insumoId: 'ins-3',
      insumoName: 'Masa de Pizza',
      unitOfMeasure: 'UNITS',
      currentQuantity: '10.000',
      initialQuantity: '10.000',
      location: 'KITCHEN_PREP',
      expirationDate: dateC,
      status: 'ACTIVE',
      createdAt: now,
    });

    // Inactivo / Agotado que NO debe retornarse
    queryRepo.seedRemanente({
      id: 'rem-d-exhausted',
      insumoId: 'ins-1',
      insumoName: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
      currentQuantity: '0.000',
      initialQuantity: '5.000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: dateB,
      status: 'EXHAUSTED',
      createdAt: now,
    });
  });

  it('debe retornar los remanentes activos ordenados estrictamente por FEFO (expirationDate ASC)', async () => {
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);

    // El primer elemento DEBE ser rem-b (vence en 2h)
    expect(response.body[0].id).toBe('rem-b');
    expect(response.body[0].insumoName).toBe('Queso Mozzarella');
    expect(response.body[0].hoursRemaining).toBeLessThanOrEqual(2.5);

    // El segundo elemento DEBE ser rem-c (vence en 12h)
    expect(response.body[1].id).toBe('rem-c');

    // El tercer elemento DEBE ser rem-a (vence en 24h)
    expect(response.body[2].id).toBe('rem-a');
  });

  it('debe permitir filtrar remanentes activos por ubicacion especifica', async () => {
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false }); // test de negocio, no de auth (Guard 15 sigue activo por defecto en createApp)
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos?location=KITCHEN_PREP');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('rem-c');
    expect(response.body[0].location).toBe('KITCHEN_PREP');
  });
});
