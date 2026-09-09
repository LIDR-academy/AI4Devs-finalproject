import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../infrastructure/http/app.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { GetActiveRemanentesUseCase } from './GetActiveRemanentesUseCase.js';
import {
  ActiveRemanenteDTO,
  IRemanenteQueryRepository,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { ISystemSettingsRepository } from '../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { SystemSettings } from '../../../domain/settings/entities/SystemSettings.js';

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

  it('TK-102 (US-026): expone storageLocationName (cae a `location` si no hay FK)', async () => {
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos');
    expect(response.status).toBe(200);
    for (const rem of response.body) {
      expect(rem).toHaveProperty('storageLocationName');
      expect(rem.storageLocationName).toBe(rem.location);
    }
  });

  it('debe filtrar remanentes activos por insumoId en cualquier ubicacion de cocina (US-021 Escenario 1, TK-080)', async () => {
    // rem-a (ins-1, KITCHEN_FRIDGE) y rem-d-exhausted (ins-1, EXHAUSTED) tambien son ins-1;
    // solo rem-a debe volver, confirmando que insumoId no se combina con location y excluye EXHAUSTED.
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos?insumoId=ins-1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('rem-a');
    expect(response.body[0].insumoId).toBe('ins-1');
  });

  it('debe retornar lista vacia cuando el insumo no tiene ningun remanente activo (US-021 Escenario 2, TK-080)', async () => {
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos?insumoId=ins-sin-remanente');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('debe rechazar un insumoId vacio con 400 Bad Request', async () => {
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app).get('/api/v1/kitchen/remanentes-activos?insumoId=');

    expect(response.status).toBe(400);
  });

  it('insumoId debe prevalecer sobre location cuando ambos se envian, sin combinarse (US-021 Escenario 1)', async () => {
    // rem-a (ins-1) esta en KITCHEN_FRIDGE, no en KITCHEN_PREP. Si location se combinara con
    // insumoId (AND) en vez de ser ignorado, rem-a NO deberia volver. Debe volver igualmente.
    const app = createApp({ remanenteQueryRepository: queryRepo, requireAuth: false });
    const response = await request(app).get(
      '/api/v1/kitchen/remanentes-activos?insumoId=ins-1&location=KITCHEN_PREP'
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('rem-a');
    expect(response.body[0].location).toBe('KITCHEN_FRIDGE');
  });
});

describe('GetActiveRemanentesUseCase — cálculo de hoursRemaining / isCriticalAlert (unitario)', () => {
  const FIXED_NOW = new Date('2026-02-01T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function makeUseCase(items: Partial<ActiveRemanenteDTO>[], criticalAlertHours = 24) {
    const repo: IRemanenteQueryRepository = {
      findActiveRemanentes: async () =>
        items.map((it) => ({
          id: it.id ?? 'rem-x',
          insumoId: it.insumoId ?? 'ins-1',
          insumoName: it.insumoName ?? 'Insumo',
          unitOfMeasure: it.unitOfMeasure ?? 'KG',
          currentQuantity: it.currentQuantity ?? '1.000',
          initialQuantity: it.initialQuantity ?? '1.000',
          location: it.location ?? 'KITCHEN_FRIDGE',
          storageLocationId: it.storageLocationId,
          storageLocationName: it.storageLocationName,
          expirationDate: it.expirationDate ?? FIXED_NOW,
          status: it.status ?? 'ACTIVE',
          createdAt: FIXED_NOW,
        })),
    };
    const settingsRepo: ISystemSettingsRepository = {
      getSettings: async () =>
        new SystemSettings({
          id: 'default',
          restaurantName: 'Test',
          currencySymbol: '$',
          criticalAlertHours,
          defaultRemanenteHours: 24,
          varianceTolerancePercent: 5,
          idleTimeoutMinutes: 15,
          preparationWasteAlertPercent: 5,
        }),
      saveSettings: async () => {},
    };
    return new GetActiveRemanentesUseCase(repo, settingsRepo);
  }

  it('hoursRemaining = (expiración − ahora) en horas, redondeado a 1 decimal', async () => {
    const useCase = makeUseCase([
      { id: 'r1', expirationDate: new Date(FIXED_NOW.getTime() + 5 * 60 * 60 * 1000) }, // +5h
      { id: 'r2', expirationDate: new Date(FIXED_NOW.getTime() + 90 * 60 * 1000) }, // +1.5h
    ]);
    const [r1, r2] = await useCase.execute();
    expect(r1.hoursRemaining).toBe(5);
    expect(r2.hoursRemaining).toBe(1.5);
  });

  it('hoursRemaining nunca es negativo: un remanente ya vencido da 0 (Math.max, no Math.min)', async () => {
    const useCase = makeUseCase([
      { id: 'expirado', expirationDate: new Date(FIXED_NOW.getTime() - 3 * 60 * 60 * 1000) }, // −3h
    ]);
    const [rem] = await useCase.execute();
    expect(rem.hoursRemaining).toBe(0);
  });

  it('isCriticalAlert es true por debajo de 24h y false a partir de 24h exactas (límite estricto <)', async () => {
    const useCase = makeUseCase([
      { id: 'critico', expirationDate: new Date(FIXED_NOW.getTime() + 23.9 * 60 * 60 * 1000) },
      { id: 'limite', expirationDate: new Date(FIXED_NOW.getTime() + 24 * 60 * 60 * 1000) },
      { id: 'holgado', expirationDate: new Date(FIXED_NOW.getTime() + 30 * 60 * 60 * 1000) },
    ]);
    const [critico, limite, holgado] = await useCase.execute();
    expect(critico.isCriticalAlert).toBe(true);
    expect(limite.isCriticalAlert).toBe(false);
    expect(holgado.isCriticalAlert).toBe(false);
  });

  // US-017 Escenario 2 / TK-110: el umbral es el que configuró el admin en SystemSettings,
  // no un hardcode — antes de este fix, isCriticalAlert siempre comparaba contra 24 sin
  // importar lo que el admin hubiera guardado.
  it('usa el umbral configurado en SystemSettings.criticalAlertHours, no un hardcode de 24h (US-017 Escenario 2)', async () => {
    const useCase = makeUseCase(
      [{ id: 'r18h', expirationDate: new Date(FIXED_NOW.getTime() + 18 * 60 * 60 * 1000) }],
      12 // umbral configurado a 12h (en vez del default 24h)
    );
    const [rem] = await useCase.execute();
    // Con el umbral en 12h, un remanente con 18h restantes deja de ser crítico.
    expect(rem.isCriticalAlert).toBe(false);
  });
});
